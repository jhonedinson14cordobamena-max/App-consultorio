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
- Incluye gestion de riesgo (tamano de posicion, stop-loss, tope de capital,
  freno por perdida diaria y freno por perdida total), pero eso limita el
  dano, no garantiza ganancias.

Pasar esto a dinero real es una decision que **no debe tomarse solo
cambiando una variable de entorno**: requiere revisar el codigo a fondo,
correr el agente en paper trading durante semanas/meses, y entender que
puedes perder dinero.

## Salvaguardas antes de considerar cuenta real

Estas tres cosas existen especificamente para cuando (si) se evalue pasar a
cuenta real, y estan activas incluso en paper trading para poder probarlas:

1. **Tope de capital (`MAX_CAPITAL_USD`)**: el calculo de tamano de posicion
   usa `min(equity de la cuenta, MAX_CAPITAL_USD)`, nunca el equity completo
   de la cuenta si se define este tope. Vacio = usa todo el equity de la
   cuenta (paper).
2. **Kill switch persistente** (`src/state.py`): si se toca
   `MAX_DAILY_LOSS_PCT` o `MAX_TOTAL_LOSS_PCT`, el agente escribe su estado
   en `state/agent_state.json` y **deja de operar**, incluso si se reinicia
   el proceso o cambia el dia. Solo se reactiva con:
   ```bash
   python main.py reset-halt
   ```
   que exige confirmacion explicita escribiendo "reactivar".
3. **Notificaciones** (`src/notifier.py`): cada orden ejecutada (compra o
   cierre) y cada activacion del kill switch generan una notificacion por
   email (configurable via `NOTIFY_EMAIL_TO` / `SMTP_*` en `.env`). Sin SMTP
   configurado, las notificaciones solo quedan en el log.

Ir a cuenta real ademas requeriria (no implementado todavia, a proposito):
revisar y quitar el guard de `Config.paper`, usar las credenciales reales de
Alpaca (no las de paper), y haber corrido el agente en paper el tiempo
suficiente para confiar en las metricas del backtest y del historial real
de ejecucion.

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

### 4. Reactivar tras un kill switch

```bash
python main.py reset-halt
```

Muestra el motivo del halt y pide confirmacion explicita antes de reanudar.

## Estructura

```
trading-agent/
├── main.py              # CLI: backtest / run / reset-halt
├── src/
│   ├── config.py         # Carga de .env y validaciones de seguridad
│   ├── broker.py         # Wrapper sobre alpaca-py (datos + ordenes)
│   ├── strategy.py        # Estrategia SMA crossover (reemplazable)
│   ├── risk.py            # Tamano de posicion, stop-loss, frenos de perdida
│   ├── state.py            # Kill switch persistente (state/agent_state.json)
│   ├── notifier.py          # Notificaciones por email (best-effort)
│   ├── agent.py             # Bucle de evaluacion y decision
│   └── backtest.py          # Backtester vectorizado
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
