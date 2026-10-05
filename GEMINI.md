# GEMINI.md — MSB OS Context & Engineering Rules

## 1. PROJECT
- **Name:** MSB (Panel de Control & Servicios)
- **Purpose:** Plataforma centralizada de mando, catálogo interactivo y telemetría de 18 aplicaciones web frontend y agentes de IA en macOS / Tailscale.
- **Users:** Manuel Álvarez Diánez (Operador del Sistema / Administrador)
- **Status:** PRODUCTION
- **Architecture:** Mission Control Dashboard (HTML5 / Vanilla CSS / ES6 / Canvas 2D / Web Audio API) servido por Python HTTP Server en el puerto 9999, supervisado por PM2 (`MSB`), y desplegado en GitHub Pages.
- **Repository:** https://github.com/manu-alvarez/MSB (Público)
- **Production URL (GitHub Pages):** https://manu-alvarez.github.io/MSB/
- **Network Mesh:** Tailscale Mesh VPN (`100.100.2.10`), Localhost (`127.0.0.1`), Cloudflare Zero Trust.

---

## 2. TECHNOLOGY BASELINE
- **Core Dashboard:** HTML5 semántico, CSS Custom Properties (Cyberpunk Dark Mode & Glassmorphism), Vanilla JavaScript ES6+.
- **Graphics & Audio:** Canvas 2D (simulación de partículas cinéticas), Web Audio API (síntesis de audio háptico procedural).
- **Procesos:** PM2 Process Manager (`ecosystem.desktop.config.cjs`).
- **Servidor HTTP:** Python 3 HTTP Server (`python3 -m http.server 9999 --bind 0.0.0.0`).
- **Malla de Red:** Tailscale VPN (`100.100.2.10`).
- **Modelos de IA:** Ollama local (`http://localhost:11434`) con modelos reales verificados (`qwen3.5:4b`, `deepseek-r1:8b`, `gemma4`, `phi4-mini-reasoning`).

---

## 3. PROJECT DIRECTORY STRUCTURE
```text
/Users/manu/Desktop/MSB/
├── index.html                      # Entry point de la aplicación web (Mission Control)
├── manifest.json                   # Web App Manifest para instalación PWA
├── servicios.json                  # Catálogo canónico JSON de las 18 aplicaciones
├── ecosystem.desktop.config.cjs    # Definición de procesos PM2
├── profile-photo.png               # Avatar oficial del operador
├── favicon.ico                     # Favicon de respaldo
├── favicon.svg                     # Favicon vectorial SVG escalable
├── apple-touch-icon.png            # Icono retina para iOS / macOS Web Clips (180x180)
├── icons/                          # Paquete de identidad visual y resoluciones
│   ├── favicon.svg
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── og-preview.png
│   └── logo-raw.jpg
├── docs/                           # Documentación técnica organizada
│   ├── audits/                     # Auditorías históricas de servicios y red
│   ├── backup/                     # Copias de seguridad
│   └── logs/                       # Transcripciones y trazas de sesión
├── scripts/                        # Scripts de mantenimiento (pm2_audit.py)
├── README.md                       # Documentación principal del repositorio
└── GEMINI.md                       # Reglas y contexto operativo del asistente
```

---

## 4. OPERATIONAL RULES & POLICIES
1. **Zero Mockups / Zero Fake Data:** Nunca inventar modelos de IA, endpoints, ni aplicaciones. Cada servicio referenciado debe ser un proceso real corriendo en su respectivo puerto.
2. **Preservación de Producción:** Antes de cualquier cambio, verificar que no rompa la estructura del DOM ni introduzca errores de sintaxis en `index.html`.
3. **Catálogo Canónico:** `servicios.json` es la fuente de verdad para la lista de aplicaciones; cualquier adición o cambio de puerto debe reflejarse tanto en `servicios.json` como en el array `SERVICES` de `index.html`.
4. **Verificación de Red:** Todo servicio debe ser validado con respuesta HTTP 200 en su URL correspondiente de Tailscale (`http://100.100.2.10:XXXX`) y local (`http://localhost:XXXX`).
