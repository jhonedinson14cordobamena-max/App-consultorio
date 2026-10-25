package co.daat.agente

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.text.Normalizer

/** Todo lo que el agente sabe hacer. Agrega aquí acciones nuevas. */
object Acciones {

    const val CATALOGO = """
shabbat_on | shabbat_off | whatsapp_on | whatsapp_off | revisar_anuncios |
abrir_app (valor = paquete Android) | tocar (texto = botón visible) |
abrir_y_tocar (valor = paquete, texto = botón) | abrir_url (valor = url) | notificar (texto)"""

    /** Acciones que se pueden elegir en la Agenda (id, nombre visible). */
    val OPCIONES: List<Pair<String, String>> by lazy {
        listOf(
            "revisar_anuncios" to "Revisar pauta de anuncios",
            "notificar" to "Recordatorio (notificación)",
            "abrir_app" to "Abrir una app",
            "abrir_url" to "Abrir un enlace",
            "shabbat_on" to "Activar Shabbat",
            "shabbat_off" to "Desactivar Shabbat"
        ) + if (COMPLETA) listOf(
            "abrir_y_tocar" to "Abrir app y tocar botón",
            "tocar" to "Tocar botón en pantalla",
            "whatsapp_on" to "Activar respuestas WhatsApp",
            "whatsapp_off" to "Pausar respuestas WhatsApp"
        ) else emptyList()
    }

    fun etiqueta(id: String) = OPCIONES.firstOrNull { it.first == id }?.second ?: id

    private fun normalizar(s: String) =
        Normalizer.normalize(s.lowercase(), Normalizer.Form.NFD).replace(Regex("\\p{Mn}+"), "").trim()

    /** Frase hablada -> acción. Primero comandos fijos, luego Claude. Nunca devuelve null. */
    fun interpretar(ctx: Context, frase: String): JSONObject {
        val f = normalizar(frase)
        val cmds = Config.load(ctx).optJSONArray("comandos_voz")
        if (cmds != null) for (i in 0 until cmds.length()) {
            val c = cmds.getJSONObject(i)
            val frases = c.optJSONArray("frases") ?: continue
            if ((0 until frases.length()).any { f.contains(normalizar(frases.getString(it))) }) return c
        }
        reglasBasicas(f)?.let { return it }

        if (Config.load(ctx).optString("claude_api_key").isBlank()) {
            return ninguna("No reconozco esa orden y aún no tengo la clave de Claude para entenderla. " +
                "Pégala en Ajustes. Mientras tanto puedes decir: modo Shabbat, revisa la pauta, abre WhatsApp Business.")
        }
        val r = Claude.una(
            ctx,
            "Convierte la orden del usuario en UN objeto JSON {\"accion\",\"valor\",\"texto\"} usando solo estas acciones: " +
                OPCIONES.joinToString(", ") { it.first } +
                ". abrir_app usa valor = paquete Android. " +
                (if (COMPLETA) "" else "Esta versión NO puede leer ni responder WhatsApp ni tocar botones; si lo piden, explícalo. ") +
                "Si ninguna aplica responde {\"accion\":\"ninguna\",\"texto\":\"respuesta corta en español\"}. Solo JSON.",
            frase, 200
        ) ?: return ninguna("No pude conectar con Claude. Revisa la clave en Ajustes y tu internet.")
        return try { JSONObject(r.substring(r.indexOf('{'), r.lastIndexOf('}') + 1)) }
        catch (e: Exception) { ninguna(r.take(200)) }
    }

    private fun ninguna(t: String) = JSONObject().put("accion", "ninguna").put("texto", t)

    /** Entiende órdenes comunes sin necesitar Claude. */
    private fun reglasBasicas(f: String): JSONObject? {
        fun tiene(vararg p: String) = p.any { f.contains(it) }
        fun a(id: String, valor: String? = null) = JSONObject().put("accion", id).also { if (valor != null) it.put("valor", valor) }
        return when {
            tiene("shabbat") && tiene("desactiv", "apag", "termin", "quit") -> a("shabbat_off")
            tiene("shabbat") -> a("shabbat_on")
            tiene("pauta", "anuncio", "campana", "publicidad", "meta ads") -> a("revisar_anuncios")
            tiene("whatsapp") && tiene("abre", "abrir") -> a("abrir_app", "com.whatsapp.w4b")
            tiene("whatsapp") && tiene("revis", "lee", "mensaje", "respond", "contest") ->
                if (COMPLETA) a("abrir_app", "com.whatsapp.w4b")
                else ninguna("En esta versión no puedo leer ni responder WhatsApp: Android bloquea ese permiso. Te abro WhatsApp Business.")
                    .put("accion", "abrir_app").put("valor", "com.whatsapp.w4b")
            tiene("bitacora", "que hiciste") -> ninguna("Abre Bitácora en Acciones rápidas.")
            else -> null
        }
    }

    fun ejecutar(ctx: Context, a: JSONObject): String {
        val accion = a.optString("accion")
        val valor = a.optString("valor")
        val texto = a.optString("texto")
        val shabbat = Shabbat.activo(ctx)
        val res = when (accion) {
            "shabbat_on" -> { Shabbat.forzarOn(ctx); "Modo Shabbat activado. Shabbat Shalom." }
            "shabbat_off" -> { Shabbat.forzarOff(ctx); "Modo Shabbat desactivado." }
            "whatsapp_off" -> { Estado.prefs(ctx).edit().putBoolean("whatsapp_pausado", true).apply(); "Respuestas automáticas pausadas." }
            "whatsapp_on" -> { Estado.prefs(ctx).edit().putBoolean("whatsapp_pausado", false).apply(); "Respuestas automáticas activas." }
            "revisar_anuncios" -> if (shabbat) "Es Shabbat, reviso los anuncios al terminar." else Anuncios.revisar(ctx)
            "abrir_app" -> (if (texto.isNotBlank()) "$texto " else "") + abrirApp(ctx, valor)
            "tocar" -> if (AgentAccessibility.instancia?.tocarTexto(texto) == true) "Toqué \"$texto\"." else "No encontré \"$texto\" en pantalla."
            "abrir_y_tocar" -> {
                val r = abrirApp(ctx, valor)
                Handler(Looper.getMainLooper()).postDelayed({
                    val ok = AgentAccessibility.instancia?.tocarTexto(texto) == true
                    Bitacora.add(ctx, if (ok) "Toqué \"$texto\" en $valor" else "No encontré \"$texto\" en $valor")
                }, 6000)
                "$r Tocaré \"$texto\" en unos segundos."
            }
            "abrir_url" -> lanzar(ctx, Intent(Intent.ACTION_VIEW, Uri.parse(valor)), "Abriendo enlace.")
            "notificar" -> { Notif.mostrar(ctx, "Daat Agente", texto); "Listo." }
            "ninguna" -> texto.ifBlank { "No sé hacer eso todavía." }
            else -> "Acción desconocida: $accion"
        }
        Bitacora.add(ctx, "Acción $accion → $res")
        return res
    }

    private fun abrirApp(ctx: Context, pkg: String): String {
        val i = ctx.packageManager.getLaunchIntentForPackage(pkg) ?: return "No tengo instalada $pkg."
        return lanzar(ctx, i, "Abriendo app.")
    }

    private fun lanzar(ctx: Context, i: Intent, ok: String): String = try {
        val acc = AgentAccessibility.instancia
        if (acc != null) acc.abrir(i) else ctx.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        ok
    } catch (e: Exception) { "No pude abrir: ${e.message}" }
}
