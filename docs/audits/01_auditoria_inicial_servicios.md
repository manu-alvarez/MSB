# Reporte Exhaustivo de Procesos y Puertos en macOS

Tras un análisis profundo y detallado del sistema (procesos, sockets, PM2, Docker y Homebrew), he elaborado el siguiente reporte con los hallazgos, las correcciones que he aplicado directamente sobre la marcha y el plan de actuación final para los conflictos restantes.

## 1. Mapeo de Puertos Activos
El sistema cuenta con una arquitectura amplia. Estos son los puertos principales que están escuchando activamente:

*   **Node.js (Proyectos PM2 / Vite):**
    *   `3000`, `4000`, `8080` (msbross-proxy)
    *   `3011` (perfume-trading)
    *   `3333` (mapfre-infocol)
    *   `3456` (txa-fitness-pro)
    *   `8003` (elitescout-server)
    *   `8004` (traductor-pro-server)
    *   `8443` (HTTPS alternativo)
    *   `8787`, `8888` (lexcase-master)
    *   `5173`, `5174`, `5175` (Procesos frontend Vite)
*   **Python (Agentes y APIs PM2):**
    *   `3005` (gas-station-backend)
    *   `8001` (nikolina-api-hub)
    *   `8006` (iaputa-backend) - *¡Reparado!*
    *   `8009` (web-restaurante-atenea-backend)
    *   `8010` (jartosdto-backend)
    *   `8081` (it-coach-agent)
    *   `5555`, `8002`, `8005`
*   **Servicios de Terceros e Infraestructura:**
    *   **Cloudflared:** `20241` (Túneles de Cloudflare)
    *   **Ollama:** `11434`, `11435`, `58369` (Modelos LLM locales)
    *   **Servicios macOS:** `7000`, `5000` (ControlCenter), `3283` (ARDAgent), `49157` (rapportd).

## 2. Estado de Proyectos (PM2) y Correcciones Aplicadas

Analizamos exhaustivamente los 25 proyectos gestionados por PM2. 

**✅ Proyectos Online y Correctos:**
ARANTXA, BECA_LAUD, BECA_LAUD_BAND, BECA_LAUD_CRM, INTERCOMPILER, cloudflare-tunnel, cuentos-magicos-client, elitescout-server, gas-station-backend, industrialpro-backend, jartosdto-backend, lexcase-master, mapfre-infocol, msbross-backend, msbross-proxy, nikolina-api-hub, perfume-trading, traductor-pro-server, txa-fitness-pro, web-restaurante-api, it-coach-agent.

**🛠️ Proyectos Reparados durante la Investigación:**
*   **`iaputa-backend`**: Estaba en bucle de errores. **Causa:** El entorno virtual no tenía los paquetes del SDK de Gemini (`google-genai` y `google-generativeai`). **Acción:** Me encargué de instalar los paquetes faltantes vía pip y reinicié el proceso en PM2. Ahora está **100% ONLINE** y escuchando en el puerto `8006`.
*   **`it-english-backend`**: Se encontraba detenido. **Acción:** Fue reactivado en PM2 sin errores y ya está online.

## 3. Problemas Detectados y Plan de Actuación Pendiente

Quedan 2 proyectos que presentan errores ajenos a la configuración inicial y que necesitan tu intervención o aprobación para proceder.

### ⚠️ A. Conflicto de Puertos: `nikolina-agent` (PID 1)
*   **El Problema:** Al reiniciar el agente, este falla de forma inmediata lanzando un error `[Errno 48] address already in use` en el puerto `8081`. 
*   **La Causa:** `nikolina-agent` intenta arrancar su LiveKit Worker en el puerto por defecto (8081), pero el proyecto `it-coach-agent` ya está ejecutándose exitosamente ocupando ese mismo puerto.
*   **Solución Propuesta:** Cambiar el puerto de inicialización de `nikolina-agent` (por ejemplo, al `8082`). Esto se puede lograr editando el archivo `agent.py` dentro de `/Users/manu/MSBrossAI/apps/livekit-nikolina/agent` agregando `port=8082` a las `WorkerOptions`, o bien mediante variables de entorno si el código lo permite.

### ⚠️ B. Base de datos caída: `cuentos-magicos-backend` (PID 8)
*   **El Problema:** El proyecto arranca pero entra en estado *Errored*. En los logs se observa un fallo `ConnectionRefusedError: [Errno 61] Connection refused` proveniente de la librería `asyncpg`.
*   **La Causa:** El backend no logra conectarse a la base de datos PostgreSQL local. Intenté arrancar postgres por Homebrew (`brew services start postgresql`), pero no lo tienes instalado de esa forma. Además, el servicio Docker no se encuentra activo ni instalado directamente en el shell actual.
*   **Solución Propuesta:** Necesitas iniciar el servicio de PostgreSQL. Dependiendo de cómo lo uses normalmente (ej. aplicación *Postgres.app*, o arrancando la app de Docker Desktop de macOS), levántalo y asegúrate de que esté expuesto en el puerto 5432. Posteriormente, con un `pm2 restart cuentos-magicos-backend` el servicio se estabilizará.
