/**
 * Trivia Bíblica — motor del juego.
 *
 * 120 niveles de dificultad. Cada bloque de 10 niveles usa el banco de
 * preguntas de un "tier" temático (ver questions.js), pero la dificultad
 * real sube de forma continua nivel a nivel mediante: tiempo por pregunta,
 * cantidad de preguntas, aciertos mínimos para pasar y vidas disponibles.
 *
 * Modelo de acceso:
 *   - Niveles 1-20: gratis, sin cuenta, guardados en localStorage.
 *   - Niveles 21-100: requieren cuenta + suscripción "tier100" (pagada con
 *     Wompi), verificada y guardada en el backend (ver js/api.js).
 *   - Niveles 101-120: requieren además la suscripción "tier120".
 *   - Al completar el nivel 120 con "tier120", el backend marca la fecha
 *     de finalización y se puede descargar un certificado de obsequio.
 */

const TOTAL_LEVELS = 120;
const FREE_LEVELS = 20;
const STORAGE_KEY = "trivia-biblica-progreso";
const TIER_RANK = { free: 0, tier100: 1, tier120: 2 };

const state = {
  unlockedLevel: 1,
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
  teaching: null,
  account: null, // { id, email, name } | null
  serverProgress: null, // { unlocked_level, total_score, tier, completed_at } | null
  pendingLevel: null,
  pendingTier: null,
  prices: { tier100Cop: 38000, tier120Cop: 15000 },
};

/* ---------- Persistencia local (solo niveles 1-20, gratis) ---------- */

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

/* ---------- Cuenta y progreso de pago (backend) ---------- */

async function refreshAccount() {
  if (!api.isLoggedIn()) {
    state.account = null;
    state.serverProgress = null;
    return;
  }
  try {
    const { user, progress } = await api.me();
    state.account = user;
    state.serverProgress = progress;
  } catch {
    api.logout();
    state.account = null;
    state.serverProgress = null;
  }
}

function combinedTotalScore() {
  return state.totalScore + (state.serverProgress ? state.serverProgress.total_score : 0);
}

function getPaymentGateForLevel(level) {
  if (level <= FREE_LEVELS) return "free";
  if (level <= 100) return "tier100";
  return "tier120";
}

function isLevelUnlocked(level) {
  if (level <= FREE_LEVELS) return level <= state.unlockedLevel;
  if (!state.serverProgress) return false;
  const gate = getPaymentGateForLevel(level);
  if (TIER_RANK[state.serverProgress.tier] < TIER_RANK[gate]) return false;
  return level <= state.serverProgress.unlocked_level;
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

function isScreenActive(id) {
  return document.getElementById(id).classList.contains("active");
}

/* ---------- Barra de cuenta (menú) ---------- */

function renderAccountBar() {
  const bar = document.getElementById("account-bar");
  const logoutBtn = document.getElementById("btn-logout");
  const certBtn = document.getElementById("btn-certificate");

  if (state.account) {
    const tierLabel = { free: "sin suscripción de pago", tier100: "acceso hasta el nivel 100", tier120: "acceso hasta el nivel 120" }[
      state.serverProgress ? state.serverProgress.tier : "free"
    ];
    bar.textContent = `Conectado como ${state.account.name} (${tierLabel}).`;
    logoutBtn.style.display = "inline-block";
    certBtn.style.display = state.serverProgress && state.serverProgress.completed_at ? "inline-block" : "none";
  } else {
    bar.textContent = "Los niveles 1-20 son gratis. Crea una cuenta cuando quieras continuar más allá.";
    logoutBtn.style.display = "none";
    certBtn.style.display = "none";
  }
}

/* ---------- Pantalla de niveles ---------- */

function renderLevelGrid() {
  const grid = document.getElementById("level-grid");
  grid.innerHTML = "";

  for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
    const tier = Math.min(12, Math.ceil(lvl / 10));
    const btn = document.createElement("button");
    btn.style.setProperty("--tier-color", TIER_INFO[tier].color);
    btn.title = TIER_INFO[tier].name;

    if (lvl <= FREE_LEVELS) {
      const locked = lvl > state.unlockedLevel;
      btn.className = "level-btn" + (locked ? " locked" : "");
      btn.disabled = locked;
      btn.textContent = locked ? "🔒" : String(lvl);
    } else if (isLevelUnlocked(lvl)) {
      btn.className = "level-btn";
      btn.disabled = false;
      btn.textContent = String(lvl);
    } else {
      const gateTier = getPaymentGateForLevel(lvl);
      const haveTier = state.serverProgress ? state.serverProgress.tier : "free";
      const needsPayment = TIER_RANK[haveTier] < TIER_RANK[gateTier];
      if (needsPayment) {
        const price = gateTier === "tier100" ? state.prices.tier100Cop : state.prices.tier120Cop;
        btn.className = "level-btn locked-paid";
        btn.disabled = false;
        btn.innerHTML = `🔒💳<br>$${price.toLocaleString("es-CO")}`;
      } else {
        btn.className = "level-btn locked";
        btn.disabled = true;
        btn.textContent = "🔒";
      }
    }

    btn.addEventListener("click", () => handleLevelClick(lvl));
    grid.appendChild(btn);
  }

  document.getElementById("total-score").textContent = combinedTotalScore();
  document.getElementById("progress-text").textContent = `${Math.min(state.unlockedLevel, FREE_LEVELS)} / ${FREE_LEVELS}`;

  const paidEl = document.getElementById("paid-progress-text");
  if (state.serverProgress && state.serverProgress.tier !== "free") {
    paidEl.style.display = "inline";
    document.getElementById("paid-progress-value").textContent = `${Math.min(state.serverProgress.unlocked_level, TOTAL_LEVELS)} / ${TOTAL_LEVELS}`;
  } else {
    paidEl.style.display = "none";
  }
}

