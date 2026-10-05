# 🔬 Auditoría Exhaustiva macOS — Reporte Final

**Fecha:** 2026-09-25 01:07 CEST  
**Scope:** Todo `/Users/manu` — Desktop, MSBrossAI, servicios del sistema, PM2, Cloudflare, Ollama, Docker

---

## 1. INVENTARIO COMPLETO DE PROYECTOS DESCUBIERTOS

### 📁 `/Users/manu/Desktop` (Desarrollo activo)

| Proyecto | Tipo | Puerto Configurado | Estado |
|---|---|---|---|
| **INTERCOMPILER** | Next.js 16 + Three.js + Monaco | `3000` (PM2 dev) | ✅ Online |
| **ARANTXA** | Next.js (traducción) | `4000` (PM2 dev) | ✅ Online |
| **BECA_LAUD** | Vite (SPA principal) | `5173` (PM2 dev) | ✅ Online |
| **BECA_LAUD_BAND** | Vite (sub-app banda) | `5174` (PM2 dev) | ✅ Online |
| **BECA_LAUD_CRM** | Vite (sub-app CRM) | `5175` (PM2 dev) | ✅ Online |
| **FOZ / LexCase** | Node.js Express | `8888` (PM2 prod) | ✅ Online |
| **PROMPT-GENERATOR** | Monorepo (Fastify server) | `8787` (.env) | ⚠️ **Proceso rogue eliminado** (colisionaba con it-english) |
| **OmniDev OS** | Python server | `8765` (.env) | 💤 No corriendo (archivo estático) |
| **TU ENERGIA MAYA** | Vite frontend | Sin backend propio | 💤 No corriendo |
| **TERINGO_INSTALADOR** | Python GUI (Tkinter) + InnoSetup | Sin puerto de red | 💤 Herramienta offline/Windows |
| **AGENT PREMIUM** | HTML estático (`forge-ui.html`) | Sin servidor | 💤 Offline |
| **Agent Builder** | HTML estático (`index.html`) | Sin servidor | 💤 Offline |
| **TAROT / maya-tarot** | Desconocido (package.json) | Sin puerto | 💤 Offline |
| **CUADRANTE HORARIOS** | Desconocido | Sin archivos de config | 💤 Offline |
| **ANTXI_MAIL** | Desconocido | Sin archivos de config | 💤 Offline |
| **multi-agent-orchestrator** | Node.js (Vercel) | Sin puerto local | 💤 Offline |
| **UIEP** | Monorepo (12 packages) | Sin puerto local | 💤 Offline |

### 📁 `/Users/manu/MSBrossAI` (Producción — Orquestador PM2)

| Proyecto | Tipo | Puerto | Proxy Route (`msbross-proxy`) | Estado |
|---|---|---|---|---|
| **nikolina-api-hub** | FastAPI (token server) | `8001` | `/_nikolina` | ✅ Online |
| **nikolina-agent** | LiveKit Voice Agent | `8083` ← **CORREGIDO** | N/A (WebSocket a LiveKit Cloud) | ✅ **ONLINE (REPARADO)** |
| **it-coach-agent** | LiveKit Coach Agent | `8081` | `/_coach/api` (inline en proxy) | ✅ Online |
| **industrialpro-backend** | FastAPI (task manager) | `8002` | `/_industrialpro` | ✅ Online |
| **gas-station-backend** | FastAPI (checklist) | `3005` | `/_gas-station` | ✅ Online |
| **traductor-pro-server** | Node.js Express | `8004` | `/_traductor` | ✅ Online |
| **msbross-backend** | Python HTTP (Adele voice) | `8005` | `/_msbross` | ✅ Online |
| **iaputa-backend** | FastAPI (AI assistant) | `8006` | `/_iaputa` | ✅ Online |
| **cuentos-magicos-backend** | FastAPI (storyteller) | `8007` (config) | `/_cuentosmagicos` | 🔴 **ERRORED (PostgreSQL caído)** |
| **cuentos-magicos-celery** | Celery worker | N/A | N/A | ✅ Online |
| **elitescout-server** | Node.js (travel scraper) | `8003` | `/app/elitescout` | ✅ Online |
| **web-restaurante-atenea** | FastAPI (restaurante) | `8009` | `/_atenea` | ✅ Online |
| **jartosdto-backend** | FastAPI (RAG multi-LLM) | `8010` | `/_jartosdto` | ✅ Online |
| **txa-fitness-pro** | Next.js SSR | `3456` | `/app/txafitnesspro` | ✅ Online |
| **mapfre-infocol** | Next.js SSR | `3333` | `/app/mapfre` | ✅ Online |
| **msbross-proxy** | Express (reverse proxy) | `8080` (HTTP) + `8443` (HTTPS) | — ES el proxy — | ✅ Online |
| **it-english-backend** | Node.js (CORS proxy) | `8787` | `/_itenglish` | ✅ Online |
| **perfume-trading** | Next.js SSR (ERP) | `3011` | `/app/perfume-trading` | ✅ Online |
| **cloudflare-tunnel** | cloudflared daemon | `20241` (metrics) | — Túnel → `localhost:8080` — | ✅ Online |
| **lexcase-master** | Node.js Express (FOZ) | `8888` | N/A | ✅ Online |

