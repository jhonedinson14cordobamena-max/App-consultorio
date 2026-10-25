import type { Config, Context } from "@netlify/functions"
import { getStore } from "@netlify/blobs"
import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Daat Agente · WhatsApp Business en la nube
 *
 * - Responde a los clientes con Claude, 24/7, aunque el teléfono esté apagado.
 * - Shabbat (viernes 18:15 → sábado 18:59, hora Colombia): solo envía
 *   "Pronto un asesor te estará atendiendo." una vez por cliente. Nada más.
 * - Si Jhon escribe al cliente desde la app de WhatsApp Business, el bot se
 *   calla con ese cliente durante 12 horas (toma humana).
 * - Jhon puede mandarle órdenes desde su número personal: "pausa", "activa", "estado".
 */

const env = (k: string, d = "") => Netlify.env.get(k) ?? d
const GRAPH = "https://graph.facebook.com/v21.0"
const MENSAJE_SHABBAT = () => env("MENSAJE_SHABBAT", "Pronto un asesor te estará atendiendo.")
const PAUSA_HUMANO_MS = 12 * 3600_000

const INSTRUCCIONES_BASE = `Eres el asistente comercial de Jhon Córdoba por WhatsApp.
Jhon es Director Comercial de Los Lagos Condominio Campestre (lotes campestres en Turbaco, Bolívar, cerca de Cartagena) y fundador de Inmobiliaria Atikvah.
Reglas:
- Español, cálido y profesional. Máximo 3 frases cortas. Nada de listas largas.
- Objetivo: entender qué busca el cliente, su presupuesto aproximado y cuándo puede visitar o hablar con un asesor.
- Haz UNA pregunta a la vez.
- NUNCA inventes precios, descuentos, disponibilidad, fechas ni condiciones. Si preguntan algo que no sabes: "Un asesor te confirma ese dato personalmente muy pronto."
- Si el cliente pide hablar con una persona, dile que un asesor lo contacta pronto.
- No menciones que eres una IA salvo que te lo pregunten directamente; si preguntan, dilo con honestidad.`

// ───────── Hora de Colombia (UTC-5, sin horario de verano) ─────────

function ahoraColombia() {
  const d = new Date(Date.now() - 5 * 3600_000)
  return { dia: d.getUTCDay(), minutos: d.getUTCHours() * 60 + d.getUTCMinutes(), fecha: d }
}

/** "FRI 18:15" -> minuto de la semana (domingo = 0) */
function minutoSemana(s: string) {
  const dias = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const [d, t] = s.trim().split(/\s+/)
  const [h, m] = t.split(":").map(Number)
  return dias.indexOf(d.toUpperCase()) * 1440 + h * 60 + m
}

function enShabbat() {
  const { dia, minutos } = ahoraColombia()
  const n = dia * 1440 + minutos
  const ini = minutoSemana(env("SHABBAT_INICIO", "FRI 18:15"))
  const fin = minutoSemana(env("SHABBAT_FIN", "SAT 18:59"))
  return ini <= fin ? n >= ini && n < fin : n >= ini || n < fin
}

/** Identificador del Shabbat actual (fecha del viernes) para no repetir el mensaje. */
function idShabbat() {
  const { fecha, dia } = ahoraColombia()
  const atras = (dia - 5 + 7) % 7
  const viernes = new Date(fecha.getTime() - atras * 86400_000)
  return viernes.toISOString().slice(0, 10)
}

// ───────── WhatsApp Cloud API ─────────

async function enviarTexto(para: string, texto: string) {
  const r = await fetch(`${GRAPH}/${env("WA_PHONE_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WA_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: para, type: "text", text: { body: texto } }),
  })
  if (!r.ok) console.error("WhatsApp error", r.status, await r.text())
}

async function marcarLeido(id: string) {
  await fetch(`${GRAPH}/${env("WA_PHONE_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WA_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: id }),
  }).catch(() => {})
}

// ───────── Claude ─────────

type Msg = { role: "user" | "assistant"; content: string }

async function claude(system: string, mensajes: Msg[]): Promise<string | null> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: env("CLAUDE_MODEL", "claude-sonnet-5-5"), max_tokens: 300, system, messages: mensajes }),
  })
  if (!r.ok) { console.error("Claude error", r.status, await r.text()); return null }
  const j: any = await r.json()
  return (j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("").trim() || null
}

// ───────── Lógica ─────────

function textoDe(m: any): string {
  switch (m.type) {
    case "text": return m.text?.body ?? ""
    case "button": return m.button?.text ?? ""
    case "interactive": return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? ""
    case "audio": return "[El cliente envió una nota de voz]"
    case "image": return "[El cliente envió una imagen]" + (m.image?.caption ? `: ${m.image.caption}` : "")
    case "document": return "[El cliente envió un documento]"
    case "location": return "[El cliente envió su ubicación]"
    default: return `[Mensaje tipo ${m.type}]`
  }
}