/* ---------- Galería de personajes ---------- */

function renderCharacterGallery() {
  const list = document.getElementById("characters-list");
  list.innerHTML = "";
  CHARACTER_GALLERY.forEach((group) => {
    const section = document.createElement("div");
    section.className = "character-group";

    const heading = document.createElement("h3");
    heading.textContent = group.era;
    section.appendChild(heading);

    const refEl = document.createElement("p");
    refEl.className = "character-ref";
    refEl.textContent = group.ref;
    section.appendChild(refEl);

    group.people.forEach((person) => {
      const row = document.createElement("p");
      row.className = "character-row";
      row.innerHTML = `<strong>${person.name}</strong> — ${person.desc}`;
      section.appendChild(row);
    });

    list.appendChild(section);
  });
}

/* ---------- Acceso: gating de niveles de pago ---------- */

function handleLevelClick(level) {
  if (level <= FREE_LEVELS) {
    if (level > state.unlockedLevel) return;
    startLevel(level);
    return;
  }
  if (isLevelUnlocked(level)) {
    startLevel(level);
    return;
  }
  handleLockedPaidLevel(level);
}

function handleLockedPaidLevel(level) {
  const requiredTier = getPaymentGateForLevel(level);
  state.pendingLevel = level;

  if (!api.isLoggedIn()) {
    showAuthScreen();
    return;
  }

  const haveTier = state.serverProgress ? state.serverProgress.tier : "free";
  if (TIER_RANK[haveTier] < TIER_RANK[requiredTier]) {
    showPaywallScreen(requiredTier);
  } else {
    state.pendingLevel = null;
    alert("Primero debes superar los niveles anteriores para llegar hasta aquí.");
  }
}

function goToLevel(level) {
  if (level > FREE_LEVELS && !isLevelUnlocked(level)) {
    handleLockedPaidLevel(level);
  } else {
    startLevel(level);
  }
}

/* ---------- Autenticación ---------- */

function showAuthScreen() {
  document.getElementById("auth-error").textContent = "";
  document.getElementById("form-login").reset();
  document.getElementById("form-register").reset();
  switchAuthTab("login");
  showScreen("screen-auth");
}

function switchAuthTab(tab) {
  document.getElementById("auth-tab-login").classList.toggle("active", tab === "login");
  document.getElementById("auth-tab-register").classList.toggle("active", tab === "register");
  document.getElementById("form-login").style.display = tab === "login" ? "flex" : "none";
  document.getElementById("form-register").style.display = tab === "register" ? "flex" : "none";
  document.getElementById("auth-error").textContent = "";
}

async function afterAuthSuccess() {
  await refreshAccount();
  renderAccountBar();
  renderLevelGrid();

  const pending = state.pendingLevel;
  state.pendingLevel = null;
  if (pending) {
    handleLevelClick(pending);
  } else {
    showScreen("screen-levels");
  }
}

/* ---------- Muro de pago ---------- */

