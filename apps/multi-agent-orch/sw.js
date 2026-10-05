/* Multi-Agent Orchestrator - Service Worker
 * Estrategias de cache:
 *  - Network-first: navegación (HTML)
 *  - Stale-while-revalidate: assets estáticos (JS, CSS, imágenes)
 *  - Cache-only: offline fallback
 *  - Network-first con timeout: API calls
 */

const SW_VERSION = 'orchestrator-v1.0.0';
const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_RUNTIME = `${SW_VERSION}-runtime`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/orchestrator.js',
  './js/agents.js',
  './js/persistence.js',
  './js/stateManager.js',
  './js/ui.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const OFFLINE_URL = './index.html';

// ============================================
// INSTALL
// ============================================
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${SW_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Pre-cache failed:', err))
  );
});

// ============================================
// ACTIVATE - limpia caches antiguas
// ============================================
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${SW_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(SW_VERSION))
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - estrategias por tipo de recurso
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar GET
  if (request.method !== 'GET') return;

  // No interceptar chrome-extension, devtools, etc.
  if (!url.protocol.startsWith('http')) return;

  // Estrategia según tipo
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPI(url)) {
    event.respondWith(handleAPI(request));
  } else {
    event.respondWith(handleDefault(request));
  }
});

// ============================================
// ESTRATEGIAS
// ============================================

// Network-first con fallback offline
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    console.log('[SW] Navigation offline, serving cache');
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_URL);
  }
}

// Stale-while-revalidate
async function handleStaticAsset(request) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_STATIC).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

// Network-first con timeout para API
async function handleAPI(request) {
  const TIMEOUT_MS = 5000;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Default: intentar red, fallback a cache
async function handleDefault(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ============================================
// HELPERS
// ============================================
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/.test(url.pathname);
}

function isAPI(url) {
  return url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname;
}

// ============================================
// MESSAGE - permite al cliente forzar actualización
// ============================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => event.ports[0]?.postMessage({ success: true }));
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
});
