"""Carga y validacion de la configuracion desde variables de entorno."""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv


@dataclass(frozen=True)
class Config:
    api_key: str
    secret_key: str
    paper: bool
    symbols: list[str]
    fast_sma_period: int
    slow_sma_period: int
    risk_per_trade_pct: float
    max_daily_loss_pct: float
    stop_loss_pct: float
    poll_interval_minutes: int

    def __post_init__(self) -> None:
        if not self.api_key or not self.secret_key:
            raise ValueError(
                "Faltan ALPACA_API_KEY / ALPACA_SECRET_KEY. Copia .env.example a .env "
                "y completa tus credenciales de paper trading."
            )
        if not self.symbols:
            raise ValueError("SYMBOLS no puede estar vacio.")
        if self.fast_sma_period >= self.slow_sma_period:
            raise ValueError("FAST_SMA_PERIOD debe ser menor que SLOW_SMA_PERIOD.")
        if not (0 < self.risk_per_trade_pct <= 10):
            raise ValueError("RISK_PER_TRADE_PCT fuera de rango razonable (0-10%).")
        if not self.paper:
            raise ValueError(
                "Este agente esta configurado para operar UNICAMENTE en modo paper "
                "(ALPACA_PAPER=true). Operar con dinero real requiere una revision "
                "manual deliberada del codigo, no solo cambiar esta variable."
            )


def load_config(env_file: str | None = ".env") -> Config:
    load_dotenv(env_file)

    def _get_bool(name: str, default: bool) -> bool:
        return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes")

    symbols_raw = os.getenv("SYMBOLS", "")
    symbols = [s.strip().upper() for s in symbols_raw.split(",") if s.strip()]

    return Config(
        api_key=os.getenv("ALPACA_API_KEY", ""),
        secret_key=os.getenv("ALPACA_SECRET_KEY", ""),
        paper=_get_bool("ALPACA_PAPER", True),
        symbols=symbols,
        fast_sma_period=int(os.getenv("FAST_SMA_PERIOD", "20")),
        slow_sma_period=int(os.getenv("SLOW_SMA_PERIOD", "50")),
        risk_per_trade_pct=float(os.getenv("RISK_PER_TRADE_PCT", "1.0")),
        max_daily_loss_pct=float(os.getenv("MAX_DAILY_LOSS_PCT", "3.0")),
        stop_loss_pct=float(os.getenv("STOP_LOSS_PCT", "2.0")),
        poll_interval_minutes=int(os.getenv("POLL_INTERVAL_MINUTES", "15")),
    )
