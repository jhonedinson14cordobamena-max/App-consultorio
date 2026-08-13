# Backend de Trivia Bíblica (cuentas, progreso de pago y Wompi)

Este backend existe por un motivo concreto: los niveles 1-20 son gratis y
funcionan solo en el navegador, pero a partir del nivel 21 el acceso depende
de un pago real, y eso **no se puede verificar de forma segura solo con
JavaScript en el navegador** (cualquiera podría editar el localStorage para
"desbloquear" niveles sin pagar). Por eso, desde el nivel 21:

- El progreso se guarda en una base de datos (SQLite), no en el navegador.
- Cada intento de avanzar de nivel se valida contra la cuenta y la
  suscripción del usuario.
- Los pagos se procesan con **Wompi** (Web Checkout) y se confirman por
  *webhook*, no por lo que diga el navegador.

## 1. Instalación

```bash
cd biblia-trivia/backend
npm install
cp .env.example .env
```

Edita `.env` y completa **tus propios valores**. Puntos importantes:

- **Nunca subas `.env` a git** (ya está en `.gitignore`). Nunca pegues tus
  llaves reales de Wompi en un chat, en un commit, en un issue o en
  cualquier archivo que se vaya a compartir.
- `JWT_SECRET`: genera uno único y largo, por ejemplo:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `WOMPI_PUBLIC_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`: los
  encuentras en tu Dashboard de Wompi → *Comercios* → *Configuración* →
  *Secretos de integración*. Hay un juego de llaves de **sandbox** (pruebas,
  `pub_test_...` / `test_integrity_...`) y otro de **producción**
  (`pub_prod_...` / `prod_integrity_...`). No los mezcles.
- `PRICE_TIER_100_COP` y `PRICE_TIER_120_COP`: 38000 y 15000 por defecto,
  según lo solicitado (nivel 21 al 100, y 101 al 120 respectivamente).

## 2. Ejecutar en desarrollo

```bash
npm run dev
```

El servidor escucha por defecto en `http://localhost:3001`. El frontend
(`index.html`) debe apuntar aquí — configura `window.TRIVIA_API_BASE_URL`
antes de cargar `js/api.js` si usas otro puerto/dominio, por ejemplo:

```html
<script>window.TRIVIA_API_BASE_URL = "https://tu-backend.tudominio.com/api";</script>
<script src="js/api.js"></script>
```

## 3. Antes de cobrar dinero real: checklist obligatorio

1. **Prueba todo en modo sandbox primero.** Usa las llaves `pub_test_...` de
   Wompi y sus [tarjetas de prueba](https://docs.wompi.co/) para simular
   pagos aprobados y rechazados. No actives las llaves de producción hasta
   haber probado el flujo completo: registro → pago → webhook → nivel
   desbloqueado.
2. **Verifica la integración contra la documentación oficial vigente de
   Wompi** (https://docs.wompi.co/, secciones "Widget & Checkout Web" y
   "Eventos"). Las fórmulas de firma implementadas en `src/wompi.js` están
   basadas en su documentación pública, pero Wompi puede actualizar su API;
   confirma que coincide antes de operar con dinero real.
3. **Configura el webhook en tu Dashboard de Wompi** apuntando a
   `https://tu-backend.tudominio.com/api/payments/webhook`. Sin esto, los
   pagos aprobados nunca desbloquearán niveles (el navegador nunca decide
   esto por sí solo, a propósito).
4. **Usa HTTPS en producción**, tanto para el frontend como el backend. Los
   tokens de sesión y los datos de pago no deben viajar sin cifrar.
5. **Aspectos legales y de negocio** (esto no lo resuelve el código, lo
   define quien opera el negocio):
   - Define y publica términos de servicio y una política de reembolsos.
     En Colombia, las compras hechas por internet suelen tener derecho de
     retracto (Ley 1480 de 2011, Estatuto del Consumidor) — verifica cómo
     aplica a tu caso con un asesor legal.
   - Cumple con la Ley 1581 de 2012 (protección de datos personales) para
     los correos, nombres y contraseñas que este backend almacena.
   - Ten claro el manejo de impuestos (IVA, retenciones) sobre lo cobrado.
   - El "bono/rifa de porcentaje incógnita" mencionado en el juego se dejó
     **solo como texto de marketing**, sin ningún mecanismo de sorteo real
     implementado, precisamente porque las rifas o sorteos ligados a un
     pago suelen estar regulados como juegos de suerte y azar en Colombia
     (Coljuegos). Si en el futuro quieres implementar un sorteo real con
     premio, consulta con un abogado si necesitas autorización antes de
     operarlo con usuarios reales.

## 4. Modelo de datos

- `users`: cuenta (correo, contraseña con hash bcrypt, nombre).
- `progress`: por usuario — `unlocked_level` (solo relevante desde el 21),
  `total_score` (puntos ganados en niveles pagos), `tier`
  (`free` / `tier100` / `tier120`), `completed_at` (fecha en que terminó el
  nivel 120 con `tier120`, para habilitar el certificado).
- `payments`: cada intento de pago (referencia, monto, estado, id de
  transacción de Wompi).

## 5. Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Crea cuenta, devuelve token |
| POST | `/api/auth/login` | — | Inicia sesión, devuelve token |
| GET | `/api/auth/me` | Bearer | Perfil + progreso actual |
| GET | `/api/progress` | Bearer | Progreso actual |
| POST | `/api/progress/advance` | Bearer | Registra el resultado de un nivel pago (21-120) |
| GET | `/api/payments/prices` | — | Precios vigentes en COP |
| POST | `/api/payments/create-checkout` | Bearer | Genera la URL del Web Checkout de Wompi |
| GET | `/api/payments/status/:reference` | Bearer | Estado de un pago propio |
| POST | `/api/payments/webhook` | — (firma verificada) | Wompi confirma pagos aquí |

## 6. Certificado

Cuando `progress.completed_at` deja de ser `null` (nivel 120 aprobado con
`tier120`), el frontend habilita el botón "🎓 Mi certificado", que dibuja un
certificado personalizado en un `<canvas>` con el nombre de la cuenta y la
fecha, descargable como PNG. Es enteramente del lado del cliente; no requiere
un servicio externo de generación de PDFs.
