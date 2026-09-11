"""Lectura/escritura de .env para el panel web, sin exponer secretos.

Usa python-dotenv (ya es dependencia del proyecto) para no reinventar el
parseo de .env, y para que escribir una clave preserve el resto del
archivo tal cual.
"""
from __future__ import annotations

from pathlib import Path

from dotenv import dotenv_values, set_key

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

_MASK = "•" * 8  # "••••••••"

# Nunca se devuelven en texto plano al navegador.
_SECRET_FIELDS = {
    "ALPACA_API_KEY",
    "ALPACA_SECRET_KEY",
    "BINANCE_API_KEY",
    "BINANCE_SECRET_KEY",
    "XTB_USER_ID",
    "XTB_PASSWORD",
    "SMTP_USER",
    "SMTP_PASSWORD",
}

# Unicas claves que el panel puede escribir (todo lo demas en el POST se ignora).
_EDITABLE_FIELDS = _SECRET_FIELDS | {
    "BROKER",
    "SYMBOLS",
    "FAST_SMA_PERIOD",
    "SLOW_SMA_PERIOD",
    "RISK_PER_TRADE_PCT",
    "MAX_DAILY_LOSS_PCT",
    "MAX_TOTAL_LOSS_PCT",
    "STOP_LOSS_PCT",
    "POLL_INTERVAL_MINUTES",
    "MAX_CAPITAL_USD",
    "NOTIFY_EMAIL_TO",
    "SMTP_HOST",
    "SMTP_PORT",
    "ALPACA_PAPER",
    "BINANCE_TESTNET",
    "XTB_DEMO",
}


def read_env() -> dict[str, str]:
    if not ENV_PATH.exists():
        return {}
    values = dotenv_values(ENV_PATH)
    safe: dict[str, str] = {}
    for key, value in values.items():
        if key in _SECRET_FIELDS:
            safe[key] = _MASK if value else ""
        else:
            safe[key] = value or ""
    return safe


def write_env(updates: dict[str, str]) -> None:
    if not ENV_PATH.exists():
        ENV_PATH.touch()
    for key, value in updates.items():
        if key not in _EDITABLE_FIELDS:
            continue
        if key in _SECRET_FIELDS and value == _MASK:
            # El frontend nos devuelve el placeholder enmascarado cuando el
            # usuario no toco ese campo: nunca sobreescribir con eso.
            continue
        set_key(str(ENV_PATH), key, value, quote_mode="never")
