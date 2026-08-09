"""Bucle principal del agente: evalua cada simbolo y actua segun la senal.

Incorpora tres salvaguardas exigidas antes de considerar cuenta real:
1. Tope de capital (MAX_CAPITAL_USD): el position sizing nunca usa mas
   capital del que el usuario asigno explicitamente al agente.
2. Kill switch persistente (src/state.py): al tocar el limite de perdida
   diaria o total, el agente se detiene y NO se reactiva solo.
3. Notificaciones (src/notifier.py): cada orden ejecutada y cada halt
   generan una notificacion, para que el usuario nunca se entere tarde.
"""
from __future__ import annotations

import logging

from .brokers.base import BrokerBase, Side
from .config import Config
from .notifier import Notifier
from .risk import RiskManager
from .state import StateStore
from .strategy import Signal, Strategy

logger = logging.getLogger(__name__)


class TradingAgent:
    def __init__(
        self,
        config: Config,
        broker: BrokerBase,
        strategy: Strategy,
        risk: RiskManager,
        notifier: Notifier | None = None,
        state_store: StateStore | None = None,
    ) -> None:
        self.config = config
        self.broker = broker
        self.strategy = strategy
        self.risk = risk
        self.notifier = notifier or Notifier(config)
        self.state_store = state_store or StateStore()

    def _capped_equity(self, equity_now: float) -> float:
        if self.config.max_capital_usd is None:
            return equity_now
        return min(equity_now, self.config.max_capital_usd)

    def run_once(self) -> None:
        halted, reason = self.state_store.is_halted()
        if halted:
            logger.warning(
                "Agente detenido por kill switch (%s). Ejecuta 'python main.py reset-halt' "
                "para reanudar manualmente. No se hace nada este ciclo.",
                reason,
            )
            return

        if not self.broker.is_market_open():
            logger.info("Mercado cerrado, no se hace nada en este ciclo.")
            return

        equity_now = self.broker.get_account_equity()
        equity_start = self.state_store.ensure_start_of_day_equity(equity_now)
        baseline_equity = self.state_store.ensure_baseline(equity_now)

        if self.risk.daily_loss_limit_hit(equity_start, equity_now):
            reason = f"Limite de perdida diaria alcanzado ({self.config.max_daily_loss_pct}%)."
            self._halt(reason)
            return

        if self.risk.daily_loss_limit_hit(
            baseline_equity, equity_now, threshold_pct=self.config.max_total_loss_pct
        ):
            reason = f"Limite de perdida total alcanzado ({self.config.max_total_loss_pct}%)."
            self._halt(reason)
            return

        effective_equity = self._capped_equity(equity_now)
        for symbol in self.config.symbols:
            self._evaluate_symbol(symbol, effective_equity)

    def _halt(self, reason: str) -> None:
        logger.error("KILL SWITCH: %s Agente detenido hasta reactivacion manual.", reason)
        self.state_store.halt(reason)
        self.notifier.notify_halt(reason)

    def _evaluate_symbol(self, symbol: str, equity_now: float) -> None:
        bars = self.broker.get_bars(symbol, lookback_bars=self.strategy.required_bars() + 5)
        if bars.empty:
            logger.info("Sin datos para %s, se omite.", symbol)
            return

        signal = self.strategy.generate_signal(bars)
        current_qty = self.broker.get_open_position_qty(symbol)
        last_price = float(bars["close"].iloc[-1])

        if signal == Signal.BUY and current_qty == 0:
            stop_price = self.risk.stop_loss_price(last_price, "buy")
            qty = self.risk.position_size(equity_now, last_price, stop_price)
            order = self.broker.submit_market_order_with_stop(symbol, qty, Side.BUY, stop_price)
            if order is not None:
                self.notifier.notify_order(
                    "COMPRA", symbol, qty, last_price, f"Stop-loss: {stop_price}"
                )

        elif signal == Signal.SELL and current_qty > 0:
            self.broker.close_position(symbol)
            self.notifier.notify_order("CIERRE", symbol, current_qty, last_price)

        else:
            logger.info("Sin accion para %s (senal=%s, posicion=%s)", symbol, signal, current_qty)
