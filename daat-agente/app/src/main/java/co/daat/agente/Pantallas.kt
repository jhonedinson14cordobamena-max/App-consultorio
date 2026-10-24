package co.daat.agente

import android.app.TimePickerDialog
import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.provider.Settings
import android.view.Gravity
import android.widget.ArrayAdapter
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Spinner
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalTime

private const val WRAP = LinearLayout.LayoutParams.WRAP_CONTENT
private const val MATCH = LinearLayout.LayoutParams.MATCH_PARENT
private val DIAS_CORTOS = arrayOf("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom")
private val DIAS_LARGOS = arrayOf("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")

private fun MainActivity.encabezado(col: LinearLayout, titulo: String, sub: String) {
    col.agregar(texto(titulo, 28f, bold = true), abajo = 2)
    col.agregar(texto(sub, 14f, Colores.SUAVE), abajo = 18)
}

private fun MainActivity.fila(izq: android.view.View, der: android.view.View): LinearLayout =
    LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        addView(izq, LinearLayout.LayoutParams(0, WRAP, 1f))
        addView(der)
    }

// ───────────────────────── INICIO ─────────────────────────

fun MainActivity.pantallaInicio(col: LinearLayout) {
    val h = LocalTime.now().hour
    val saludo = when { h < 12 -> "Buenos días"; h < 19 -> "Buenas tardes"; else -> "Buenas noches" }
    col.addView(texto("$saludo, Jhon", 15f, Colores.SUAVE))
    col.agregar(texto("Daat Agente", 30f, bold = true), abajo = 20)

    // Micrófono
    val mic = tarjeta().apply { gravity = Gravity.CENTER_HORIZONTAL }
    val circulo = texto("🎤", 44f).apply {
        gravity = Gravity.CENTER
        background = GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(Colores.ORO) }
        setOnClickListener { escuchar() }
    }
    mic.addView(circulo, LinearLayout.LayoutParams(dp(116), dp(116)).apply { topMargin = dp(8) })
    mic.addView(texto(if (procesando) "Procesando…" else "Toca y habla", 14f, Colores.SUAVE).apply {
        gravity = Gravity.CENTER
        setPadding(0, dp(12), 0, dp(4))
    })
    if (resultado.isNotEmpty()) {
        mic.addView(texto(resultado, 15f).apply {
            background = forma(Colores.TARJETA2, 14)
            setPadding(dp(14), dp(12), dp(14), dp(12))
        }, LinearLayout.LayoutParams(MATCH, WRAP).apply { topMargin = dp(12) })
    }
    col.agregar(mic)

    // Shabbat
    val activo = Shabbat.activo(this)
    val sh = tarjeta(if (activo) Colores.ORO_OSCURO else Colores.TARJETA)
    sh.addView(texto(if (activo) "🕯️  Shabbat activo" else "☀️  Días de trabajo", 18f, bold = true))
    sh.addView(texto(Shabbat.proximo(this), 14f, if (activo) Colores.ORO else Colores.SUAVE).apply {
        setPadding(0, dp(4), 0, dp(12))
    })
    sh.addView(botonSecundario(if (activo) "Desactivar Shabbat" else "Activar Shabbat ahora") {
        accion(if (activo) "shabbat_off" else "shabbat_on")
    })
    col.agregar(sh)

    // Permisos pendientes
    val faltan = mutableListOf<Pair<String, () -> Unit>>()
    if (!BloqueoService.tieneUso(this)) faltan += "Acceso a uso de apps" to { startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }
    if (!Settings.canDrawOverlays(this)) faltan += "Mostrar sobre otras apps" to {
        startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName")))
    }
    if (Config.load(this).optString("claude_api_key").isBlank()) faltan += "Clave de Claude" to { mostrar(3) }
    if (COMPLETA) {
        if (AgentAccessibility.instancia == null) faltan += "Accesibilidad" to { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        if (!NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName))
            faltan += "Leer notificaciones" to { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
    }
    if (faltan.isNotEmpty()) {
        val p = tarjeta(Colores.TARJETA)
        p.addView(texto("⚠️  Falta configurar", 16f, bold = true))
        for ((nombre, abrir) in faltan) p.agregar(fila(texto(nombre, 15f), enlace("Activar") { abrir() }), arriba = 6, abajo = 0)
        col.agregar(p)
    }

    // Acciones rápidas
    col.addView(seccion("Acciones rápidas"))
    fun mosaico(icono: String, t: String, f: () -> Unit) = tarjeta().apply {
        addView(texto(icono, 26f))
        addView(texto(t, 14f, bold = true).apply { setPadding(0, dp(6), 0, 0) })
        isClickable = true
        setOnClickListener { f() }
    }
    val rapidas = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
    rapidas.addView(mosaico("📊", "Revisar pauta") { accion("revisar_anuncios") },
        LinearLayout.LayoutParams(0, WRAP, 1f).apply { rightMargin = dp(6) })
    rapidas.addView(mosaico("📜", "Bitácora") { verBitacora() },
        LinearLayout.LayoutParams(0, WRAP, 1f).apply { leftMargin = dp(6) })
    col.agregar(rapidas)

    // WhatsApp
    val w = tarjeta()
    if (COMPLETA) {
        val pausado = Estado.prefs(this).getBoolean("whatsapp_pausado", false)
        w.addView(filaSwitch("💬  Responder WhatsApp Business", "Claude atiende a tus clientes", !pausado) { b ->
            Estado.prefs(this).edit().putBoolean("whatsapp_pausado", !b).apply()
        })
    } else {
        w.addView(texto("💬  WhatsApp Business", 16f, bold = true))
        w.addView(texto("En Shabbat usa el Mensaje de ausencia de WhatsApp Business. Los pasos están en la pestaña Shabbat.",
            14f, Colores.SUAVE).apply { setPadding(0, dp(4), 0, 0) })
    }
    col.agregar(w)
}

