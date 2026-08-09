import pandas as pd
import pytest

from src.strategy import Signal, Strategy


def make_bars(prices: list[float]) -> pd.DataFrame:
    return pd.DataFrame({"close": prices})


def test_rejects_invalid_periods():
    with pytest.raises(ValueError):
        Strategy(fast_period=50, slow_period=20)


def test_hold_when_not_enough_bars():
    strategy = Strategy(fast_period=2, slow_period=4)
    bars = make_bars([1, 2, 3])
    assert strategy.generate_signal(bars) == Signal.HOLD


def test_buy_on_golden_cross():
    strategy = Strategy(fast_period=2, slow_period=3)
    # precios cayendo y luego un salto fuerte -> la SMA rapida cruza hacia arriba
    prices = [10, 9, 8, 7, 6, 20]
    bars = make_bars(prices)
    assert strategy.generate_signal(bars) == Signal.BUY


def test_sell_on_death_cross():
    strategy = Strategy(fast_period=2, slow_period=3)
    prices = [6, 7, 8, 9, 10, 1]
    bars = make_bars(prices)
    assert strategy.generate_signal(bars) == Signal.SELL


def test_hold_missing_close_column_raises():
    strategy = Strategy(fast_period=2, slow_period=3)
    bars = pd.DataFrame({"price": [1, 2, 3, 4]})
    with pytest.raises(ValueError):
        strategy.generate_signal(bars)
