package co.daat.agente

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.service.quicksettings.TileService
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

/** Revisa cada 15 min las tareas programadas del config. */
class TaskWorker(ctx: Context, p: WorkerParameters) : Worker(ctx, p) {
    override fun doWork(): Result {
        try { revisar(applicationContext) } catch (e: Exception) { Bitacora.add(applicationContext, "Error tareas: ${e.message}") }
        return Result.success()
    }

    companion object {
        fun programar(ctx: Context) {
            WorkManager.getInstance(ctx).enqueueUniquePeriodicWork(
                "agente", ExistingPeriodicWorkPolicy.KEEP,
                PeriodicWorkRequestBuilder<TaskWorker>(15, TimeUnit.MINUTES).build()
            )
        }

        fun revisar(ctx: Context) {
            if (Shabbat.activo(ctx)) return // nada se ejecuta en Shabbat
            val tareas = Config.load(ctx).optJSONArray("tareas") ?: return
            val ahora = LocalDateTime.now()
            val dia = Shabbat.DIAS[ahora.dayOfWeek.value - 1]
            val hoy = LocalDate.now().toString()
            val minutos = ahora.hour * 60 + ahora.minute
            val p = Estado.prefs(ctx)

            for (i in 0 until tareas.length()) {
                val t = tareas.getJSONObject(i)
                if (!t.optBoolean("activa", true)) continue
                val dias = t.optJSONArray("dias")
                if (dias != null && (0 until dias.length()).none { dias.getString(it).equals(dia, true) }) continue
                val (h, m) = t.optString("hora", "00:00").split(":").map { it.trim().toInt() }
                val objetivo = h * 60 + m
                if (minutos < objetivo || minutos > objetivo + 30) continue
                val clave = "hecho_" + t.optString("nombre", "$i")
                if (p.getString(clave, "") == hoy) continue
                p.edit().putString(clave, hoy).apply()
                Bitacora.add(ctx, "Tarea \"${t.optString("nombre")}\" → ${Acciones.ejecutar(ctx, t)}")
            }
        }
    }
}

object Notif {
    private const val CANAL = "agente"

    fun canal(ctx: Context) {
        if (Build.VERSION.SDK_INT >= 26) {
            ctx.getSystemService(NotificationManager::class.java).createNotificationChannel(
                NotificationChannel(CANAL, "Daat Agente", NotificationManager.IMPORTANCE_DEFAULT)
            )
        }
    }

    fun mostrar(ctx: Context, titulo: String, texto: String) {
        canal(ctx)
        val n = NotificationCompat.Builder(ctx, CANAL)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(titulo)
            .setContentText(texto)
            .setStyle(NotificationCompat.BigTextStyle().bigText(texto))
            .setAutoCancel(true)
            .build()
        try { NotificationManagerCompat.from(ctx).notify(System.currentTimeMillis().toInt(), n) } catch (_: SecurityException) {}
    }
}

/** Botón "Daat Voz" en el panel de ajustes rápidos. */
class VoiceTile : TileService() {
    override fun onClick() {
        val i = Intent(this, MainActivity::class.java)
            .putExtra("escuchar", true)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        if (Build.VERSION.SDK_INT >= 34) {
            startActivityAndCollapse(PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT))
        } else {
            @Suppress("DEPRECATION")
            startActivityAndCollapse(i)
        }
    }
}
