"""Estado persistente del agente: baseline de equity y kill switch.

El kill switch es intencionalmente "pegajoso": una vez que el agente se
detiene por un limite de perdida, NO vuelve a operar solo, ni al reiniciar
el proceso ni al dia siguiente. Requiere una accion humana explicita
(`python main.py reset-halt`) para reanudar. Esa friccion es deliberada:
un freno que se levanta solo no protege de nada.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_STATE_PATH = Path(__file__).resolve().parent.parent / "state" / "agent_state.json"


@dataclass
class AgentState:
    baseline_equity: float | None = None
    equity_start_of_day: float | None = None
    equity_start_of_day_date: str | None = None  # ISO date (UTC), ej. "2026-08-05"
    halted: bool = False
    halted_reason: str | None = None
    halted_at: str | None = None


class StateStore:
    def __init__(self, path: Path = DEFAULT_STATE_PATH) -> None:
        self.path = path

    def load(self) -> AgentState:
        if not self.path.exists():
            return AgentState()
        data = json.loads(self.path.read_text())
        return AgentState(**data)

    def save(self, state: AgentState) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(asdict(state), indent=2))

    def ensure_baseline(self, equity_now: float) -> float:
        state = self.load()
        if state.baseline_equity is None:
            state.baseline_equity = equity_now
            self.save(state)
        return state.baseline_equity

    def ensure_start_of_day_equity(self, equity_now: float) -> float:
        """Equity de referencia para el freno de perdida DIARIA. Persistido
        en disco (no solo en memoria del proceso): si el agente se reinicia
        a mitad del dia justo despues de una perdida grande, debe seguir
        comparando contra el equity de inicio de ese mismo dia, no contra
        el equity ya reducido del momento del reinicio."""
        today = datetime.now(timezone.utc).date().isoformat()
        state = self.load()
        if state.equity_start_of_day is None or state.equity_start_of_day_date != today:
            state.equity_start_of_day = equity_now
            state.equity_start_of_day_date = today
            self.save(state)
        return state.equity_start_of_day

    def is_halted(self) -> tuple[bool, str | None]:
        state = self.load()
        return state.halted, state.halted_reason

    def halt(self, reason: str) -> None:
        state = self.load()
        state.halted = True
        state.halted_reason = reason
        state.halted_at = datetime.now(timezone.utc).isoformat()
        self.save(state)

    def reset_halt(self) -> None:
        """Reactivacion manual explicita. Tambien reinicia el baseline de
        perdida total y el de perdida diaria, para que el usuario empiece
        de cero conscientemente en vez de arrastrar un punto de referencia
        de antes del halt."""
        state = self.load()
        state.halted = False
        state.halted_reason = None
        state.halted_at = None
        state.baseline_equity = None
        state.equity_start_of_day = None
        state.equity_start_of_day_date = None
        self.save(state)
