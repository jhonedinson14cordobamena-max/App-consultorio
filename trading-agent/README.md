# trading-agent

Agente de trading **simulado** (dinero de mentira, datos de mercado reales)
que evalua simbolos con una estrategia de cruce de medias moviles (SMA
crossover) y opera automaticamente a traves de [XTB](https://www.xtb.com/)
(acciones/ETFs sin apalancamiento, cuenta demo — **broker por defecto**),
[Alpaca](https://alpaca.markets/) (acciones/ETFs, paper trading) o
[Binance](https://testnet.binance.vision) (cripto, spot testnet). Se usa un
broker a la vez, seleccionable con `BROKER=xtb`, `BROKER=alpaca` o
`BROKER=binance` en `.env`.

## Advertencia importante

**Ningun sistema de trading automatico es 100% efectivo.** No existe, ni
aqui ni en ningun fondo cuantitativo del mundo. Los mercados tienen ruido
irreducible (noticias, liquidez, otros algoritmos). Este proyecto:

- Opera **solo en modo simulado** por diseno. El codigo (`Config`) rechaza
  explicitamente `XTB_DEMO=false` (XTB), `ALPACA_PAPER=false` (Alpaca) y
  `BINANCE_TESTNET=false` (Binance) sin importar cual broker este activo.
- Con XTB, ademas rechaza en tiempo de ejecucion cualquier simbolo que no
  sea 1:1 (sin apalancamiento) — ver "Limitaciones conocidas" mas abajo.
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
revisar y quitar el guard de `Config.xtb_demo` / `Config.paper` /
`Config.binance_testnet`, usar credenciales reales (no las de demo/paper/
testnet), y haber corrido el agente el tiempo suficiente para confiar en las
metricas del backtest y del historial real de ejecucion.

## Requisitos

- Python 3.11+
- Para XTB: cuenta DEMO — se crea gratis en https://www.xtb.com/ (usuario y
  contrasena de esa cuenta demo, no de la real)
- Para Alpaca: cuenta gratuita de paper trading — https://app.alpaca.markets/paper/dashboard/overview
- Para Binance: claves de testnet (inicia sesion con GitHub) — https://testnet.binance.vision

## Instalacion

```bash
cd trading-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edita .env: elige BROKER=xtb (default), BROKER=alpaca o BROKER=binance y
# completa las credenciales correspondientes (siempre de cuenta demo/paper/
# testnet, nunca las reales)
```

## Uso

### 1. Backtest (recomendado antes que nada)

Prueba la estrategia contra datos historicos reales y mira las metricas:

```bash
python main.py backtest --symbol AAPL --days 400      # con BROKER=xtb o BROKER=alpaca
python main.py backtest --symbol BTCUSDT --days 400   # con BROKER=binance
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
minutos. Con XTB o Alpaca, solo cuando el mercado de acciones esta abierto;
con Binance evalua siempre (cripto opera 24/7). El freno de perdida "diaria"
se recalcula automaticamente en cada cambio de dia (UTC), incluso si el
proceso lleva semanas corriendo sin reiniciarse.

### 4. Reactivar tras un kill switch

```bash
python main.py reset-halt
```

Muestra el motivo del halt y pide confirmacion explicita antes de reanudar.

## Estructura

```
trading-agent/
├── main.py                    # CLI: backtest / run / reset-halt
├── src/
│   ├── config.py               # Carga de .env y validaciones de seguridad
│   ├── brokers/
│   │   ├── base.py              # Interfaz comun (BrokerBase, Side, BarInterval)
│   │   ├── xtb_broker.py        # Implementacion sobre XTBApi (cuenta demo)
│   │   ├── alpaca_broker.py     # Implementacion sobre alpaca-py (paper)
│   │   ├── binance_broker.py    # Implementacion sobre python-binance (testnet)
│   │   └── __init__.py          # create_broker(config) -> BrokerBase
│   ├── strategy.py              # Estrategia SMA crossover (reemplazable)
│   ├── risk.py                  # Tamano de posicion, stop-loss, frenos de perdida
│   ├── state.py                 # Kill switch persistente (state/agent_state.json)
│   ├── notifier.py               # Notificaciones por email (best-effort)
│   ├── agent.py                  # Bucle de evaluacion y decision (agnostico al broker)
│   └── backtest.py               # Backtester vectorizado
└── tests/                    # Tests unitarios (no requieren red ni API keys)
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
- **Mas simbolos**: agrega a `SYMBOLS` en `.env` (formato segun el broker
  activo: `AAPL,MSFT` para XTB/Alpaca, `BTCUSDT,ETHUSDT` para Binance).
- **Otro broker**: implementa `BrokerBase` (`src/brokers/base.py`) en un
  archivo nuevo dentro de `src/brokers/` y agregalo a `create_broker()` en
  `src/brokers/__init__.py`. `agent.py` no necesita cambios: solo conoce la
  interfaz comun.

## Limitaciones conocidas

### XTB

- Este bot esta pensado solo para acciones/ETFs sin apalancamiento. Antes de
  operar cualquier simbolo por primera vez, se consulta su `leverage` real
  via `getSymbol` y se rechaza si no es 1:1 — asi un simbolo CFD apalancado
  no se cuela por un error de configuracion o de eleccion de simbolo.
  `RISK_PER_TRADE_PCT` / el resto de `risk.py` asumen esto (sin margen).
- A diferencia de Binance, `get_bars` SI usa la sesion demo directamente
  (no una separada de datos "reales"): las cuentas demo de XTB reflejan los
  mismos precios de mercado que la cuenta real, a diferencia del testnet de
  Binance (que es una red de pruebas aparte, con historial limitado).
- No hay SDK oficial de Python para XTB; se usa la libreria de terceros
  `XTBApi`, que habla el protocolo WebSocket documentado de xStation5.
- Cerrar una posicion asume una sola operacion abierta por simbolo a la vez
  (coherente con como el resto del bot decide: no abre una segunda posicion
  en un simbolo que ya tiene una abierta).

### Binance

- Solo opera contra pares cotizados en `USDT` (ej. `BTCUSDT`), para poder
  calcular el equity en una sola moneda.
- El stop-loss se implementa como una orden `STOP_LOSS_LIMIT` separada tras
  la compra a mercado (no es una orden OCO atomica como el bracket order de
  Alpaca). Si la orden de stop falla despues de una compra exitosa, la
  posicion queda sin proteccion automatica y se registra un error explicito
  en el log — revisar manualmente en ese caso.
