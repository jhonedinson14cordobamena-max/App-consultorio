package co.daat.agente

import android.content.Context
import org.json.JSONObject
import java.net.URL
import java.net.URLEncoder

/** Revisa la pauta de Meta Ads (Facebook/Instagram) y resume con Claude. */
object Anuncios {
    fun revisar(ctx: Context): String {
        val c = Config.load(ctx).optJSONObject("anuncios") ?: return "Falta la sección anuncios."
        val token = c.optString("meta_token").trim()
        val cuenta = c.optString("cuenta").trim()
        if (token.isEmpty() || cuenta.endsWith("0000000000")) return "Configura meta_token y cuenta en Ajustes."

        val datos = try {
            val url = "https://graph.facebook.com/${c.optString("graph_version", "v21.0")}/$cuenta/insights" +
                "?level=campaign&date_preset=${c.optString("periodo", "yesterday")}" +
                "&fields=campaign_name,spend,impressions,clicks,ctr,cpc,actions" +
                "&access_token=" + URLEncoder.encode(token, "UTF-8")
            JSONObject(URL(url).readText()).optJSONArray("data")
        } catch (e: Exception) {
            Bitacora.add(ctx, "Meta Ads error: ${e.message}")
            return "No pude leer Meta Ads (revisa el token)."
        } ?: return "Sin datos de campañas."

        if (datos.length() == 0) return "No hubo gasto en el periodo."
        val lineas = (0 until datos.length()).joinToString("\n") {
            val d = datos.getJSONObject(it)
            val acciones = d.optJSONArray("actions")
            val leads = acciones?.let { a ->
                (0 until a.length()).map { i -> a.getJSONObject(i) }
                    .filter { x -> x.optString("action_type").contains("lead") || x.optString("action_type").contains("messaging_conversation_started") }
                    .sumOf { x -> x.optString("value", "0").toDoubleOrNull() ?: 0.0 }
            } ?: 0.0
            "${d.optString("campaign_name")}: gasto ${d.optString("spend")}, impresiones ${d.optString("impressions")}, " +
                "clics ${d.optString("clicks")}, CTR ${d.optString("ctr")}%, CPC ${d.optString("cpc")}, leads/chats ${leads.toInt()}"
        }

        val resumen = Claude.una(
            ctx,
            "Eres analista de pauta digital inmobiliaria. Con estos datos de Meta Ads da en español: " +
                "1 línea de estado general, hasta 3 alertas (CTR bajo <1%, costo por lead alto, campañas sin leads) " +
                "y 2 acciones concretas. Máximo 7 líneas, sin relleno.",
            lineas, 400
        ) ?: lineas

        Notif.mostrar(ctx, "📊 Pauta Meta Ads", resumen)
        Bitacora.add(ctx, "Anuncios revisados:\n$resumen")
        return resumen
    }
}
