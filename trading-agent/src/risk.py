"""Gestion de riesgo: tamano de posicion, stop-loss y freno por perdida diaria.

Ningun sistema automatico puede garantizar ganancias. Lo unico que este
modulo puede controlar es CUANTO se arriesga por operacion y CUANDO detener
al agente por completo si las cosas van mal.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RiskManager:
    risk_per_trade_pct: float
    max_daily_loss_pct: float
    stop_loss_pct: float

    def stop_loss_price(self, entry_price: float, side: str) -> float:
        if entry_price <= 0:
            raise ValueError("entry_price debe ser positivo")
        distance = entry_price * (self.stop_loss_pct / 100)
        if side == "buy":
            return round(entry_price - distance, 2)
        if side == "sell":
            return round(entry_price + distance, 2)
        raise ValueError("side debe ser 'buy' o 'sell'")

    def position_size(self, equity: float, entry_price: float, stop_price: float) -> int:
        """Numero de acciones tal que, si se toca el stop, la perdida sea
        aproximadamente risk_per_trade_pct del equity. Redondea hacia abajo.
        """
        if equity <= 0 or entry_price <= 0:
            return 0
        risk_amount = equity * (self.risk_per_trade_pct / 100)
        per_share_risk = abs(entry_price - stop_price)
        if per_share_risk <= 0:
            return 0
        shares = int(risk_amount // per_share_risk)
        max_affordable = int(equity // entry_price)
        return max(0, min(shares, max_affordable))

    def daily_loss_limit_hit(self, equity_start_of_day: float, equity_now: float) -> bool:
        if equity_start_of_day <= 0:
            return False
        loss_pct = (equity_start_of_day - equity_now) / equity_start_of_day * 100
        return loss_pct >= self.max_daily_loss_pct
