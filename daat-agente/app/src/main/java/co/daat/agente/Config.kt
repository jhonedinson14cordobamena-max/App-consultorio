package co.daat.agente

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject
import java.io.File
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/** Configuración editable desde la app (sin recompilar). */
object Config {
    private const val ARCHIVO = "config.json"

    fun load(ctx: Context): JSONObject {
        val f = File(ctx.filesDir, ARCHIVO)
        if (!f.exists()) f.writeText(DEFAULT)
        return try { JSONObject(f.readText()) } catch (e: Exception) { JSONObject(DEFAULT) }
    }

    fun texto(ctx: Context): String = load(ctx).toString(2)

    /** Devuelve null si guardó bien, o el error del JSON. */
    fun guardar(ctx: Context, texto: String): String? = try {
        val json = JSONObject(texto)
        File(ctx.filesDir, ARCHIVO).writeText(json.toString(2))
        null
    } catch (e: Exception) { e.message ?: "JSON inválido" }

    fun guardarJson(ctx: Context, json: JSONObject) = File(ctx.filesDir, ARCHIVO).writeText(json.toString(2))

    fun restaurar(ctx: Context) = File(ctx.filesDir, ARCHIVO).writeText(JSONObject(DEFAULT).toString(2))

    val DEFAULT = """
{
  "claude_api_key": "",
  "modelo": "claude-sonnet-5-5",

  "shabbat": {
    "activo": true,
    "inicio": "FRI 18:15",
    "fin": "SAT 18:59",
    "bloquear_juegos": true,
    "apps_bloqueadas": [
      "com.nequi.MobileApp", "com.davivienda.daviplataapp", "com.todo1.mobile",
      "co.com.bbva.mb", "com.bancodebogota.bancamovil", "com.davivienda.daviviendaapp",
      "com.mercadopago.wallet", "com.paypal.android.p2pmobile", "com.binance.dev",
      "com.google.android.apps.walletnfcrel"
    ],
    "palabras_bloqueo": ["banco", "bank", "wallet", "casino", "wplay", "rushbet", "apuesta"],
    "respuesta_whatsapp": "Pronto un asesor te estará atendiendo."
  },

  "whatsapp": {
    "auto_responder": true,
    "ignorar_grupos": true,
    "ignorar_contactos": [],
    "instrucciones": "Eres el asistente comercial de Jhon Córdoba (Los Lagos Condominio Campestre, Turbaco, e Inmobiliaria Atikvah). Responde en español, breve y cálido, máximo 3 frases. Califica al cliente: qué busca, presupuesto y cuándo puede visitar. No inventes precios, descuentos ni fechas: si no sabes algo, di que Jhon le confirma personalmente muy pronto."
  },

  "anuncios": {
    "meta_token": "",
    "cuenta": "act_0000000000",
    "graph_version": "v21.0",
    "periodo": "yesterday"
  },

  "comandos_voz": [
    { "frases": ["modo shabbat", "activa shabbat", "shabbat shalom"], "accion": "shabbat_on" },
    { "frases": ["desactiva shabbat", "termina shabbat"], "accion": "shabbat_off" },
    { "frases": ["revisa anuncios", "como van los anuncios", "revisa la pauta"], "accion": "revisar_anuncios" },
    { "frases": ["pausa respuestas", "no respondas"], "accion": "whatsapp_off" },
    { "frases": ["activa respuestas", "responde clientes"], "accion": "whatsapp_on" },
    { "frases": ["abre whatsapp", "abre business"], "accion": "abrir_app", "valor": "com.whatsapp.w4b" },
    { "frases": ["abre meta", "abre anuncios"], "accion": "abrir_app", "valor": "com.facebook.pages.app" }
  ],

  "tareas": [
    { "nombre": "Pauta de la mañana", "hora": "08:00", "dias": ["MON","TUE","WED","THU","FRI","SUN"], "accion": "revisar_anuncios" },
    { "nombre": "Abrir Meta Business y tocar Anuncios", "hora": "09:00", "dias": ["MON"], "accion": "abrir_y_tocar", "valor": "com.facebook.pages.app", "texto": "Anuncios", "activa": false }
  ]
}
""".trimIndent()
}

object Estado {
    fun prefs(ctx: Context): SharedPreferences = ctx.getSharedPreferences("estado", Context.MODE_PRIVATE)
}

/** Registro de todo lo que hace el agente. */
object Bitacora {
    private val fmt = DateTimeFormatter.ofPattern("dd/MM HH:mm")

    @Synchronized
    fun add(ctx: Context, msg: String) {
        val f = File(ctx.filesDir, "bitacora.txt")
        val linea = "[${LocalDateTime.now().format(fmt)}] $msg\n"
        val previo = if (f.exists()) f.readText() else ""
        f.writeText((linea + previo).take(30000))
    }

    fun leer(ctx: Context): String {
        val f = File(ctx.filesDir, "bitacora.txt")
        return if (f.exists()) f.readText() else "Sin actividad todavía."
    }
}
