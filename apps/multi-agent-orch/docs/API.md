# 🔌 API Reference

Documentación de los módulos JS públicos para contribuidores.

## Tabla de contenidos

- [`Persistence`](#persistence) — IndexedDB wrapper
- [`StateManager`](#statemanager) — Observer/Pub-Sub
- [`Agents`](#agents) — 4 agentes base
- [`Orchestrator`](#orchestrator) — DAG engine
- [`UI`](#ui) — Render reactivo
- [`Monitoring`](#monitoring) — Sentry + Plausible

---

## Persistence

Wrapper tipado sobre IndexedDB con migraciones de schema.

### `Persistence.init()`

Abre la DB y ejecuta migraciones pendientes. Idempotente.

```js
await Persistence.init();
```

### `Persistence.saveWorkflow(workflow)`

Upsert de un workflow. `workflow.workflowId` es la primary key.

```js
await Persistence.saveWorkflow({
  workflowId: 'wf-123',
  workflowType: 'research',
  query: 'investiga X',
  status: 'running',
  startedAt: Date.now(),
  iteration: 1,
  maxIterations: 5,
  messages: [],
});
```

### `Persistence.loadAllWorkflows()`

Retorna array de todos los workflows persistidos, ordenados por `startedAt` desc.

```js
const workflows = await Persistence.loadAllWorkflows();
```

### `Persistence.deleteWorkflow(workflowId)`

Elimina un workflow y sus checkpoints asociados.

```js
await Persistence.deleteWorkflow('wf-123');
```

### `Persistence.saveCheckpoint(checkpoint)` / `loadCheckpoints(workflowId)`

Checkpoints permiten Time Travel.

```js
await Persistence.saveCheckpoint({
  id: 'cp-456',
  workflowId: 'wf-123',
  node: 'research',
  iteration: 1,
  state: { /* snapshot completo */ },
  ts: Date.now(),
});
const checkpoints = await Persistence.loadCheckpoints('wf-123');
```

---

## StateManager

Patrón Observer con eventos nombrados por namespace (`recurso:evento`).

### `StateManager.subscribe(event, handler)`

```js
const unsubscribe = StateManager.subscribe('workflow:update', (payload) => {
  console.log(payload.workflow);
});
// Más tarde:
unsubscribe();
```

### `StateManager.setState(key, value)`

Actualiza rama del estado y emite evento `<key>:update`.

```js
StateManager.setState('workflows', { wf1: { /* ... */ } });
// → emite 'workflows:update' con el nuevo valor
```

### `StateManager.getState(key)`

```js
const workflows = StateManager.getState('workflows');
```

### `StateManager.emit(event, payload)`

Emite un evento custom sin modificar estado.

```js
StateManager.emit('workflow:log', { level: 'info', message: '...' });
```

### `StateManager.hydrate(workflow)`

Carga un workflow desde persistencia al estado en memoria (sin disparar re-render).

### `StateManager.log(level, source, message)`

Helper que crea un log entry con timestamp y lo emite por `workflow:log`.

```js
StateManager.log('error', 'orchestrator', 'Falló la conexión con el LLM');
```

### Eventos disponibles

| Evento | Payload | Cuándo se emite |
|--------|---------|-----------------|
| `agents:update` | `{ agents }` | Tras `Orchestrator.runAgent` |
| `workflow:created` | `{ workflow }` | Al crear un workflow nuevo |
| `workflow:update` | `{ workflow }` | En cada transición de estado |
| `workflow:checkpoint` | `{ workflow, checkpoint }` | Al guardar checkpoint |
| `workflow:log` | `entry` | En cada paso del DAG |
| `workflow:complete` | `{ workflow }` | Al finalizar (success/fail) |
| `workflow:error` | `{ workflow, error }` | Excepción no manejada |
| `workflow:hitl-required` | `{ workflow }` | Cuando Supervisor pausa |
| `agents:update` | `{ agents }` | Stats de agentes cambian |

---

## Agents

Cada agente implementa la interfaz:

```js
{
  id: 'research',           // único
  name: 'Research',
  icon: '🔍',
  description: '...',
  capabilities: ['web-search', 'summarize'],
  status: 'idle' | 'running' | 'success' | 'failed',
  stats: { executions, successes, failures, avgTime },

  async execute({ query, state, signal }) {
    // retorna { output, artifacts, durationMs }
  },

  getSuccessRate() {
    // retorna 0-100
  },

  updateStats({ success, duration }) {
    // actualiza contadores
  },
}
```

Para añadir un agente custom, edita `js/agents.js` y regístralo en el DAG del orchestrator.

---

## Orchestrator

### `Orchestrator.startWorkflow({ query, type? })`

Crea un workflow nuevo y comienza la ejecución. Retorna el workflow.

```js
const wf = await Orchestrator.startWorkflow({ query: 'investiga IA' });
```

### `Orchestrator.pause(workflowId)` / `Orchestrator.resume(workflowId)`

Control de ejecución. `resume` requiere que `workflow.humanApproval` esté definido si está en HITL.

### `Orchestrator.cancel(workflowId)`

Marca como `cancelled` y detiene la ejecución.

### `Orchestrator.timeTravel(checkpointId)`

Restaura el estado a un checkpoint previo. Emite `workflow:update` con el nuevo estado.

### `Orchestrator.resumeHumanApproval(workflowId, decision)`

Resume un workflow pausado por HITL.

```js
// decision = { type: 'approve' | 'reject' | 'modify', modifiedText?: string }
Orchestrator.resumeHumanApproval('wf-123', { type: 'modify', modifiedText: '...' });
```

### DAG

El DAG por defecto es:

```
research → drafting → supervisor ─┬─► executor → end
                                  └─► (HITL si quality < 0.7)
```

Para personalizar el DAG, edita `Orchestrator.DAG` en `js/orchestrator.js`.

---

## UI

### `UI.renderAgentGrid(agents)`

Re-renderiza la grid de agentes. Llamado automáticamente vía suscripción a StateManager.

### `UI.showHITLModal(workflow, onDecision)`

Muestra el modal de aprobación. `onDecision(decision)` se invoca al cerrar.

### `UI.notify(message, type, durationMs?)`

Toast notification. Tipos: `info | success | warning | error`. Si `durationMs = 0`, persistente.

### `UI.setupInstallPrompt()`

Listener para `beforeinstallprompt`. Llama automáticamente en `app.js` bootstrap.

### `UI.setupKeyboardShortcuts(handlers)`

```js
UI.setupKeyboardShortcuts({
  submit: () => Orchestrator.startWorkflow(...),
  togglePause: () => /* ... */,
  reset: () => /* ... */,
  escape: () => /* cerrar modal */,
});
```

---

## Monitoring

### `Monitoring.init()`

Inicializa Sentry + Plausible. No-op en localhost. Llamar una vez en bootstrap.

### `Monitoring.trackEvent(name, props)`

Trackea evento custom. Funciona con Plausible o fallback console en dev.

```js
Monitoring.trackEvent('workflow_completed', { type: 'research', duration: 4200 });
```

### Configuración

Define `window.__CONFIG__` antes de cargar `monitoring.js`:

```html
<script>
  window.__CONFIG__ = {
    sentryDsn: 'https://...@sentry.io/...',
    plausibleDomain: 'tudominio.com',
    environment: 'production',
    release: 'pwa@1.0.0',
  };
</script>
<script src="js/monitoring.js"></script>
```
