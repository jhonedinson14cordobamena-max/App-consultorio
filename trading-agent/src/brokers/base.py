"""Interfaz comun que debe implementar cualquier broker/exchange.

agent.py, risk.py y strategy.py solo conocen esta interfaz, nunca el SDK
especifico de Alpaca o Binance. Asi, agregar un broker nuevo no requiere
tocar la logica de decision del agente.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from enum import Enum

import pandas as pd


class Side(str, Enum):
    BUY = "buy"
    SELL = "sell"


class BarInterval(str, Enum):
    ONE_DAY = "1Day"
    ONE_HOUR = "1Hour"
    FIFTEEN_MIN = "15Min"


class BrokerBase(ABC):
    @abstractmethod
    def get_account_equity(self) -> float:
        """Valor total de la cuenta, en la moneda base (USD/USDT)."""

    @abstractmethod
    def is_market_open(self) -> bool:
        """False fuera de horario de mercado. Cripto: siempre True."""

    @abstractmethod
    def get_bars(
        self, symbol: str, lookback_bars: int, interval: BarInterval = BarInterval.ONE_DAY
    ) -> pd.DataFrame:
        """DataFrame con columna 'close', ordenado cronologicamente ascendente."""

    @abstractmethod
    def get_open_position_qty(self, symbol: str) -> float:
        """Cantidad actualmente en posicion para ese simbolo (0 si no hay)."""

    @abstractmethod
    def submit_market_order_with_stop(self, symbol: str, qty: float, side: Side, stop_price: float):
        """Abre posicion a mercado y protege con una orden de stop-loss."""

    @abstractmethod
    def close_position(self, symbol: str):
        """Cierra toda la posicion abierta en ese simbolo."""
