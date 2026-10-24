# Daat Agente (Android)

Agente personal: responde **solo WhatsApp Business** con Claude (el WhatsApp personal se ignora por completo), revisa la pauta de Meta Ads, modo Shabbat automático, tareas programadas que tocan botones, y comandos de voz.

## 1. Obtener el APK (sin computador)
1. Crea un repositorio en GitHub y sube esta carpeta completa.
2. Pestaña **Actions → Compilar APK → Run workflow**.
3. Al terminar (~5 min), descarga el artefacto `DaatAgente-apk` e instala `app-debug.apk` en el teléfono.

Con computador: abrir la carpeta en Android Studio → Run.

## 2. Activar permisos (una vez)
1. Ajustes → Apps → Daat Agente → ⋮ → **Permitir ajustes restringidos** (Android 13+).
2. En la app: **Permiso: Accesibilidad** → activar Daat Agente.
3. En la app: **Permiso: Leer notificaciones** → activar Daat Agente.
4. Ajustes → Batería → Daat Agente → **Sin restricciones**.
5. Panel rápido (deslizar dos veces) → lápiz → arrastrar **Daat Voz**.

## 3. Configurar (en la app, sección ⚙️)
- `claude_api_key`: clave de console.anthropic.com.
- `anuncios.meta_token` y `anuncios.cuenta` (`act_XXXX`): desde Meta Business → Usuarios del sistema → token con `ads_read`.
- `whatsapp.instrucciones`: cómo debe responder a clientes.
- `whatsapp.ignorar_contactos`: nombres a los que NO debe responder (familia, etc.).

## 4. Ampliar sin programar
**Nuevo comando de voz** → agregar a `comandos_voz`:
```json
{ "frases": ["abre nequi"], "accion": "abrir_app", "valor": "com.nequi.MobileApp" }
```
**Nueva tarea programada** → agregar a `tareas`:
```json
{ "nombre": "Revisar leads", "hora": "17:30", "dias": ["MON","WED","FRI"],
  "accion": "abrir_y_tocar", "valor": "com.facebook.pages.app", "texto": "Clientes potenciales" }
```
Si dices algo que no está en la lista, Claude lo interpreta y elige la acción.

Acciones disponibles: `shabbat_on`, `shabbat_off`, `whatsapp_on`, `whatsapp_off`, `revisar_anuncios`, `abrir_app`, `tocar`, `abrir_y_tocar`, `abrir_url`, `notificar`.
Acciones nuevas (con código): agregar un caso en `Acciones.kt → ejecutar()`.

## Modo Shabbat
- Ventana: viernes 18:15 → sábado 18:59 (editable en `shabbat.inicio` / `shabbat.fin`).
- Bloquea apps de bancos/billeteras/apuestas y todos los juegos (las devuelve al inicio).
- Responde WhatsApp Business una sola vez por contacto: "Pronto un asesor te estará atendiendo." (sin mencionar Shabbat).
- No ejecuta tareas programadas.

## Límites
- Tareas con precisión de ±15 min (límite de Android en segundo plano).
- No escucha "palabra mágica" permanente (gasta batería): usa el botón **Daat Voz** o "Hey Google, abre Daat Agente".
- La respuesta de WhatsApp funciona sobre la notificación: si abres el chat antes, ese mensaje no se responde.

## Dos versiones
- **DaatAgente.apk (segura):** se instala sin bloqueo de Play Protect. Shabbat bloquea apps con "Acceso a uso de apps" + "Mostrar sobre otras apps". Voz, pauta y tareas funcionan. No lee WhatsApp ni toca botones.
- **DaatAgente-completa.apk:** todo, incluida la respuesta de WhatsApp Business con Claude. Play Protect puede bloquearla.

### Shabbat en WhatsApp Business (versión segura)
WhatsApp Business → Herramientas para la empresa:
1. **Horario comercial:** dom–jue abierto 24 h; vie 00:00–18:15; sáb 19:00–23:59.
2. **Mensaje de ausencia:** activar, texto "Pronto un asesor te estará atendiendo.", programar **Fuera del horario comercial**.
