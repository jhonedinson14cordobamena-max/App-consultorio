# Trivia Bíblica — 120 Niveles

Juego de preguntas y respuestas sobre la Biblia. El frontend es HTML, CSS y
JavaScript puro (sin dependencias); desde el nivel 21 se apoya en un backend
propio (`backend/`) para cuentas de usuario y pagos reales con Wompi.

**Propósito del juego**: traer las historias del pasado bíblico al presente. No se trata solo de memorizar datos sobre los personajes, sino de ver qué hicieron en el pasado y cómo aplicar ese mismo ejemplo hoy y en el futuro.

## Modelo de acceso

- **Niveles 1 a 20: gratis**, sin necesidad de cuenta. Progreso guardado en el navegador.
- **Niveles 21 a 100**: requieren crear una cuenta gratuita y pagar una suscripción única de **$38.000 COP**.
- **Niveles 101 a 120**: requieren, además, un pago adicional de **$15.000 COP**.
- Al completar el nivel 120 se obtiene, de obsequio, un **certificado de finalización** descargable con el nombre del jugador.
- Los suscriptores participan además en la rifa de un bono por un **porcentaje que, por ahora, se mantiene como una incógnita** (ver nota legal más abajo).

Los pagos se procesan con **Wompi** y el acceso pagado se verifica en un backend propio (no en el navegador) para que no se pueda "desbloquear" nada editando el almacenamiento local. Ver `backend/README.md` para la puesta en marcha, configuración de llaves y una checklist antes de cobrar dinero real.

## Cómo jugarlo (solo niveles gratis 1-20)

Abre `index.html` en cualquier navegador, o sirve la carpeta con un servidor estático:

```bash
cd biblia-trivia
python3 -m http.server 8080
# luego abre http://localhost:8080
```

Con esto ya se puede jugar completo del nivel 1 al 20. Para desbloquear del 21 en adelante hace falta además levantar el backend (`backend/`, ver su README) con las credenciales reales de Wompi.

## Estructura

- `index.html` — pantallas del juego (menú, cómo jugar, galería de personajes, niveles, juego, resultado, cuenta, muro de pago, certificado).
- `css/styles.css` — estilos.
- `js/questions.js` — banco de preguntas (180 en total, 15 por tema), agrupado en 12 temas ("tiers") bíblicos, con personajes de todo el Antiguo y Nuevo Testamento.
- `js/teachings.js` — enseñanzas bíblicas por tema: qué hizo el personaje **en el pasado** y cómo aplicarlo **hoy y en el futuro**, con un reto de opción múltiple.
- `js/characters.js` — Galería de Personajes Bíblicos: más de 200 figuras nombradas, de Génesis a Apocalipsis, agrupadas por época.
- `js/api.js` — cliente del backend: registro/login, progreso de pago, checkout de Wompi.
- `js/i18n.js` — sistema de idiomas: textos de la interfaz (`UI_STRINGS`) y funciones que resuelven qué banco de contenido usar según el idioma activo.
- `js/torah-talmud.js` — modo bonus gratis: preguntas de la Torá (Levítico, Números, Deuteronomio) y leyendas del Talmud/Midrash, claramente diferenciadas.
- `js/game.js` — motor del juego: progresión de dificultad, temporizador, vidas, puntaje, enseñanza aplicada, galería de personajes, modo Torá/Talmud, muro de pago, certificado e idiomas.
- `backend/` — servidor Node.js/Express + SQLite: cuentas, progreso server-side de los niveles pagos, e integración con Wompi (checkout y webhooks). Ver `backend/README.md`.

## Diseño de la dificultad (niveles 1 a 120)

Los 120 niveles se agrupan de 10 en 10 en 12 temas bíblicos, de lo más conocido a lo más específico:

1. Génesis y la Creación
2. Los Patriarcas
3. Éxodo y los Mandamientos
4. Jueces y Reyes
5. Sabiduría y Profetas I
6. Profetas Mayores y Menores
7. Vida de Jesús
8. Parábolas y Enseñanzas
9. Apóstoles y Hechos
10. Cartas Paulinas
11. Apocalipsis y Profecía
12. Trivia Experta

Dentro de cada tema, la dificultad sube nivel a nivel mediante:

- **Tiempo por pregunta**: de 22s (nivel 1) hasta 6s (nivel 120).
- **Preguntas por ronda**: de 5 hasta 8.
- **Aciertos mínimos para pasar**: de 3 hasta ~7.
- **Vidas disponibles**: 4 en los niveles iniciales, 3 a partir del 61, 2 a partir del 101.
- **Multiplicador de puntaje**: crece con el nivel, premiando además la velocidad de respuesta.

El progreso de los niveles 1-20 se guarda automáticamente en el navegador; del nivel 21 en adelante se guarda en el backend, asociado a la cuenta del jugador.

## Certificado y bono sorpresa

Al completar el nivel 120 (con la suscripción hasta el 120 activa), el menú
muestra un botón **"🎓 Mi certificado"** que genera —en el propio navegador,
con un `<canvas>`— un certificado personalizado con el nombre del jugador y
la fecha, descargable como imagen PNG.

