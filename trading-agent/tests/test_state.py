from pathlib import Path

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
