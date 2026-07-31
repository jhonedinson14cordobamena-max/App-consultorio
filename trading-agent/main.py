"""Punto de entrada del agente de paper trading.

Uso:
    python main.py backtest --symbol AAPL --days 400
    python main.py run --once
    python main.py run
"""
from __future__ import annotations

import argparse
import logging
import time

from alpaca.data.timeframe import TimeFrame

from src.agent import TradingAgent
from src.backtest import run_backtest
from src.broker import Broker
from src.config import load_config
from src.risk import RiskManager
from src.strategy import Strategy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")


def cmd_backtest(args: argparse.Namespace) -> None:
    config = load_config()
    broker = Broker(config)
    strategy = Strategy(config.fast_sma_period, config.slow_sma_period)

    bars = broker.get_bars(args.symbol, lookback_bars=args.days, timeframe=TimeFrame.Day)
    if bars.empty:
        logger.error("No se obtuvieron datos historicos para %s", args.symbol)
        return

    result = run_backtest(bars, strategy, starting_equity=args.equity)
    print(f"\nBacktest de {args.symbol} ({len(bars)} barras diarias)\n")
    print(result.summary())


def cmd_run(args: argparse.Namespace) -> None:
    config = load_config()
    broker = Broker(config)
    strategy = Strategy(config.fast_sma_period, config.slow_sma_period)
    risk = RiskManager(config.risk_per_trade_pct, config.max_daily_loss_pct, config.stop_loss_pct)
    agent = TradingAgent(config, broker, strategy, risk)

    logger.info(
        "Agente iniciado en modo PAPER TRADING. Simbolos: %s. Intervalo: %s min.",
        config.symbols,
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Agente de paper trading (Alpaca)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    backtest_parser = subparsers.add_parser("backtest", help="Probar la estrategia con datos historicos")
    backtest_parser.add_argument("--symbol", required=True)
    backtest_parser.add_argument("--days", type=int, default=400)
    backtest_parser.add_argument("--equity", type=float, default=10_000.0)
    backtest_parser.set_defaults(func=cmd_backtest)

    run_parser = subparsers.add_parser("run", help="Ejecutar el agente en paper trading")
    run_parser.add_argument("--once", action="store_true", help="Ejecutar un solo ciclo y salir")
    run_parser.set_defaults(func=cmd_run)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
