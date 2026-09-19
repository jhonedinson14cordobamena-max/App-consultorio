/**
 * Integración con Wompi (Web Checkout) para las suscripciones de Trivia Bíblica.
 *
 * ADVERTENCIA IMPORTANTE:
 * Las fórmulas de abajo (firma de integridad del checkout y checksum de
 * webhooks) están implementadas según la documentación pública de Wompi
 * vigente al momento de escribir este código. Wompi puede cambiar su API.
 * Antes de operar con dinero real:
 *   1) Prueba TODO el flujo en modo sandbox con tarjetas de prueba de Wompi.
 *   2) Verifica esta implementación contra la documentación oficial actual:
 *      https://docs.wompi.co/  (sección "Widget & Checkout Web" y "Eventos").
 *   3) Nunca imprimas ni subas a git tus secretos reales
 *      (WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_SECRET). Solo viven en tu .env.
 */

const crypto = require("crypto");

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Firma de integridad para el Web Checkout de Wompi:
 *   SHA256(referencia + montoEnCentavos + moneda + secretoDeIntegridad)
 */
function buildCheckoutSignature({ reference, amountInCents, currency, integritySecret }) {
  return sha256Hex(`${reference}${amountInCents}${currency}${integritySecret}`);
}

/**
 * Construye la URL del Web Checkout hospedado de Wompi.
 * https://checkout.wompi.co/p/  (sandbox y producción usan la misma URL;
 * lo que cambia es si tu llave pública es pub_test_... o pub_prod_...)
 */
function buildCheckoutUrl({ publicKey, currency, amountInCents, reference, signature, redirectUrl }) {
  const params = new URLSearchParams({
    "public-key": publicKey,
    currency,
    "amount-in-cents": String(amountInCents),
    reference,
    "signature:integrity": signature,
    "redirect-url": redirectUrl,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

function generateReference(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
}

/** Lee un valor anidado de un objeto a partir de una ruta tipo "transaction.id". */
function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

/**
 * Verifica la firma (checksum) de un evento webhook de Wompi.
 * checksum = SHA256( valores de event.signature.properties (en orden,
 * resueltos sobre event.data) + event.timestamp + secretoDeEventos )
 */
function verifyWebhookSignature(event, eventsSecret) {
  if (!event || !event.signature || !Array.isArray(event.signature.properties)) return false;

  const concatenatedValues = event.signature.properties
    .map((propPath) => getByPath(event.data, propPath))
    .join("");

  const expected = sha256Hex(`${concatenatedValues}${event.timestamp}${eventsSecret}`);
  return expected === event.signature.checksum;
}

module.exports = {
  buildCheckoutSignature,
  buildCheckoutUrl,
  generateReference,
  verifyWebhookSignature,
};
