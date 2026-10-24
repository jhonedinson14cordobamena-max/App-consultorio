package co.daat.agente

import android.app.Notification
import android.app.RemoteInput
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject

/** Lee mensajes de WhatsApp y responde desde la notificación. */
class WhatsAppListener : NotificationListenerService() {

    companion object {
        private val historial = HashMap<String, JSONArray>()
        private val ultimaRespuesta = HashMap<String, Long>()
        private val vistos = ArrayDeque<String>()
        private const val WA_BUSINESS = "com.whatsapp.w4b"
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // Solo WhatsApp Business. El WhatsApp personal nunca se lee ni se responde.
        if (sbn.packageName != WA_BUSINESS) return
        val n = sbn.notification
        if (n.flags and Notification.FLAG_GROUP_SUMMARY != 0) return

        val estilo = NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(n)
        val ultimo = estilo?.messages?.lastOrNull()
        if (estilo != null && ultimo?.person == null) return // mensaje propio
        val remitente = ultimo?.person?.name?.toString()
            ?: n.extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: return
        val texto = ultimo?.text?.toString()
            ?: n.extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return
        if (texto.matches(Regex("^\\d+ (mensajes|messages).*"))) return

        val cfg = Config.load(this).optJSONObject("whatsapp") ?: return
        if (!cfg.optBoolean("auto_responder", true)) return
        if (Estado.prefs(this).getBoolean("whatsapp_pausado", false)) return
        if (cfg.optBoolean("ignorar_grupos", true) && estilo?.isGroupConversation == true) return
        val ignorar = cfg.optJSONArray("ignorar_contactos") ?: JSONArray()
        if ((0 until ignorar.length()).any { remitente.contains(ignorar.getString(it), true) }) return

        val clave = "$remitente|$texto"
        synchronized(vistos) {
            if (clave in vistos) return
            vistos.addLast(clave); if (vistos.size > 200) vistos.removeFirst()
        }

        val accion = n.actions?.firstOrNull { it.remoteInputs?.isNotEmpty() == true } ?: return
        val shabbat = Shabbat.activo(this)
        val ahora = System.currentTimeMillis()
        val espera = if (shabbat) 25 * 3600_000L else 20_000L
        if (ahora - (ultimaRespuesta[remitente] ?: 0) < espera) return

        Thread {
            val respuesta = if (shabbat) {
                Config.load(this).optJSONObject("shabbat")?.optString("respuesta_whatsapp")
            } else responderConClaude(remitente, texto, cfg)
            if (!respuesta.isNullOrBlank()) {
                enviar(accion, respuesta)
                ultimaRespuesta[remitente] = System.currentTimeMillis()
                Bitacora.add(this, "WhatsApp ← $remitente: $texto\n   → $respuesta")
            }
        }.start()
    }

    private fun responderConClaude(remitente: String, texto: String, cfg: JSONObject): String? {
        val h = synchronized(historial) { historial.getOrPut(remitente) { JSONArray() } }
        h.put(JSONObject().put("role", "user").put("content", texto))
        val system = cfg.optString("instrucciones") + "\nEl cliente se llama o aparece como: $remitente."
        val r = Claude.preguntar(this, system, h, 300)
        if (r == null) { h.remove(h.length() - 1); return null }
        h.put(JSONObject().put("role", "assistant").put("content", r))
        while (h.length() > 12) { h.remove(0); h.remove(0) }
        return r
    }

    private fun enviar(accion: Notification.Action, texto: String) {
        try {
            val intent = Intent()
            val datos = Bundle()
            accion.remoteInputs.forEach { datos.putCharSequence(it.resultKey, texto) }
            RemoteInput.addResultsToIntent(accion.remoteInputs, intent, datos)
            accion.actionIntent.send(this, 0, intent)
        } catch (e: Exception) {
            Bitacora.add(this, "No pude enviar a WhatsApp: ${e.message}")
        }
    }
}
