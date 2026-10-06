# 🌐 MSB // Panel de Control & Catálogo de Aplicaciones

<div align="center">
  <img src="icons/icon-512.png" alt="MSB Logo" width="180" style="border-radius: 28px; filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.4)); margin-bottom: 20px;" />
  <p><strong>Panel centralizado de acceso, telemetría y catálogo de las 18 aplicaciones activas en macOS</strong></p>
  <p>
    <a href="http://100.100.2.10:9999"><img src="https://img.shields.io/badge/Tailscale_Node-100.100.2.10%3A9999-00f0ff?style=for-the-badge&logo=tailscale&logoColor=black" alt="Tailscale Node"></a>
    <a href="http://localhost:9999"><img src="https://img.shields.io/badge/Localhost-Port_9999-a855f7?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Localhost Port"></a>
    <img src="https://img.shields.io/badge/PM2_Cluster-36_Procesos_Activos-10b981?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2 Cluster">
    <img src="https://img.shields.io/badge/Apps_Frontend-18_Online-f59e0b?style=for-the-badge" alt="Apps Frontend">
  </p>
</div>

---

## 📑 Tabla de Contenidos
- [1. Visión General & Identidad](#1-visión-general--identidad)
- [2. Topología de Red y Enlaces de Acceso](#2-topología-de-red-y-enlaces-de-acceso)
- [3. Catálogo de Aplicaciones Frontend (18 Aplicaciones)](#3-catálogo-de-aplicaciones-frontend-18-aplicaciones)
  - [🧠 IA & Plataformas Agénticas (6 Apps)](#-ia--plataformas-agénticas-6-apps)
  - [💻 Aplicaciones Web Interactivas (10 Apps)](#-aplicaciones-web-interactivas-10-apps)
  - [⚡ Sistemas, OS & Developer Tools (2 Apps)](#-sistemas-os--developer-tools-2-apps)
- [4. Estructura del Proyecto (Estándares Internacionales)](#4-estructura-del-proyecto-estándares-internacionales)
- [5. Gestión de Infraestructura con PM2](#5-gestión-de-infraestructura-con-pm2)
- [6. Identidad Visual, Favicons y Diseño](#6-identidad-visual-favicons-y-diseño)
- [7. Mantenimiento y Auditoría](#7-mantenimiento-y-auditoría)

---

## 1. Visión General & Identidad

**MSB** (anteriormente conocido durante la fase de desarrollo como *MSB*) es el centro neurálgico de mando y orquestador web que unifica, supervisa y ofrece acceso instantáneo a todas las soluciones de software, microservicios, agentes cognitivos y herramientas de productividad ejecutadas en la estación de trabajo macOS (Hackintosh).

### Principios Fundamentales:
- **Zero Mockups / Zero Fakes:** Cada tarjeta representa una aplicación real, desplegada en su respectivo puerto y verificada con código de estado HTTP 200.
- **Acceso Sin Fricción:** Enrutamiento optimizado mediante Tailscale Mesh VPN (`100.100.2.10`) para acceso directo multidispositivo (móvil, tablet, portátil, VPS) sin exponer puertos innecesarios a Internet.
- **Diseño Funcional:** Interfaz basada en glassmorphism cyberpunk, aceleración gráfica por canvas 2D de partículas cinéticas, síntesis de audio procedural Web Audio API y compatibilidad PWA para instalación de escritorio.

---

## 2. Topología de Red y Enlaces de Acceso

| Tipo de Acceso | URL de Entrada | Protocolo / Nodo | Caso de Uso |
|---|---|---|---|
| 🌐 **Tailscale VPN (Móvil / Remoto)** | [http://100.100.2.10:9999](http://100.100.2.10:9999) | Malla privada cifrada WireGuard | Acceso desde iPhone, Android, MacBook remoto o VPS |
| 💻 **Localhost (Nativo)** | [http://localhost:9999](http://localhost:9999) | Loopback local (`127.0.0.1`) | Acceso directo en el equipo anfitrión |
| 🛡️ **Cloudflare Zero Trust** | Enrutamiento perimetral túnel | Edge Reverse Proxy | Acceso seguro WAN protegido |

---

## 3. Catálogo de Aplicaciones Frontend (18 Aplicaciones)

### 🧠 IA & Plataformas Agénticas (6 Apps)

| Puerto | Aplicación | Stack Tecnológico | ID Proceso PM2 | Descripción |
|:---:|---|---|:---:|---|
| **9123** | **PromptForge Studio** | Fastify + Next.js PWA | `PROMPT-GENERATOR` | Compilador cognitivo de prompts multi-proveedor con 17 motores de IA integrados y optimización de instrucciones. |
| **5180** | **UIEP Platform** | Next.js 15 Platform | `UIEP` | Plataforma de ingeniería cognitiva para gestión de entidades, agentes autónomos y plugins en tiempo real. |
| **8005** | **MSBrOSs** | Python HTTP + Ollama Native | `msbross-backend` | Interfaz conversacional limpia conectada a los 8 modelos locales de Ollama (`qwen3.5:4b`, `deepseek-r1:8b`, etc.). |
| **5555** | **Agent Forge Studio** | HTML5 / Modular ES | `AGENT-PREMIUM` | Estudio visual para diseño, configuración de system prompts y exportación de arquitecturas de agentes. |
| **5556** | **AI Agent Builder PRO** | HTML5 / Visual Flow | `AGENT-BUILDER` | Factoría visual para diseño de flujos de trabajo LLM, prompt chains y orquestación de herramientas. |
| **5557** | **Multi-Agent Orchestrator** | PWA + IndexedDB + Ollama | `MULTI-AGENT-ORCH` | Orquestador multi-agente en enjambre con DAG secuencial, checkpoints de Time-Travel y aprobaciones Human-in-the-Loop (HITL). |

---

### 💻 Aplicaciones Web Interactivas (10 Apps)

| Puerto | Aplicación | Stack Tecnológico | ID Proceso PM2 | Descripción |
|:---:|---|---|:---:|---|
| **4000** | **PERFUME EAN** | Next.js Luxury Catalog | `PERFUME-EAN` | Buscador y catálogo de fragancias de alta gama con escáner de códigos de barras EAN-13, notas olfativas y stock. |
| **3333** | **Mapfre** | Next.js SSR Suite | `mapfre` | Suite digital para digitalización, OCR, validación de partes periciales y automatización de siniestros. |
| **3011** | **Perfume Trading Luxury ERP** | Next.js B2B ERP | `perfume-trading` | ERP comercial para cotización de perfumería exclusiva al por mayor, control de lotes y despacho aduanero. |
| **5176** | **Tu Energía Maya** | Vite + React + MUI | `TU-ENERGIA-MAYA` | Calculadora interactiva de cosmovisión sagrada maya: Kin del día, sellos solares y tonos galácticos. |
| **5177** | **TAROT MAYA Tzolk'in** | Vite SPA + CSS Neón | `TAROT-MAYA` | Oráculo maya interactivo con tiradas de cartas animadas 3D, efectos luminosos neón y arquetipos ancestrales. |
| **5178** | **Cuadrante de Horarios** | Vanilla SPA + Sync | `CUADRANTE-HORARIOS` | Gestor visual e interactivo de turnos rotativos, vacaciones, descansos y cobertura de dotaciones operativas. |
| **5179** | **Teringo Neural Cockpit** | SPA Enterprise Helpdesk | `TERINGO` | Bandeja de entrada inteligente y panel de triaje automatizado para soporte y gestión de incidencias. |
| **5173** | **Beca Laud Suite Principal** | Vite + React Audio | `BECA_LAUD` | Portal interactivo de la propuesta formativa y artística de Beca Laud con reproductor y catálogo musical. |
| **5174** | **Beca Laud Band Live** | Landing Page SPA | `BECA_LAUD_BAND` | Landing page promocional interactiva para contratación de repertorio musical en eventos privados y ceremonias. |
| **5175** | **Beca Laud CRM Alumnos** | CRM Management SPA | `BECA_LAUD_CRM` | Panel administrativo para gestión de matrículas, expedientes de alumnado, instrumentos y control de pagos. |

---

### ⚡ Sistemas, OS & Developer Tools (2 Apps)

| Puerto | Aplicación | Stack Tecnológico | ID Proceso PM2 | Descripción |
|:---:|---|---|:---:|---|
| **3000** | **Intercompiler 3D** | Next.js 16 + Three.js 3D | `INTERCOMPILER` | Análisis visual tridimensional de repositorios GitHub con grafo interactivo y mapa semántico de dependencias. |
| **8765** | **OmniDev OS** | Cognitive Web OS | `OMNIDEV-OS` | Sistema operativo web con terminal virtual interactiva, suite de edición de código y factoría de desarrollo agéntico. |

---

## 4. Estructura del Proyecto (Estándares Internacionales)

La raíz del proyecto ha sido organizada siguiendo estándares internacionales de arquitectura limpia y mantenimiento estructurado:

```text
/Users/manu/Desktop/MSB/
├── index.html                      # Entry point de la aplicación web (Mission Control)
├── manifest.json                   # Web App Manifest para instalación PWA
├── servicios.json                  # Catálogo canónico JSON de las 18 aplicaciones
├── ecosystem.desktop.config.cjs    # Definición declarativa de orquestación en PM2
├── profile-photo.png               # Avatar oficial del operador
├── favicon.ico                     # Favicon de respaldo para navegadores legacy
├── favicon.svg                     # Favicon vectorial SVG escalable (SOTA)
├── apple-touch-icon.png            # Icono retina para iOS / macOS Web Clips (180x180)
├── icons/                          # Paquete de identidad visual y resoluciones PWA
│   ├── favicon.svg                 # Vector maestro
│   ├── favicon-16x16.png           # Resolución 16px
│   ├── favicon-32x32.png           # Resolución 32px
│   ├── icon-192.png                # Icono PWA estándar (192px)
│   ├── icon-512.png                # Icono PWA splash screen (512px)
│   ├── apple-touch-icon.png        # Icono Apple (180px)
│   ├── og-preview.png              # Imagen OpenGraph para previsualizaciones sociales
│   └── logo-raw.jpg                # Arte gráfico original generado
├── docs/                           # Documentación técnica organizada
│   ├── audits/                     # Informes técnicos históricos de servicios y red
│   │   ├── 01_auditoria_inicial_servicios.md
│   │   ├── 02_auditoria_expert_macos.md
│   │   ├── 03_auditoria_completa_exhaustiva_macos.md
│   │   └── 04_servicios_tailscale_final.md
│   ├── backup/                     # Copias de seguridad de plantillas maestras
│   │   └── MSB_INDEX.html
│   └── logs/                       # Transcripciones íntegras y trazas de sesión
│       ├── HISTORIAL_CONVERSACION_COMPLETO.md
│       ├── transcript.jsonl
│       └── transcript_full.jsonl
├── scripts/                        # Scripts deterministas de mantenimiento
│   └── pm2_audit.py                # Auditor de salud y colisiones de procesos PM2
└── README.md                       # Documentación principal del repositorio
```

---

## 5. Gestión de Infraestructura con PM2

El servidor del Mission Control opera como servicio persistente gestionado por PM2 bajo el nombre **`MSB`**:

```bash
# Comprobar estado de todos los servicios
pm2 list

# Reiniciar el Mission Control
pm2 restart MSB

# Ver logs en tiempo real del Mission Control
pm2 logs MSB --lines 50

# Guardar la configuración actual de procesos persistentes
pm2 save
```

Para levantar todas las aplicaciones de escritorio definidas en la configuración declarativa:
```bash
pm2 start ecosystem.desktop.config.cjs
```

---

## 6. Identidad Visual, Favicons y Diseño

- **Logotipo Oficial:** Diseñado con geometría isométrica hexagonal en tonos cian `#00f0ff` y violeta eléctrico `#a855f7`, integrando un núcleo cuántico y trazas de circuitos neuronales.
- **Favicon Dinámico:** Servido en SVG nativo vectorial (`favicon.svg`) para máxima nitidez en pantallas Retina y modo oscuro.
- **Audio Procedimental:** El sintetizador Web Audio API integrado reproduce efectos hápticos sonoros al interactuar con las tarjetas y cambiar de entorno de red sin requerir archivos de audio externos.

---

## 7. Mantenimiento y Auditoría

Para verificar periódicamente el estado de los puertos y servicios HTTP:
```bash
python3 -c "
import urllib.request, json
services = json.load(open('servicios.json'))
for s in services:
    url = s.get('tailscaleUrl') or s.get('localUrl')
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=3)
        print(f'✅ {s[\"port\"]} - {s[\"name\"]}: {r.getcode()}')
    except Exception as e:
        print(f'⚠️ {s[\"port\"]} - {s[\"name\"]}: {e}')
"
```

---

<div align="center">
  <sub>Desarrollado y operado por <strong>Manuel Álvarez Diánez</strong> (Zaragoza, España).</sub><br>
  <sub>MSB &bull; 2026</sub>
</div>
