package co.daat.agente

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object Claude {
    /** Llama a la API de Claude. Devuelve null si no hay clave o falla. */
    fun preguntar(ctx: Context, system: String, mensajes: JSONArray, maxTokens: Int = 500): String? {
        val cfg = Config.load(ctx)
        val key = cfg.optString("claude_api_key").trim()
        if (key.isEmpty()) return null
        return try {
            val con = URL("https://api.anthropic.com/v1/messages").openConnection() as HttpURLConnection
            con.requestMethod = "POST"
            con.connectTimeout = 15000
            con.readTimeout = 60000
            con.doOutput = true
            con.setRequestProperty("x-api-key", key)
            con.setRequestProperty("anthropic-version", "2023-06-01")
            con.setRequestProperty("content-type", "application/json")
            val body = JSONObject()
                .put("model", cfg.optString("modelo", "claude-sonnet-5-5"))
                .put("max_tokens", maxTokens)
                .put("system", system)
                .put("messages", mensajes)
            con.outputStream.use { it.write(body.toString().toByteArray()) }
            val ok = con.responseCode in 200..299
            val txt = (if (ok) con.inputStream else con.errorStream).bufferedReader().readText()
            if (!ok) { Bitacora.add(ctx, "Claude error ${con.responseCode}: ${txt.take(200)}"); return null }
            val content = JSONObject(txt).getJSONArray("content")
            (0 until content.length()).map { content.getJSONObject(it) }
                .filter { it.optString("type") == "text" }
                .joinToString("") { it.optString("text") }.trim()
        } catch (e: Exception) {
            Bitacora.add(ctx, "Claude sin conexión: ${e.message}")
            null
        }
    }

    fun una(ctx: Context, system: String, usuario: String, maxTokens: Int = 500): String? =
        preguntar(ctx, system, JSONArray().put(JSONObject().put("role", "user").put("content", usuario)), maxTokens)
}
