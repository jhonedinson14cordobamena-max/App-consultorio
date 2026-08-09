"""Punto de entrada del agente de paper trading.

Uso:
    python main.py backtest --symbol AAPL --days 400
    python main.py run --once
    python main.py run
    python main.py reset-halt
"""
from __future__ import annotations

import argparse
import logging
import time

from src.agent import TradingAgent
from src.backtest import run_backtest
from src.brokers import create_broker
from src.config import load_config
from src.notifier import Notifier
from src.risk import RiskManager
from src.state import StateStore
from src.strategy import Strategy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")


def cmd_backtest(args: argparse.Namespace) -> None:
    config = load_config()
    broker = create_broker(config)
    strategy = Strategy(config.fast_sma_period, config.slow_sma_period)

    bars = broker.get_bars(args.symbol, lookback_bars=args.days)
    if bars.empty:
        logger.error("No se obtuvieron datos historicos para %s", args.symbol)
        return

    result = run_backtest(bars, strategy, starting_equity=args.equity)
    print(f"\nBacktest de {args.symbol} ({len(bars)} barras diarias)\n")
    print(result.summary())


def cmd_run(args: argparse.Namespace) -> None:
    config = load_config()
    broker = create_broker(config)
    strategy = Strategy(config.fast_sma_period, config.slow_sma_period)
    risk = RiskManager(config.risk_per_trade_pct, config.max_daily_loss_pct, config.stop_loss_pct)
    notifier = Notifier(config)
    state_store = StateStore()
    agent = TradingAgent(config, broker, strategy, risk, notifier, state_store)

    halted, reason = state_store.is_halted()
    if halted:
        logger.error(
            "El agente esta detenido por el kill switch (%s). "
            "Ejecuta 'python main.py reset-halt' si revisaste la causa y quieres reanudar.",
            reason,
        )
        return

    logger.info(
        "Agente iniciado (broker=%s, simulado/testnet). Simbolos: %s. Capital max: %s. Intervalo: %s min.",
        config.broker,
        config.symbols,
        config.max_capital_usd or "sin tope (usa equity de la cuenta)",
        config.poll_interval_minutes,
    )

    if args.once:
        agent.run_once()
        return

    while True:
        try:
            agent.run_once()
        except Exception:
            logger.exception("Error en el ciclo del agente, se reintenta en el proximo intervalo.")
        time.sleep(config.poll_interval_minutes * 60)


def cmd_reset_halt(args: argparse.Namespace) -> None:
    state_store = StateStore()
    halted, reason = state_store.is_halted()
    if not halted:
        print("El agente no esta detenido. Nada que reactivar.")
        return
    print(f"Motivo del halt actual: {reason}")
    confirm = input("Escribe 'reactivar' para confirmar que revisaste la causa y quieres continuar: ")
    if confirm.strip().lower() != "reactivar":
        print("Cancelado. El agente sigue detenido.")
        return
    state_store.reset_halt()
    print("Kill switch reactivado. El agente volvera a operar en el proximo ciclo.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Agente de trading simulado (XTB demo / Alpaca paper / Binance testnet)"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    backtest_parser = subparsers.add_parser("backtest", help="Probar la estrategia con datos historicos")
    backtest_parser.add_argument("--symbol", required=True)
    backtest_parser.add_argument("--days", type=int, default=400)
    backtest_parser.add_argument("--equity", type=float, default=10_000.0)
    backtest_parser.set_defaults(func=cmd_backtest)

    run_parser = subparsers.add_parser("run", help="Ejecutar el agente en paper trading")
    run_parser.add_argument("--once", action="store_true", help="Ejecutar un solo ciclo y salir")
    run_parser.set_defaults(func=cmd_run)

    reset_halt_parser = subparsers.add_parser(
        "reset-halt", help="Reactivar manualmente el agente tras un kill switch"
    )
    reset_halt_parser.set_defaults(func=cmd_reset_halt)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