fun MainActivity.verBitacora() {
    val t = texto(Bitacora.leer(this), 13f).apply { setPadding(dp(20), dp(10), dp(20), dp(10)) }
    dialogo().setTitle("Bitácora")
        .setView(ScrollView(this).apply { addView(t) })
        .setPositiveButton("Cerrar", null).show()
}

// ───────────────────────── SHABBAT ─────────────────────────

fun MainActivity.pantallaShabbat(col: LinearLayout) {
    encabezado(col, "Modo Shabbat", "Bloquea dinero, pagos, apuestas y juegos")
    val cfg = Config.load(this)
    val sh = cfg.optJSONObject("shabbat") ?: JSONObject().also { cfg.put("shabbat", it) }
    val guardar = { Config.guardarJson(this, cfg) }

    col.agregar(tarjeta().apply {
        addView(filaSwitch("Horario automático", "Se activa y termina solo cada semana", sh.optBoolean("activo", true)) {
            sh.put("activo", it); guardar()
        })
    })

    val horario = tarjeta()
    horario.addView(texto("Horario", 16f, bold = true))
    for ((clave, etiqueta) in listOf("inicio" to "Comienza", "fin" to "Termina")) {
        val info = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(texto(etiqueta, 13f, Colores.SUAVE))
            addView(texto(Shabbat.describir(sh.optString(clave)), 17f, bold = true))
        }
        horario.agregar(fila(info, enlace("Cambiar") {
            cambiarHorario(sh, clave) { guardar(); mostrar(1) }
        }), arriba = 10, abajo = 0)
    }
    col.agregar(horario)

    col.agregar(tarjeta().apply {
        addView(filaSwitch("Bloquear juegos", "Todos los juegos instalados", sh.optBoolean("bloquear_juegos", true)) {
            sh.put("bloquear_juegos", it); guardar()
        })
    })

    val apps = sh.optJSONArray("apps_bloqueadas") ?: JSONArray()
    val instaladas = (0 until apps.length()).map { apps.getString(it) }
        .filter { packageManager.getLaunchIntentForPackage(it) != null }
    val bloq = tarjeta()
    bloq.addView(texto("Apps bloqueadas", 16f, bold = true))
    bloq.addView(texto(
        if (instaladas.isEmpty()) "Ninguna de tus apps de pago está en la lista"
        else instaladas.joinToString("  ·  ") { nombreApp(it) }, 14f, Colores.SUAVE
    ).apply { setPadding(0, dp(4), 0, 0) })
    bloq.addView(texto("También se bloquean apps con: banco, wallet, casino, apuestas.", 12f, Colores.SUAVE).apply {
        setPadding(0, dp(6), 0, 0)
    })
    bloq.agregar(boton("Elegir apps") { elegirApps(sh) { guardar(); mostrar(1) } }, arriba = 12, abajo = 0)
    col.agregar(bloq)

    val wa = tarjeta()
    wa.addView(texto("💬  WhatsApp Business en Shabbat", 16f, bold = true))
    if (COMPLETA) {
        val msg = campo(wa, "Mensaje automático (una vez por cliente)", sh.optString("respuesta_whatsapp"), lineas = 2)
        wa.agregar(boton("Guardar mensaje") {
            sh.put("respuesta_whatsapp", msg.text.toString()); guardar(); toast("Guardado ✅")
        }, arriba = 10, abajo = 0)
    } else {
        wa.addView(texto(
            "En WhatsApp Business → Herramientas para la empresa:\n\n" +
                "1. Horario comercial: domingo a jueves 24 h, viernes 00:00–18:15, sábado 19:00–23:59.\n\n" +
                "2. Mensaje de ausencia: actívalo con el texto \"Pronto un asesor te estará atendiendo.\" y prográmalo en \"Fuera del horario comercial\".",
            14f, Colores.SUAVE
        ).apply { setPadding(0, dp(8), 0, 0) })
    }
    col.agregar(wa)
}