const solo = (s: string) => s.replace(/\D/g, "")

async function ordenDelDueno(para: string, texto: string) {
  const est = getStore("estado")
  const t = texto.trim().toLowerCase()
  if (t.startsWith("pausa")) { await est.set("pausado", "1"); return enviarTexto(para, "⏸️ Bot en pausa. Escribe *activa* para reanudar.") }
  if (t.startsWith("activa")) { await est.delete("pausado"); return enviarTexto(para, "✅ Bot activo, respondiendo clientes.") }
  const pausado = (await est.get("pausado")) === "1"
  return enviarTexto(para,
    `🤖 Daat Agente\n• Bot: ${pausado ? "en pausa" : "activo"}\n• Shabbat: ${enShabbat() ? "en curso" : "no"}\n\nÓrdenes: *pausa*, *activa*, *estado*`)
}

async function procesarMensaje(m: any, nombre: string) {
  const de = m.from as string
  const texto = textoDe(m)
  if (!texto) return

  // Evitar procesar dos veces (Meta reintenta)
  const vistos = getStore("vistos")
  const { modified } = await vistos.set(m.id, "1", { onlyIfNew: true })
  if (!modified) return
  marcarLeido(m.id)

  if (env("OWNER_PHONE") && solo(de) === solo(env("OWNER_PHONE"))) return ordenDelDueno(de, texto)

  const est = getStore("estado")
  if (enShabbat()) {
    const clave = `shabbat/${idShabbat()}/${de}`
    const r = await est.set(clave, "1", { onlyIfNew: true })
    if (r.modified) await enviarTexto(de, MENSAJE_SHABBAT())
    return
  }

  if ((await est.get("pausado")) === "1") return
  const humano = Number((await est.get(`humano/${de}`)) ?? 0)
  if (Date.now() - humano < PAUSA_HUMANO_MS) return

  const chats = getStore("chats")
  const historial: Msg[] = ((await chats.get(de, { type: "json" })) as Msg[] | null) ?? []
  historial.push({ role: "user", content: texto })
  // La conversación debe empezar con "user" y alternar
  while (historial.length && historial[0].role !== "user") historial.shift()

  const system = `${env("BOT_INSTRUCCIONES", INSTRUCCIONES_BASE)}\nEl cliente aparece como: ${nombre || "sin nombre"}.`
  const respuesta = await claude(system, historial.slice(-16))
  if (!respuesta) return

  await enviarTexto(de, respuesta)
  historial.push({ role: "assistant", content: respuesta })
  await chats.setJSON(de, historial.slice(-30))
}

/** Mensajes que Jhon envía desde la app (coexistencia) → el bot se calla con ese cliente. */
async function procesarEco(e: any) {
  const cliente = e.to as string
  if (cliente) await getStore("estado").set(`humano/${cliente}`, String(Date.now()))
}

function firmaValida(cuerpo: string, firma: string | null) {
  const secreto = env("WA_APP_SECRET")
  if (!secreto) return true
  if (!firma) return false
  const esperado = "sha256=" + createHmac("sha256", secreto).update(cuerpo).digest("hex")
  const a = Buffer.from(esperado), b = Buffer.from(firma)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url)

  // Verificación del webhook (Meta la hace una sola vez)
  if (req.method === "GET") {
    if (url.searchParams.get("hub.mode") === "subscribe" &&
        url.searchParams.get("hub.verify_token") === env("WA_VERIFY_TOKEN")) {
      return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 })
    }
    return new Response("Daat Agente activo", { status: 200 })
  }

  const cuerpo = await req.text()
  if (!firmaValida(cuerpo, req.headers.get("x-hub-signature-256"))) return new Response("firma inválida", { status: 401 })

  let datos: any
  try { datos = JSON.parse(cuerpo) } catch { return new Response("ok") }

  const tareas: Promise<unknown>[] = []
  for (const entry of datos.entry ?? []) {
    for (const ch of entry.changes ?? []) {
      const v = ch.value ?? {}
      if (ch.field === "messages") {
        const nombres = new Map<string, string>((v.contacts ?? []).map((c: any) => [c.wa_id, c.profile?.name ?? ""]))
        for (const m of v.messages ?? []) tareas.push(procesarMensaje(m, nombres.get(m.from) ?? ""))
      }
      if (ch.field === "smb_message_echoes") {
        for (const e of v.message_echoes ?? []) tareas.push(procesarEco(e))
      }
    }
  }

  // Responder 200 de inmediato y trabajar después (Meta exige respuesta rápida)
  context.waitUntil(Promise.allSettled(tareas).then((r) => r.forEach((x) => x.status === "rejected" && console.error(x.reason))))
  return new Response("ok", { status: 200 })
}

export const config: Config = { path: "/whatsapp" }
