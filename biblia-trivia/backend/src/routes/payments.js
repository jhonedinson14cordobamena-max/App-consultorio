const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { buildCheckoutSignature, buildCheckoutUrl, generateReference, verifyWebhookSignature } = require("../wompi");

const router = express.Router();

const CURRENCY = "COP";

function priceInCentsFor(tier) {
  const cop = tier === "tier100" ? Number(process.env.PRICE_TIER_100_COP) : Number(process.env.PRICE_TIER_120_COP);
  return Math.round(cop * 100);
}

router.get("/prices", (_req, res) => {
  res.json({
    currency: CURRENCY,
    tier100Cop: Number(process.env.PRICE_TIER_100_COP),
    tier120Cop: Number(process.env.PRICE_TIER_120_COP),
  });
});

router.post("/create-checkout", requireAuth, (req, res) => {
  const { tier } = req.body || {};
  if (tier !== "tier100" && tier !== "tier120") {
    return res.status(400).json({ error: "tier debe ser 'tier100' o 'tier120'." });
  }

  const progress = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(req.userId);
  if (tier === "tier100" && progress.tier !== "free") {
    return res.status(409).json({ error: "Ya tienes acceso hasta el nivel 100 o superior." });
  }
  if (tier === "tier120" && progress.tier !== "tier100") {
    return res.status(409).json({ error: "Necesitas primero la suscripción hasta el nivel 100." });
  }

  const amountInCents = priceInCentsFor(tier);
  const reference = generateReference(`biblia-${tier}-u${req.userId}`);

  db.prepare(
    `INSERT INTO payments (user_id, reference, tier, amount_in_cents, currency, status)
     VALUES (?, ?, ?, ?, ?, 'PENDING')`
  ).run(req.userId, reference, tier, amountInCents, CURRENCY);

  const signature = buildCheckoutSignature({
    reference,
    amountInCents,
    currency: CURRENCY,
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET,
  });

  const checkoutUrl = buildCheckoutUrl({
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    currency: CURRENCY,
    amountInCents,
    reference,
    signature,
    redirectUrl: process.env.CHECKOUT_REDIRECT_URL,
  });

  res.json({ checkoutUrl, reference });
});

router.get("/status/:reference", requireAuth, (req, res) => {
  const payment = db
    .prepare("SELECT * FROM payments WHERE reference = ? AND user_id = ?")
    .get(req.params.reference, req.userId);
  if (!payment) return res.status(404).json({ error: "Pago no encontrado." });
  res.json({ status: payment.status, tier: payment.tier });
});

// Wompi llama esta ruta directamente (configúrala en tu dashboard de Wompi).
// No requiere el JWT de la app: se autentica verificando la firma del evento.
router.post("/webhook", express.json(), (req, res) => {
  const event = req.body;

  const isValid = verifyWebhookSignature(event, process.env.WOMPI_EVENTS_SECRET);
  if (!isValid) {
    return res.status(400).json({ error: "Firma de webhook inválida." });
  }

  const transaction = event?.data?.transaction;
  if (!transaction || !transaction.reference) {
    return res.status(400).json({ error: "Evento sin transacción válida." });
  }

  const payment = db.prepare("SELECT * FROM payments WHERE reference = ?").get(transaction.reference);
  if (!payment) {
    // Puede ser un evento de otra integración/prueba; respondemos 200 para que Wompi no reintente.
    return res.status(200).json({ received: true });
  }

  db.prepare(
    "UPDATE payments SET status = ?, wompi_transaction_id = ?, updated_at = datetime('now') WHERE reference = ?"
  ).run(transaction.status, transaction.id, transaction.reference);

  if (transaction.status === "APPROVED") {
    // Solo se sube de nivel de suscripción, nunca se baja desde aquí.
    const tierRank = { free: 0, tier100: 1, tier120: 2 };
    const current = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(payment.user_id);
    if (current && tierRank[payment.tier] > tierRank[current.tier]) {
      // Al pagar tier100 por primera vez, se desbloquea el nivel 21 (si no estaba ya más adelante).
      const newUnlockedLevel =
        payment.tier === "tier100" ? Math.max(current.unlocked_level, 21) : current.unlocked_level;
      db.prepare(
        "UPDATE progress SET tier = ?, unlocked_level = ?, updated_at = datetime('now') WHERE user_id = ?"
      ).run(payment.tier, newUnlockedLevel, payment.user_id);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
