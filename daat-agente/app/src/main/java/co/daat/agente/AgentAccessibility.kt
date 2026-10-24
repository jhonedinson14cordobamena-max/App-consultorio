package co.daat.agente

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast

/** Bloquea apps en Shabbat y toca botones por texto. */
class AgentAccessibility : AccessibilityService() {

    companion object {
        var instancia: AgentAccessibility? = null
        private val IGNORAR = setOf("com.android.systemui", "android", "com.android.settings")
    }

    private var ultimoAviso = 0L

    override fun onServiceConnected() { instancia = this }
    override fun onDestroy() { instancia = null; super.onDestroy() }
    override fun onInterrupt() {}

    override fun onAccessibilityEvent(e: AccessibilityEvent) {
        if (e.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = e.packageName?.toString() ?: return
        if (pkg == packageName || pkg in IGNORAR) return
        if (!Shabbat.activo(this) || !bloqueada(pkg)) return

        performGlobalAction(GLOBAL_ACTION_HOME)
        val ahora = System.currentTimeMillis()
        if (ahora - ultimoAviso > 3000) {
            ultimoAviso = ahora
            Toast.makeText(this, "🕯️ Shabbat Shalom — app bloqueada hasta el fin de Shabbat", Toast.LENGTH_LONG).show()
            Bitacora.add(this, "Shabbat: bloqueé $pkg")
        }
    }

    private fun bloqueada(pkg: String) = Shabbat.bloqueada(this, pkg)

    /** Busca un botón con ese texto en pantalla y lo toca. */
    fun tocarTexto(texto: String): Boolean {
        val raiz = rootInActiveWindow ?: return false
        for (nodo in raiz.findAccessibilityNodeInfosByText(texto)) {
            var c: AccessibilityNodeInfo? = nodo
            while (c != null && !c.isClickable) c = c.parent
            if (c != null && c.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true
        }
        return false
    }

    fun abrir(intent: Intent) { startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
}
