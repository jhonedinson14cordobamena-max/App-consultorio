/**
 * Internacionalización (i18n) de Trivia Bíblica.
 *
 * Arquitectura: el español (es) es el idioma canónico/original; cada
 * idioma adicional vive en su propio bloque dentro de UI_STRINGS (para
 * los textos fijos de la interfaz) y en variables *_EN, *_PT, etc. dentro
 * de cada archivo de contenido (questions.js, teachings.js, characters.js,
 * torah-talmud.js), con la MISMA estructura y el MISMO orden que la
 * versión en español, para que el resto del motor del juego (game.js)
 * funcione igual sin importar el idioma activo.
 *
 * Si un idioma no tiene todavía una traducción para cierto contenido,
 * este módulo cae automáticamente ("fallback") al español, para que
 * nunca se rompa la partida mientras se van completando traducciones.
 *
 * Añadir un idioma nuevo = agregar su bloque en UI_STRINGS aquí, y sus
 * variables *_XX en los archivos de contenido. No hace falta tocar
 * game.js ni index.html.
 */

const SUPPORTED_LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

const LANG_STORAGE_KEY = "trivia-biblica-idioma";

const i18nState = {
  lang: "es",
};

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch (e) {
    /* localStorage no disponible; usar valor por defecto */
  }
  const browserLang = (navigator.language || "es").slice(0, 2);
  return SUPPORTED_LANGUAGES.some((l) => l.code === browserLang) ? browserLang : "es";
}

function getLang() {
  return i18nState.lang;
}

function setLang(code) {
  if (!SUPPORTED_LANGUAGES.some((l) => l.code === code)) return;
  i18nState.lang = code;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, code);
  } catch (e) {
    /* no-op */
  }
  document.documentElement.lang = code;
}

/** Traduce una clave de UI_STRINGS, con reemplazo simple de variables {nombre}. */
function t(key, vars) {
  const dict = UI_STRINGS[i18nState.lang] || UI_STRINGS.es;
  let str = dict[key] !== undefined ? dict[key] : UI_STRINGS.es[key] !== undefined ? UI_STRINGS.es[key] : key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return str;
}

/** Aplica las traducciones a todos los elementos estáticos marcados en el HTML. */
function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}

/* ---------- Resolutores de contenido (con fallback a español) ---------- */

function pickContent(esData, enData) {
  return i18nState.lang === "en" && enData ? enData : esData;
}

function getTierInfo() {
  return pickContent(TIER_INFO_ES, typeof TIER_INFO_EN !== "undefined" ? TIER_INFO_EN : null);
}

function getQuestionBank() {
  return pickContent(QUESTION_BANK_ES, typeof QUESTION_BANK_EN !== "undefined" ? QUESTION_BANK_EN : null);
}

function getTeachings() {
  return pickContent(TEACHINGS_ES, typeof TEACHINGS_EN !== "undefined" ? TEACHINGS_EN : null);
}

function getCharacterGallery() {
  return pickContent(CHARACTER_GALLERY_ES, typeof CHARACTER_GALLERY_EN !== "undefined" ? CHARACTER_GALLERY_EN : null);
}

function getTorahQuestions() {
  return pickContent(TORAH_QUESTIONS_ES, typeof TORAH_QUESTIONS_EN !== "undefined" ? TORAH_QUESTIONS_EN : null);
}

function getTalmudLegends() {
  return pickContent(TALMUD_LEGENDS_ES, typeof TALMUD_LEGENDS_EN !== "undefined" ? TALMUD_LEGENDS_EN : null);
}

/* ---------- Textos de la interfaz ---------- */

