from unittest.mock import patch

import pytest
from dotenv import dotenv_values

from src.state import StateStore
from webapp import env_store, process_manager
from webapp.app import create_app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(env_store, "ENV_PATH", tmp_path / ".env")
    monkeypatch.setattr(process_manager, "PID_FILE", tmp_path / "agent.pid")
    monkeypatch.setattr(process_manager, "LOG_FILE", tmp_path / "agent.log")
    monkeypatch.setattr(process_manager, "STATE_DIR", tmp_path)

    state_store = StateStore(path=tmp_path / "agent_state.json")
    app = create_app(state_store=state_store)
    app.config.update(TESTING=True)
    app.state_store_for_tests = state_store  # solo para que los tests lo reusen
    return app.test_client()


def _state_store(client) -> StateStore:
    return client.application.state_store_for_tests


def test_index_page_loads(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"trading-agent" in resp.data


def test_status_defaults_when_nothing_configured(client):
    resp = client.get("/api/status")
    data = resp.get_json()
    assert data["running"] is False
    assert data["halted"] is False
    assert data["halted_reason"] is None
    assert data["config"] == {}


def test_reset_halt_when_not_halted_returns_ok_false(client):
    resp = client.post("/api/reset-halt")
    data = resp.get_json()
    assert data["ok"] is False


def test_reset_halt_when_halted_clears_it(client):
    state_store = _state_store(client)
    state_store.halt("limite de perdida diaria")

    resp = client.post("/api/reset-halt")
    data = resp.get_json()

    assert data["ok"] is True
    halted, _ = state_store.is_halted()
    assert halted is False


def test_status_reflects_halt_reason(client):
    state_store = _state_store(client)
    state_store.halt("prueba de halt")

    data = client.get("/api/status").get_json()

    assert data["halted"] is True
    assert data["halted_reason"] == "prueba de halt"


def test_config_get_masks_secrets_but_not_plain_fields(client, tmp_path):
    (tmp_path / ".env").write_text("XTB_USER_ID=demo1\nXTB_PASSWORD=secret123\nSYMBOLS=AAPL\n")

    data = client.get("/api/config").get_json()

    assert data["SYMBOLS"] == "AAPL"
    assert data["XTB_USER_ID"] == "•" * 8
    assert data["XTB_PASSWORD"] == "•" * 8


def test_config_post_updates_plain_field(client, tmp_path):
    (tmp_path / ".env").write_text("SYMBOLS=AAPL\n")

    resp = client.post("/api/config", json={"SYMBOLS": "AAPL,MSFT"})

    assert resp.get_json()["ok"] is True
    assert dotenv_values(tmp_path / ".env")["SYMBOLS"] == "AAPL,MSFT"


def test_config_post_never_overwrites_secret_with_mask_placeholder(client, tmp_path):
    (tmp_path / ".env").write_text("XTB_PASSWORD=real-secret\n")

    client.post("/api/config", json={"XTB_PASSWORD": "•" * 8})

    assert dotenv_values(tmp_path / ".env")["XTB_PASSWORD"] == "real-secret"


def test_config_post_ignores_unknown_fields(client, tmp_path):
    (tmp_path / ".env").write_text("SYMBOLS=AAPL\n")

    client.post("/api/config", json={"SOME_RANDOM_KEY": "hack"})

    values = dotenv_values(tmp_path / ".env")
    assert "SOME_RANDOM_KEY" not in values


def test_backtest_missing_symbol_returns_400(client):
    resp = client.post("/api/backtest", json={"symbol": "", "days": "400"})
    assert resp.status_code == 400


def test_run_start_writes_pid_and_status_reflects_running(client, tmp_path):
    with patch("webapp.process_manager.subprocess.Popen") as mock_popen, patch(
        "webapp.process_manager.os.kill"
    ) as mock_kill:
        mock_popen.return_value.pid = 4321
        mock_kill.return_value = None  # simula que el proceso SI esta vivo

        resp = client.post("/api/run/start")
        assert resp.get_json()["ok"] is True
        assert (tmp_path / "agent.pid").read_text() == "4321"

        status = client.get("/api/status").get_json()
        assert status["running"] is True


def test_run_start_twice_does_not_spawn_a_second_process(client):
    with patch("webapp.process_manager.subprocess.Popen") as mock_popen, patch(
        "webapp.process_manager.os.kill"
    ):
        mock_popen.return_value.pid = 4321
        client.post("/api/run/start")
        resp = client.post("/api/run/start")

    data = resp.get_json()
    assert data["ok"] is False
    assert mock_popen.call_count == 1


def test_run_stop_when_not_running_returns_ok_false(client):
    resp = client.post("/api/run/stop")
    assert resp.get_json()["ok"] is False


def test_run_stop_sends_sigterm_and_clears_pid(client, tmp_path):
    with patch("webapp.process_manager.subprocess.Popen") as mock_popen, patch(
        "webapp.process_manager.os.kill"
    ) as mock_kill:
        mock_popen.return_value.pid = 4321
        mock_kill.return_value = None
        client.post("/api/run/start")

        resp = client.post("/api/run/stop")

    assert resp.get_json()["ok"] is True
    assert not (tmp_path / "agent.pid").exists()


def test_status_self_heals_stale_pid_file(client, tmp_path):
    # un PID que casi seguro no corresponde a ningun proceso real
    (tmp_path / "agent.pid").write_text("999999999")

    data = client.get("/api/status").get_json()

    assert data["running"] is False
    assert not (tmp_path / "agent.pid").exists()
