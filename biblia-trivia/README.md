# Trivia Bíblica — 120 Niveles

Juego de preguntas y respuestas sobre la Biblia, 100% en el navegador (HTML, CSS y JavaScript puro, sin dependencias).

## Cómo jugarlo

Abre `index.html` en cualquier navegador, o sirve la carpeta con un servidor estático:

```bash
cd biblia-trivia
python3 -m http.server 8080
# luego abre http://localhost:8080
```

## Estructura

- `index.html` — pantallas del juego (menú, cómo jugar, niveles, juego, resultado).
- `css/styles.css` — estilos.
- `js/questions.js` — banco de preguntas, agrupado en 12 temas ("tiers") bíblicos.
- `js/game.js` — motor del juego: progresión de dificultad, temporizador, vidas, puntaje y guardado del progreso (`localStorage`).

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