const UI_STRINGS = {
  es: {
    "menu.title": "📖 Trivia Bíblica",
    "menu.subtitle": "120 niveles de dificultad — de aprendiz a experto",
    "menu.mission": "Este juego nació para traer las historias del pasado bíblico al presente: conocer a sus personajes no es solo un dato, sino una oportunidad de aplicar hoy —y en el futuro— lo que ellos vivieron.",
    "menu.mysteryBonus": "🎁 <strong>Promoción:</strong> los suscriptores participan en la rifa de un bono por <strong>un porcentaje que, por ahora, es una incógnita</strong>. ¡Pronto revelaremos de cuánto se trata!",
    "menu.btnPlay": "Jugar",
    "menu.btnCharacters": "Personajes de la Biblia",
    "menu.btnTorah": "📜 Torá y Leyendas del Talmud",
    "menu.btnCertificate": "🎓 Mi certificado",
    "menu.btnHowTo": "Cómo jugar",
    "menu.btnLogout": "Cerrar sesión",
    "menu.langLabel": "Idioma",

    "howto.title": "Cómo jugar",
    "howto.mission": "Este juego se creó con un propósito: traer lo que ocurrió en el pasado bíblico al presente, para que puedas aplicarlo hoy y en tu futuro, no solo memorizarlo.",
    "howto.li1": "Hay <strong>120 niveles</strong>, agrupados en 12 temas bíblicos (Génesis, Patriarcas, Éxodo, Reyes, Profetas, Jesús, Parábolas, Apóstoles, Cartas, Apocalipsis, y más), con personajes de toda la Biblia.",
    "howto.li2": "Cada nivel es una ronda corta de preguntas de opción múltiple.",
    "howto.li3": "A medida que subes de nivel, tienes <strong>menos tiempo</strong> por pregunta, <strong>menos vidas</strong> y necesitas <strong>más aciertos</strong> para pasar.",
    "howto.li4": "Responder rápido y correctamente da más puntos.",
    "howto.li5": "Al superar un nivel verás una <strong>enseñanza</strong>: qué hizo un personaje en el pasado, y cómo aplicar ese mismo ejemplo hoy y en el futuro, con un reto extra que da puntos de bonus.",
    "howto.li6": "Explora la <strong>Galería de Personajes</strong> y el modo <strong>Torá y Leyendas del Talmud</strong> desde el menú, ambos gratis.",
    "howto.li7": "Si te quedas sin vidas o no llegas a los aciertos requeridos, puedes reintentar el nivel.",
    "howto.li8": "Tu progreso se guarda automáticamente en este navegador.",
    "howto.btnBack": "Volver al menú",

    "characters.title": "Personajes de la Biblia",
    "characters.mission": "Del pasado al presente: estos son los personajes cuyas historias inspiran las preguntas y enseñanzas del juego.",
    "characters.btnBack": "Volver al menú",

    "levels.title": "Selecciona un nivel",
    "levels.freeLevel": "Nivel gratis:",
    "levels.paidLevel": "Nivel de pago:",
    "levels.totalPoints": "Puntos totales:",
    "levels.legend": "<span class=\"badge-locked\">🔒</span> por jugar &nbsp; <span class=\"badge-paid\">🔒💳</span> requiere suscripción de pago",
    "levels.btnMenu": "Menú",
    "levels.btnReset": "Reiniciar progreso",
    "levels.resetConfirm": "¿Seguro que quieres borrar tu progreso GRATIS (niveles 1-20) y volver a empezar desde el nivel 1? Esto no afecta tu suscripción de pago si tienes una.",

    "game.level": "Nivel {n}",
    "game.hudPass": "Necesitas {n} aciertos",
    "game.needPayment": "Primero debes superar los niveles anteriores para llegar hasta aquí.",

    "result.pass": "¡Nivel superado!",
    "result.fail": "Nivel fallido",
    "result.detail": "Respondiste bien {correct} de {total} preguntas. Necesitabas {needed}.",
    "result.allCompleted": " ¡Has completado los 120 niveles!",
    "result.syncError": " (No se pudo sincronizar tu progreso con el servidor: {error})",
    "result.scorePass": "+{score} puntos",
    "result.scoreFail": "0 puntos",
    "result.btnRetry": "Reintentar",
    "result.btnNext": "Siguiente nivel",
    "result.btnMenu": "Menú",

    "teaching.title": "📘 Enseñanza de este nivel",
    "teaching.applyPrefix": "💡 Aplícalo: ",
    "teaching.correctFeedback": "¡Correcto! +{bonus} puntos de bonus por aplicar la enseñanza.",
    "teaching.wrongFeedback": "Esa no es la mejor aplicación. ¡Sigue practicando esta enseñanza en tu vida diaria!",

    "account.loggedIn": "Conectado como {name} ({tier}).",
    "account.loggedOut": "Los niveles 1-20 son gratis. Crea una cuenta cuando quieras continuar más allá.",
    "account.tierFree": "sin suscripción de pago",
    "account.tier100": "acceso hasta el nivel 100",
    "account.tier120": "acceso hasta el nivel 120",

    "auth.title": "Los niveles 1-20 son gratis",
    "auth.mission": "Para continuar del nivel 21 en adelante necesitas una cuenta gratuita y, luego, una suscripción de pago. Crea tu cuenta o inicia sesión para seguir.",
    "auth.tabLogin": "Iniciar sesión",
    "auth.tabRegister": "Crear cuenta",
    "auth.labelEmail": "Correo",
    "auth.labelPassword": "Contraseña",
    "auth.labelName": "Nombre",
    "auth.labelPasswordMin": "Contraseña (mínimo 8 caracteres)",
    "auth.btnLogin": "Iniciar sesión",
    "auth.btnRegister": "Crear cuenta",
    "auth.btnCancel": "Cancelar",

    "paywall.title100": "Continúa hasta el nivel 100",
    "paywall.title120": "Completa hasta el nivel 120",
    "paywall.detail100": "Los niveles 1 al 20 son gratis. Para continuar del nivel 21 al 100 se requiere esta suscripción única.",
    "paywall.detail120": "Ya tienes acceso hasta el nivel 100. Para completar hasta el nivel 120 —y obtener tu certificado— se requiere este pago adicional.",
    "paywall.currency": "COP",
    "paywall.btnPay": "Pagar con Wompi",
    "paywall.redirecting": "Redirigiendo a Wompi...",
    "paywall.mysteryBonus": "🎁 <strong>Bono sorpresa:</strong> al suscribirte participas en la rifa de un bono por <strong>un porcentaje que por ahora es una incógnita</strong> — ¡se revelará más adelante!",

    "certificate.title": "🎓 ¡Completaste los 120 niveles!",
    "certificate.mission": "De obsequio, aquí tienes tu certificado por completar Trivia Bíblica de principio a fin.",
    "certificate.btnDownload": "Descargar certificado",
    "certificate.canvasTitle": "Certificado de Finalización",
    "certificate.canvasSubtitle": "Trivia Bíblica — 120 Niveles",
    "certificate.canvasAwardedTo": "Se otorga el presente certificado a:",
    "certificate.canvasLine1": "por completar exitosamente los 120 niveles de dificultad,",
    "certificate.canvasLine2": "llevando las enseñanzas del pasado bíblico a la práctica en el presente.",
    "certificate.canvasDate": "Fecha: {date}",
    "certificate.canvasFooter": "📖 Trivia Bíblica",
    "certificate.defaultName": "Jugador",

    "torah.menuTitle": "Torá y Leyendas del Talmud",
    "torah.intro": "Un espacio gratuito para profundizar en los cinco libros de la Torá (Génesis, Éxodo, Levítico, Números y Deuteronomio) y para conocer leyendas tradicionales del Talmud y el Midrash.",
    "torah.disclaimer": "⚠️ Importante: las preguntas de \"Torá\" vienen directamente del texto bíblico. Las \"Leyendas del Talmud\" son tradición oral judía (Hagadá/Aggadah) posterior: relatos e interpretaciones rabínicas, NO parte del texto de la Torá ni de la Biblia cristiana. Se muestran siempre etiquetadas para que sepas cuál es cuál.",
    "torah.btnStart": "Comenzar ronda (10 preguntas)",
    "torah.btnBack": "Volver al menú",
    "torah.badgeTorah": "📖 Torá (texto bíblico)",
    "torah.badgeLegend": "✨ Leyenda del Talmud (tradición, no es la Biblia)",
    "torah.source": "Fuente: {source}",
    "torah.resultTitle": "Ronda completada",
    "torah.resultDetail": "Acertaste {correct} de {total} preguntas sobre la Torá y las leyendas del Talmud.",
    "torah.btnPlayAgain": "Jugar otra ronda",
  },

  en: {
    "menu.title": "📖 Bible Trivia",
    "menu.subtitle": "120 levels of difficulty — from beginner to expert",
    "menu.mission": "This game was created to bring the stories of the biblical past into the present: getting to know its characters isn't just a fact to learn, but a chance to apply today — and in the future — what they lived through.",
    "menu.mysteryBonus": "🎁 <strong>Promotion:</strong> subscribers enter a raffle for a bonus worth <strong>a percentage that, for now, remains a mystery</strong>. We'll reveal how much soon!",
    "menu.btnPlay": "Play",
    "menu.btnCharacters": "Bible Characters",
    "menu.btnTorah": "📜 Torah and Talmud Legends",
    "menu.btnCertificate": "🎓 My Certificate",
    "menu.btnHowTo": "How to Play",
    "menu.btnLogout": "Log out",
    "menu.langLabel": "Language",

    "howto.title": "How to Play",
    "howto.mission": "This game was made with a purpose: to bring what happened in the biblical past into the present, so you can apply it today and in your future — not just memorize it.",
    "howto.li1": "There are <strong>120 levels</strong>, grouped into 12 biblical themes (Genesis, Patriarchs, Exodus, Kings, Prophets, Jesus, Parables, Apostles, Letters, Revelation, and more), with characters from the whole Bible.",
    "howto.li2": "Each level is a short round of multiple-choice questions.",
    "howto.li3": "As you level up, you get <strong>less time</strong> per question, <strong>fewer lives</strong>, and need <strong>more correct answers</strong> to pass.",
    "howto.li4": "Answering fast and correctly gives more points.",
    "howto.li5": "When you pass a level, you'll see a <strong>teaching</strong>: what a character did in the past, and how to apply that same example today and in the future, with an extra challenge that gives bonus points.",
    "howto.li6": "Explore the <strong>Character Gallery</strong> and the <strong>Torah and Talmud Legends</strong> mode from the menu — both free.",
    "howto.li7": "If you run out of lives or don't reach the required number of correct answers, you can retry the level.",
    "howto.li8": "Your progress is saved automatically in this browser.",
    "howto.btnBack": "Back to menu",

    "characters.title": "Bible Characters",
    "characters.mission": "From the past to the present: these are the characters whose stories inspire the game's questions and teachings.",
    "characters.btnBack": "Back to menu",

    "levels.title": "Choose a level",
    "levels.freeLevel": "Free level:",
    "levels.paidLevel": "Paid level:",
    "levels.totalPoints": "Total points:",
    "levels.legend": "<span class=\"badge-locked\">🔒</span> to play &nbsp; <span class=\"badge-paid\">🔒💳</span> requires a paid subscription",
    "levels.btnMenu": "Menu",
    "levels.btnReset": "Reset progress",
    "levels.resetConfirm": "Are you sure you want to erase your FREE progress (levels 1-20) and start over from level 1? This does not affect your paid subscription if you have one.",

    "game.level": "Level {n}",
    "game.hudPass": "You need {n} correct answers",
    "game.needPayment": "You must first pass the earlier levels to reach this one.",

    "result.pass": "Level passed!",
    "result.fail": "Level failed",
    "result.detail": "You answered {correct} of {total} questions correctly. You needed {needed}.",
    "result.allCompleted": " You've completed all 120 levels!",
    "result.syncError": " (Your progress could not be synced with the server: {error})",
    "result.scorePass": "+{score} points",
    "result.scoreFail": "0 points",
    "result.btnRetry": "Retry",
    "result.btnNext": "Next level",
    "result.btnMenu": "Menu",

    "teaching.title": "📘 Teaching for this level",
    "teaching.applyPrefix": "💡 Apply it: ",
    "teaching.correctFeedback": "Correct! +{bonus} bonus points for applying the teaching.",
    "teaching.wrongFeedback": "That's not the best application. Keep practicing this teaching in your daily life!",

    "account.loggedIn": "Signed in as {name} ({tier}).",
    "account.loggedOut": "Levels 1-20 are free. Create an account whenever you want to go further.",
    "account.tierFree": "no paid subscription",
    "account.tier100": "access up to level 100",
    "account.tier120": "access up to level 120",

    "auth.title": "Levels 1-20 are free",
    "auth.mission": "To continue from level 21 onward you need a free account and, after that, a paid subscription. Create your account or sign in to continue.",
    "auth.tabLogin": "Sign in",
    "auth.tabRegister": "Create account",
    "auth.labelEmail": "Email",
    "auth.labelPassword": "Password",
    "auth.labelName": "Name",
    "auth.labelPasswordMin": "Password (minimum 8 characters)",
    "auth.btnLogin": "Sign in",
    "auth.btnRegister": "Create account",
    "auth.btnCancel": "Cancel",

    "paywall.title100": "Continue up to level 100",
    "paywall.title120": "Complete up to level 120",
    "paywall.detail100": "Levels 1 through 20 are free. To continue from level 21 to 100, this one-time subscription is required.",
    "paywall.detail120": "You already have access up to level 100. To complete up to level 120 — and get your certificate — this additional payment is required.",
    "paywall.currency": "COP",
    "paywall.btnPay": "Pay with Wompi",
    "paywall.redirecting": "Redirecting to Wompi...",
    "paywall.mysteryBonus": "🎁 <strong>Surprise bonus:</strong> by subscribing you enter a raffle for a bonus worth <strong>a percentage that, for now, remains a mystery</strong> — to be revealed later!",

    "certificate.title": "🎓 You completed all 120 levels!",
    "certificate.mission": "As a gift, here is your certificate for completing Bible Trivia from start to finish.",
    "certificate.btnDownload": "Download certificate",
    "certificate.canvasTitle": "Certificate of Completion",
    "certificate.canvasSubtitle": "Bible Trivia — 120 Levels",
    "certificate.canvasAwardedTo": "This certificate is awarded to:",
    "certificate.canvasLine1": "for successfully completing all 120 levels of difficulty,",
    "certificate.canvasLine2": "bringing the teachings of the biblical past into practice in the present.",
    "certificate.canvasDate": "Date: {date}",
    "certificate.canvasFooter": "📖 Bible Trivia",
    "certificate.defaultName": "Player",

    "torah.menuTitle": "Torah and Talmud Legends",
    "torah.intro": "A free space to go deeper into the five books of the Torah (Genesis, Exodus, Leviticus, Numbers, and Deuteronomy) and to learn traditional legends from the Talmud and the Midrash.",
    "torah.disclaimer": "⚠️ Important: the \"Torah\" questions come directly from the biblical text. The \"Talmud Legends\" are later Jewish oral tradition (Aggadah): rabbinic stories and interpretations that are NOT part of the Torah text or the Christian Bible. They are always clearly labeled so you know which is which.",
    "torah.btnStart": "Start round (10 questions)",
    "torah.btnBack": "Back to menu",
    "torah.badgeTorah": "📖 Torah (biblical text)",
    "torah.badgeLegend": "✨ Talmud legend (tradition, not the Bible)",
    "torah.source": "Source: {source}",
    "torah.resultTitle": "Round complete",
    "torah.resultDetail": "You got {correct} of {total} questions right about the Torah and the Talmud legends.",
    "torah.btnPlayAgain": "Play another round",
  },
};