### 🔧 Servicios del Sistema y Terceros

| Servicio | Puerto | Notas |
|---|---|---|
| **Ollama** (LLM local) | `11434` (API), `11435` + `57896` (interno) | ✅ Corriendo |
| **ControlCenter** (macOS) | `5000`, `7000` | AirPlay Receiver — normal |
| **ARDAgent** (macOS) | `3283` | Apple Remote Desktop — normal |
| **rapportd** (macOS) | `49157` | Bluetooth/WiFi — normal |
| **Python http.server** | `5555` | Servidor manual en TTY (`python -m http.server 5555`) |
| **MCP Agent Memory** | `8890` | `mcp-agent-memory` server |
| **Token Optimizer MCP** | `16999`, `17379` | `@ooples/token-optimizer-mcp` supervisor |

### 🐳 Docker Compose (Definiciones encontradas, NO ejecutándose)

| Archivo | Puertos definidos | Estado |
|---|---|---|
| `jartosdto/docker-compose.yml` | `5433:5432` (Postgres), `6380:6379` (Redis), `9010:9000` + `9011:9001` (MinIO), `8100:8000` (API), `3100:3000` (Client), `8090:80` (Nginx) | 💤 Docker no activo |
| `portfolio-via-01` | API genérica | 💤 Docker no activo |
| `portfolio-via-02` | Postgres `5433:5432` + orquestación `8002:8002` + `8502:8502` | 💤 Docker no activo |
| `portfolio-via-03` | Similar | 💤 Docker no activo |
| `portfolio-web` | Governance verifier | 💤 Docker no activo |
| `agent-stack uml-mcp` | UML rendering | 💤 Docker no activo |

---

## 2. MAPA DE PUERTOS COMPLETO (Estado vivo al cierre)

