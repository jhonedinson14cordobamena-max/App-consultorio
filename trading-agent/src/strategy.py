"""Estrategias de trading. Interfaz simple y facil de reemplazar/extender.

Ninguna estrategia aqui pretende ser rentable garantizada: son puntos de
partida transparentes (sin caja negra) para que el usuario pueda medir su
desempeno con el backtester antes de arriesgar nada, ni siquiera en papel.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

import pandas as pd


class Signal(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


@dataclass
class Strategy:
    """Cruce de medias moviles simples (SMA crossover).

    BUY  cuando la SMA rapida cruza por encima de la SMA lenta.
    SELL cuando la SMA rapida cruza por debajo de la SMA lenta.
    HOLD en cualquier otro caso (incluye datos insuficientes).
    """

    fast_period: int = 20
    slow_period: int = 50

    def __post_init__(self) -> None:
        if self.fast_period >= self.slow_period:
            raise ValueError("fast_period debe ser menor que slow_period")

    def required_bars(self) -> int:
        return self.slow_period + 1

    def generate_signal(self, bars: pd.DataFrame) -> Signal:
        """bars debe tener una columna 'close' ordenada cronologicamente."""
        if "close" not in bars.columns:
            raise ValueError("El DataFrame de barras debe tener columna 'close'")
        if len(bars) < self.required_bars():
            return Signal.HOLD

        closes = bars["close"]
        fast = closes.rolling(self.fast_period).mean()
        slow = closes.rolling(self.slow_period).mean()

        fast_now, fast_prev = fast.iloc[-1], fast.iloc[-2]
        slow_now, slow_prev = slow.iloc[-1], slow.iloc[-2]

        if pd.isna(fast_prev) or pd.isna(slow_prev):
            return Signal.HOLD

        crossed_up = fast_prev <= slow_prev and fast_now > slow_now
        crossed_down = fast_prev >= slow_prev and fast_now < slow_now

        if crossed_up:
            return Signal.BUY
        if crossed_down:
            return Signal.SELL
        return Signal.HOLD
