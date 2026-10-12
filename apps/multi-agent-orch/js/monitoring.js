/**
 * monitoring.js - Sentry + Plausible integration (privacy-friendly)
 *
 * Carga lazy: solo se inicializa en producción con DSN configurado.
 * Sentry captura errores no manejados. Plausible trackea page views y eventos custom.
 */

(function (global) {
  'use strict';

  const config = {
    sentryDsn: global.__CONFIG__?.sentryDsn || null,
    plausibleDomain: global.__CONFIG__?.plausibleDomain || null,
    environment: global.__CONFIG__?.environment || 'production',
    release: global.__CONFIG__?.release || `pwa@${Date.now()}`,
    enabled: global.location.hostname !== 'localhost' && global.location.hostname !== '127.0.0.1',
  };

  /**
   * Inicializa Sentry de forma lazy (script async).
   * NO bundlea el SDK — usa CDN para mantener el bundle pequeño.
   */
  function initSentry() {
    if (!config.enabled || !config.sentryDsn) return;
    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/8.34.0/bundle.tracing.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (!global.Sentry) return;
      global.Sentry.init({
        dsn: config.sentryDsn,
        environment: config.environment,
        release: config.release,
        integrations: [new global.Sentry.BrowserTracing()],
        tracesSampleRate: 0.1, // 10% de requests
        replaysSessionSampleRate: 0, // sin session replay (privacidad)
        replaysOnErrorSampleRate: 0,
        beforeSend(event) {
          // Strip PII
          if (event.user) delete event.user.ip_address;
          return event;
        },
      });
      console.info('[monitoring] Sentry initialized');
    };
    document.head.appendChild(script);

    // Capturar errores globales como fallback
    global.addEventListener('error', (e) => {
      console.error('[monitoring] Unhandled error:', e.error || e.message);
    });
    global.addEventListener('unhandledrejection', (e) => {
      console.error('[monitoring] Unhandled rejection:', e.reason);
    });
  }

  /**
   * Plausible: script async de 1KB, sin cookies, GDPR-compliant.
   */
  function initPlausible() {
    if (!config.enabled || !config.plausibleDomain) return;
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = config.plausibleDomain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
    console.info('[monitoring] Plausible initialized for', config.plausibleDomain);
  }

  /**
   * API pública para trackear eventos custom desde la app.
   * Funciona con Plausible (event) o fallback console.info en dev.
   */
  function trackEvent(name, props) {
    if (typeof global.plausible === 'function') {
      global.plausible(name, { props });
    } else {
      console.info('[analytics]', name, props || {});
    }
  }

  function init() {
    if (!config.enabled) {
      console.info('[monitoring] Skipped (dev environment)');
      return;
    }
    initSentry();
    initPlausible();
  }

  global.Monitoring = { init, trackEvent, config };
})(window);
