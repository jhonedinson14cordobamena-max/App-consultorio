"""Implementacion de BrokerBase sobre XTBApi (XTB xStation5, cuenta DEMO).

Toda sesion se abre SIEMPRE en modo demo (ver Config, que rechaza
XTB_DEMO=false), la misma salvaguarda que ya aplican Alpaca (paper) y
Binance (testnet): separar "conectar con el broker" de "arriesgar dinero
real" es deliberado, no un detalle de configuracion.

XTB opera principalmente CFDs apalancados, pero este bot esta pensado
para acciones/ETFs SIN apalancamiento (el modulo de gestion de riesgo en
risk.py asume eso: comprar N unidades con perdida maxima = distancia del
stop, sin multiplicador de margen). Por eso, antes de operar cualquier
simbolo por primera vez, se consulta su leverage real via getSymbol y se
rechaza si no es 1:1 (leverage == 100 en la convencion de XTB) - asi un
simbolo CFD apalancado no se cuela por un error de configuracion.
"""
from __future__ import annotations

import logging

import pandas as pd
from XTBApi.api import MODES, TRANS_TYPES, Client

from ..config import Config
from .base import BarInterval, BrokerBase, Side

logger = logging.getLogger(__name__)

# get_lastn_candle_history solo acepta estos timeframes, en segundos.
_INTERVAL_SECONDS = {
    BarInterval.FIFTEEN_MIN: 900,
    BarInterval.ONE_HOUR: 3600,
    BarInterval.ONE_DAY: 86400,
}

_SIDE_TO_MODE = {Side.BUY: MODES.BUY.value, Side.SELL: MODES.SELL.value}

_NO_LEVERAGE = 100  # convencion XTB: leverage=100 significa 1:1 (sin apalancamiento)


class XTBBroker(BrokerBase):
    def __init__(self, config: Config) -> None:
        self.config = config
        self._client = Client()
        self._logged_in = False
        self._leverage_checked: set[str] = set()

    def _ensure_login(self) -> None:
        # Conexion WebSocket real diferida al primer uso, no al construir el
        # broker: igual que Alpaca/Binance, crear el broker no debe disparar
        # trafico de red por si solo.
        if not self._logged_in:
            self._client.login(self.config.xtb_user_id, self.config.xtb_password, mode="demo")
            self._logged_in = True

    def _ensure_no_leverage(self, symbol: str) -> None:
        if symbol in self._leverage_checked:
            return
        info = self._client.get_symbol(symbol)
        leverage = info.get("leverage")
        if leverage != _NO_LEVERAGE:
            raise ValueError(
                f"'{symbol}' tiene apalancamiento {leverage} (se esperaba {_NO_LEVERAGE}, "
                "sin apalancamiento). Este bot solo opera acciones/ETFs 1:1; revisa el "
                "simbolo o el tipo de cuenta en XTB antes de continuar."
            )
        self._leverage_checked.add(symbol)

    def get_account_equity(self) -> float:
        self._ensure_login()
        margin = self._client.get_margin_level()
        return float(margin["equity"])

    def is_market_open(self) -> bool:
        if not self.config.symbols:
            return False
        self._ensure_login()
        status = self._client.check_if_market_open(self.config.symbols)
        return any(status.values())

    def get_bars(
        self, symbol: str, lookback_bars: int, interval: BarInterval = BarInterval.ONE_DAY
    ) -> pd.DataFrame:
        self._ensure_login()
        seconds = _INTERVAL_SECONDS[interval]
        candles = self._client.get_lastn_candle_history(symbol, seconds, lookback_bars)
        if not candles:
            return pd.DataFrame(columns=["close"])
        closes = [c["close"] for c in candles]
        times = [pd.to_datetime(c["timestamp"], unit="s", utc=True) for c in candles]
        return pd.DataFrame({"close": closes}, index=times).sort_index()

    def get_open_position_qty(self, symbol: str) -> float:
        self._ensure_login()
        trades = self._client.get_trades(opened_only=True)
        return sum(float(t["volume"]) for t in trades if t["symbol"] == symbol)

    def submit_market_order_with_stop(self, symbol: str, qty: float, side: Side, stop_price: float):
        if qty <= 0:
            logger.info("Cantidad 0 para %s, no se envia orden.", symbol)
            return None
        self._ensure_login()
        self._ensure_no_leverage(symbol)

        mode = _SIDE_TO_MODE[side]
        price_field = "ask" if side == Side.BUY else "bid"
        price = self._client.get_symbol(symbol)[price_field]

        logger.info("Enviando orden: %s %s x%s stop=%s", side, symbol, qty, stop_price)
        return self._client.trade_transaction(
            symbol, mode, TRANS_TYPES.OPEN.value, qty, price=price, sl=stop_price
        )

    def close_position(self, symbol: str):
        self._ensure_login()
        trades = [t for t in self._client.get_trades(opened_only=True) if t["symbol"] == symbol]
        if not trades:
            logger.info("Sin posicion abierta en %s.", symbol)
            return None

        results = []
        for trade in trades:
            # cerrar una compra se hace vendiendo (bid); cerrar una venta se
            # hace comprando de vuelta (ask). El campo 'cmd' de la orden de
            # cierre debe ser el de la operacion ORIGINAL, no el invertido:
            # asi es como XTB identifica que se esta cerrando esa posicion.
            closing_price_field = "bid" if trade["cmd"] == MODES.BUY.value else "ask"
            price = self._client.get_symbol(symbol)[closing_price_field]
            logger.info("Cerrando posicion %s en %s x%s", trade["order"], symbol, trade["volume"])
            results.append(
                self._client.trade_transaction(
                    symbol,
                    trade["cmd"],
                    TRANS_TYPES.CLOSE.value,
                    trade["volume"],
                    order=trade["order"],
                    price=price,
                )
            )
        return results
