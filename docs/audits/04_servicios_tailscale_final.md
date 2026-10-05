# 🛡️ SERVICIOS EN PRODUCCIÓN — TAILSCALE
**IP Tailscale:** `100.100.2.10`  
**Actualizado:** 2026-09-25 · Verificación real de puertos activos

---

## ✅ SERVICIOS ACTIVOS Y VERIFICADOS

| Servicio | Puerto | URL Tailscale | Stack | Estado | PM2 ID |
|---|---|---|---|---|---|
| **DEMENTOR** (Dashboard) | 9999 | http://100.100.2.10:9999 | Python HTTP | ✅ Online | 43 |
| **PROMPT-GENERATOR** | 9123 | http://100.100.2.10:9123 | Fastify + Next.js | ✅ Online | 39 |
| **PERFUME-EAN** | 4000 | http://100.100.2.10:4000 | Node.js | ✅ Online | 44 |
| **TAROT-MAYA** | 5177 | http://100.100.2.10:5177 | Python HTTP (SPA) | ✅ Online | 46 |
| **UIEP** | 5180 | http://100.100.2.10:5180 | Next.js 15 | ✅ Online | 42 |
| **MULTI-AGENT-ORCH** | 5557 | http://100.100.2.10:5557 | Python HTTP (PWA) | ✅ Online | 45 |
| **OMNIDEV-OS** | 8765 | http://100.100.2.10:8765 | Node.js | ✅ Online | 28 |
| **INTERCOMPILER** | 3000 | http://100.100.2.10:3000 | Next.js | ✅ Online | 19 |
| **PROMPT-GEN Backend** | 8787 | — | Fastify | ✅ Online | — |

---

## 📋 DETALLE DE CADA SERVICIO

### 🎭 DEMENTOR — Dashboard Mission Control
- **Puerto:** 9999
- **URL:** http://100.100.2.10:9999
- **Ruta:** `/Users/manu/Desktop/DEMENTOR/`
- **Descripción:** Landing page de control central. Canvas animado, efectos de partículas, Web Audio API, acceso directo a todos los proyectos.
- **Estado:** ✅ Producción real

---

### 🧠 PROMPT-GENERATOR
- **Puerto:** 9123 (frontend) + 8787 (backend Fastify)
- **URL:** http://100.100.2.10:9123
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/PROMPT-GENERATOR/`
- **Fixes:** Shell.tsx responsive (mobile drawer + bottom nav), Studio.tsx flex-col en móvil
- **Estado:** ✅ Producción + Mobile Responsive

---

### 💄 PERFUME-EAN
- **Puerto:** 4000
- **URL:** http://100.100.2.10:4000
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/ARANTXA/`
- **Fix:** ecosystem.config.js renombrado a `PERFUME-EAN`
- **Estado:** ✅ Online

---

### 🔮 TAROT-MAYA
- **Puerto:** 5177
- **URL:** http://100.100.2.10:5177
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/TAROT/maya-tarot/index.html`
- **Descripción:** Calendario sagrado Tzolk'in. Motor GMT 584283, 20 nahuales yucatecos, 13 tonos, 4 rumbos. Tiradas: Kin del día, Cruz Maya (5), Rueda del Año (13), Libre (3/5/7/9), Natal. Partículas, flip cards, historial localStorage, export MD/PDF.
- **Fixes:**
  - `nahuales.json` inválido eliminado (contenía TypeScript)
  - Migrado React+Vite → HTML SPA autocontenida
  - PM2: `python3 -m http.server 5177` (antes `npm run dev`)
- **Referencia:** https://lobehub.com/share/artifact/QYm4VgF5
- **Estado:** ✅ Producción real, diseño neón completo

---

### 🤖 MULTI-AGENT-ORCH
- **Puerto:** 5557 (antes 8000)
- **URL:** http://100.100.2.10:5557
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/multi-agent-orchestrator/`
- **Descripción:** PWA 4 agentes (Research, Supervisor, Drafting, Executor) + DAG engine + HITL + Time Travel + IndexedDB + Service Worker offline.
- **Agentes:** Integración Ollama local (`localhost:11434`) con fallback
- **Fixes:**
  - Puerto 8000 → 5557
  - `agents.js` reescrito con llamadas reales a Ollama
  - `package.json` scripts actualizados
