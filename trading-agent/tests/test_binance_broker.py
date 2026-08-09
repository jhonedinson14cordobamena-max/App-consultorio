from unittest.mock import MagicMock, patch

import pytest

from src.brokers.base import BarInterval, Side
from src.brokers.binance_broker import BinanceBroker, _base_asset
from src.config import Config
from tests.test_config import base_kwargs


def make_config(**overrides) -> Config:
    return Config(
        **base_kwargs(
            broker="binance",
            symbols=["BTCUSDT"],
            binance_api_key="k",
            binance_secret_key="s",
            binance_testnet=True,
            **overrides,
        )
    )


def make_broker() -> BinanceBroker:
    """_client (testnet, credenciales) y _market_client (Binance real, publico)
    se reemplazan por mocks INDEPENDIENTES a proposito, para que un test que
    use el mock equivocado falle en vez de pasar por accidente."""
    with patch("src.brokers.binance_broker.Client"):
        broker = BinanceBroker(make_config())
    broker._client = MagicMock(name="testnet_client")
    broker._market_client = MagicMock(name="public_market_client")
    return broker


def test_base_asset_extracts_correctly():
    assert _base_asset("BTCUSDT") == "BTC"
    assert _base_asset("ETHUSDT") == "ETH"


def test_base_asset_rejects_non_usdt_pairs():
    with pytest.raises(ValueError):
        _base_asset("BTCEUR")


def test_get_bars_parses_klines_into_dataframe():
    broker = make_broker()
    # [open_time, open, high, low, close, volume, close_time, ...]
    broker._market_client.get_klines.return_value = [
        [1700000000000, "100", "105", "95", "101.5", "10", 0, 0, 0, 0, 0, 0],
        [1700086400000, "101.5", "106", "99", "103.25", "12", 0, 0, 0, 0, 0, 0],
    ]

    bars = broker.get_bars("BTCUSDT", lookback_bars=2, interval=BarInterval.ONE_DAY)

    assert list(bars["close"]) == [101.5, 103.25]
    broker._market_client.get_klines.assert_called_once_with(symbol="BTCUSDT", interval="1d", limit=2)
    broker._client.get_klines.assert_not_called()  # nunca contra el testnet


def test_get_bars_empty_klines_returns_empty_dataframe():
    broker = make_broker()
    broker._market_client.get_klines.return_value = []
    bars = broker.get_bars("BTCUSDT", lookback_bars=10)
    assert bars.empty


def test_get_account_equity_sums_usdt_and_position_value():
    broker = make_broker()
    broker._client.get_account.return_value = {
        "balances": [
            {"asset": "USDT", "free": "1000", "locked": "0"},
            {"asset": "BTC", "free": "0.5", "locked": "0.1"},
        ]
    }
    broker._market_client.get_symbol_ticker.return_value = {"symbol": "BTCUSDT", "price": "20000"}

    equity = broker.get_account_equity()

    # 1000 USDT + 0.6 BTC * 20000 = 13000
    assert equity == 13000.0
    broker._client.get_symbol_ticker.assert_not_called()  # el precio viene del cliente publico


def test_get_open_position_qty_sums_free_and_locked():
    broker = make_broker()
    broker._client.get_asset_balance.return_value = {"asset": "BTC", "free": "0.5", "locked": "0.1"}
    qty = broker.get_open_position_qty("BTCUSDT")
    assert qty == pytest.approx(0.6)


def test_get_open_position_qty_returns_zero_on_error():
    broker = make_broker()
    broker._client.get_asset_balance.side_effect = Exception("boom")
    assert broker.get_open_position_qty("BTCUSDT") == 0.0


def _mock_symbol_filters(broker, step_size="0.0001", tick_size="0.01"):
    broker._client.get_symbol_info.return_value = {
        "filters": [
            {"filterType": "LOT_SIZE", "stepSize": step_size, "minQty": step_size},
            {"filterType": "PRICE_FILTER", "tickSize": tick_size},
        ]
    }


def test_submit_market_order_with_stop_rounds_qty_and_places_two_orders():
    broker = make_broker()
    _mock_symbol_filters(broker)

    broker.submit_market_order_with_stop("BTCUSDT", qty=0.123456, side=Side.BUY, stop_price=19800.005)

    assert broker._client.create_order.call_count == 2
    buy_call = broker._client.create_order.call_args_list[0].kwargs
    stop_call = broker._client.create_order.call_args_list[1].kwargs

    assert buy_call["side"] == "BUY"
    assert buy_call["type"] == "MARKET"
    assert buy_call["quantity"] == pytest.approx(0.1234)  # redondeado a step_size 0.0001

    assert stop_call["side"] == "SELL"
    assert stop_call["type"] == "STOP_LOSS_LIMIT"
    assert stop_call["quantity"] == pytest.approx(0.1234)

    broker._market_client.create_order.assert_not_called()  # ordenes solo van al testnet


def test_submit_market_order_with_zero_qty_after_rounding_does_nothing():
    broker = make_broker()
    _mock_symbol_filters(broker, step_size="1")  # step_size grande fuerza qty=0

    result = broker.submit_market_order_with_stop("BTCUSDT", qty=0.5, side=Side.BUY, stop_price=100.0)

    assert result is None
    broker._client.create_order.assert_not_called()


def test_close_position_cancels_open_orders_then_sells_all():
    broker = make_broker()
    _mock_symbol_filters(broker)
    broker._client.get_open_orders.return_value = [{"orderId": 42}]
    broker._client.get_asset_balance.return_value = {"asset": "BTC", "free": "0.2", "locked": "0"}

    broker.close_position("BTCUSDT")

    broker._client.cancel_order.assert_called_once_with(symbol="BTCUSDT", orderId=42)
    sell_call = broker._client.create_order.call_args.kwargs
    assert sell_call["side"] == "SELL"
    assert sell_call["type"] == "MARKET"
    assert sell_call["quantity"] == pytest.approx(0.2)


def test_close_position_does_nothing_when_no_balance():
    broker = make_broker()
    _mock_symbol_filters(broker)
    broker._client.get_open_orders.return_value = []
    broker._client.get_asset_balance.return_value = {"asset": "BTC", "free": "0", "locked": "0"}

    result = broker.close_position("BTCUSDT")

    assert result is None
    broker._client.create_order.assert_not_called()
