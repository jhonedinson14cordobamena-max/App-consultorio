/**
 * Trivia Bíblica — motor del juego.
 * 120 niveles de dificultad. Cada bloque de 10 niveles usa el banco de
 * preguntas de un "tier" temático (ver questions.js), pero la dificultad
 * real sube de forma continua nivel a nivel mediante: tiempo por pregunta,
 * cantidad de preguntas, aciertos mínimos para pasar y vidas disponibles.
 */

const TOTAL_LEVELS = 120;
const STORAGE_KEY = "trivia-biblica-progreso";

const state = {
  unlockedLevel: 1,
  bestScore: 0,
  totalScore: 0,
  currentLevel: null,
  config: null,
  questions: [],
  qIndex: 0,
  correctCount: 0,
  lives: 3,
  score: 0,
  timer: null,
  timeLeft: 0,
};

/* ---------- Persistencia ---------- */

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      state.unlockedLevel = data.unlockedLevel || 1;
      state.totalScore = data.totalScore || 0;
    }
  } catch (e) {
    state.unlockedLevel = 1;
  }
}

function saveProgress() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ unlockedLevel: state.unlockedLevel, totalScore: state.totalScore })
  );
}

/* ---------- Configuración de dificultad por nivel ---------- */

function getLevelConfig(level) {
  const tier = Math.min(12, Math.max(1, Math.ceil(level / 10)));
  const questionsCount = 5 + Math.floor((level - 1) / 30); // 5 -> 8
  const timeLimit = Math.max(6, 22 - Math.floor((level - 1) / 6)); // 22s -> 6s
  const passCount = Math.min(questionsCount, 3 + Math.floor((level - 1) / 24)); // 3 -> ~7
  const lives = level > 100 ? 2 : level > 60 ? 3 : 4;
  const scoreMultiplier = 1 + level * 0.05;
  return { level, tier, questionsCount, timeLimit, passCount, lives, scoreMultiplier };
}

/* ---------- Utilidades ---------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(tier, count) {
  const pool = QUESTION_BANK[tier] || [];
  const chosen = shuffle(pool).slice(0, Math.min(count, pool.length));
  return chosen.map((item) => {
    const options = item.options.map((text, idx) => ({ text, isCorrect: idx === item.correct }));
    const shuffled = shuffle(options);
    return {
      q: item.q,
      ref: item.ref,
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
    };
  });
}

/* ---------- Navegación entre pantallas ---------- */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- Pantalla de niveles ---------- */

function renderLevelGrid() {
  const grid = document.getElementById("level-grid");
  grid.innerHTML = "";
  for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
    const tier = Math.min(12, Math.ceil(lvl / 10));
    const btn = document.createElement("button");
    const locked = lvl > state.unlockedLevel;
    btn.className = "level-btn" + (locked ? " locked" : "");
    btn.style.setProperty("--tier-color", TIER_INFO[tier].color);
    btn.disabled = locked;
    btn.innerHTML = locked ? "🔒" : String(lvl);
    btn.title = `${TIER_INFO[tier].name}`;
    btn.addEventListener("click", () => startLevel(lvl));
    grid.appendChild(btn);
  }
  document.getElementById("total-score").textContent = state.totalScore;
  document.getElementById("progress-text").textContent = `${Math.min(
    state.unlockedLevel,
    TOTAL_LEVELS
  )} / ${TOTAL_LEVELS}`;
}

/* ---------- Lógica de nivel ---------- */

function startLevel(level) {
  state.currentLevel = level;
  state.config = getLevelConfig(level);
  state.questions = pickQuestions(state.config.tier, state.config.questionsCount);
  state.qIndex = 0;
  state.correctCount = 0;
  state.lives = state.config.lives;
  state.score = 0;

  document.getElementById("game-level-label").textContent = `Nivel ${level}`;
  document.getElementById("game-tier-label").textContent = TIER_INFO[state.config.tier].name;
  showScreen("screen-game");
  showQuestion();
}

function updateHud() {
  document.getElementById("hud-lives").textContent = "❤️".repeat(Math.max(0, state.lives));
  document.getElementById("hud-score").textContent = state.score;
  document.getElementById("hud-progress").textContent = `${state.qIndex + 1} / ${state.questions.length}`;
  document.getElementById("hud-pass").textContent = `Necesitas ${state.config.passCount} aciertos`;
}

function showQuestion() {
  clearInterval(state.timer);
  if (state.qIndex >= state.questions.length || state.lives <= 0) {
    return endLevel();
  }
  updateHud();
  const item = state.questions[state.qIndex];
  document.getElementById("question-text").textContent = item.q;
  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  item.options.forEach((opt, idx) => {
    const b = document.createElement("button");
    b.className = "option-btn";
    b.textContent = opt;
    b.addEventListener("click", () => answer(idx));
    optionsEl.appendChild(b);
  });

  state.timeLeft = state.config.timeLimit;
  const bar = document.getElementById("timer-bar");
  bar.style.transition = "none";
  bar.style.width = "100%";
  requestAnimationFrame(() => {
    bar.style.transition = `width ${state.config.timeLimit}s linear`;
    bar.style.width = "0%";
  });

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      lockOptions();
      registerAnswer(-1, item);
    }
  }, 1000);
}

function lockOptions() {
  document.querySelectorAll(".option-btn").forEach((b) => (b.disabled = true));
}