```
PUERTO   SERVICIO                     BIND           ESTADO
──────   ─────────────────────────    ─────────────  ──────
3000     INTERCOMPILER (Next.js)      *              ✅
3005     gas-station-backend          127.0.0.1      ✅
3011     perfume-trading (Next.js)    127.0.0.1      ✅
3283     ARDAgent (macOS)             *              ✅ Sistema
3333     mapfre-infocol (Next.js)     127.0.0.1      ✅
3456     txa-fitness-pro (Next.js)    127.0.0.1      ✅
4000     ARANTXA (Next.js)            *              ✅
5000     ControlCenter (macOS)        *              ✅ Sistema
5173     BECA_LAUD (Vite)             *              ✅
5174     BECA_LAUD_BAND (Vite)        *              ✅
5175     BECA_LAUD_CRM (Vite)         *              ✅
5555     Python http.server (manual)  *              ⚪ Manual
7000     ControlCenter (macOS)        *              ✅ Sistema
8001     nikolina-api-hub (FastAPI)   127.0.0.1      ✅
8002     industrialpro-backend        127.0.0.1      ✅
8003     elitescout-server            *              ✅
8004     traductor-pro-server         *              ✅
8005     msbross-backend              *              ✅
8006     iaputa-backend (FastAPI)     127.0.0.1      ✅
8009     atenea-backend (FastAPI)     127.0.0.1      ✅
8010     jartosdto-backend (FastAPI)  127.0.0.1      ✅
8080     msbross-proxy (Express)      *              ✅ REVERSE PROXY
8081     it-coach-agent (LiveKit)     *              ✅
8083     nikolina-agent (LiveKit)     *              ✅ REPARADO
8443     msbross-proxy (HTTPS)        *              ✅
8787     it-english-backend           *              ✅ (conflicto resuelto)
8888     lexcase-master (FOZ)         *              ✅
8890     mcp-agent-memory             127.0.0.1      ✅
11434    ollama (LLM API)             *              ✅
20241    cloudflared (metrics)        127.0.0.1      ✅
```

> **0 colisiones de puertos.** Cada puerto es único y verificado en vivo.

---

## 3. ENRUTAMIENTO CLOUDFLARE → PROXY → MICROSERVICIOS

```mermaid
graph LR
    Internet["🌍 Internet"] -->|HTTPS| CF["api.msbross.me<br/>(Cloudflare Tunnel)"]
    CF -->|HTTP| PROXY["msbross-proxy<br/>:8080 / :8443"]
    PROXY -->|/_nikolina| NIK[":8001 nikolina-api-hub"]
    PROXY -->|/_gas-station| GAS[":3005 gas-station"]
    PROXY -->|/_industrialpro| IND[":8002 industrialpro"]
    PROXY -->|/app/elitescout| ELI[":8003 elitescout"]
    PROXY -->|/_traductor| TRA[":8004 traductor-pro"]
    PROXY -->|/_msbross| MSB[":8005 msbross-backend"]
    PROXY -->|/_iaputa| IAP[":8006 iaputa"]
    PROXY -->|/_cuentosmagicos| CUE[":8007 cuentos-magicos 🔴"]
    PROXY -->|/_atenea| ATE[":8009 atenea"]
    PROXY -->|/_jartosdto| JAR[":8010 jartosdto"]
    PROXY -->|/_itenglish| ENG[":8787 it-english"]
    PROXY -->|/app/txafitnesspro| TXA[":3456 txa-fitness"]
    PROXY -->|/app/mapfre| MAP[":3333 mapfre-infocol"]
    PROXY -->|/app/perfume-trading| PER[":3011 perfume-trading"]
    PROXY -->|/_coach/api| COA[":8081 it-coach (inline)"]
    PROXY -->|/rtc| LK[":7880 LiveKit WS"]
```

---

## 4. CORRECCIONES APLICADAS

