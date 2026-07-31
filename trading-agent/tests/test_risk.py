import pytest

from src.risk import RiskManager


def make_risk(risk_pct=1.0, max_daily_loss_pct=3.0, stop_loss_pct=2.0) -> RiskManager:
    return RiskManager(risk_pct, max_daily_loss_pct, stop_loss_pct)


def test_stop_loss_price_buy():
    risk = make_risk(stop_loss_pct=2.0)
    assert risk.stop_loss_price(100.0, "buy") == 98.0


def test_stop_loss_price_sell():
    risk = make_risk(stop_loss_pct=2.0)
    assert risk.stop_loss_price(100.0, "sell") == 102.0


def test_stop_loss_price_invalid_side():
    risk = make_risk()
    with pytest.raises(ValueError):
        risk.stop_loss_price(100.0, "hold")


def test_position_size_respects_risk_budget():
    risk = make_risk(risk_pct=1.0)  # 1% de 10000 = 100 de riesgo
    # entrada 100, stop 98 -> riesgo por accion = 2 -> 50 acciones
    qty = risk.position_size(equity=10_000, entry_price=100.0, stop_price=98.0)
    assert qty == 50


def test_position_size_capped_by_affordability():
    risk = make_risk(risk_pct=50.0)  # riesgo enorme a proposito
    qty = risk.position_size(equity=1_000, entry_price=100.0, stop_price=99.0)
    # sin el tope, el riesgo permitiria comprar mas de lo que el equity alcanza
    assert qty <= 10


def test_position_size_zero_when_equity_zero():
    risk = make_risk()
    assert risk.position_size(equity=0, entry_price=100.0, stop_price=98.0) == 0


def test_daily_loss_limit_hit():
    risk = make_risk(max_daily_loss_pct=3.0)
    assert risk.daily_loss_limit_hit(10_000, 9_600) is True
    assert risk.daily_loss_limit_hit(10_000, 9_800) is False
