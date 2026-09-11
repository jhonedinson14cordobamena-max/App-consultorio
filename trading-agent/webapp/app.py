"""Panel web para ver y controlar el agente sin usar la terminal.

Pensado para correr localmente (o en un Codespace) y abrirse en el
navegador. NO tiene autenticacion: si lo corres en un Codespace, deja el
puerto en visibilidad "Private" (el default) y nunca lo pongas en
"Public" — cualquiera con la URL podria iniciar/detener el agente o
cambiar su configuracion.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from src.state import StateStore

from . import env_store, process_manager

BASE_DIR = Path(__file__).resolve().parent.parent


def create_app(state_store: StateStore | None = None) -> Flask:
    app = Flask(__name__)
    state_store = state_store or StateStore()

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/api/status")
    def api_status():
        halted, reason = state_store.is_halted()
        state = state_store.load()
        return jsonify(
            {
                "running": process_manager.is_running(),
                "halted": halted,
                "halted_reason": reason,
                "baseline_equity": state.baseline_equity,
                "equity_start_of_day": state.equity_start_of_day,
                "config": env_store.read_env(),
            }
        )

    @app.post("/api/run/start")
    def api_run_start():
        ok, message = process_manager.start()
        return jsonify({"ok": ok, "message": message})

    @app.post("/api/run/stop")
    def api_run_stop():
        ok, message = process_manager.stop()
        return jsonify({"ok": ok, "message": message})

    @app.post("/api/reset-halt")
    def api_reset_halt():
        halted, _ = state_store.is_halted()
        if not halted:
            return jsonify({"ok": False, "message": "El agente no esta detenido."})
        state_store.reset_halt()
        return jsonify({"ok": True, "message": "Kill switch reactivado."})

    @app.get("/api/log")
    def api_log():
        return jsonify({"log": process_manager.tail_log()})

    @app.get("/api/config")
    def api_config_get():
        return jsonify(env_store.read_env())

    @app.post("/api/config")
    def api_config_post():
        updates = request.get_json(force=True, silent=True) or {}
        env_store.write_env({str(k): str(v) for k, v in updates.items()})
        return jsonify(
            {
                "ok": True,
                "message": "Configuracion guardada. Si el agente ya estaba "
                "corriendo, detenlo y vuelve a iniciarlo para aplicar los cambios.",
            }
        )

    @app.post("/api/backtest")
    def api_backtest():
        data = request.get_json(force=True, silent=True) or {}
        symbol = str(data.get("symbol", "")).strip()
        days = str(data.get("days", "400")).strip()
        if not symbol:
            return jsonify({"ok": False, "output": "Falta el simbolo."}), 400
        try:
            result = subprocess.run(
                [sys.executable, "main.py", "backtest", "--symbol", symbol, "--days", days],
                cwd=BASE_DIR,
                capture_output=True,
                text=True,
                timeout=120,
            )
        except subprocess.TimeoutExpired:
            return jsonify({"ok": False, "output": "El backtest tardo demasiado (timeout)."}), 504
        output = (result.stdout or "") + (result.stderr or "")
        return jsonify({"ok": result.returncode == 0, "output": output})

    return app
