package co.daat.agente

import android.content.Context
import java.time.LocalDateTime

object Shabbat {
    val DIAS = listOf("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN")
    private const val SEMANA = 7 * 1440

    private fun minutoSemana(dt: LocalDateTime) =
        (dt.dayOfWeek.value - 1) * 1440 + dt.hour * 60 + dt.minute

    /** "FRI 18:15" -> minuto de la semana */
    private fun parse(s: String): Int {
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
}
