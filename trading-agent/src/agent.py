"""Bucle principal del agente: evalua cada simbolo y actua segun la senal."""
from __future__ import annotations

import logging

from alpaca.trading.enums import OrderSide

from .broker import Broker
from .config import Config
from .risk import RiskManager
from .strategy import Signal, Strategy

logger = logging.getLogger(__name__)


class TradingAgent:
    def __init__(self, config: Config, broker: Broker, strategy: Strategy, risk: RiskManager) -> None:
        self.config = config
        self.broker = broker
        self.strategy = strategy
        self.risk = risk
        self._equity_start_of_day: float | None = None

    def _ensure_start_of_day_equity(self) -> float:
        if self._equity_start_of_day is None:
            self._equity_start_of_day = self.broker.get_account_equity()
        return self._equity_start_of_day

    def run_once(self) -> None:
        if not self.broker.is_market_open():
            logger.info("Mercado cerrado, no se hace nada en este ciclo.")
            return

        equity_start = self._ensure_start_of_day_equity()
        equity_now = self.broker.get_account_equity()

        if self.risk.daily_loss_limit_hit(equity_start, equity_now):
            logger.warning(
                "Limite de perdida diaria alcanzado (%.2f%%). Agente pausado por hoy.",
                self.config.max_daily_loss_pct,
            )
            return

        for symbol in self.config.symbols:
            self._evaluate_symbol(symbol, equity_now)

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
            self.broker.submit_market_order_with_stop(symbol, qty, OrderSide.BUY, stop_price)

        elif signal == Signal.SELL and current_qty > 0:
            self.broker.close_position(symbol)

        else:
            logger.info("Sin accion para %s (senal=%s, posicion=%s)", symbol, signal, current_qty)
