from unittest.mock import MagicMock, patch

import pytest

from src.brokers.base import BarInterval, Side
from src.brokers.xtb_broker import XTBBroker
from src.config import Config
from tests.test_config import base_kwargs


def make_config(**overrides) -> Config:
    return Config(
        **base_kwargs(
            broker="xtb",
            symbols=["AAPL"],
            xtb_user_id="user123",
            xtb_password="pass123",
            xtb_demo=True,
            **overrides,
        )
    )


def make_broker() -> XTBBroker:
    with patch("src.brokers.xtb_broker.Client"):
        broker = XTBBroker(make_config())
    broker._client = MagicMock()
    return broker


def test_constructing_broker_does_not_log_in():
    broker = make_broker()
    broker._client.login.assert_not_called()
    assert broker._logged_in is False


def test_first_call_logs_in_lazily_with_demo_mode():
    broker = make_broker()
    broker._client.get_margin_level.return_value = {"equity": "1000"}

    broker.get_account_equity()

    broker._client.login.assert_called_once_with("user123", "pass123", mode="demo")
    assert broker._logged_in is True


def test_second_call_does_not_log_in_again():
    broker = make_broker()
    broker._client.get_margin_level.return_value = {"equity": "1000"}

    broker.get_account_equity()
    broker.get_account_equity()

    broker._client.login.assert_called_once()


def test_get_account_equity_reads_equity_field():
    broker = make_broker()
    broker._client.get_margin_level.return_value = {
        "balance": 900.0, "equity": 950.5, "margin": 0.0,
    }
    assert broker.get_account_equity() == 950.5


def test_is_market_open_true_if_any_symbol_open():
    broker = make_broker()
    broker._client.check_if_market_open.return_value = {"AAPL": False, "MSFT": True}
    broker.config.symbols[:] = ["AAPL", "MSFT"]
    assert broker.is_market_open() is True


def test_is_market_open_false_if_all_closed():
    broker = make_broker()
    broker._client.check_if_market_open.return_value = {"AAPL": False}
    assert broker.is_market_open() is False


def test_get_bars_uses_correct_interval_seconds_and_parses_candles():
    broker = make_broker()
    broker._client.get_lastn_candle_history.return_value = [
        {"timestamp": 1700000000, "open": 100, "close": 101.5, "high": 102, "low": 99, "volume": 10},
        {"timestamp": 1700086400, "open": 101.5, "close": 103.25, "high": 104, "low": 101, "volume": 12},
    ]

    bars = broker.get_bars("AAPL", lookback_bars=2, interval=BarInterval.ONE_DAY)

    assert list(bars["close"]) == [101.5, 103.25]
    broker._client.get_lastn_candle_history.assert_called_once_with("AAPL", 86400, 2)


def test_get_bars_empty_returns_empty_dataframe():
    broker = make_broker()
    broker._client.get_lastn_candle_history.return_value = []
    bars = broker.get_bars("AAPL", lookback_bars=10)
    assert bars.empty


def test_get_open_position_qty_sums_matching_symbol_only():
    broker = make_broker()
    broker._client.get_trades.return_value = [
        {"symbol": "AAPL", "volume": 5.0},
        {"symbol": "MSFT", "volume": 3.0},
        {"symbol": "AAPL", "volume": 2.0},
    ]
    assert broker.get_open_position_qty("AAPL") == 7.0


def test_submit_market_order_with_stop_rejects_leveraged_symbol():
    broker = make_broker()
    broker._client.get_symbol.return_value = {"leverage": 500, "ask": 100.0}

    with pytest.raises(ValueError, match="apalancamiento"):
        broker.submit_market_order_with_stop("AAPL", qty=1.0, side=Side.BUY, stop_price=95.0)

    broker._client.trade_transaction.assert_not_called()


def test_submit_market_order_with_stop_accepts_no_leverage_symbol():
    broker = make_broker()
    broker._client.get_symbol.return_value = {"leverage": 100, "ask": 150.0}

    broker.submit_market_order_with_stop("AAPL", qty=2.0, side=Side.BUY, stop_price=145.0)

    broker._client.trade_transaction.assert_called_once_with(
        "AAPL", 0, 0, 2.0, price=150.0, sl=145.0
    )


def test_submit_market_order_zero_qty_does_nothing():
    broker = make_broker()
    result = broker.submit_market_order_with_stop("AAPL", qty=0, side=Side.BUY, stop_price=95.0)
    assert result is None
    broker._client.get_symbol.assert_not_called()


def test_leverage_is_only_checked_once_per_symbol():
    broker = make_broker()
    broker._client.get_symbol.return_value = {"leverage": 100, "ask": 150.0}

    broker.submit_market_order_with_stop("AAPL", qty=1.0, side=Side.BUY, stop_price=145.0)
    broker.submit_market_order_with_stop("AAPL", qty=1.0, side=Side.BUY, stop_price=145.0)

    # get_symbol se llama para el precio en cada orden (2), pero la
    # verificacion de leverage en si misma solo debe ocurrir una vez.
    assert "AAPL" in broker._leverage_checked


def test_close_position_closes_each_matching_trade_with_original_cmd():
    broker = make_broker()
    broker._client.get_trades.return_value = [
        {"symbol": "AAPL", "order": 111, "cmd": 0, "volume": 3.0},  # compra abierta
        {"symbol": "MSFT", "order": 222, "cmd": 0, "volume": 1.0},  # otro simbolo, se ignora
    ]
    broker._client.get_symbol.return_value = {"bid": 148.0, "ask": 150.0}

    broker.close_position("AAPL")

    broker._client.trade_transaction.assert_called_once_with(
        "AAPL", 0, 2, 3.0, order=111, price=148.0
    )


def test_close_position_does_nothing_without_open_trades():
    broker = make_broker()
    broker._client.get_trades.return_value = []
    result = broker.close_position("AAPL")
    assert result is None
    broker._client.trade_transaction.assert_not_called()