### ✅ FIX 1: Colisión puerto 8081 (nikolina-agent vs it-coach-agent)
- **Causa raíz:** LiveKit SDK v1.6.7 usa `prod_default=8081`. Ambos agentes intentaban el mismo puerto.
- **Corrección:**
  - Editado [`agent.py`](file:///Users/manu/MSBrossAI/apps/livekit-nikolina/agent/src/agent.py) → añadido `port=int(os.environ.get("LIVEKIT_WORKER_PORT", 8083))` a `WorkerOptions`
  - Editado [`coach_agent.py`](file:///Users/manu/MSBrossAI/apps/livekit-nikolina/agent/src/coach_agent.py) → añadido `port=int(os.environ.get("LIVEKIT_WORKER_PORT", 8082))` a `WorkerOptions`
  - Editado [`ecosystem.config.js`](file:///Users/manu/MSBrossAI/ecosystem.config.js) → añadido `LIVEKIT_WORKER_PORT: 8083` al env de nikolina-agent
- **Resultado:** nikolina-agent ahora en `8083`, it-coach-agent en `8081`. **33,773 reinicios fallidos eliminados.**

### ✅ FIX 2: Colisión puerto 8787 (it-english-backend vs PROMPT-GENERATOR)
- **Causa raíz:** `it-english-backend` (PM2, server.js `PORT || 8787`) y un proceso rogue de PROMPT-GENERATOR (`apps/server/dist/index.js`, `.env PORT=8787`) competían por el mismo puerto.
- **Corrección:** Eliminado el proceso rogue de PROMPT-GENERATOR (PID 55712). it-english-backend se queda como dueño del `8787`.
- **Resultado:** Puerto 8787 limpio y exclusivo para `it-english-backend`.

### ✅ FIX 3: iaputa-backend (aplicado en sesión anterior)
- Se instalaron las dependencias faltantes (`google-genai`, `google-generativeai`) en su venv. Ahora online en `8006`.

### ✅ FIX 4: it-english-backend y nikolina-agent (reactivados en sesión anterior)
- Procesos detenidos fueron reiniciados vía PM2.

---

## 5. PROBLEMA PENDIENTE (Requiere acción del usuario)

### 🔴 `cuentos-magicos-backend` — PostgreSQL local caído

- **Puerto configurado:** `8007`
- **Error:** `ConnectionRefusedError: [Errno 61] Connection refused` → `asyncpg` no puede conectar a `localhost:5432`
- **Config encontrada:** [`config.py`](file:///Users/manu/MSBrossAI/apps/cuentos-magicos/backend/app/core/config.py) línea 27:
  ```python
  DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cuentos_magicos"
  ```
- **Estado del sistema:** PostgreSQL **NO está instalado** via Homebrew. Docker Desktop **NO está activo** (el comando `docker` no existe en PATH).
- **Acción requerida:**
  1. **Opción A:** Abrir Postgres.app o Docker Desktop y asegurarte de que PostgreSQL esté escuchando en `localhost:5432`, luego `pm2 restart cuentos-magicos-backend`
  2. **Opción B:** Cambiar la `DATABASE_URL` en `config.py` para apuntar a tu instancia de Supabase (que ya tienes configurada en el `.env` del frontend: `ujktxhqxhxkbrhczbhcf.supabase.co`)

---

## 6. VERIFICACIÓN DOBLE — CHECKLIST

| Verificación | Resultado |
|---|---|
| Escaneados TODOS los `.env`, `.env.local`, `.env.production` | ✅ 21 archivos leídos |
| Escaneados TODOS los `ecosystem.config.*` | ✅ 4 archivos (MSBrossAI, FOZ, FOZ/Portable, ARANTXA) |
| Escaneados TODOS los `docker-compose.yml` | ✅ 6 archivos |
| Leído código fuente del reverse proxy (`server.js`) | ✅ Todas las rutas verificadas |
| Leído código fuente `agent.py` y `coach_agent.py` | ✅ WorkerOptions analizados |
| Leído código fuente LiveKit SDK `worker.py` | ✅ Comportamiento de puerto por defecto verificado |
| Leído código fuente `it-english-coach/server.js` | ✅ `PORT || 8787` verificado |
| Leído código fuente `msbross-backend/server.py` | ✅ `PORT = 8005` hardcoded verificado |
| Cloudflared config leído | ✅ Tunnel `e77340ca...` → `localhost:8080` |
| Verificados 25/25 procesos PM2 | ✅ 24 online, 1 errored (DB) |
| Verificada colisión de puertos en vivo (lsof) | ✅ 0 colisiones |
| Proyectos Desktop sin servidor identificados | ✅ 10 proyectos offline/estáticos catalogados |
| Docker Compose analizados pero no activos | ✅ 6 definiciones documentadas |
| Procesos fuera de PM2 identificados | ✅ python http.server :5555, mcp-agent-memory :8890, token-optimizer :16999/:17379 |
