# Auditoría Técnica y Topológica de Proyectos macOS

He completado la fase de descubrimiento profundo (*Deep Scan*) en tu entorno, abarcando de forma recursiva los directorios de usuario, tu escritorio (`~/Desktop`) y la raíz de proyectos (`~/MSBrossAI`). 

## 1. Descubrimiento y Mapeo Estático (Fase de Escaneo)
Se ha ejecutado un rastreo multinivel ignorando cachés y dependencias (`node_modules`, `venv`, `.next`, `.git`) para extraer exclusivamente metadatos de configuración.

*   **Total de archivos de configuración base encontrados:** 746
*   **Proyectos Core identificados (con variables de entorno o gestores de procesos):** 52
*   **Archivos Maestros Analizados:**
    *   `/Users/manu/MSBrossAI/ecosystem.config.js` (Orquestador principal, +20 apps)
    *   `/Users/manu/Desktop/FOZ/ecosystem.config.cjs`
    *   `/Users/manu/Desktop/PROYECTOS/ARANTXA/ecosystem.config.js`
    *   `.env` roots (OmniDev OS, gas-station, traductor-pro, etc.)
    *   `docker-compose.yml` (PROYECTOS IA, agent-stack, jartosdto)
    *   `/Users/manu/.cloudflared/config.yml`

## 2. Topología de Red y Enrutamiento (Túneles)
He leído la configuración de Cloudflare (`config.yml`). 
*   El dominio `api.msbross.me` está redirigiendo todo el tráfico de *ingress* al servicio local **HTTP `localhost:8080`** mediante el UUID `e77340ca...`.
*   El puerto `8080` está correctamente ocupado por tu proyecto **`msbross-proxy`**, que actúa como tu Reverse Proxy interno para distribuir el tráfico hacia el resto de los microservicios.

## 3. Matriz de Colisiones y Diagnóstico de PM2
Se han cruzado los datos estáticos extraídos de los `ecosystem.config.js` y archivos `.env` contra los Sockets TCP activos (`lsof`) en el sistema.

### 🔴 Conflicto Severo de Puertos (Port Hogging)
*   **Afectado:** `nikolina-agent` (PM2 PID 1)
*   **Síntoma:** Error de binding del LiveKit Worker (`[Errno 48] address already in use`). Entra en bucle de reinicios (33,773 reinicios a la fecha).
*   **Causa Raíz:** Ambos, `nikolina-agent` y el proyecto **`it-coach-agent`**, están intentando levantar servidores en el puerto **`8081`**. Actualmente `it-coach-agent` tiene el control del puerto.

### 🔴 Caída de Capa de Datos (Database Downtime)
*   **Afectado:** `cuentos-magicos-backend` (PM2 PID 8)
*   **Síntoma:** `ConnectionRefusedError: [Errno 61] Connection refused` por parte del driver `asyncpg`.
*   **Causa Raíz:** PostgreSQL no está corriendo en el sistema (no está en Homebrew, y Docker no está en ejecución). El backend de FastAPI falla al no tener backend de estado.

### 🟡 Colisiones Potenciales a Monitorizar
*   Se observan múltiples proyectos de **Frontend (Next.js y Vite)** corriendo o pre-configurados para los puertos `3000`, `4000`, `5173`, `5174`, `5175`. Vite auto-escala el puerto si está ocupado, pero Next.js puede fallar si no se declara explícitamente en el orquestador (`ecosystem.config.js`).

## 4. Plan de Actuación y Corrección (Action Plan)

Si me autorizas a proceder con las modificaciones al código y al entorno, estos serán los pasos exactos a seguir de forma automatizada:

### PASO 1: Aislamiento del `nikolina-agent`
1. Modificaré el archivo de arranque de `nikolina-agent` (dentro de `~/MSBrossAI/apps/livekit-nikolina/agent/src/agent.py`) o sus parámetros en PM2 para forzar que inicialice el WorkerOptions en un puerto limpio (por ejemplo, el `8082`).
2. Reiniciaré el proceso PM2 (`pm2 restart nikolina-agent`) garantizando que quede estable y *Online*.

### PASO 2: Reactivación de la Base de Datos
1. Debido a que el demonio de Docker y el servicio de PostgreSQL de Homebrew están inaccesibles para mí en el entorno TTY actual, **necesitaré que asegures que el servidor de PostgreSQL esté encendido** en tu Mac (iniciando Postgres.app o Docker Desktop).
2. Si prefieres que migre `cuentos-magicos-backend` para que use SQLite temporalmente en lugar de PostgreSQL (para evitar la dependencia), puedo reescribir su configuración de conexión en el backend.

### PASO 3: Auditoría y Refactor de Orquestador Principal
1. Modificaré el archivo `/Users/manu/MSBrossAI/ecosystem.config.js` para incluir mapeos explícitos (hardcoded ports) para los procesos que están implícitos (`nikolina-agent`, `it-coach-agent`), previniendo colisiones futuras.
2. Haré un `pm2 reload all` para refrescar todo el árbol de procesos en caliente y garantizar que cada proxy inverso (`msbross-proxy`) apunte a los puertos de forma determinista.

¿Procedemos a ejecutar el **Paso 1** y el **Paso 3** para dejar el orquestador y los agentes completamente libres de colisiones?
