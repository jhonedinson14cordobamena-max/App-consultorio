package co.daat.agente

import android.Manifest
import android.content.Intent
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.NotificationManagerCompat
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var estado: TextView
    private lateinit var editor: EditText
    private var tts: TextToSpeech? = null

    private val voz = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { r ->
        val frase = r.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
            ?: return@registerForActivityResult
        procesar(frase)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        tts = TextToSpeech(this) { tts?.language = Locale("es", "CO") }
        Notif.canal(this)
        if (Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        TaskWorker.programar(this)

        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(40, 60, 40, 60) }
        col.addView(TextView(this).apply { text = "Daat Agente"; textSize = 26f; setTypeface(null, Typeface.BOLD) })
        estado = TextView(this).apply { textSize = 15f; setPadding(0, 20, 0, 20) }
        col.addView(estado)

        fun boton(t: String, f: () -> Unit) = col.addView(Button(this).apply { text = t; setOnClickListener { f() } })
        boton("🎤  Hablar") { escuchar() }
        boton("🕯️  Shabbat ON / OFF") {
            procesarAccion(if (Shabbat.activo(this)) "shabbat_off" else "shabbat_on")
        }
        boton("📊  Revisar anuncios ahora") { procesarAccion("revisar_anuncios") }
        boton("♿  Permiso: Accesibilidad (bloqueo y toques)") { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        boton("🔔  Permiso: Leer notificaciones (WhatsApp Business)") { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        boton("📜  Ver bitácora") { estado.text = Bitacora.leer(this) }

        col.addView(TextView(this).apply {
            text = "\n⚙️ Configuración (comandos de voz, tareas, Shabbat, WhatsApp, anuncios)"
            setTypeface(null, Typeface.BOLD)
        })
        editor = EditText(this).apply {
            typeface = Typeface.MONOSPACE; textSize = 11f; minLines = 18
            setText(Config.texto(this@MainActivity))
        }
        col.addView(editor)
        boton("💾  Guardar configuración") {
            val err = Config.guardar(this, editor.text.toString())
            toast(err?.let { "Error: $it" } ?: "Guardado ✅")
            refrescar()
        }
        boton("↩️  Restaurar configuración inicial") {
            Config.restaurar(this); editor.setText(Config.texto(this)); toast("Restaurada")
        }

        setContentView(ScrollView(this).apply { addView(col) })
        if (intent?.getBooleanExtra("escuchar", false) == true) escuchar()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.getBooleanExtra("escuchar", false)) escuchar()
    }

    override fun onResume() { super.onResume(); refrescar() }

    override fun onDestroy() { tts?.shutdown(); super.onDestroy() }

    private fun refrescar() {
        val cfg = Config.load(this)
        val acc = AgentAccessibility.instancia != null
        val notif = NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)
        val pausado = Estado.prefs(this).getBoolean("whatsapp_pausado", false)
        estado.text = buildString {
            appendLine(if (Shabbat.activo(this@MainActivity)) "🕯️ Shabbat ACTIVO" else "☀️ Shabbat inactivo")
            appendLine((if (acc) "✅" else "❌") + " Accesibilidad")
            appendLine((if (notif) "✅" else "❌") + " Lectura de WhatsApp")
            appendLine(if (pausado) "⏸️ Respuestas WhatsApp en pausa" else "💬 Respuestas WhatsApp activas")
            appendLine((if (cfg.optString("claude_api_key").isNotBlank()) "✅" else "❌") + " Clave de Claude")
        }
    }

    private fun escuchar() {
        val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-CO")
            .putExtra(RecognizerIntent.EXTRA_PROMPT, "¿Qué hago, Jhon?")
        try { voz.launch(i) } catch (e: Exception) { toast("Reconocimiento de voz no disponible") }
    }

    private fun procesar(frase: String) {
        estado.text = "🗣️ $frase\n⏳ Procesando…"
        Thread {
            val cmd = Acciones.interpretar(this, frase)
            val res = if (cmd == null) "No entendí la orden." else Acciones.ejecutar(this, cmd)
            runOnUiThread { mostrar("🗣️ $frase", res) }
        }.start()
    }

    private fun procesarAccion(accion: String) {
        estado.text = "⏳ Procesando…"
        Thread {
            val res = Acciones.ejecutar(this, org.json.JSONObject().put("accion", accion))
            runOnUiThread { mostrar("", res) }
        }.start()
    }

    private fun mostrar(arriba: String, res: String) {
        estado.text = (if (arriba.isNotEmpty()) "$arriba\n" else "") + "✅ $res"
        tts?.speak(res, TextToSpeech.QUEUE_FLUSH, null, "r")
    }

    private fun toast(t: String) = Toast.makeText(this, t, Toast.LENGTH_SHORT).show()
}