private fun MainActivity.cambiarHorario(sh: JSONObject, clave: String, listo: () -> Unit) {
    val actual = try { Shabbat.parse(sh.optString(clave)) } catch (_: Exception) { 4 * 1440 + 18 * 60 }
    dialogo().setTitle("Día").setItems(DIAS_LARGOS) { _, dia ->
        TimePickerDialog(this, android.R.style.Theme_DeviceDefault_Dialog_Alert, { _, h, m ->
            sh.put(clave, "${Shabbat.DIAS[dia]} ${"%02d:%02d".format(h, m)}")
            listo()
        }, (actual % 1440) / 60, actual % 60, false).show()
    }.show()
}

private fun MainActivity.elegirApps(sh: JSONObject, listo: () -> Unit) {
    val lista = appsInstaladas()
    val arr = sh.optJSONArray("apps_bloqueadas") ?: JSONArray()
    val actuales = (0 until arr.length()).map { arr.getString(it) }
    val marcadas = BooleanArray(lista.size) { lista[it].second in actuales }
    dialogo().setTitle("Bloquear en Shabbat")
        .setMultiChoiceItems(lista.map { it.first }.toTypedArray(), marcadas) { _, i, b -> marcadas[i] = b }
        .setPositiveButton("Guardar") { _, _ ->
            val nuevas = actuales.filter { p -> lista.none { it.second == p } }.toMutableList()
            lista.forEachIndexed { i, app -> if (marcadas[i]) nuevas += app.second }
            sh.put("apps_bloqueadas", JSONArray(nuevas))
            listo()
        }
        .setNegativeButton("Cancelar", null).show()
}

// ───────────────────────── AGENDA ─────────────────────────

