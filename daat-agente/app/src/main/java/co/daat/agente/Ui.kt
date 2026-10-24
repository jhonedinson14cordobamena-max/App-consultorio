package co.daat.agente

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Switch
import android.widget.TextView

/** Paleta y componentes visuales de Daat Agente. */
object Colores {
    val FONDO = 0xFF0B1220.toInt()
    val TARJETA = 0xFF151F33.toInt()
    val TARJETA2 = 0xFF1E2A44.toInt()
    val ORO = 0xFFF5B301.toInt()
    val ORO_OSCURO = 0xFF3A2E0A.toInt()
    val TEXTO = 0xFFF1F5F9.toInt()
    val SUAVE = 0xFF94A3B8.toInt()
    val VERDE = 0xFF22C55E.toInt()
    val ROJO = 0xFFEF4444.toInt()
    val AZUL = 0xFF3B82F6.toInt()
}

private val NEGRITA: Typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)

fun Context.dp(v: Int): Int = (v * resources.displayMetrics.density).toInt()

fun Context.forma(color: Int, radioDp: Int, borde: Int? = null) = GradientDrawable().apply {
    setColor(color)
    cornerRadius = dp(radioDp).toFloat()
    if (borde != null) setStroke(dp(1), borde)
}

fun Context.texto(t: CharSequence, size: Float = 15f, color: Int = Colores.TEXTO, bold: Boolean = false) =
    TextView(this).apply {
        text = t
        textSize = size
        setTextColor(color)
        if (bold) typeface = NEGRITA
        setLineSpacing(0f, 1.15f)
    }

fun Context.tarjeta(color: Int = Colores.TARJETA) = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL
    background = forma(color, 20)
    setPadding(dp(18), dp(16), dp(18), dp(16))
}

fun LinearLayout.agregar(v: View, arriba: Int = 0, abajo: Int = 12): View {
    val lp = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT)
    lp.topMargin = context.dp(arriba)
    lp.bottomMargin = context.dp(abajo)
    addView(v, lp)
    return v
}

fun Context.boton(t: String, fondo: Int = Colores.ORO, colorTexto: Int = Colores.FONDO, accion: () -> Unit) =
    TextView(this).apply {
        text = t
        textSize = 15f
        setTextColor(colorTexto)
        typeface = NEGRITA
        gravity = Gravity.CENTER
        setPadding(dp(16), dp(13), dp(16), dp(13))
        background = RippleDrawable(ColorStateList.valueOf(0x33FFFFFF), forma(fondo, 14), null)
        isClickable = true
        setOnClickListener { accion() }
    }

fun Context.botonSecundario(t: String, accion: () -> Unit) =
    boton(t, Colores.TARJETA2, Colores.TEXTO, accion)

fun Context.enlace(t: String, color: Int = Colores.ORO, accion: () -> Unit) = texto(t, 14f, color, true).apply {
    setPadding(dp(8), dp(6), dp(8), dp(6))
    setOnClickListener { accion() }
}

fun Context.seccion(t: String) = texto(t.uppercase(), 12f, Colores.SUAVE, true).apply {
    letterSpacing = 0.08f
    setPadding(dp(4), dp(10), 0, dp(6))
}

fun Context.chip(t: String, color: Int = Colores.TARJETA2) = texto(t, 13f).apply {
    background = forma(color, 50)
    setPadding(dp(12), dp(6), dp(12), dp(6))
}

fun Context.filaSwitch(titulo: String, sub: String?, valor: Boolean, cambio: (Boolean) -> Unit): LinearLayout {
    val fila = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
    val textos = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
    textos.addView(texto(titulo, 16f, bold = true))
    if (sub != null) textos.addView(texto(sub, 13f, Colores.SUAVE))
    fila.addView(textos, LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f))
    val estados = arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf())
    fila.addView(Switch(this).apply {
        isChecked = valor
        thumbTintList = ColorStateList(estados, intArrayOf(Colores.ORO, Colores.SUAVE))
        trackTintList = ColorStateList(estados, intArrayOf(0x88F5B301.toInt(), 0x5594A3B8))
        setOnCheckedChangeListener { _, b -> cambio(b) }
    })
    return fila
}

/** Etiqueta + caja de texto. */
fun Context.campo(col: LinearLayout, etiqueta: String, valor: String, oculto: Boolean = false, lineas: Int = 1): EditText {
    col.addView(texto(etiqueta, 13f, Colores.SUAVE).apply { setPadding(dp(2), dp(8), 0, dp(4)) })
    val e = EditText(this).apply {
        setText(valor)
        textSize = 15f
        setTextColor(Colores.TEXTO)
        setHintTextColor(Colores.SUAVE)
        background = forma(Colores.TARJETA2, 12)
        setPadding(dp(14), dp(12), dp(14), dp(12))
        inputType = when {
            oculto -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            lineas > 1 -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            else -> InputType.TYPE_CLASS_TEXT
        }
        if (lineas > 1) { minLines = lineas; gravity = Gravity.TOP or Gravity.START }
    }
    col.agregar(e, abajo = 4)
    return e
}

fun Context.dialogo(): AlertDialog.Builder = AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)

/** Apps con ícono en el menú: (nombre, paquete), ordenadas. */
fun Context.appsInstaladas(): List<Pair<String, String>> {
    val pm = packageManager
    val i = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
    return pm.queryIntentActivities(i, 0)
        .map { it.loadLabel(pm).toString() to it.activityInfo.packageName }
        .filter { it.second != packageName }
        .distinctBy { it.second }
        .sortedBy { it.first.lowercase() }
}

fun Context.nombreApp(pkg: String): String = try {
    packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString()
} catch (_: Exception) { pkg }
