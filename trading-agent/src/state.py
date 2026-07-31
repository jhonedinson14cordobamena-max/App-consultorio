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
        perdida total, para que el usuario empiece de cero conscientemente."""
        state = self.load()
        state.halted = False
        state.halted_reason = None
        state.halted_at = None
        state.baseline_equity = None
        self.save(state)