fun MainActivity.pantallaAgenda(col: LinearLayout) {
    encabezado(col, "Agenda", "Tareas automáticas y comandos de voz")
    val cfg = Config.load(this)
    val tareas = cfg.optJSONArray("tareas") ?: JSONArray().also { cfg.put("tareas", it) }
    val comandos = cfg.optJSONArray("comandos_voz") ?: JSONArray().also { cfg.put("comandos_voz", it) }

    col.addView(seccion("Tareas programadas"))
    if (tareas.length() == 0) col.agregar(texto("Sin tareas todavía.", 14f, Colores.SUAVE))
    for (i in 0 until tareas.length()) {
        val t = tareas.getJSONObject(i)
        val c = tarjeta()
        c.addView(filaSwitch(
            t.optString("nombre", "Tarea"),
            "${t.optString("hora")} · ${diasTexto(t.optJSONArray("dias"))}\n${Acciones.etiqueta(t.optString("accion"))}${detalle(t)}",
            t.optBoolean("activa", true)
        ) { t.put("activa", it); Config.guardarJson(this, cfg) })
        c.addView(enlace("Eliminar", Colores.ROJO) {
            confirmar("¿Eliminar esta tarea?") { tareas.remove(i); Config.guardarJson(this, cfg); mostrar(2) }
        }, LinearLayout.LayoutParams(WRAP, WRAP).apply { gravity = Gravity.END })
        col.agregar(c)
    }
    col.agregar(boton("+  Nueva tarea") { nuevaTarea(cfg, tareas) }, abajo = 24)

    col.addView(seccion("Comandos de voz"))
    for (i in 0 until comandos.length()) {
        val c = comandos.getJSONObject(i)
        val frases = c.optJSONArray("frases") ?: JSONArray()
        val t = tarjeta()
        t.addView(texto("“" + (0 until frases.length()).joinToString(" / ") { frases.getString(it) } + "”", 15f, bold = true))
        t.addView(texto(Acciones.etiqueta(c.optString("accion")) + detalle(c), 13f, Colores.SUAVE).apply { setPadding(0, dp(4), 0, 0) })
        t.addView(enlace("Eliminar", Colores.ROJO) {
            confirmar("¿Eliminar este comando?") { comandos.remove(i); Config.guardarJson(this, cfg); mostrar(2) }
        }, LinearLayout.LayoutParams(WRAP, WRAP).apply { gravity = Gravity.END })
        col.agregar(t)
    }
    col.agregar(boton("+  Nuevo comando de voz") { nuevoComando(cfg, comandos) })
    col.agregar(texto("Si dices algo que no está en la lista, Claude interpreta la orden.", 12f, Colores.SUAVE).apply {
        gravity = Gravity.CENTER
    }, arriba = 4)
}

private fun diasTexto(dias: JSONArray?): String {
    if (dias == null || dias.length() == 7) return "Todos los días"
    return (0 until dias.length()).mapNotNull { i ->
        Shabbat.DIAS.indexOf(dias.getString(i).uppercase()).takeIf { it >= 0 }?.let { DIAS_CORTOS[it] }
    }.joinToString(" ")
}

private fun MainActivity.detalle(o: JSONObject): String {
    val v = o.optString("valor")
    val t = o.optString("texto")
    val partes = mutableListOf<String>()
    if (v.isNotBlank()) partes += if (v.startsWith("http")) v else nombreApp(v)
    if (t.isNotBlank()) partes += "“$t”"
    return if (partes.isEmpty()) "" else " · " + partes.joinToString(" · ")
}

private fun MainActivity.confirmar(pregunta: String, si: () -> Unit) {
    dialogo().setTitle(pregunta).setPositiveButton("Sí") { _, _ -> si() }.setNegativeButton("No", null).show()
}

/** Selector reutilizable de acción + app + texto. */
private class SelectorAccion(val spinner: Spinner) {
    var paquete = ""
    lateinit var texto: EditText

    fun json(): JSONObject {
        val id = Acciones.OPCIONES[spinner.selectedItemPosition].first
        val o = JSONObject().put("accion", id)
        val t = texto.text.toString().trim()
        if (id == "abrir_url") o.put("valor", t)
        else {
            if (paquete.isNotBlank()) o.put("valor", paquete)
            if (t.isNotBlank()) o.put("texto", t)
        }
        return o
    }
}