- **Estado:** ✅ Online (PWA funcional, Ollama-ready)

---

### 🧩 UIEP — Universal Intelligence Engineering Platform
- **Puerto:** 5180
- **URL:** http://100.100.2.10:5180
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/UIEP/packages/ui/`
- **Descripción:** Constructor visual de entidades IA, diagrama de flujo (@xyflow/react), panel de resultados y exportación.
- **Fixes:**
  - `next.config.js`: añadido `allowedDevOrigins` para IP Tailscale (corrige pantalla blanca)
  - Script PM2: `--host` → `-H` (flag correcto Next.js 15)
- **Estado:** ✅ Online

---

### 💻 OMNIDEV-OS
- **Puerto:** 8765
- **URL:** http://100.100.2.10:8765
- **Ruta:** `/Users/manu/Desktop/PROYECTOS/OmniDev OS/`
- **Estado:** ✅ Online

---

### 🔧 INTERCOMPILER
- **Puerto:** 3000
- **URL:** http://100.100.2.10:3000
- **Ruta:** `/Users/manu/Desktop/INTERCOMPILER/`
- **Estado:** ✅ Online

---

## 💤 SERVICIOS OFFLINE / SIN RED

| Servicio | Motivo |
|---|---|
| **AGENT-PREMIUM** | HTML estático sin backend |
| **AGENT-BUILDER** | HTML estático sin backend |
| **TERINGO** | Herramienta offline/Windows (Tkinter + InnoSetup) |
| **TU-ENERGIA-MAYA** | Frontend sin backend propio |
| **CUADRANTE-HORARIOS** | Sin config de red |
| **BECA_LAUD / BAND / CRM** | Proyectos cliente específicos |

---

## 🗺️ MAPA DE PUERTOS

```
Puerto  Servicio                Stack
──────  ──────────────────────  ───────────────────
3000    INTERCOMPILER           Next.js
4000    PERFUME-EAN             Node.js
5177    TAROT-MAYA              Python HTTP (SPA)
5180    UIEP                    Next.js 15
5557    MULTI-AGENT-ORCH        Python HTTP (PWA)
8765    OMNIDEV-OS              Node.js/Python
8787    PROMPT-GEN Backend      Fastify
9123    PROMPT-GENERATOR        Next.js frontend
9999    DEMENTOR (Dashboard)    Python HTTP
```

---

## 🔄 HISTORIAL DE CAMBIOS

| Fecha | Acción |
|---|---|
| 2026-09-25 | ARANTXA → renombrado a PERFUME-EAN |
| 2026-09-25 | MULTI-AGENT-ORCH: puerto 8000 → 5557 |
| 2026-09-25 | PROMPT-GENERATOR: Mobile responsive (Shell.tsx + Studio.tsx) |
| 2026-09-25 | TAROT-MAYA: Migrado React+Vite → HTML SPA neón |
| 2026-09-25 | TAROT-MAYA: nahuales.json eliminado, Python HTTP server |
| 2026-09-25 | UIEP: allowedDevOrigins añadido, pantalla blanca corregida |
| 2026-09-25 | DEMENTOR: Dashboard creado y desplegado en PM2 |
| 2026-09-25 | MULTI-AGENT-ORCH: agents.js reescrito con Ollama real |

---

## ⚡ COMANDOS

```bash
# Estado de todos los servicios
pm2 list

# Reiniciar servicio
pm2 restart NOMBRE

# Logs en tiempo real
pm2 logs NOMBRE --lines 50

# Guardar config PM2 (persiste reinicios)
pm2 save && pm2 startup

# Health check todos los endpoints
for port in 3000 4000 5177 5180 5557 8765 8787 9123 9999; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/)
  echo "Port $port: $code"
done
```
