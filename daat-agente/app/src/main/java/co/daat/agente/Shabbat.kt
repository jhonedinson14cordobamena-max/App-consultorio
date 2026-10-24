package co.daat.agente

import android.content.Context
import android.content.pm.ApplicationInfo
import java.time.LocalDateTime

object Shabbat {
    val DIAS = listOf("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN")
    private const val SEMANA = 7 * 1440

    private fun minutoSemana(dt: LocalDateTime) =
        (dt.dayOfWeek.value - 1) * 1440 + dt.hour * 60 + dt.minute

    /** "FRI 18:15" -> minuto de la semana */
    fun parse(s: String): Int {
        val (d, t) = s.trim().split(Regex("\\s+"))
        val (h, m) = t.split(":").map { it.trim().toInt() }
        return DIAS.indexOf(d.uppercase()) * 1440 + h * 60 + m
    }

    fun enVentana(ctx: Context, ahora: LocalDateTime = LocalDateTime.now()): Boolean {
        val c = Config.load(ctx).optJSONObject("shabbat") ?: return false
        if (!c.optBoolean("activo", true)) return false
        val ini = parse(c.optString("inicio", "FRI 18:15"))
        val fin = parse(c.optString("fin", "SAT 18:59"))
        val n = minutoSemana(ahora)
        return if (ini <= fin) n in ini until fin else (n >= ini || n < fin)
    }

    private fun minutosHastaFin(ctx: Context): Int {
        val c = Config.load(ctx).optJSONObject("shabbat") ?: return 0
        val fin = parse(c.optString("fin", "SAT 18:59"))
        return ((fin - minutoSemana(LocalDateTime.now())) % SEMANA + SEMANA) % SEMANA
    }

    fun activo(ctx: Context): Boolean {
        val p = Estado.prefs(ctx)
        val ahora = System.currentTimeMillis()
        if (ahora < p.getLong("forzado_off", 0)) return false
        if (ahora < p.getLong("forzado_on", 0)) return true
        return enVentana(ctx)
    }

    /** Activación manual: dura hasta el fin configurado (o 25 h). */
    fun forzarOn(ctx: Context) {
        val min = minutosHastaFin(ctx).takeIf { it in 1..1500 } ?: 1500
        Estado.prefs(ctx).edit()
            .putLong("forzado_on", System.currentTimeMillis() + min * 60_000L)
            .putLong("forzado_off", 0).apply()
        Bitacora.add(ctx, "Shabbat activado manualmente")
    }

    /** Desactivación manual: solo hasta que termine la ventana actual. */
    fun forzarOff(ctx: Context) {
        val hasta = if (enVentana(ctx)) System.currentTimeMillis() + minutosHastaFin(ctx) * 60_000L else 0L
        Estado.prefs(ctx).edit().putLong("forzado_off", hasta).putLong("forzado_on", 0).apply()
        Bitacora.add(ctx, "Shabbat desactivado manualmente")
    }

    /** ¿Esta app se bloquea en Shabbat? (bancos, billeteras, apuestas, juegos) */
    fun bloqueada(ctx: Context, pkg: String): Boolean {
        val c = Config.load(ctx).optJSONObject("shabbat") ?: return false
        val apps = c.optJSONArray("apps_bloqueadas")
        if (apps != null && (0 until apps.length()).any { apps.getString(it) == pkg }) return true
        val palabras = c.optJSONArray("palabras_bloqueo")
        if (palabras != null && (0 until palabras.length()).any { pkg.contains(palabras.getString(it), true) }) return true
        if (c.optBoolean("bloquear_juegos", true)) {
            try {
                val info = ctx.packageManager.getApplicationInfo(pkg, 0)
                if (info.category == ApplicationInfo.CATEGORY_GAME || info.flags and ApplicationInfo.FLAG_IS_GAME != 0) return true
            } catch (_: Exception) {}
        }
        return false
    }

    private val NOMBRES = listOf("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")

    /** "FRI 18:15" -> "Viernes 6:15 pm" */
    fun describir(s: String): String = try {
        val m = parse(s)
        val dia = NOMBRES[m / 1440]
        val h = (m % 1440) / 60
        val min = m % 60
        val h12 = if (h % 12 == 0) 12 else h % 12
        "$dia $h12:${"%02d".format(min)} ${if (h < 12) "am" else "pm"}"
    } catch (_: Exception) { s }

    private fun duracion(min: Int): String {
        val d = min / 1440
        val h = (min % 1440) / 60
        val m = min % 60
        return when {
            d > 0 -> "$d d $h h"
            h > 0 -> "$h h $m min"
            else -> "$m min"
        }
    }

    /** Texto para la pantalla: cuánto falta para empezar o terminar. */
    fun proximo(ctx: Context): String {
        val c = Config.load(ctx).optJSONObject("shabbat") ?: return ""
        val p = Estado.prefs(ctx)
        val ahora = System.currentTimeMillis()
        if (ahora < p.getLong("forzado_on", 0)) return "Activado manualmente"
        if (ahora < p.getLong("forzado_off", 0)) return "Desactivado manualmente hasta el fin"
        if (!c.optBoolean("activo", true)) return "Horario automático apagado"
        return try {
            val n = minutoSemana(LocalDateTime.now())
            val objetivo = parse(c.optString(if (enVentana(ctx)) "fin" else "inicio"))
            val falta = ((objetivo - n) % SEMANA + SEMANA) % SEMANA
            (if (enVentana(ctx)) "Termina en " else "Comienza en ") + duracion(falta)
        } catch (_: Exception) { "" }
    }
}
