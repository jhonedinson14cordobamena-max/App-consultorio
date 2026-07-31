/**
 * Cliente del backend de Trivia Bíblica.
 *
 * Los niveles 1-20 son gratis y funcionan 100% en el navegador (sin este
 * backend). A partir del nivel 21 el progreso y las suscripciones de pago
 * se validan aquí, contra el servidor, para que no se puedan desbloquear
 * borrando el localStorage del navegador.
 *
 * Cambia API_BASE_URL si despliegas el backend en otra dirección.
 */

const API_BASE_URL = window.TRIVIA_API_BASE_URL || "http://localhost:3001/api";
const TOKEN_KEY = "trivia-biblica-token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || "Ocurrió un error."), { status: response.status, data });
  }
  return data;
}

const api = {
  register: (email, password, name) => apiRequest("/auth/register", { method: "POST", body: { email, password, name } }),
  login: (email, password) => apiRequest("/auth/login", { method: "POST", body: { email, password } }),
  me: () => apiRequest("/auth/me", { auth: true }),
  prices: () => apiRequest("/payments/prices"),
  createCheckout: (tier) => apiRequest("/payments/create-checkout", { method: "POST", auth: true, body: { tier } }),
  paymentStatus: (reference) => apiRequest(`/payments/status/${encodeURIComponent(reference)}`, { auth: true }),
  advanceProgress: (level, passed, scoreGained) =>
    apiRequest("/progress/advance", { method: "POST", auth: true, body: { level, passed, scoreGained } }),
  getProgress: () => apiRequest("/progress", { auth: true }),
  isLoggedIn: () => Boolean(getToken()),
  logout: () => setToken(null),
  setToken,
};