function showPaywallScreen(tier) {
  state.pendingTier = tier;
  const price = tier === "tier100" ? state.prices.tier100Cop : state.prices.tier120Cop;

  document.getElementById("paywall-title").textContent =
    tier === "tier100" ? "Continúa hasta el nivel 100" : "Completa hasta el nivel 120";
  document.getElementById("paywall-detail").textContent =
    tier === "tier100"
      ? "Los niveles 1 al 20 son gratis. Para continuar del nivel 21 al 100 se requiere esta suscripción única."
      : "Ya tienes acceso hasta el nivel 100. Para completar hasta el nivel 120 —y obtener tu certificado— se requiere este pago adicional.";
  document.getElementById("paywall-price").innerHTML = `$${price.toLocaleString("es-CO")}`;
  document.getElementById("paywall-status").textContent = "";
  showScreen("screen-paywall");
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

function pickTeachingFor(tier) {
  const pool = TEACHINGS[tier] || [];
  state.teaching = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function endLevel() {
  clearInterval(state.timer);
  const passed = state.correctCount >= state.config.passCount && state.lives > 0;
  state.teaching = null;

  if (state.currentLevel <= FREE_LEVELS) {
    finishFreeLevel(passed);
  } else {
    finishPaidLevel(passed);
  }
}

function finishFreeLevel(passed) {
  if (passed) {
    state.totalScore += state.score;
    if (state.currentLevel === state.unlockedLevel && state.unlockedLevel < FREE_LEVELS) {
      state.unlockedLevel++;
    } else if (state.currentLevel >= state.unlockedLevel) {
      state.unlockedLevel = Math.min(FREE_LEVELS, state.currentLevel + 1);
    }
    pickTeachingFor(state.config.tier);
    saveProgress();
  }
  renderResultScreen(passed, null);
}

async function finishPaidLevel(passed) {
  let syncError = null;
  try {
    const res = await api.advanceProgress(state.currentLevel, passed, passed ? state.score : 0);
    state.serverProgress = res.progress;
  } catch (e) {
    syncError = e.message;
  }
  if (passed) pickTeachingFor(state.config.tier);
  renderResultScreen(passed, syncError);
}

function renderResultScreen(passed, syncError) {
  document.getElementById("result-title").textContent = passed ? "¡Nivel superado!" : "Nivel fallido";
  document.getElementById("result-title").className = passed ? "pass" : "fail";

  let detail = `Respondiste bien ${state.correctCount} de ${state.questions.length} preguntas. Necesitabas ${state.config.passCount}.`;
  if (passed && state.currentLevel === TOTAL_LEVELS) {
    detail += " ¡Has completado los 120 niveles!";
  }
  if (syncError) {
    detail += ` (No se pudo sincronizar tu progreso con el servidor: ${syncError})`;
  }
  document.getElementById("result-detail").textContent = detail;
  document.getElementById("result-score").textContent = passed ? `+${state.score} puntos` : "0 puntos";

  const nextBtn = document.getElementById("btn-next-level");
  nextBtn.style.display = passed && state.currentLevel < TOTAL_LEVELS ? "inline-block" : "none";

  renderTeaching(passed);
  renderAccountBar();
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

async function answerTeachingChallenge(clickedBtn, isCorrect, shuffledOptions, optsEl) {
  const buttons = optsEl.querySelectorAll(".option-btn");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (shuffledOptions[i].isCorrect) b.classList.add("correct");
  });
  if (!isCorrect) clickedBtn.classList.add("wrong");

  const feedback = document.getElementById("teaching-feedback");
  if (!isCorrect) {
    feedback.textContent = "Esa no es la mejor aplicación. ¡Sigue practicando esta enseñanza en tu vida diaria!";
    feedback.className = "teaching-feedback fail";
    return;
  }

  const bonus = 50;
  if (state.currentLevel <= FREE_LEVELS) {
    state.totalScore += bonus;
    saveProgress();
  } else {
    try {
      const res = await api.advanceProgress(state.currentLevel, true, bonus);
      state.serverProgress = res.progress;
    } catch {
      // Si falla la sincronización, el bono no se pierde de vista: se avisa igual.
    }
  }
  document.getElementById("total-score").textContent = combinedTotalScore();
  feedback.textContent = `¡Correcto! +${bonus} puntos de bonus por aplicar la enseñanza.`;
  feedback.className = "teaching-feedback pass";
}

/* ---------- Certificado ---------- */

function renderCertificate() {
  const canvas = document.getElementById("certificate-canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#f6ecd9";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#f2b134";
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.strokeStyle = "#2b2016";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, w - 72, h - 72);

  ctx.fillStyle = "#2b2016";
  ctx.textAlign = "center";
  ctx.font = "bold 42px Georgia";
  ctx.fillText("Certificado de Finalización", w / 2, 140);

  ctx.font = "24px Georgia";
  ctx.fillText("Trivia Bíblica — 120 Niveles", w / 2, 185);

  ctx.font = "italic 22px Georgia";
  ctx.fillText("Se otorga el presente certificado a:", w / 2, 280);

  ctx.font = "bold 48px Georgia";
  ctx.fillStyle = "#6c5b7b";
  const name = (state.account && state.account.name) || "Jugador";
  ctx.fillText(name, w / 2, 350);

  ctx.fillStyle = "#2b2016";
  ctx.font = "20px Georgia";
  ctx.fillText("por completar exitosamente los 120 niveles de dificultad,", w / 2, 420);
  ctx.fillText("llevando las enseñanzas del pasado bíblico a la práctica en el presente.", w / 2, 450);

  const dateStr =
    state.serverProgress && state.serverProgress.completed_at
      ? new Date(state.serverProgress.completed_at).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("es-CO");
  ctx.font = "18px Georgia";
  ctx.fillText(`Fecha: ${dateStr}`, w / 2, 520);

  ctx.font = "16px Georgia";
  ctx.fillStyle = "#8a7a5c";
  ctx.fillText("📖 Trivia Bíblica", w / 2, 620);
}

/* ---------- Eventos globales ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  renderAccountBar();

  api
    .prices()
    .then((p) => {
      state.prices = { tier100Cop: p.tier100Cop, tier120Cop: p.tier120Cop };
      if (isScreenActive("screen-levels")) renderLevelGrid();
    })
    .catch(() => {
      /* Sin backend disponible: se mantienen los precios por defecto. */
    });

  refreshAccount().then(() => {
    renderAccountBar();
    if (isScreenActive("screen-levels")) renderLevelGrid();
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    renderLevelGrid();
    showScreen("screen-levels");
  });

  document.getElementById("btn-how-to-play").addEventListener("click", () => {
    showScreen("screen-howto");
  });

  document.getElementById("btn-characters").addEventListener("click", () => {
    renderCharacterGallery();
    showScreen("screen-characters");
  });

  document.getElementById("btn-certificate").addEventListener("click", () => {
    renderCertificate();
    showScreen("screen-certificate");
  });

  document.getElementById("btn-logout").addEventListener("click", () => {
    api.logout();
    state.account = null;
    state.serverProgress = null;
    renderAccountBar();
  });

  document.querySelectorAll(".btn-back-menu").forEach((btn) =>
    btn.addEventListener("click", () => showScreen("screen-menu"))
  );

  document.querySelectorAll(".btn-back-levels-from-auth").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.pendingLevel = null;
      renderLevelGrid();
      showScreen("screen-levels");
    })
  );

  document.getElementById("btn-back-levels").addEventListener("click", () => {
    renderLevelGrid();
    showScreen("screen-levels");
  });

  document.getElementById("btn-retry-level").addEventListener("click", () => startLevel(state.currentLevel));

  document.getElementById("btn-next-level").addEventListener("click", () => {
    goToLevel(Math.min(TOTAL_LEVELS, state.currentLevel + 1));
  });

  document.getElementById("btn-reset-progress").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres borrar tu progreso GRATIS (niveles 1-20) y volver a empezar desde el nivel 1? Esto no afecta tu suscripción de pago si tienes una.")) {
      state.unlockedLevel = 1;
      state.totalScore = 0;
      saveProgress();
      renderLevelGrid();
    }
  });

  // Autenticación
  document.getElementById("auth-tab-login").addEventListener("click", () => switchAuthTab("login"));
  document.getElementById("auth-tab-register").addEventListener("click", () => switchAuthTab("register"));

  document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errEl = document.getElementById("auth-error");
    errEl.textContent = "";
    try {
      const { token } = await api.login(email, password);
      api.setToken(token);
      await afterAuthSuccess();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById("form-register").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const errEl = document.getElementById("auth-error");
    errEl.textContent = "";
    try {
      const { token } = await api.register(email, password, name);
      api.setToken(token);
      await afterAuthSuccess();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  // Muro de pago
  document.getElementById("btn-pay-wompi").addEventListener("click", async () => {
    const statusEl = document.getElementById("paywall-status");
    statusEl.textContent = "";
    try {
      const { checkoutUrl } = await api.createCheckout(state.pendingTier);
      statusEl.textContent = "Redirigiendo a Wompi...";
      window.location.href = checkoutUrl;
    } catch (err) {
      statusEl.textContent = err.message;
    }
  });

  // Certificado
  document.getElementById("btn-download-certificate").addEventListener("click", () => {
    const canvas = document.getElementById("certificate-canvas");
    const link = document.createElement("a");
    link.download = "certificado-trivia-biblica.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