private fun MainActivity.selectorAccion(form: LinearLayout): SelectorAccion {
    form.addView(texto("Acción", 13f, Colores.SUAVE).apply { setPadding(dp(2), dp(10), 0, dp(4)) })
    val sp = Spinner(this).apply {
        adapter = ArrayAdapter(this@selectorAccion, android.R.layout.simple_spinner_dropdown_item, Acciones.OPCIONES.map { it.second })
        background = forma(Colores.TARJETA2, 12)
        setPadding(dp(6), dp(6), dp(6), dp(6))
    }
    form.agregar(sp, abajo = 4)
    val sel = SelectorAccion(sp)
    val btnApp = botonSecundario("📱  Elegir app (si aplica)") {}
    btnApp.setOnClickListener {
        val apps = appsInstaladas()
        dialogo().setTitle("App").setItems(apps.map { it.first }.toTypedArray()) { _, i ->
            sel.paquete = apps[i].second
            btnApp.text = "📱  ${apps[i].first}"
        }.show()
    }
    form.agregar(btnApp, arriba = 8, abajo = 0)
    sel.texto = campo(form, "Texto: recordatorio, botón a tocar o enlace", "")
    return sel
}

private fun MainActivity.formulario(): LinearLayout = LinearLayout(this).apply {
    orientation = LinearLayout.VERTICAL
    setPadding(dp(20), dp(8), dp(20), dp(8))
}

private fun MainActivity.nuevaTarea(cfg: JSONObject, tareas: JSONArray) {
    val form = formulario()
    val nombre = campo(form, "Nombre", "")
    var hora = "08:00"
    val dias = BooleanArray(7) { it != 5 } // todos menos sábado
    fun textoDias() = DIAS_CORTOS.filterIndexed { i, _ -> dias[i] }.joinToString(" ").ifEmpty { "Ningún día" }

    val btnHora = botonSecundario("🕗  Hora: $hora") {}
    btnHora.setOnClickListener {
        TimePickerDialog(this, android.R.style.Theme_DeviceDefault_Dialog_Alert, { _, h, m ->
            hora = "%02d:%02d".format(h, m)
            btnHora.text = "🕗  Hora: $hora"
        }, 8, 0, false).show()
    }
    form.agregar(btnHora, arriba = 12, abajo = 8)

    val btnDias = botonSecundario("📅  ${textoDias()}") {}
    btnDias.setOnClickListener {
        dialogo().setTitle("Días")
            .setMultiChoiceItems(DIAS_LARGOS, dias) { _, i, b -> dias[i] = b }
            .setPositiveButton("Listo") { _, _ -> btnDias.text = "📅  ${textoDias()}" }
            .show()
    }
    form.agregar(btnDias, abajo = 0)
    val sel = selectorAccion(form)

    dialogo().setTitle("Nueva tarea")
        .setView(ScrollView(this).apply { addView(form) })
        .setPositiveButton("Guardar") { _, _ ->
            val o = sel.json()
                .put("nombre", nombre.text.toString().ifBlank { "Tarea" })
                .put("hora", hora)
                .put("dias", JSONArray(Shabbat.DIAS.filterIndexed { i, _ -> dias[i] }))
                .put("activa", true)
            tareas.put(o)
            Config.guardarJson(this, cfg)
            mostrar(2)
        }
        .setNegativeButton("Cancelar", null).show()
}

private fun MainActivity.nuevoComando(cfg: JSONObject, comandos: JSONArray) {
    val form = formulario()
    val frases = campo(form, "Frases que dirás (separadas por coma)", "")
    val sel = selectorAccion(form)
    dialogo().setTitle("Nuevo comando de voz")
        .setView(ScrollView(this).apply { addView(form) })
        .setPositiveButton("Guardar") { _, _ ->
            val lista = frases.text.toString().split(",").map { it.trim() }.filter { it.isNotEmpty() }
            if (lista.isEmpty()) { toast("Escribe al menos una frase"); return@setPositiveButton }
            comandos.put(sel.json().put("frases", JSONArray(lista)))
            Config.guardarJson(this, cfg)
            mostrar(2)
        }
        .setNegativeButton("Cancelar", null).show()
}