Además, el juego anuncia una promoción: los suscriptores participan en la
rifa de un bono por **un porcentaje que se mantiene como una incógnita**.
Esto está implementado **únicamente como texto de marketing** en la
interfaz, sin ningún mecanismo de sorteo real dentro del código. Se decidió
así a propósito: las rifas o sorteos ligados a un pago suelen estar
regulados como juegos de suerte y azar (en Colombia, por Coljuegos). Antes
de anunciar o entregar un premio real, se recomienda confirmar con un
asesor legal si se necesita autorización.

## Galería de Personajes Bíblicos

Desde el menú principal, el botón **"Personajes de la Biblia"** abre una galería con más de 200 figuras nombradas, agrupadas en 10 épocas/secciones que recorren toda la Biblia:

1. Orígenes: Creación y primeros descendientes (Génesis 1–11)
2. Los Patriarcas y sus familias (Génesis 12–50)
3. Éxodo y el desierto
4. Conquista y Jueces (Josué–Rut)
5. Reino unido: Samuel, Saúl, David y Salomón
6. Reinos divididos y sus profetas
7. Exilio y regreso (Esdras, Nehemías, Ester, Daniel)
8. Sabiduría, Salmos y profetas menores
9. Los Evangelios: la vida de Jesús
10. Hechos y la iglesia primitiva

**Nota honesta**: la Biblia menciona miles de nombres, muchos solo en genealogías. Esta galería no pretende ser una lista exhaustiva letra por letra, pero cubre de forma amplia y representativa a los personajes con papel narrativo en cada libro y época — todos ellos también aparecen en las preguntas de trivia o inspiran alguna de las enseñanzas aplicadas.

## Enseñanza aplicada: del pasado al presente

Al superar cada nivel, el juego muestra una **enseñanza bíblica** con una estructura fija:

1. **En el pasado**: qué hizo un personaje bíblico concreto (ej. "En el pasado, David enfrentó a Goliat confiando en Dios...").
2. **Hoy y en el futuro**: cómo aplicar ese mismo ejemplo a la vida actual (ej. "...ante un problema que parece un gigante, enfrenta el miedo con fe y preparación").
3. **Reto de aplicación**: una situación de opción múltiple donde el jugador elige la mejor forma de vivir esa enseñanza, ganando 50 puntos de bonus por acertar.

La idea central del juego es esa: no memorizar datos sueltos sobre personajes del pasado, sino traer sus historias al presente y practicar cómo aplicarlas hoy y en el futuro.

## Datos históricos puntuales en cada pregunta

Cada una de las 180 preguntas incluye, además de la respuesta, un **dato histórico concreto** que se muestra justo después de responder: un número exacto (edades, medidas, cantidades de años), un lugar geográfico preciso, o el detalle cronológico/narrativo inmediato del suceso (por ejemplo, cuántos codos medía el arca de Noé, cuántos días tomó reconstruir el muro de Jerusalén, o el nombre exacto del pozo donde Jesús habló con la samaritana). Esto responde a la idea de que el juego no se quede en la respuesta correcta, sino que ancle cada evento en algo puntual y verificable de la Biblia.

## Torá y Leyendas del Talmud (modo bonus, gratis)

Desde el menú, el botón **"📜 Torá y Leyendas del Talmud"** abre un espacio gratuito y separado de los 120 niveles de pago — no requiere cuenta ni suscripción. Cada ronda mezcla al azar 10 preguntas de dos fuentes muy distintas, siempre etiquetadas para que no se confundan:

- **📖 Torá (texto bíblico)**: 20 preguntas que profundizan específicamente en Levítico, Números y Deuteronomio (fiestas, sacrificios, el Shemá, las hijas de Zelofehad, el monte Nebo, etc.), con referencia exacta de capítulo — igual de verificables que el resto del banco de preguntas del juego.
- **✨ Leyenda del Talmud (tradición, no es la Biblia)**: 11 leyendas del Talmud y el Midrash (Hagadá) — como Abraham rompiendo los ídolos de su padre, el pastor Akiva y la piedra horadada por una gota de agua, o el debate del "horno de Ajnai" — cada una con su fuente exacta (tratado talmúdico) y marcada explícitamente como tradición oral judía posterior, **no** parte del texto de la Torá ni de la Biblia cristiana.

## Idiomas

El juego está disponible en **español** (idioma original) e **inglés**, con un selector en la esquina superior del menú. El idioma se detecta automáticamente del navegador la primera vez, y luego se recuerda en ese navegador.

Todo el contenido está traducido en ambos idiomas: las 180 preguntas con su dato histórico, las 24 enseñanzas aplicadas, las más de 200 entradas de la Galería de Personajes, y las 31 preguntas del modo Torá y Talmud — además de toda la interfaz (menús, botones, pantallas de cuenta, muro de pago y certificado).

La arquitectura (`js/i18n.js`) está pensada para agregar más idiomas fácilmente: cada archivo de contenido guarda su versión en español como `_ES` (canónica) y agrega variantes `_EN`, `_PT`, etc. con la misma estructura; si un idioma no tiene aún cierta traducción, el juego cae automáticamente al español en vez de romperse.
