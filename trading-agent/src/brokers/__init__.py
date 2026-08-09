from __future__ import annotations

from ..config import Config
from .base import BarInterval, BrokerBase, Side

__all__ = ["BarInterval", "BrokerBase", "Side", "create_broker"]


def create_broker(config: Config) -> BrokerBase:
    if config.broker == "alpaca":
        from .alpaca_broker import AlpacaBroker

        return AlpacaBroker(config)
    if config.broker == "binance":
        from .binance_broker import BinanceBroker

        return BinanceBroker(config)
    if config.broker == "xtb":
        from .xtb_broker import XTBBroker

        return XTBBroker(config)
    raise ValueError(f"Broker desconocido: {config.broker!r} (usa 'alpaca', 'binance' o 'xtb')")
