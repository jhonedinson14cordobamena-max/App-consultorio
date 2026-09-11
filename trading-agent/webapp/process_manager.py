"""Arranca/detiene el agente (`python main.py run`) como proceso aparte.

Asi el panel web puede prender/apagar el bot sin bloquearse el mismo, y el
agente sigue vivo aunque el servidor Flask se reinicie: es un proceso
genuinamente independiente, rastreado por PID en disco (no un hilo dentro
del proceso de Flask).
"""
from __future__ import annotations

import os
import signal
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STATE_DIR = BASE_DIR / "state"
PID_FILE = STATE_DIR / "agent.pid"
LOG_FILE = STATE_DIR / "agent.log"


def is_running() -> bool:
    pid = _read_pid()
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        _clear_pid()
        return False
    return True


def start() -> tuple[bool, str]:
    if is_running():
        return False, "El agente ya esta corriendo."
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    log = open(LOG_FILE, "a")
    process = subprocess.Popen(
        [sys.executable, "main.py", "run"],
        cwd=BASE_DIR,
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    PID_FILE.write_text(str(process.pid))
    return True, f"Agente iniciado (pid {process.pid})."


def stop() -> tuple[bool, str]:
    pid = _read_pid()
    if pid is None or not is_running():
        return False, "El agente no esta corriendo."
    os.kill(pid, signal.SIGTERM)
    _clear_pid()
    return True, "Agente detenido."


def tail_log(lines: int = 200) -> str:
    if not LOG_FILE.exists():
        return ""
    content = LOG_FILE.read_text().splitlines()
    return "\n".join(content[-lines:])


def _read_pid() -> int | None:
    if not PID_FILE.exists():
        return None
    try:
        return int(PID_FILE.read_text().strip())
    except ValueError:
        return None


def _clear_pid() -> None:
    PID_FILE.unlink(missing_ok=True)
