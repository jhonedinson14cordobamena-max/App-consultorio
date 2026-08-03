import pytest

from src.brokers import create_broker
from src.brokers.alpaca_broker import AlpacaBroker
from src.brokers.binance_broker import BinanceBroker
from tests.test_config import base_kwargs
from src.config import Config


def test_create_broker_alpaca_returns_alpaca_broker():
    config = Config(**base_kwargs())
    broker = create_broker(config)
    assert isinstance(broker, AlpacaBroker)


def test_create_broker_binance_returns_binance_broker():
    config = Config(
        **base_kwargs(
            broker="binance",
            symbols=["BTCUSDT"],
            binance_api_key="k",
            binance_secret_key="s",
            binance_testnet=True,
        )
    )
    broker = create_broker(config)
    assert isinstance(broker, BinanceBroker)


def test_create_broker_unknown_raises():
    # Config ya rechaza brokers desconocidos, pero create_broker tambien
    # debe fallar explicitamente si alguna vez se le pasa uno igual.
    config = Config(**base_kwargs())
    object.__setattr__(config, "broker", "coinbase")
    with pytest.raises(ValueError):
        create_broker(config)
