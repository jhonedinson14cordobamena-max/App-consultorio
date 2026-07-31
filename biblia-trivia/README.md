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
- `js/questions.js` — banco de preguntas (180 en total, 15 por tema), agrupado en 12 temas ("tiers") bíblicos, con personajes de todo el Antiguo y Nuevo Testamento.
- `js/teachings.js` — enseñanzas bíblicas por tema y retos de aplicación práctica a la vida diaria.
- `js/game.js` — motor del juego: progresión de dificultad, temporizador, vidas, puntaje, enseñanza aplicada y guardado del progreso (`localStorage`).

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

## Personajes bíblicos incluidos

Las preguntas cubren personajes de toda la Biblia, entre ellos:

- **Antiguo Testamento**: Adán, Eva, Caín, Abel, Set, Enoc, Noé, Abraham, Sara, Agar, Isaac, Jacob, Esaú, Labán, José, Moisés, Miriam, Aarón, Josué, Caleb, Balaam, Débora, Sansón, Rut, Noemí, Booz, Ana, Samuel, Saúl, David, Jonatán, Abigail, Betsabé, Salomón, Elías, Eliseo, Naamán, Job, Isaías, Jeremías, Ezequiel, Daniel, Sadrac/Mesac/Abed-nego, Jonás, Ester, Mardoqueo, Nehemías, Esdras, Melquisedec, entre otros.
- **Nuevo Testamento**: María, José, Zacarías y Elisabet, Juan el Bautista, Jesús, Pedro, Andrés, Juan, Tomás, Mateo, Judas Iscariote, Matías, Zaqueo, Nicodemo, la mujer samaritana, Marta y María de Betania, Lázaro, Esteban, Saulo/Pablo, Bernabé, Cornelio, Ananías y Safira, Priscila y Aquila, Lidia, Apolos, Timoteo, Tito, Onésimo, Silas, entre otros.

## Enseñanza aplicada

Al superar cada nivel, el juego muestra una **enseñanza bíblica** relacionada con el tema del nivel, una **sugerencia de aplicación práctica** a la vida diaria, y un pequeño **reto de opción múltiple** ("¿cómo la aplicarías en esta situación?"). Responder correctamente el reto otorga 50 puntos de bonus, reforzando que el juego no es solo memorizar datos, sino llevar las enseñanzas a la práctica.
