"""Notificaciones por email. Best-effort: un fallo al notificar nunca debe
tumbar el agente ni bloquear una decision de trading, solo se registra.

Si SMTP no esta configurado en .env, las notificaciones simplemente se
loguean en vez de enviarse (util para desarrollo/paper trading sin correo).
"""
from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText

from .config import Config

logger = logging.getLogger(__name__)


class Notifier:
    def __init__(self, config: Config) -> None:
        self.config = config

    def _configured(self) -> bool:
        return bool(
            self.config.notify_email_to
            and self.config.smtp_host
            and self.config.smtp_user
            and self.config.smtp_password
        )

    def notify(self, subject: str, body: str) -> None:
        full_subject = f"[trading-agent] {subject}"
        if not self._configured():
            logger.info("Notificacion (SMTP no configurado, solo log): %s | %s", full_subject, body)
            return

        try:
            msg = MIMEText(body)
            msg["Subject"] = full_subject
            msg["From"] = self.config.smtp_user
            msg["To"] = self.config.notify_email_to

            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port, timeout=10) as server:
                server.starttls()
                server.login(self.config.smtp_user, self.config.smtp_password)
                server.sendmail(self.config.smtp_user, [self.config.notify_email_to], msg.as_string())
            logger.info("Notificacion enviada por email: %s", full_subject)
        except Exception:
            logger.exception("No se pudo enviar la notificacion por email: %s", full_subject)

    def notify_order(self, action: str, symbol: str, qty: float, price: float, extra: str = "") -> None:
        self.notify(
            f"Orden ejecutada: {action} {symbol}",
            f"Accion: {action}\nSimbolo: {symbol}\nCantidad: {qty}\nPrecio aprox: {price}\n{extra}",
        )

    def notify_halt(self, reason: str) -> None:
        self.notify(
            "AGENTE DETENIDO (kill switch)",
            f"El agente se detuvo automaticamente: {reason}\n\n"
            "No volvera a operar hasta que ejecutes manualmente:\n"
            "  python main.py reset-halt",
        )
