const CONFIG_FIELDS = [
  "BROKER", "SYMBOLS", "FAST_SMA_PERIOD", "SLOW_SMA_PERIOD", "POLL_INTERVAL_MINUTES",
  "RISK_PER_TRADE_PCT", "STOP_LOSS_PCT", "MAX_DAILY_LOSS_PCT", "MAX_TOTAL_LOSS_PCT",
  "MAX_CAPITAL_USD",
  "XTB_USER_ID", "XTB_PASSWORD",
  "ALPACA_API_KEY", "ALPACA_SECRET_KEY",
  "BINANCE_API_KEY", "BINANCE_SECRET_KEY",
  "NOTIFY_EMAIL_TO", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD",
];

async function fetchJson(url, options) {
  const resp = await fetch(url, options);
  return resp.json();
}

function setBadge(el, text, kind) {
  el.textContent = text;
  el.className = "badge" + (kind ? " " + kind : "");
}

async function refreshStatus() {
  const data = await fetchJson("/api/status");

  setBadge(
    document.getElementById("badge-running"),
    data.running ? "Corriendo" : "Detenido",
    data.running ? "ok" : ""
  );
  setBadge(
    document.getElementById("badge-halted"),
    data.halted ? "KILL SWITCH ACTIVO" : "Sin halt",
    data.halted ? "danger" : "ok"
  );

  const cfg = data.config || {};
  document.getElementById("status-broker").textContent = cfg.BROKER || "—";
  document.getElementById("status-symbols").textContent = cfg.SYMBOLS || "—";
  document.getElementById("status-equity-day").textContent =
    data.equity_start_of_day != null ? data.equity_start_of_day : "—";
  document.getElementById("status-equity-baseline").textContent =
    data.baseline_equity != null ? data.baseline_equity : "—";
  document.getElementById("status-halt-reason").textContent = data.halted_reason || "—";

  document.getElementById("btn-start").disabled = data.running;
  document.getElementById("btn-stop").disabled = !data.running;
  document.getElementById("btn-reset-halt").disabled = !data.halted;

  if (!document.activeElement || document.activeElement.tagName !== "INPUT") {
    populateConfigForm(cfg);
  }
}

function populateConfigForm(cfg) {
  for (const field of CONFIG_FIELDS) {
    const el = document.getElementById("cfg-" + field);
    if (el && cfg[field] !== undefined && el !== document.activeElement) {
      el.value = cfg[field];
    }
  }
}

function collectConfigForm() {
  const updates = {};
  for (const field of CONFIG_FIELDS) {
    const el = document.getElementById("cfg-" + field);
    if (el) updates[field] = el.value;
  }
  return updates;
}

async function refreshLog() {
  const data = await fetchJson("/api/log");
  const out = document.getElementById("log-output");
  out.textContent = data.log || "(sin actividad todavia)";
  out.scrollTop = out.scrollHeight;
}

document.getElementById("btn-start").addEventListener("click", async () => {
  const data = await fetchJson("/api/run/start", { method: "POST" });
  document.getElementById("status-message").textContent = data.message;
  refreshStatus();
});

document.getElementById("btn-stop").addEventListener("click", async () => {
  const data = await fetchJson("/api/run/stop", { method: "POST" });
  document.getElementById("status-message").textContent = data.message;
  refreshStatus();
});

document.getElementById("btn-reset-halt").addEventListener("click", async () => {
  if (!confirm("¿Revisaste por que se detuvo el agente y quieres reactivarlo?")) return;
  const data = await fetchJson("/api/reset-halt", { method: "POST" });
  document.getElementById("status-message").textContent = data.message;
  refreshStatus();
});

document.getElementById("backtest-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const symbol = document.getElementById("bt-symbol").value.trim();
  const days = document.getElementById("bt-days").value;
  const out = document.getElementById("backtest-output");
  out.textContent = "Corriendo backtest...";
  const data = await fetchJson("/api/backtest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, days }),
  });
  out.textContent = data.output || "(sin salida)";
});

document.getElementById("config-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const updates = collectConfigForm();
  const data = await fetchJson("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  document.getElementById("config-message").textContent = data.message;
  refreshStatus();
});

document.getElementById("btn-refresh-log").addEventListener("click", refreshLog);

refreshStatus();
refreshLog();
setInterval(refreshStatus, 5000);