function answer(idx) {
  clearInterval(state.timer);
  lockOptions();
  const item = state.questions[state.qIndex];
  registerAnswer(idx, item);
}

function registerAnswer(idx, item) {
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach((b, i) => {
    if (i === item.correctIndex) b.classList.add("correct");
    else if (i === idx) b.classList.add("wrong");
  });

  const isCorrect = idx === item.correctIndex;
  if (isCorrect) {
    state.correctCount++;
    const speedBonus = Math.max(0, state.timeLeft) * 2;
    state.score += Math.round((100 + speedBonus) * state.config.scoreMultiplier);
  } else {
    state.lives--;
  }

  setTimeout(() => {
    state.qIndex++;
    showQuestion();
  }, 900);
}

function endLevel() {
  clearInterval(state.timer);
  const passed = state.correctCount >= state.config.passCount && state.lives > 0;
  state.teaching = null;

  if (passed) {
    state.totalScore += state.score;
    if (state.currentLevel === state.unlockedLevel && state.unlockedLevel < TOTAL_LEVELS) {
      state.unlockedLevel++;
    } else if (state.currentLevel >= state.unlockedLevel) {
      state.unlockedLevel = Math.min(TOTAL_LEVELS, state.currentLevel + 1);
    }
    const pool = TEACHINGS[state.config.tier] || [];
    if (pool.length) state.teaching = pool[Math.floor(Math.random() * pool.length)];
    saveProgress();
  }

  document.getElementById("result-title").textContent = passed ? "¡Nivel superado!" : "Nivel fallido";
  document.getElementById("result-title").className = passed ? "pass" : "fail";
  document.getElementById("result-detail").textContent = `Respondiste bien ${state.correctCount} de ${state.questions.length} preguntas. Necesitabas ${state.config.passCount}.`;
  document.getElementById("result-score").textContent = passed ? `+${state.score} puntos` : "0 puntos";

  const nextBtn = document.getElementById("btn-next-level");
  nextBtn.style.display = passed && state.currentLevel < TOTAL_LEVELS ? "inline-block" : "none";

  if (passed && state.currentLevel === TOTAL_LEVELS) {
    document.getElementById("result-detail").textContent += " ¡Has completado los 120 niveles!";
  }

  renderTeaching(passed);
  showScreen("screen-result");
}

/* ---------- Enseñanza y aplicación práctica ---------- */

function renderTeaching(passed) {
  const box = document.getElementById("teaching-box");
  if (!passed || !state.teaching) {
    box.style.display = "none";
    return;
  }
  box.style.display = "block";
  document.getElementById("teaching-lesson").textContent = state.teaching.lesson;
  document.getElementById("teaching-application").textContent = "💡 Aplícalo: " + state.teaching.application;
  document.getElementById("teaching-challenge-q").textContent = state.teaching.challenge.q;
  document.getElementById("teaching-feedback").textContent = "";
  document.getElementById("teaching-feedback").className = "teaching-feedback";

  const optsEl = document.getElementById("teaching-options");
  optsEl.innerHTML = "";
  const shuffledOptions = shuffle(
    state.teaching.challenge.options.map((text, idx) => ({
      text,
      isCorrect: idx === state.teaching.challenge.correct,
    }))
  );
  shuffledOptions.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "option-btn";
    b.textContent = opt.text;
    b.addEventListener("click", () => answerTeachingChallenge(b, opt.isCorrect, shuffledOptions, optsEl));
    optsEl.appendChild(b);
  });
}

function answerTeachingChallenge(clickedBtn, isCorrect, shuffledOptions, optsEl) {
  const buttons = optsEl.querySelectorAll(".option-btn");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (shuffledOptions[i].isCorrect) b.classList.add("correct");
  });
  if (!isCorrect) clickedBtn.classList.add("wrong");

  const feedback = document.getElementById("teaching-feedback");
  if (isCorrect) {
    const bonus = 50;
    state.totalScore += bonus;
    saveProgress();
    feedback.textContent = `¡Correcto! +${bonus} puntos de bonus por aplicar la enseñanza.`;
    feedback.className = "teaching-feedback pass";
  } else {
    feedback.textContent = "Esa no es la mejor aplicación. ¡Sigue practicando esta enseñanza en tu vida diaria!";
    feedback.className = "teaching-feedback fail";
  }
}

/* ---------- Eventos globales ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadProgress();

  document.getElementById("btn-play").addEventListener("click", () => {
    renderLevelGrid();
    showScreen("screen-levels");
  });

  document.getElementById("btn-how-to-play").addEventListener("click", () => {
    showScreen("screen-howto");
  });

  document.querySelectorAll(".btn-back-menu").forEach((btn) =>
    btn.addEventListener("click", () => showScreen("screen-menu"))
  );

  document.getElementById("btn-back-levels").addEventListener("click", () => {
    renderLevelGrid();
    showScreen("screen-levels");
  });

  document.getElementById("btn-retry-level").addEventListener("click", () => startLevel(state.currentLevel));

  document.getElementById("btn-next-level").addEventListener("click", () => {
    startLevel(Math.min(TOTAL_LEVELS, state.currentLevel + 1));
  });

  document.getElementById("btn-reset-progress").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres borrar tu progreso y volver a empezar desde el nivel 1?")) {
      state.unlockedLevel = 1;
      state.totalScore = 0;
      saveProgress();
      renderLevelGrid();
    }
  });
});
