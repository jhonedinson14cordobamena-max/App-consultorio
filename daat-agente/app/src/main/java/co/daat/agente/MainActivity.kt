package co.daat.agente

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import org.json.JSONObject
import java.util.Locale

val COMPLETA = BuildConfig.FLAVOR == "completa"

class MainActivity : ComponentActivity() {

    private lateinit var contenido: FrameLayout
    private lateinit var nav: LinearLayout
    private var tts: TextToSpeech? = null
    var pestana = 0
    var resultado = ""
    var procesando = false

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
        BloqueoService.iniciar(this)

        val raiz = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(Colores.FONDO) }
        contenido = FrameLayout(this)
        raiz.addView(contenido, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))
        nav = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Colores.TARJETA)
            setPadding(0, dp(6), 0, dp(6))
        }
        raiz.addView(nav)
        setContentView(raiz)
        construirNav()
        mostrar(0)

        if (intent?.getBooleanExtra("escuchar", false) == true) escuchar()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (intent.getBooleanExtra("escuchar", false)) escuchar()
    }

    override fun onResume() { super.onResume(); mostrar(pestana) }

    override fun onDestroy() { tts?.shutdown(); super.onDestroy() }

    private val PESTANAS = listOf("🏠" to "Inicio", "🕯️" to "Shabbat", "🗓️" to "Agenda", "⚙️" to "Ajustes")

    private fun construirNav() {
        nav.removeAllViews()
        PESTANAS.forEachIndexed { i, (icono, nombre) ->
            val activa = i == pestana
            val item = texto("$icono\n$nombre", 12f, if (activa) Colores.ORO else Colores.SUAVE, activa).apply {
                gravity = Gravity.CENTER
                setPadding(0, dp(4), 0, dp(4))
                setOnClickListener { mostrar(i) }
            }
            nav.addView(item, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        }
    }

    /** Redibuja la pestaña indicada. */
    fun mostrar(i: Int) {
        pestana = i
        construirNav()
        contenido.removeAllViews()
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(28), dp(18), dp(28))
        }
        when (i) {
            0 -> pantallaInicio(col)
            1 -> pantallaShabbat(col)
            2 -> pantallaAgenda(col)
            else -> pantallaAjustes(col)
        }
        contenido.addView(ScrollView(this).apply { addView(col); isFillViewport = true })
    }

    fun escuchar() {
        val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-CO")
            .putExtra(RecognizerIntent.EXTRA_PROMPT, "¿Qué hago, Jhon?")
        try { voz.launch(i) } catch (e: Exception) { toast("Reconocimiento de voz no disponible") }
    }

    private fun procesar(frase: String) {
        resultado = "🗣️ $frase"
        procesando = true
        mostrar(0)
        Thread {
            val cmd = Acciones.interpretar(this, frase)
            val res = Acciones.ejecutar(this, cmd)
            runOnUiThread { terminar("🗣️ $frase\n\n$res", res) }
        }.start()
    }

    fun accion(accion: String) {
        procesando = true
        resultado = ""
        mostrar(pestana)
        Thread {
            val res = Acciones.ejecutar(this, JSONObject().put("accion", accion))
            runOnUiThread { terminar(res, res) }
        }.start()
    }

    private fun terminar(pantalla: String, hablado: String) {
        procesando = false
        resultado = pantalla
        mostrar(pestana)
        tts?.speak(hablado, TextToSpeech.QUEUE_FLUSH, null, "r")
    }

    fun toast(t: String) = Toast.makeText(this, t, Toast.LENGTH_SHORT).show()
}
