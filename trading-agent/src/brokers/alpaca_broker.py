"""Implementacion de BrokerBase sobre alpaca-py (acciones/ETFs).

Toda instancia creada aqui apunta SIEMPRE a paper trading (ver Config, que
rechaza paper=False). Esto es intencional: separar "conectar con Alpaca" de
"decidir con dinero real" es una salvaguarda adicional, no solo un detalle
de configuracion.
"""
from __future__ import annotations

import logging

import pandas as pd
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.trading.client import TradingClient
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.trading.requests import MarketOrderRequest, StopLossRequest

from ..config import Config
from .base import BarInterval, BrokerBase, Side

logger = logging.getLogger(__name__)

_INTERVAL_MAP = {
    BarInterval.ONE_DAY: TimeFrame.Day,
    BarInterval.ONE_HOUR: TimeFrame.Hour,
    BarInterval.FIFTEEN_MIN: TimeFrame(15, TimeFrameUnit.Minute),
}

_SIDE_MAP = {Side.BUY: OrderSide.BUY, Side.SELL: OrderSide.SELL}


class AlpacaBroker(BrokerBase):
    def __init__(self, config: Config) -> None:
        self._trading = TradingClient(config.api_key, config.secret_key, paper=config.paper)
        self._data = StockHistoricalDataClient(config.api_key, config.secret_key)

    def get_account_equity(self) -> float:
        account = self._trading.get_account()
        return float(account.equity)

    def is_market_open(self) -> bool:
        clock = self._trading.get_clock()
        return bool(clock.is_open)

    def get_bars(
        self, symbol: str, lookback_bars: int, interval: BarInterval = BarInterval.ONE_DAY
    ) -> pd.DataFrame:
        request = StockBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=_INTERVAL_MAP[interval],
            limit=lookback_bars,
        )
        bars = self._data.get_stock_bars(request).df
        if bars.empty:
            return pd.DataFrame(columns=["close"])
        if isinstance(bars.index, pd.MultiIndex):
            bars = bars.xs(symbol, level=0)
        return bars[["close"]].sort_index()

    def get_open_position_qty(self, symbol: str) -> float:
        try:
            position = self._trading.get_open_position(symbol)
            return float(position.qty)
        except Exception:
            return 0.0

    def submit_market_order_with_stop(self, symbol: str, qty: float, side: Side, stop_price: float):
        if qty <= 0:
            logger.info("Cantidad 0 para %s, no se envia orden.", symbol)
            return None
        order = MarketOrderRequest(
            symbol=symbol,
            qty=qty,
            side=_SIDE_MAP[side],
            time_in_force=TimeInForce.DAY,
            order_class="bracket",
            stop_loss=StopLossRequest(stop_price=stop_price),
        )
        logger.info("Enviando orden: %s %s x%s stop=%s", side, symbol, qty, stop_price)
        return self._trading.submit_order(order)

    def close_position(self, symbol: str):
        logger.info("Cerrando posicion en %s", symbol)
        return self._trading.close_position(symbol)
