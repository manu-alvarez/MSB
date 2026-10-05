# 🛡️ Security Audit Checklist

Auditoría de seguridad realizada sobre el código fuente.

## ✅ XSS Prevention

- [x] **HTML escaping** en `ui.js` → función `escapeHTML()` aplicada a:
  - `renderWorkflowList`: query y title
  - `appendLog`: message
  - `renderAgentGrid`: descripción (via `el()` con text node)
  - `showHITLModal`: query, proposal
- [x] **No uso de `innerHTML`** con datos del usuario — solo `textContent` o `el()` que crea text nodes
- [x] **DOMPurify NO necesario** porque nunca insertamos HTML crudo

## ✅ Content Security Policy

CSP configurado en headers HTTP (Vercel/Netlify) y como fallback meta en `index.html`:

```
default-src 'self';
script-src 'self' https://browserframe-ancestors 'none';
```

**Recomendación adicional**: añadir `<meta http-equiv="Content-Security-Policy">` en `index.html` para entornos sin headers configurables.

## ✅ Inputs

- [x] Query sanitizada: trim + length limit (recomendado: max 1000 chars)
- [x] Checkpoint IDs validados como UUIDs antes de cargar
- [x] Workflow IDs generados con `crypto.randomUUID()` (collision-resistant)

## ✅ Service Worker

- [x] `sw.js` solo cachea archivos del propio origen
- [x] No expone información sensible en cache
- [x] `updateViaCache: 'none'` para el SW
- [x] Headers `Service-Worker-Allowed: /` configurados

## ✅ Persistencia (IndexedDB)

- [x] Datos sensibles (si los hubiera) deben cifrarse antes de almacenar
- [x] Migraciones validan schema antes de aplicar
- [x] No se persiste PII (todo es workflow state local)

## ✅ HTTPS

- [x] Producción solo sobre HTTPS (Lighthouse assert lo verifica)
- [x] HSTS recomendado en headers (añadir tras primer deploy)

## ✅ Dependencias

- [x] Sin dependencias runtime = supply chain attack surface = 0
- [x] Dependencias dev (Vitest, Playwright, ESLint) auditadas vía `npm audit`

## ✅ Monitoring & Logging

- [x] Sentry con `beforeSend` que strip PII (`user.ip_address`)
- [x] Console logs solo en dev (no exponen datos en prod)
- [x] Plausible sin cookies (GDPR compliant)

## ⚠️ Pendiente para v1.0 (post-MVP)

- [ ] Auditoría externa con herramienta automatizada (OWASP ZAP)
- [ ] Penetration test si se añaden features de auth
- [ ] CSP reporting endpoint para monitorizar violaciones
- [ ] Subresource Integrity (SRI) cuando se añadan CDN scripts (Sentry, Plausible)
- [ ] Rate limiting en backend cuando se integre LLM API

## 🔒 Reportar vulnerabilidad

Email: security@multi-agent-orchestrator.dev (placeholder)
GPG: (añadir cuando proceda)

**No** abras issues públicos para vulnerabilidades de seguridad.
