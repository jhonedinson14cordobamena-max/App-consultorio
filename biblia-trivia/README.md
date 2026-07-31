# Trivia Bíblica — 120 Niveles

Juego de preguntas y respuestas sobre la Biblia, 100% en el navegador (HTML, CSS y JavaScript puro, sin dependencias).

**Propósito del juego**: traer las historias del pasado bíblico al presente. No se trata solo de memorizar datos sobre los personajes, sino de ver qué hicieron en el pasado y cómo aplicar ese mismo ejemplo hoy y en el futuro.

## Cómo jugarlo

Abre `index.html` en cualquier navegador, o sirve la carpeta con un servidor estático:

```bash
cd biblia-trivia
python3 -m http.server 8080
# luego abre http://localhost:8080
```

## Estructura

- `index.html` — pantallas del juego (menú, cómo jugar, galería de personajes, niveles, juego, resultado).
- `css/styles.css` — estilos.
- `js/questions.js` — banco de preguntas (180 en total, 15 por tema), agrupado en 12 temas ("tiers") bíblicos, con personajes de todo el Antiguo y Nuevo Testamento.
- `js/teachings.js` — enseñanzas bíblicas por tema: qué hizo el personaje **en el pasado** y cómo aplicarlo **hoy y en el futuro**, con un reto de opción múltiple.
- `js/characters.js` — Galería de Personajes Bíblicos: más de 200 figuras nombradas, de Génesis a Apocalipsis, agrupadas por época.
- `js/game.js` — motor del juego: progresión de dificultad, temporizador, vidas, puntaje, enseñanza aplicada, galería de personajes y guardado del progreso (`localStorage`).

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

El progreso (nivel desbloqueado y puntaje total) se guarda automáticamente en el navegador.

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
