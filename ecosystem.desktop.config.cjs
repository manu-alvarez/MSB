/**
 * Desktop Projects — PM2 Ecosystem (Tailscale-Ready)
 * IP Tailscale: 100.100.2.10
 * Actualizado: 2026-09-25 — todos los servicios verificados en producción
 * 
 * Uso:
 *   pm2 start /Users/manu/Desktop/ecosystem.desktop.config.cjs
 *   pm2 save
 */
module.exports = {
  apps: [

    // ── MSB — Panel de Control ──────────────────────────────
    // URL: http://100.100.2.10:9999
    {
      name: 'MSB',
      script: 'python3',
      args: '-m http.server 9999 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB',
      out_file: '/Users/manu/.pm2/logs/MSB-out.log',
      error_file: '/Users/manu/.pm2/logs/MSB-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── PROMPT-GENERATOR (Fastify API + Next.js frontend) ────────────────
    // URL: http://100.100.2.10:9123  Backend: http://100.100.2.10:8787
    {
      name: 'PROMPT-GENERATOR',
      script: 'node',
      args: '--env-file=apps/server/.env apps/server/dist/index.js',
      cwd: '/Users/manu/Desktop/PROYECTOS/PROMPT-GENERATOR',
      env: { NODE_ENV: 'production' },
      out_file: '/Users/manu/.pm2/logs/PROMPT-GENERATOR-out.log',
      error_file: '/Users/manu/.pm2/logs/PROMPT-GENERATOR-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M'
    },

    // ── PERFUME-EAN ──────────────────────────────────────────────────────
    // URL: http://100.100.2.10:4000
    {
      name: 'PERFUME-EAN',
      script: 'npm',
      args: 'start',
      cwd: '/Users/manu/Desktop/PROYECTOS/ARANTXA',
      env: { PORT: 4000, NODE_ENV: 'production' },
      out_file: '/Users/manu/.pm2/logs/PERFUME-EAN-out.log',
      error_file: '/Users/manu/.pm2/logs/PERFUME-EAN-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '200M'
    },

    // ── TAROT-MAYA (HTML SPA — python http.server) ───────────────────────
    // URL: http://100.100.2.10:5177
    // NOTA: migrado de React+Vite a HTML puro autocontenido (2026-09-25)
    {
      name: 'TAROT-MAYA',
      script: 'python3',
      args: '-m http.server 5177 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/PROYECTOS/TAROT/maya-tarot',
      out_file: '/Users/manu/.pm2/logs/TAROT-MAYA-out.log',
      error_file: '/Users/manu/.pm2/logs/TAROT-MAYA-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── UIEP — Intelligence Platform (Next.js 15 monorepo) ───────────────
    // URL: http://100.100.2.10:5180
    {
      name: 'UIEP',
      script: 'npm',
      args: 'run dev -- -H 0.0.0.0 --port 5180',
      cwd: '/Users/manu/Desktop/PROYECTOS/UIEP/packages/ui',
      env: { NODE_ENV: 'development', PORT: 5180 },
      out_file: '/Users/manu/.pm2/logs/UIEP-out.log',
      error_file: '/Users/manu/.pm2/logs/UIEP-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },

    // ── MULTI-AGENT-ORCH (PWA — python http.server) ──────────────────────
    // URL: http://100.100.2.10:5557
    // NOTA: puerto cambiado de 8000 a 5557 (2026-09-25)
    {
      name: 'MULTI-AGENT-ORCH',
      script: 'python3',
      args: '-m http.server 5557 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/PROYECTOS/multi-agent-orchestrator',
      out_file: '/Users/manu/.pm2/logs/MULTI-AGENT-ORCH-out.log',
      error_file: '/Users/manu/.pm2/logs/MULTI-AGENT-ORCH-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── OmniDev OS ────────────────────────────────────────────────────────
    // URL: http://100.100.2.10:8765
    {
      name: 'OMNIDEV-OS',
      script: 'npm',
      args: 'start',
      cwd: '/Users/manu/Desktop/PROYECTOS/OmniDev OS',
      env: { PORT: 8765, NODE_ENV: 'production' },
      out_file: '/Users/manu/.pm2/logs/OMNIDEV-OS-out.log',
      error_file: '/Users/manu/.pm2/logs/OMNIDEV-OS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },

    // ── TU ENERGIA MAYA (Vite frontend) ──────────────────────────────────
    // URL: http://100.100.2.10:5176
    {
      name: 'TU-ENERGIA-MAYA',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 5176',
      cwd: '/Users/manu/Desktop/TU ENERGIA MAYA/TuEnergiaMaya/frontend',
      env: { NODE_ENV: 'development' },
      out_file: '/Users/manu/.pm2/logs/TU-ENERGIA-MAYA-out.log',
      error_file: '/Users/manu/.pm2/logs/TU-ENERGIA-MAYA-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M'
    },

    // ── AGENT PREMIUM (Static HTML) ───────────────────────────────────────
    // URL: http://100.100.2.10:5555
    {
      name: 'AGENT-PREMIUM',
      script: 'python3',
      args: '-m http.server 5555 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/PROYECTOS/AGENT PREMIUM',
      out_file: '/Users/manu/.pm2/logs/AGENT-PREMIUM-out.log',
      error_file: '/Users/manu/.pm2/logs/AGENT-PREMIUM-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── AGENT BUILDER (Static HTML) ───────────────────────────────────────
    // URL: http://100.100.2.10:5556
    {
      name: 'AGENT-BUILDER',
      script: 'python3',
      args: '-m http.server 5556 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/PROYECTOS/Agent Builder',
      out_file: '/Users/manu/.pm2/logs/AGENT-BUILDER-out.log',
      error_file: '/Users/manu/.pm2/logs/AGENT-BUILDER-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── CUADRANTE HORARIOS (Static HTML) ─────────────────────────────────
    // URL: http://100.100.2.10:5178
    {
      name: 'CUADRANTE-HORARIOS',
      script: 'python3',
      args: '-m http.server 5178 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/PROYECTOS/CUADRANTE HORARIOS',
      out_file: '/Users/manu/.pm2/logs/CUADRANTE-HORARIOS-out.log',
      error_file: '/Users/manu/.pm2/logs/CUADRANTE-HORARIOS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── TERINGO INSTALADOR (Static frontend) ─────────────────────────────
    // URL: http://100.100.2.10:5179
    {
      name: 'TERINGO',
      script: 'python3',
      args: '-m http.server 5179 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/TERINGO_INSTALADOR/frontend',
      out_file: '/Users/manu/.pm2/logs/TERINGO-out.log',
      error_file: '/Users/manu/.pm2/logs/TERINGO-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },

    // ── Novedades Migradas: Static Frontends (Ports 6001-6016) ───────────
    {
      name: 'CV-PORTFOLIO',
      script: 'python3',
      args: '-m http.server 6001 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/cv',
      out_file: '/Users/manu/.pm2/logs/CV-PORTFOLIO-out.log',
      error_file: '/Users/manu/.pm2/logs/CV-PORTFOLIO-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'APP-GENERATOR',
      script: 'python3',
      args: '-m http.server 6002 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/app-generator',
      out_file: '/Users/manu/.pm2/logs/APP-GENERATOR-out.log',
      error_file: '/Users/manu/.pm2/logs/APP-GENERATOR-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'COMBIPRO',
      script: 'python3',
      args: '-m http.server 6003 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/combipro',
      out_file: '/Users/manu/.pm2/logs/COMBIPRO-out.log',
      error_file: '/Users/manu/.pm2/logs/COMBIPRO-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'EDELWEISS',
      script: 'python3',
      args: '-m http.server 6004 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/edelweiss',
      out_file: '/Users/manu/.pm2/logs/EDELWEISS-out.log',
      error_file: '/Users/manu/.pm2/logs/EDELWEISS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'EXPOSITATOR',
      script: 'python3',
      args: '-m http.server 6005 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/expositator-rte',
      out_file: '/Users/manu/.pm2/logs/EXPOSITATOR-out.log',
      error_file: '/Users/manu/.pm2/logs/EXPOSITATOR-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'LOGISEARCH',
      script: 'python3',
      args: '-m http.server 6006 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/logisearch',
      out_file: '/Users/manu/.pm2/logs/LOGISEARCH-out.log',
      error_file: '/Users/manu/.pm2/logs/LOGISEARCH-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'MOKO-TOOLS',
      script: 'python3',
      args: '-m http.server 6007 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/moko-tools',
      out_file: '/Users/manu/.pm2/logs/MOKO-TOOLS-out.log',
      error_file: '/Users/manu/.pm2/logs/MOKO-TOOLS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'TASKFLOW-PRO',
      script: 'python3',
      args: '-m http.server 6008 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/taskflow',
      out_file: '/Users/manu/.pm2/logs/TASKFLOW-PRO-out.log',
      error_file: '/Users/manu/.pm2/logs/TASKFLOW-PRO-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'GAS-STATION-UI',
      script: 'python3',
      args: '-m http.server 6009 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/gas-station',
      out_file: '/Users/manu/.pm2/logs/GAS-STATION-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/GAS-STATION-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'INDUSTRIALPRO-UI',
      script: 'python3',
      args: '-m http.server 6010 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/industrialpro',
      out_file: '/Users/manu/.pm2/logs/INDUSTRIALPRO-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/INDUSTRIALPRO-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'TRADUCTOR-PRO-UI',
      script: 'python3',
      args: '-m http.server 6011 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/traductor-pro',
      out_file: '/Users/manu/.pm2/logs/TRADUCTOR-PRO-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/TRADUCTOR-PRO-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'CUENTOS-MAGICOS-UI',
      script: 'python3',
      args: '-m http.server 6012 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/cuentos-magicos',
      out_file: '/Users/manu/.pm2/logs/CUENTOS-MAGICOS-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/CUENTOS-MAGICOS-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'ATENEA-UI',
      script: 'python3',
      args: '-m http.server 6013 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/web-restaurante-atenea',
      out_file: '/Users/manu/.pm2/logs/ATENEA-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/ATENEA-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'NIKOLINA-UI',
      script: 'python3',
      args: '-m http.server 6014 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/livekit-nikolina',
      out_file: '/Users/manu/.pm2/logs/NIKOLINA-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/NIKOLINA-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'IAPROD-OS',
      script: 'python3',
      args: '-m http.server 6015 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/iaprod-os',
      out_file: '/Users/manu/.pm2/logs/IAPROD-OS-out.log',
      error_file: '/Users/manu/.pm2/logs/IAPROD-OS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'JARTOSDTO-UI',
      script: 'python3',
      args: '-m http.server 6016 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/jartosdto',
      out_file: '/Users/manu/.pm2/logs/JARTOSDTO-UI-out.log',
      error_file: '/Users/manu/.pm2/logs/JARTOSDTO-UI-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    },
    {
      name: 'TAROT-RWS',
      script: 'python3',
      args: '-m http.server 6017 --bind 0.0.0.0',
      cwd: '/Users/manu/Desktop/MSB/apps/tarot-rws',
      out_file: '/Users/manu/.pm2/logs/TAROT-RWS-out.log',
      error_file: '/Users/manu/.pm2/logs/TAROT-RWS-error.log',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '100M'
    }
  ]
};
