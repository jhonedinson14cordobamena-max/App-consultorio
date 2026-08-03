import pytest

from src.config import Config


def base_kwargs(**overrides):
    kwargs = dict(
        api_key="k",
        secret_key="s",
        paper=True,
        symbols=["AAPL"],
        fast_sma_period=20,
        slow_sma_period=50,
        risk_per_trade_pct=1.0,
        max_daily_loss_pct=3.0,
        max_total_loss_pct=10.0,
        stop_loss_pct=2.0,
        poll_interval_minutes=15,
        max_capital_usd=None,
        notify_email_to=None,
        smtp_host=None,
        smtp_port=587,
        smtp_user=None,
        smtp_password=None,
    )
    kwargs.update(overrides)
    return kwargs


def test_valid_config_does_not_raise():
    Config(**base_kwargs())


def test_rejects_non_paper_mode():
    with pytest.raises(ValueError):
        Config(**base_kwargs(paper=False))


def test_rejects_total_loss_lower_than_daily_loss():
    with pytest.raises(ValueError):
        Config(**base_kwargs(max_daily_loss_pct=10.0, max_total_loss_pct=5.0))


def test_rejects_negative_max_capital():
    with pytest.raises(ValueError):
        Config(**base_kwargs(max_capital_usd=-100.0))


def test_accepts_positive_max_capital():
    Config(**base_kwargs(max_capital_usd=500.0))


def test_rejects_unknown_broker():
    with pytest.raises(ValueError):
        Config(**base_kwargs(broker="coinbase"))


def test_binance_requires_credentials():
    with pytest.raises(ValueError):
        Config(**base_kwargs(broker="binance", api_key="", secret_key=""))


def test_binance_rejects_non_testnet():
    with pytest.raises(ValueError):
        Config(
            **base_kwargs(
                broker="binance",
                binance_api_key="k",
                binance_secret_key="s",
                binance_testnet=False,
            )
        )


def test_binance_valid_config_does_not_raise():
    Config(
        **base_kwargs(
            broker="binance",
            symbols=["BTCUSDT"],
            api_key="",
            secret_key="",
            binance_api_key="k",
            binance_secret_key="s",
            binance_testnet=True,
        )
    )


def test_alpaca_broker_does_not_require_binance_credentials():
    # el default es broker=alpaca; no debe exigir credenciales de binance
    Config(**base_kwargs())
