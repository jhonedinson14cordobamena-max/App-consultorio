"""Backtester simple, vectorizado, sobre datos historicos ya descargados.

El objetivo es honesto: mostrar que NINGUNA estrategia acierta siempre, y
dar metricas basicas para decidir con datos, no con esperanza, si vale la
pena correr la estrategia en paper trading.
"""
from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from .strategy import Signal, Strategy


@dataclass
class BacktestResult:
    total_return_pct: float
    num_trades: int
    win_rate_pct: float
    max_drawdown_pct: float

    def summary(self) -> str:
        return (
            f"Retorno total:      {self.total_return_pct:+.2f}%\n"
            f"Numero de trades:   {self.num_trades}\n"
            f"Win rate:           {self.win_rate_pct:.1f}%\n"
            f"Max drawdown:       {self.max_drawdown_pct:.2f}%\n"
            "\nRecordatorio: rendimiento pasado no garantiza resultados futuros.\n"
            "Ninguna estrategia es 100% efectiva."
        )


def run_backtest(bars: pd.DataFrame, strategy: Strategy, starting_equity: float = 10_000.0) -> BacktestResult:
    """bars: DataFrame con columna 'close', ordenado cronologicamente, un solo simbolo."""
    if "close" not in bars.columns:
        raise ValueError("bars debe tener columna 'close'")

    equity = starting_equity
    position_qty = 0.0
    entry_price = 0.0
    trades: list[float] = []
    equity_curve: list[float] = []

    min_bars = strategy.required_bars()
    for i in range(min_bars, len(bars) + 1):
        window = bars.iloc[:i]
        signal = strategy.generate_signal(window)
        price = float(window["close"].iloc[-1])

        if signal == Signal.BUY and position_qty == 0:
            position_qty = equity / price
            entry_price = price

        elif signal == Signal.SELL and position_qty > 0:
            pnl = (price - entry_price) * position_qty
            equity += pnl
            trades.append(pnl)
            position_qty = 0.0
            entry_price = 0.0

        mark_to_market = equity + (position_qty * (price - entry_price) if position_qty else 0)
        equity_curve.append(mark_to_market)

    if position_qty > 0:
        last_price = float(bars["close"].iloc[-1])
        pnl = (last_price - entry_price) * position_qty
        equity += pnl
        trades.append(pnl)
        equity_curve.append(equity)

    total_return_pct = (equity - starting_equity) / starting_equity * 100
    wins = [t for t in trades if t > 0]
    win_rate_pct = (len(wins) / len(trades) * 100) if trades else 0.0
    max_drawdown_pct = _max_drawdown(equity_curve)

    return BacktestResult(
        total_return_pct=total_return_pct,
        num_trades=len(trades),
        win_rate_pct=win_rate_pct,
        max_drawdown_pct=max_drawdown_pct,
    )


def _max_drawdown(equity_curve: list[float]) -> float:
    if not equity_curve:
        return 0.0
    peak = equity_curve[0]
    max_dd = 0.0
    for value in equity_curve:
        peak = max(peak, value)
        if peak > 0:
            drawdown = (peak - value) / peak * 100
            max_dd = max(max_dd, drawdown)
    return max_dd