// ───────────────────────── AJUSTES ─────────────────────────

fun MainActivity.pantallaAjustes(col: LinearLayout) {
    encabezado(col, "Ajustes", "Conexiones e inteligencia del agente")
    val cfg = Config.load(this)

    col.addView(seccion("Inteligencia · Claude"))
    val c1 = tarjeta()
    val clave = campo(c1, "Clave API (console.anthropic.com)", cfg.optString("claude_api_key"), oculto = true)
    val modelo = campo(c1, "Modelo", cfg.optString("modelo", "claude-sonnet-5-5"))
    col.agregar(c1)

    col.addView(seccion("Pauta · Meta Ads"))
    val an = cfg.optJSONObject("anuncios") ?: JSONObject().also { cfg.put("anuncios", it) }
    val c2 = tarjeta()
    val token = campo(c2, "Token de acceso (ads_read)", an.optString("meta_token"), oculto = true)
    val cuenta = campo(c2, "Cuenta publicitaria (act_XXXX)", an.optString("cuenta"))
    col.agregar(c2)

    var instrucciones: EditText? = null
    var ignorar: EditText? = null
    val wa = cfg.optJSONObject("whatsapp") ?: JSONObject().also { cfg.put("whatsapp", it) }
    if (COMPLETA) {
        col.addView(seccion("WhatsApp Business"))
        val c3 = tarjeta()
        instrucciones = campo(c3, "Cómo debe responder a los clientes", wa.optString("instrucciones"), lineas = 5)
        val ig = wa.optJSONArray("ignorar_contactos") ?: JSONArray()
        ignorar = campo(c3, "No responder a (nombres, separados por coma)",
            (0 until ig.length()).joinToString(", ") { ig.getString(it) })
        col.agregar(c3)
    }

    col.agregar(boton("💾  Guardar ajustes") {
        cfg.put("claude_api_key", clave.text.toString().trim())
        cfg.put("modelo", modelo.text.toString().trim().ifEmpty { "claude-sonnet-5-5" })
        an.put("meta_token", token.text.toString().trim())
        an.put("cuenta", cuenta.text.toString().trim())
        instrucciones?.let { wa.put("instrucciones", it.text.toString()) }
        ignorar?.let { e ->
            wa.put("ignorar_contactos", JSONArray(e.text.toString().split(",").map { it.trim() }.filter { it.isNotEmpty() }))
        }
        Config.guardarJson(this, cfg)
        toast("Guardado ✅")
        mostrar(3)
    }, arriba = 4, abajo = 22)

    col.addView(seccion("Avanzado"))
    val c4 = tarjeta()
    c4.agregar(botonSecundario("{ }  Editar configuración completa") { editorJson() }, abajo = 8)
    c4.agregar(botonSecundario("📜  Ver bitácora") { verBitacora() }, abajo = 8)
    c4.agregar(botonSecundario("↩️  Restaurar valores iniciales") {
        confirmar("¿Restaurar? Se borran tareas, comandos y claves.") { Config.restaurar(this); mostrar(3) }
    }, abajo = 0)
    col.agregar(c4)

    col.agregar(texto("Daat Agente ${BuildConfig.VERSION_NAME}", 12f, Colores.SUAVE).apply {
        gravity = Gravity.CENTER
    }, arriba = 8)
}

private fun MainActivity.editorJson() {
    val e = EditText(this).apply {
        setText(Config.texto(this@editorJson))
        typeface = Typeface.MONOSPACE
        textSize = 11f
        setTextColor(Colores.TEXTO)
        setPadding(dp(16), dp(12), dp(16), dp(12))
    }
    dialogo().setTitle("Configuración (JSON)")
        .setView(ScrollView(this).apply { addView(e) })
        .setPositiveButton("Guardar") { _, _ ->
            val err = Config.guardar(this, e.text.toString())
            toast(err?.let { "Error: $it" } ?: "Guardado ✅")
            mostrar(pestana)
        }
        .setNegativeButton("Cancelar", null).show()
}
