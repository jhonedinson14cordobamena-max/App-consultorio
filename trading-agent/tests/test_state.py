from pathlib import Path
from unittest.mock import patch

from src.state import StateStore


def make_store(tmp_path: Path) -> StateStore:
    return StateStore(path=tmp_path / "agent_state.json")


def test_not_halted_by_default(tmp_path):
    store = make_store(tmp_path)
    halted, reason = store.is_halted()
    assert halted is False
    assert reason is None


def test_halt_persists_across_instances(tmp_path):
    path = tmp_path / "agent_state.json"
    StateStore(path=path).halt("limite de perdida diaria")

    halted, reason = StateStore(path=path).is_halted()
    assert halted is True
    assert reason == "limite de perdida diaria"


def test_reset_halt_clears_state_and_baseline(tmp_path):
    path = tmp_path / "agent_state.json"
    store = StateStore(path=path)
    store.ensure_baseline(10_000.0)
    store.halt("kill switch de prueba")

    store.reset_halt()

    halted, reason = store.is_halted()
    assert halted is False
    assert reason is None
    # el baseline tambien se reinicia: la proxima llamada fija uno nuevo
    assert store.ensure_baseline(5_000.0) == 5_000.0


def test_ensure_baseline_is_captured_once(tmp_path):
    store = make_store(tmp_path)
    first = store.ensure_baseline(10_000.0)
    second = store.ensure_baseline(9_000.0)  # no debe sobreescribir
    assert first == 10_000.0
    assert second == 10_000.0


def test_ensure_start_of_day_equity_captured_once_same_day(tmp_path):
    store = make_store(tmp_path)
    first = store.ensure_start_of_day_equity(10_000.0)
    second = store.ensure_start_of_day_equity(9_500.0)  # mismo dia, no debe sobreescribir
    assert first == 10_000.0
    assert second == 10_000.0


def test_ensure_start_of_day_equity_persists_across_instances(tmp_path):
    path = tmp_path / "agent_state.json"
    StateStore(path=path).ensure_start_of_day_equity(10_000.0)

    # simula que el proceso se reinicio: instancia nueva, mismo archivo
    value = StateStore(path=path).ensure_start_of_day_equity(7_000.0)

    # NO debe recapturar contra el equity ya reducido del reinicio
    assert value == 10_000.0


def test_ensure_start_of_day_equity_resets_on_new_utc_day(tmp_path):
    from datetime import datetime, timezone

    store = make_store(tmp_path)
    day1 = datetime(2026, 8, 5, 10, 0, tzinfo=timezone.utc)
    day2 = datetime(2026, 8, 6, 1, 0, tzinfo=timezone.utc)

    with patch("src.state.datetime") as mock_dt:
        mock_dt.now.return_value = day1
        first = store.ensure_start_of_day_equity(10_000.0)

    with patch("src.state.datetime") as mock_dt:
        mock_dt.now.return_value = day2
        second = store.ensure_start_of_day_equity(9_000.0)

    assert first == 10_000.0
    assert second == 9_000.0


def test_reset_halt_also_clears_start_of_day_equity(tmp_path):
    store = make_store(tmp_path)
    store.ensure_start_of_day_equity(10_000.0)
    store.halt("prueba")

    store.reset_halt()

    assert store.ensure_start_of_day_equity(3_000.0) == 3_000.0
