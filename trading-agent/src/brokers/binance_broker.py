"""Implementacion de BrokerBase sobre python-binance (Binance Spot Testnet).

Toda instancia creada aqui apunta SIEMPRE al testnet de Binance (ver
Config, que rechaza BINANCE_TESTNET=false), por la misma razon que Alpaca
esta fijado a paper: separar "conectar con el exchange" de "arriesgar
dinero real" es una salvaguarda deliberada, no un detalle de configuracion.

Solo opera contra pares cotizados en USDT (ej. BTCUSDT, ETHUSDT) para
poder calcular un "equity" simple en una sola moneda.
"""
from __future__ import annotations

import logging

import pandas as pd
from binance.client import Client
from binance.enums import (
    KLINE_INTERVAL_15MINUTE,
    KLINE_INTERVAL_1DAY,
    KLINE_INTERVAL_1HOUR,
    ORDER_TYPE_STOP_LOSS_LIMIT,
    SIDE_BUY,
    SIDE_SELL,
    TIME_IN_FORCE_GTC,
)
from binance.helpers import round_step_size

from ..config import Config
from .base import BarInterval, BrokerBase, Side

logger = logging.getLogger(__name__)

_INTERVAL_MAP = {
    BarInterval.ONE_DAY: KLINE_INTERVAL_1DAY,
    BarInterval.ONE_HOUR: KLINE_INTERVAL_1HOUR,
    BarInterval.FIFTEEN_MIN: KLINE_INTERVAL_15MINUTE,
}

_SIDE_MAP = {Side.BUY: SIDE_BUY, Side.SELL: SIDE_SELL}

_QUOTE_ASSET = "USDT"


def _base_asset(symbol: str) -> str:
    if not symbol.endswith(_QUOTE_ASSET):
        raise ValueError(f"Simbolo '{symbol}' no cotiza en USDT (se esperaba algo como BTCUSDT).")
    return symbol[: -len(_QUOTE_ASSET)]


class BinanceBroker(BrokerBase):
    def __init__(self, config: Config) -> None:
        self.config = config
        self._client = Client(config.binance_api_key, config.binance_secret_key, testnet=True, ping=False)
        self._filters_cache: dict[str, dict] = {}

    def _symbol_filters(self, symbol: str) -> dict:
        if symbol not in self._filters_cache:
            info = self._client.get_symbol_info(symbol)
            if info is None:
                raise ValueError(f"Binance no reconoce el simbolo '{symbol}'.")
            filters = {f["filterType"]: f for f in info["filters"]}
            self._filters_cache[symbol] = filters
        return self._filters_cache[symbol]

    def _step_size(self, symbol: str) -> float:
        return float(self._symbol_filters(symbol)["LOT_SIZE"]["stepSize"])

    def _tick_size(self, symbol: str) -> float:
        return float(self._symbol_filters(symbol)["PRICE_FILTER"]["tickSize"])

    def get_account_equity(self) -> float:
        account = self._client.get_account()
        balances = {b["asset"]: float(b["free"]) + float(b["locked"]) for b in account["balances"]}

        equity = balances.get(_QUOTE_ASSET, 0.0)
        for symbol in self.config.symbols:
            base = _base_asset(symbol)
            qty = balances.get(base, 0.0)
            if qty <= 0:
                continue
            price = float(self._client.get_symbol_ticker(symbol=symbol)["price"])
            equity += qty * price
        return equity

    def is_market_open(self) -> bool:
        return True  # cripto opera 24/7

    def get_bars(
        self, symbol: str, lookback_bars: int, interval: BarInterval = BarInterval.ONE_DAY
    ) -> pd.DataFrame:
        klines = self._client.get_klines(
            symbol=symbol, interval=_INTERVAL_MAP[interval], limit=lookback_bars
        )
        if not klines:
            return pd.DataFrame(columns=["close"])
        closes = [float(k[4]) for k in klines]
        open_times = [pd.to_datetime(k[0], unit="ms", utc=True) for k in klines]
        return pd.DataFrame({"close": closes}, index=open_times).sort_index()

    def get_open_position_qty(self, symbol: str) -> float:
        try:
            base = _base_asset(symbol)
            balance = self._client.get_asset_balance(asset=base)
            if balance is None:
                return 0.0
            return float(balance["free"]) + float(balance["locked"])
        except Exception:
            logger.exception("No se pudo consultar la posicion de %s", symbol)
            return 0.0

    def submit_market_order_with_stop(self, symbol: str, qty: float, side: Side, stop_price: float):
        step_size = self._step_size(symbol)
        tick_size = self._tick_size(symbol)
        qty = round_step_size(qty, step_size)
        if qty <= 0:
            logger.info("Cantidad 0 (tras redondear a step_size) para %s, no se envia orden.", symbol)
            return None

        logger.info("Enviando orden de compra: %s x%s (mercado)", symbol, qty)
        buy_order = self._client.create_order(
            symbol=symbol, side=_SIDE_MAP[side], type="MARKET", quantity=qty
        )

        stop_price = round_step_size(stop_price, tick_size)
        limit_price = round_step_size(stop_price * 0.995, tick_size)
        logger.info("Enviando stop-loss: %s x%s stop=%s limite=%s", symbol, qty, stop_price, limit_price)
        try:
            self._client.create_order(
                symbol=symbol,
                side=SIDE_SELL,
                type=ORDER_TYPE_STOP_LOSS_LIMIT,
                timeInForce=TIME_IN_FORCE_GTC,
                quantity=qty,
                stopPrice=stop_price,
                price=limit_price,
            )
        except Exception:
            logger.exception(
                "La compra se ejecuto pero el stop-loss para %s fallo. "
                "La posicion queda SIN proteccion automatica, revisar manualmente.",
                symbol,
            )
        return buy_order

    def close_position(self, symbol: str):
        for order in self._client.get_open_orders(symbol=symbol):
            logger.info("Cancelando orden abierta %s en %s antes de cerrar posicion.", order["orderId"], symbol)
            self._client.cancel_order(symbol=symbol, orderId=order["orderId"])

        qty = self.get_open_position_qty(symbol)
        step_size = self._step_size(symbol)
        qty = round_step_size(qty, step_size)
        if qty <= 0:
            logger.info("Sin cantidad para cerrar en %s.", symbol)
            return None

        logger.info("Cerrando posicion: vendiendo %s x%s (mercado)", symbol, qty)
        return self._client.create_order(symbol=symbol, side=SIDE_SELL, type="MARKET", quantity=qty)
