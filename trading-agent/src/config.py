"""Carga y validacion de la configuracion desde variables de entorno."""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


_VALID_BROKERS = ("alpaca", "binance", "xtb")


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
    max_total_loss_pct: float
    stop_loss_pct: float
    poll_interval_minutes: int
    max_capital_usd: float | None
    notify_email_to: str | None
    smtp_host: str | None
    smtp_port: int
    smtp_user: str | None
    smtp_password: str | None
    broker: str = "alpaca"
    binance_api_key: str | None = None
    binance_secret_key: str | None = None
    binance_testnet: bool = True
    xtb_user_id: str | None = None
    xtb_password: str | None = None
    xtb_demo: bool = True

    def __post_init__(self) -> None:
        if self.broker not in _VALID_BROKERS:
            raise ValueError(f"BROKER debe ser uno de {_VALID_BROKERS}, recibido: {self.broker!r}")

        if self.broker == "alpaca":
            if not self.api_key or not self.secret_key:
                raise ValueError(
                    "Faltan ALPACA_API_KEY / ALPACA_SECRET_KEY. Copia .env.example a .env "
                    "y completa tus credenciales de paper trading."
                )
            if not self.paper:
                raise ValueError(
                    "Este agente esta configurado para operar UNICAMENTE en modo paper "
                    "(ALPACA_PAPER=true). Operar con dinero real requiere una revision "
                    "manual deliberada del codigo, no solo cambiar esta variable."
                )

        if self.broker == "binance":
            if not self.binance_api_key or not self.binance_secret_key:
                raise ValueError(
                    "Faltan BINANCE_API_KEY / BINANCE_SECRET_KEY. Genera claves en "
                    "https://testnet.binance.vision y completa .env."
                )
            if not self.binance_testnet:
                raise ValueError(
                    "Este agente esta configurado para operar UNICAMENTE contra el testnet "
                    "de Binance (BINANCE_TESTNET=true). Operar con dinero real requiere una "
                    "revision manual deliberada del codigo, no solo cambiar esta variable."
                )

        if self.broker == "xtb":
            if not self.xtb_user_id or not self.xtb_password:
                raise ValueError(
                    "Faltan XTB_USER_ID / XTB_PASSWORD. Usa las credenciales de tu cuenta "
                    "DEMO de XTB (no la real)."
                )
            if not self.xtb_demo:
                raise ValueError(
                    "Este agente esta configurado para operar UNICAMENTE contra la cuenta "
                    "DEMO de XTB (XTB_DEMO=true). Operar con la cuenta real requiere una "
                    "revision manual deliberada del codigo, no solo cambiar esta variable."
                )

        if not self.symbols:
            raise ValueError("SYMBOLS no puede estar vacio.")
        if self.fast_sma_period >= self.slow_sma_period:
            raise ValueError("FAST_SMA_PERIOD debe ser menor que SLOW_SMA_PERIOD.")
        if not (0 < self.risk_per_trade_pct <= 10):
            raise ValueError("RISK_PER_TRADE_PCT fuera de rango razonable (0-10%).")
        if self.max_total_loss_pct <= self.max_daily_loss_pct:
            raise ValueError(
                "MAX_TOTAL_LOSS_PCT debe ser mayor que MAX_DAILY_LOSS_PCT "
                "(el freno diario debe activarse antes que el freno total)."
            )
        if self.max_capital_usd is not None and self.max_capital_usd <= 0:
            raise ValueError("MAX_CAPITAL_USD debe ser positivo si se define.")


def load_config(env_file: str | None = ".env") -> Config:
    load_dotenv(env_file)

    def _get_bool(name: str, default: bool) -> bool:
        return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes")

    symbols_raw = os.getenv("SYMBOLS", "")
    symbols = [s.strip().upper() for s in symbols_raw.split(",") if s.strip()]

    max_capital_raw = os.getenv("MAX_CAPITAL_USD", "").strip()
    max_capital_usd = float(max_capital_raw) if max_capital_raw else None

    return Config(
        api_key=os.getenv("ALPACA_API_KEY", ""),
        secret_key=os.getenv("ALPACA_SECRET_KEY", ""),
        paper=_get_bool("ALPACA_PAPER", True),
        broker=os.getenv("BROKER", "xtb").strip().lower(),
        binance_api_key=os.getenv("BINANCE_API_KEY") or None,
        binance_secret_key=os.getenv("BINANCE_SECRET_KEY") or None,
        binance_testnet=_get_bool("BINANCE_TESTNET", True),
        xtb_user_id=os.getenv("XTB_USER_ID") or None,
        xtb_password=os.getenv("XTB_PASSWORD") or None,
        xtb_demo=_get_bool("XTB_DEMO", True),
        symbols=symbols,
        fast_sma_period=int(os.getenv("FAST_SMA_PERIOD", "20")),
        slow_sma_period=int(os.getenv("SLOW_SMA_PERIOD", "50")),
        risk_per_trade_pct=float(os.getenv("RISK_PER_TRADE_PCT", "1.0")),
        max_daily_loss_pct=float(os.getenv("MAX_DAILY_LOSS_PCT", "3.0")),
        max_total_loss_pct=float(os.getenv("MAX_TOTAL_LOSS_PCT", "10.0")),
        stop_loss_pct=float(os.getenv("STOP_LOSS_PCT", "2.0")),
        poll_interval_minutes=int(os.getenv("POLL_INTERVAL_MINUTES", "15")),
        max_capital_usd=max_capital_usd,
        notify_email_to=os.getenv("NOTIFY_EMAIL_TO") or None,
        smtp_host=os.getenv("SMTP_HOST") or None,
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_user=os.getenv("SMTP_USER") or None,
        smtp_password=os.getenv("SMTP_PASSWORD") or None,
    )
