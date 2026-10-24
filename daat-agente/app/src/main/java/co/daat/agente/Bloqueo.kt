package co.daat.agente

import android.app.Activity
import android.app.AppOpsManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.Process
import android.view.Gravity
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat

/**
 * Bloqueo de Shabbat sin Accesibilidad: mira qué app está al frente
 * (permiso "Acceso a uso de apps") y tapa las bloqueadas con una pantalla propia.
 */
class BloqueoService : Service() {

    companion object {
        private const val CANAL = "agente_fondo"

        fun iniciar(ctx: Context) {
            try {
                ContextCompat.startForegroundService(ctx, Intent(ctx, BloqueoService::class.java))
            } catch (e: Exception) {
                Bitacora.add(ctx, "No pude iniciar el bloqueo: ${e.message}")
            }
        }

        fun tieneUso(ctx: Context): Boolean {
            val ops = ctx.getSystemService(AppOpsManager::class.java)
            @Suppress("DEPRECATION")
            val modo = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
            return modo == AppOpsManager.MODE_ALLOWED
        }
    }

    private val handler = Handler(Looper.getMainLooper())
    private var desde = 0L
    private var actual: String? = null
    private var ultimoBloqueo = 0L

    private val ciclo = object : Runnable {
        override fun run() {
            val activo = try { Shabbat.activo(this@BloqueoService) } catch (_: Exception) { false }
            if (activo) try { revisar() } catch (_: Exception) {}
            else desde = 0L
            handler.postDelayed(this, if (activo) 1000L else 30_000L)
        }
    }

    override fun onCreate() {
        super.onCreate()
        if (Build.VERSION.SDK_INT >= 26) {
            getSystemService(NotificationManager::class.java).createNotificationChannel(
                NotificationChannel(CANAL, "Agente en segundo plano", NotificationManager.IMPORTANCE_MIN)
            )
        }
        val n = Notification.Builder(this, CANAL)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentTitle("Daat Agente activo")
            .setContentText("Vigilando el modo Shabbat")
            .build()
        if (Build.VERSION.SDK_INT >= 34) startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(7, n)
        handler.post(ciclo)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int) = START_STICKY

    override fun onDestroy() { handler.removeCallbacks(ciclo); super.onDestroy() }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun revisar() {
        if (!tieneUso(this)) return
        val ahora = System.currentTimeMillis()
        val usm = getSystemService(UsageStatsManager::class.java)
        val eventos = usm.queryEvents(if (desde == 0L) ahora - 10_000 else desde, ahora)
        desde = ahora
        val e = UsageEvents.Event()
        while (eventos.hasNextEvent()) {
            eventos.getNextEvent(e)
            @Suppress("DEPRECATION")
            if (e.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) actual = e.packageName
        }
        val pkg = actual ?: return
        if (pkg == packageName) return
        if (Shabbat.bloqueada(this, pkg) && ahora - ultimoBloqueo > 1500) {
            ultimoBloqueo = ahora
            actual = packageName
            startActivity(Intent(this, BloqueoActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            Bitacora.add(this, "Shabbat: bloqueé $pkg")
        }
    }
}

/** Pantalla de "Shabbat Shalom" que tapa la app bloqueada. */
class BloqueoActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(60, 60, 60, 60)
            setBackgroundColor(Colores.FONDO)
        }
        col.addView(TextView(this).apply {
            text = "🕯️\nShabbat Shalom"
            textSize = 30f
            setTextColor(Colores.ORO)
            gravity = Gravity.CENTER
            setTypeface(null, Typeface.BOLD)
        })
        col.addView(TextView(this).apply {
            text = "\nEsta app está en pausa hasta que termine Shabbat."
            textSize = 17f
            setTextColor(Colores.TEXTO)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 60)
        })
        col.addView(boton("Ir al inicio") { irInicio() })
        setContentView(col)
    }

    private fun irInicio() {
        startActivity(Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        finish()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() { irInicio() }
}

/** Arranca el bloqueo al encender el teléfono. */
class InicioReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            BloqueoService.iniciar(ctx)
            TaskWorker.programar(ctx)
        }
    }
}
