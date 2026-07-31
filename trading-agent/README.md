# trading-agent

Agente de **paper trading** (dinero simulado) que evalua acciones con una
estrategia de cruce de medias moviles (SMA crossover) y opera automaticamente
a traves de la API de [Alpaca](https://alpaca.markets/).

## Advertencia importante

**Ningun sistema de trading automatico es 100% efectivo.** No existe, ni
aqui ni en ningun fondo cuantitativo del mundo. Los mercados tienen ruido
irreducible (noticias, liquidez, otros algoritmos). Este proyecto:

- Opera **solo en modo paper (simulado)** por diseno. El codigo (`Config`)
  rechaza explicitamente `ALPACA_PAPER=false`.
- Incluye un **backtester** para medir honestamente el desempeno historico
  de la estrategia (retorno, win rate, drawdown) antes de confiar en ella.
- Incluye gestion de riesgo (tamano de posicion, stop-loss, freno por
  perdida diaria), pero eso limita el dano, no garantiza ganancias.

Pasar esto a dinero real es una decision que **no debe tomarse solo
cambiando una variable de entorno**: requiere revisar el codigo a fondo,
correr el agente en paper trading durante semanas/meses, y entender que
puedes perder dinero.

## Requisitos

- Python 3.11+
- Una cuenta gratuita de paper trading en Alpaca: https://app.alpaca.markets/paper/dashboard/overview

## Instalacion

```bash
cd trading-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edita .env con tus API keys de PAPER TRADING de Alpaca
```

## Uso

### 1. Backtest (recomendado antes que nada)

Prueba la estrategia contra datos historicos reales y mira las metricas:

```bash
python main.py backtest --symbol AAPL --days 400
```

Salida esperada: retorno total, numero de operaciones, win rate y max
drawdown. Ajusta `FAST_SMA_PERIOD` / `SLOW_SMA_PERIOD` en `.env` y vuelve a
correr para comparar.

### 2. Un solo ciclo de evaluacion (paper trading)

```bash
python main.py run --once
```

### 3. Agente corriendo en bucle (paper trading)

```bash
python main.py run
```

Evalua todos los `SYMBOLS` configurados cada `POLL_INTERVAL_MINUTES`
minutos, solo cuando el mercado esta abierto.

## Estructura

```
trading-agent/
├── main.py              # CLI: backtest / run
├── src/
│   ├── config.py         # Carga de .env y validaciones de seguridad
│   ├── broker.py         # Wrapper sobre alpaca-py (datos + ordenes)
│   ├── strategy.py        # Estrategia SMA crossover (reemplazable)
│   ├── risk.py            # Tamano de posicion, stop-loss, freno diario
│   ├── agent.py            # Bucle de evaluacion y decision
│   └── backtest.py         # Backtester vectorizado
└── tests/                # Tests unitarios (no requieren red ni API keys)
```

## Tests

```bash
pip install -r requirements.txt
pytest -v
```

## Como extender

- **Otra estrategia**: crea una clase con `required_bars()` y
  `generate_signal(bars) -> Signal` (ver `src/strategy.py`) y pasala a
  `TradingAgent` en `main.py`.
- **Mas simbolos**: agrega a `SYMBOLS` en `.env`.
- **Otro bróker**: reemplaza `src/broker.py` manteniendo la misma interfaz
  publica (`get_bars`, `get_account_equity`, `submit_market_order_with_stop`,
  etc.) para no tocar `agent.py`.
