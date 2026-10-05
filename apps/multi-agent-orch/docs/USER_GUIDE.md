# 📖 Guía de Usuario

## ¿Qué es Multi-Agent Orchestrator?

Una PWA que orquesta 4 agentes de IA (Research, Drafting, Supervisor, Executor) en un workflow configurable con checkpoints, supervisión humana y modo offline.

## 🚀 Primeros pasos

### 1. Abrir la app

- **Navegador**: visita la URL del deploy (ej. `https://orchestrator.tudominio.com`)
- **Instalar como app**: en Chrome/Edge/Safari, click en el icono de instalación en la barra de direcciones
- **Móvil**: en Safari iOS o Chrome Android, "Añadir a pantalla de inicio"

### 2. Lanzar tu primer workflow

1. Escribe una consulta en el campo de texto (ej. *"Investiga sobre computación cuántica y dame un resumen ejecutivo"*)
2. Pulsa **Enter** o el botón ▶️
3. Observa cómo el dashboard se actualiza en tiempo real con el progreso de cada agente

### 3. Supervisar el progreso

El panel central muestra:
- **🔍 Research** → recopila información
- **✍️ Drafting** → genera la propuesta
- **🎯 Supervisor** → evalúa calidad (puede pausar para HITL)
- **⚡ Executor** → ejecuta el resultado final

## ✋ Human-in-the-Loop (HITL)

Si la calidad cae por debajo del umbral (configurable), el **Supervisor** pausa el workflow y te pide aprobación:

1. Aparece un modal con la propuesta actual
2. Tres opciones:
   - **✓ Aprobar**: continúa al Executor
   - **✕ Rechazar**: cancela el workflow
   - **✏️ Modificar**: edita el texto y aprueba tu versión

## ⏱️ Time Travel

¿El workflow fue por mal camino? Viaja a un checkpoint previo:

1. Click en cualquier punto del **Timeline de Checkpoints** (panel inferior derecho)
2. Confirma la acción
3. El estado se restaura a ese punto — puedes continuar desde ahí

## ⌨️ Atajos de teclado

| Shortcut | Acción |
|----------|--------|
| `Ctrl/Cmd + Enter` | Lanzar query (desde cualquier lugar) |
| `Ctrl/Cmd + .` | Pausar / reanudar workflow |
| `Ctrl/Cmd + Shift + R` | Reset (con confirmación) |
| `Esc` | Cerrar modal abierto |

## 🌙 Tema oscuro/claro

Click en el icono ☀️/🌙 en la cabecera para alternar. Tu preferencia se guarda en `localStorage`.

## 📴 Modo offline

Una vez cargada la app, funciona sin conexión:
- ✅ Crear workflows
- ✅ Navegar por el historial
- ✅ Revisar logs y checkpoints
- ❌ Sincronización con backend (cuando exista)

## 🔧 Troubleshooting

### La app no instala como PWA

- **Chrome/Edge**: requiere HTTPS en producción
- **Safari iOS**: "Compartir → Añadir a pantalla de inicio"
- **Firefox**: no soporta install prompt todavía

### El workflow se queda en "paused"

Probablemente el modal HITL está esperando tu decisión. Búscalo en pantalla o pulsa `Esc` para descartar.

### Perdí un workflow tras recargar

Los workflows se persisten en IndexedDB. Si la DB fue borrada (modo incógnito, "Clear site data"), se perderán. Para producción con backend, los workflows se sincronizarán al servidor.

### Error "Service Worker failed to register"

- En desarrollo: sirve la app vía `http://localhost` o `https://`
- En producción: verifica que `sw.js` se sirve con header `Service-Worker-Allowed: /`

## ❓ FAQ

**¿Los datos se envían a algún servidor?**
No, en esta versión todo es local. La integración con backend es roadmap.

**¿Puedo añadir mis propios agentes?**
Sí, edita `js/agents.js` y añade tu agente con la misma interfaz (id, name, icon, capabilities, execute()).

**¿Cómo cambio el umbral de calidad?**
En `js/orchestrator.js`, busca `qualityThreshold`. Default: 0.7.

**¿Funciona en navegadores antiguos?**
Requiere ES2023, Service Workers, IndexedDB. Compatible con navegadores de los últimos 2 años.
