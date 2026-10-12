/**
 * ui.js - Render reactivo, componentes del dashboard y notificaciones
 *
 * Responsabilidad única: conectar el estado (stateManager) con el DOM.
 * No contiene lógica de negocio — solo presentación y captura de eventos.
 *
 * Arquitectura:
 *   stateManager ─(subscribe)─► UI ─(events)─► orchestrator/stateManager
 *
 * @module UI
 */

'use strict';

// ============================================================================
// SELECTORES Y CONSTANTES
// ============================================================================

const SELECTORS = {
  // IDs reales del index.html
  agentGrid: '#agentsGrid',
  workflowList: '#workflowList',
  logStream: '#logs',
  metricsPanel: '#dagContainer', // el panel de métricas usa el contenedor del DAG
  queryInput: '#query-input',
  humanApprovalModal: '#approvalModal',
  notificationStack: '#toastContainer',
  checkpointTimeline: '#checkpointList',
  dagFlow: '#dagFlow',
};

const ANIMATION_DURATIONS = {
  notificationFade: 300,
  workflowTransition: 250,
  modalSlide: 200,
};

const ICONS = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };

// ============================================================================
// UTILIDADES DOM
// ============================================================================

/**
 * Escapa HTML para prevenir XSS. Crítico en render de datos del usuario
 * (logs, queries, nombres de workflow).
 */
function escapeHTML(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Crea elemento con atributos y children de forma declarativa.
 */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') node.className = v;
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => (node.dataset[dk] = dv));
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v != null) node.setAttribute(k, v);
  });
  children.flat().forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ============================================================================
// RENDER: DAG NODES (actualiza el grafo visual)
// ============================================================================

/**
 * Actualiza el estado visual de los nodos DAG en el dashboard.
 */
function updateDAGNode(nodeName, status) {
  const dagFlow = document.querySelector(SELECTORS.dagFlow);
  if (!dagFlow) return;
  const node = dagFlow.querySelector(`[data-node="${nodeName}"]`);
  if (!node) return;
  node.dataset.status = status;
  node.classList.remove('dag-node--idle', 'dag-node--active', 'dag-node--done', 'dag-node--error');
  node.classList.add(`dag-node--${status}`);
  const statusEl = node.querySelector('.dag-status');
  if (statusEl) statusEl.textContent = status;
}

// ============================================================================
// RENDER: AGENTE GRID
// ============================================================================

/**
 * Renderiza la grid de agentes con sus stats en vivo.
 */
function renderAgentGrid(agents) {
  const grid = document.querySelector(SELECTORS.agentGrid);
  if (!grid) return;

  grid.innerHTML = '';
  const agentsObj = agents instanceof Map ? Object.fromEntries(agents) : agents;
  Object.values(agentsObj).forEach((agent) => {
    const successRate =
      agent.stats?.executions > 0
        ? ((agent.stats?.successes || 0) / agent.stats.executions) * 100
        : 0;
    const card = el(
      'article',
      {
        className: `agent-card agent-card--${agent.status || 'idle'}`,
        dataset: { agentId: agent.id },
        role: 'region',
        'aria-label': `Agente ${agent.name}, ${agent.description}`,
      },
      el(
        'header',
        { className: 'agent-card__header' },
        el('span', { className: 'agent-card__icon', 'aria-hidden': 'true' }, agent.icon || '🤖'),
        el('h3', { className: 'agent-card__name' }, agent.name),
        el(
          'span',
          {
            className: `agent-card__status agent-card__status--${agent.status || 'idle'}`,
            'aria-live': 'polite',
          },
          agent.status || 'idle'
        )
      ),
      el('p', { className: 'agent-card__desc' }, agent.description || ''),
      el(
        'dl',
        { className: 'agent-card__stats' },
        el('div', {}, el('dt', {}, 'Ejecuciones'), el('dd', {}, String(agent.stats?.executions || 0))),
        el('div', {}, el('dt', {}, 'Éxito'), el('dd', {}, `${successRate.toFixed(1)}%`)),
        el(
          'div',
          {},
          el('dt', {}, 'Tiempo medio'),
          el('dd', {}, fmtDuration(agent.stats?.avgTime || 0))
        )
      ),
      el(
        'ul',
        { className: 'agent-card__caps', 'aria-label': 'Capacidades' },
        ...(agent.capabilities || []).map((cap) => el('li', { className: 'badge' }, cap))
      )
    );
    grid.appendChild(card);
  });
}

// ============================================================================
// RENDER: WORKFLOW LIST
// ============================================================================

/**
 * Renderiza la lista de workflows.
 */
function renderWorkflowList(workflows) {
  const list = document.querySelector(SELECTORS.workflowList);
  if (!list) return;

  list.innerHTML = '';
  const workflowsObj = workflows instanceof Map ? Object.fromEntries(workflows) : workflows;
  const sorted = Object.values(workflowsObj).sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
  );

  if (sorted.length === 0) {
    list.appendChild(
      el('p', { className: 'empty-state' }, 'No hay workflows aún. Lanza una consulta para empezar.')
    );
    return;
  }

  sorted.forEach((wf) => {
    const item = el(
      'article',
      {
        className: `workflow-item workflow-item--${wf.status || 'pending'}`,
        dataset: { workflowId: wf.workflowId },
        tabindex: '0',
        role: 'button',
        'aria-label': `Workflow ${wf.workflowType}: ${wf.status}`,
      },
      el(
        'header',
        { className: 'workflow-item__header' },
        el(
          'span',
          { className: `workflow-item__status-dot status-dot--${wf.status || 'pending'}`, 'aria-hidden': 'true' }
        ),
        el('h4', { className: 'workflow-item__title' }, escapeHTML(wf.query || wf.workflowType)),
        el(
          'time',
          { className: 'workflow-item__time', datetime: new Date(wf.startedAt).toISOString() },
          fmtTime(wf.startedAt)
        )
      ),
      el(
        'div',
        { className: 'workflow-item__progress' },
        el('div', {
          className: 'workflow-item__progress-bar',
          style: `width:${wf.iteration ? Math.min(100, (wf.iteration / wf.maxIterations) * 100) : 0}%`,
          role: 'progressbar',
          'aria-valuemin': '0',
          'aria-valuemax': String(wf.maxIterations),
          'aria-valuenow': String(wf.iteration || 0),
        })
      ),
      el(
        'footer',
        { className: 'workflow-item__footer' },
        el('span', { className: 'badge' }, wf.workflowType),
        el('span', { className: 'badge' }, `Iter ${wf.iteration || 0}/${wf.maxIterations}`),
        wf.status === 'paused' &&
          el(
            'button',
            {
              className: 'btn btn--sm btn--primary',
              onclick: (e) => {
                e.stopPropagation();
                window.UI.handleResume(wf.workflowId);
              },
            },
            'Reanudar'
          )
      )
    );
    list.appendChild(item);
  });
}

// ============================================================================
// RENDER: LOG STREAM
// ============================================================================

/**
 * Stream de eventos del orquestador. Auto-scroll al final.
 */
function appendLog(entry) {
  const stream = document.querySelector(SELECTORS.logStream);
  if (!stream) return;

  const isAtBottom =
    stream.scrollHeight - stream.scrollTop - stream.clientHeight < 100;
  const wasAutoscroll = stream.dataset.autoscroll !== 'false';

  const node = el(
    'li',
    {
      className: `log-entry log-entry--${entry.level || 'info'}`,
      dataset: { ts: String(entry.timestamp || Date.now()) },
    },
    el(
      'time',
      { className: 'log-entry__time' },
      fmtTime(entry.timestamp || Date.now())
    ),
    el(
      'span',
      { className: `log-entry__level log-entry__level--${entry.level || 'info'}` },
      (entry.level || 'info').toUpperCase()
    ),
    el('span', { className: 'log-entry__source' }, escapeHTML(entry.source || 'system')),
    el('p', { className: 'log-entry__message' }, escapeHTML(entry.message))
  );
  stream.appendChild(node);

  // Capacidad máxima
  const MAX_ENTRIES = 500;
  while (stream.children.length > MAX_ENTRIES) stream.firstChild.remove();

  if (isAtBottom && wasAutoscroll) stream.scrollTop = stream.scrollHeight;
}

// ============================================================================
// RENDER: METRICS PANEL
// ============================================================================

/**
 * Panel de métricas del dashboard.
 */
function renderMetrics(workflows) {
  const panel = document.querySelector(SELECTORS.metricsPanel);
  if (!panel) return;

  const workflowsObj = workflows instanceof Map ? Object.fromEntries(workflows) : (workflows || {});
  const all = Object.values(workflowsObj);
  const completed = all.filter((w) => w.status === 'completed');
  const failed = all.filter((w) => w.status === 'failed');
  const avgQuality =
    completed.length > 0
      ? completed.reduce((s, w) => s + (w.qualityScore || 0), 0) / completed.length
      : 0;

  panel.innerHTML = '';
  panel.appendChild(
    el('div', { className: 'metric' },
      el('span', { className: 'metric__label' }, 'Total'),
      el('span', { className: 'metric__value' }, String(all.length))
    )
  );
  panel.appendChild(
    el('div', { className: 'metric metric--success' },
      el('span', { className: 'metric__label' }, 'Completados'),
      el('span', { className: 'metric__value' }, String(completed.length))
    )
  );
  panel.appendChild(
    el('div', { className: 'metric metric--danger' },
      el('span', { className: 'metric__label' }, 'Fallidos'),
      el('span', { className: 'metric__value' }, String(failed.length))
    )
  );
  panel.appendChild(
    el('div', { className: 'metric' },
      el('span', { className: 'metric__label' }, 'Calidad media'),
      el('span', { className: 'metric__value' }, `${(avgQuality * 100).toFixed(0)}%`)
    )
  );

  // Actualizar stat cards del dashboard
  const statWorkflows = document.querySelector('#statWorkflows');
  const statCompleted = document.querySelector('#statCompleted');
  const statApprovals = document.querySelector('#statApprovals');
  const statCheckpoints = document.querySelector('#statCheckpoints');
  if (statWorkflows) statWorkflows.textContent = String(all.filter((w) => w.status === 'running').length);
  if (statCompleted) statCompleted.textContent = String(completed.length);
  if (statApprovals) statApprovals.textContent = '0';
  if (statCheckpoints)
    statCheckpoints.textContent = String(
      all.reduce((sum, w) => sum + (w.checkpoints?.length || 0), 0)
    );
}

// ============================================================================
// RENDER: CHECKPOINT TIMELINE
// ============================================================================

/**
 * Renderiza la timeline de checkpoints para time travel.
 */
function renderCheckpointTimeline(workflow) {
  const timeline = document.querySelector(SELECTORS.checkpointTimeline);
  if (!timeline) return;

  timeline.innerHTML = '';
  const checkpoints = workflow?.checkpoints || [];
  if (checkpoints.length === 0) {
    timeline.appendChild(
      el('p', { className: 'empty-state' }, 'Aún no hay checkpoints. Los checkpoints se crean automáticamente durante la ejecución.'));
    return;
  }

  checkpoints.forEach((cp, i) => {
    const node = el(
      'button',
      {
        className: 'checkpoint',
        dataset: { checkpointId: cp.id },
        onclick: () => window.UI.handleTimeTravel(cp.id),
        'aria-label': `Checkpoint ${i + 1}: ${cp.node || 'checkpoint'} en iter ${cp.iteration}`,
      },
      el('span', { className: 'checkpoint__dot' }),
      el('span', { className: 'checkpoint__label' }, `Iter ${cp.iteration || i + 1}`),
      el('span', { className: 'checkpoint__node' }, cp.node || 'checkpoint')
    );
    timeline.appendChild(node);
  });
}

// ============================================================================
// HITL MODAL
// ============================================================================

/**
 * Muestra el modal de aprobación humana (Human-in-the-Loop).
 * Llama este método cuando llega el evento 'orchestrator:approval_required'.
 *
 * Modal HTML: #approvalModal (index.html)
 *   - #modalProposal        → texto de la propuesta
 *   - #modalApprovalAgent   → nombre del agente que generó la propuesta
 *   - #approvalReason       → textarea para comentario del usuario
 *   - #btnApprove           → botón aprobar
 *   - #btnReject            → botón rechazar
 */
function showHITLModal(approval, onDecision) {
  const modal = document.querySelector(SELECTORS.humanApprovalModal);
  if (!modal) return;

  const proposalEl = modal.querySelector('#modalProposal');
  const agentEl = modal.querySelector('#modalApprovalAgent');
  const reasonEl = modal.querySelector('#approvalReason');
  const approveBtn = modal.querySelector('#btnApprove');
  const rejectBtn = modal.querySelector('#btnReject');

  // Poblar con datos del approval/workflow
  if (proposalEl) proposalEl.textContent = approval.proposal?.text || approval.proposal || '(sin propuesta)';
  if (agentEl) agentEl.textContent = approval.type || 'Drafting';
  if (reasonEl) reasonEl.value = '';

  // Mostrar modal
  modal.hidden = false;
  modal.removeAttribute('hidden');
  modal.classList.add('modal--active');

  // Focus en textarea o botón
  (reasonEl || approveBtn || rejectBtn)?.focus();

  // Limpiar handlers anteriores
  const cleanup = () => {
    modal.classList.remove('modal--active');
    modal.setAttribute('hidden', '');
    modal.hidden = true;
  };

  // Botón aprobar
  if (approveBtn) {
    approveBtn.onclick = null; // reset
    approveBtn.addEventListener('click', () => {
      cleanup();
      onDecision({ type: 'approved', reason: reasonEl?.value || '' });
    }, { once: true });
  }

  // Botón rechazar
  if (rejectBtn) {
    rejectBtn.onclick = null;
    rejectBtn.addEventListener('click', () => {
      cleanup();
      onDecision({ type: 'rejected', reason: reasonEl?.value || '' });
    }, { once: true });
  }

  // Cerrar con backdrop
  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.onclick = null;
    el.addEventListener('click', () => {
      cleanup();
      onDecision({ type: 'rejected', reason: 'cancelado por usuario' });
    }, { once: true });
  });

  // Cerrar con Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      cleanup();
      onDecision({ type: 'rejected', reason: 'cancelado por usuario' });
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

// ============================================================================
// NOTIFICACIONES TOAST
// ============================================================================

/**
 * Sistema de notificaciones no-bloqueante.
 * Auto-dismiss para info/success; persistente para warning/error.
 */
function notify(message, type = 'info', duration = 4000) {
  const stack = document.querySelector(SELECTORS.notificationStack);
  if (!stack) return;

  const toast = el(
    'div',
    {
      className: `toast toast--${type}`,
      role: type === 'error' ? 'alert' : 'status',
      'aria-live': type === 'error' ? 'assertive' : 'polite',
    },
    el('span', { className: 'toast__icon', 'aria-hidden': 'true' }, ICONS[type] || 'ℹ'),
    el('p', { className: 'toast__message' }, escapeHTML(message))
  );

  stack.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  const dismiss = () => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), ANIMATION_DURATIONS.notificationFade);
  };
  toast.addEventListener('click', dismiss);

  if (duration > 0 && type !== 'error') {
    setTimeout(dismiss, duration);
  }
}

// ============================================================================
// PWA INSTALL PROMPT
// ============================================================================

let _deferredInstallPrompt = null;

/**
 * Configura el deferred install prompt del navegador.
 */
function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    const btn = document.querySelector('#btnInstall');
    if (btn) btn.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    _deferredInstallPrompt = null;
    const btn = document.querySelector('#btnInstall');
    if (btn) btn.hidden = true;
    notify('App instalada correctamente 🎉', 'success');
  });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Atajos globales:
 *   Ctrl/Cmd+Enter → lanzar query
 *   Ctrl/Cmd+.     → pausar/reanudar
 *   Ctrl+Shift+R   → reset (con confirmación)
 *   Esc            → cerrar modales
 */
function setupKeyboardShortcuts(handlers) {
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter') {
      e.preventDefault();
      handlers.submit?.();
    } else if (mod && e.key === '.') {
      e.preventDefault();
      handlers.togglePause?.();
    } else if (mod && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      handlers.reset?.();
    } else if (e.key === 'Escape') {
      handlers.escape?.();
    }
  });
}

// ============================================================================
// NAVIGATION (tab switching)
// ============================================================================

/**
 * Inicializa la navegación por tabs. Lo llama app.js desde bootstrap.
 */
function setupNavigation() {
  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('.nav-item[data-view]');
    if (!navBtn) return;

    const view = navBtn.dataset.view;
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
      btn.removeAttribute('aria-current');
    });
    navBtn.classList.add('active');
    navBtn.setAttribute('aria-current', 'page');

    document.querySelectorAll('.view').forEach((v) => {
      const match = v.id === `view-${view}`;
      if (match) {
        v.removeAttribute('hidden');
        v.hidden = false;
        v.classList.add('active');
      } else {
        v.setAttribute('hidden', '');
        v.hidden = true;
        v.classList.remove('active');
      }
    });
  });
}

// ============================================================================
// API PÚBLICA
// ============================================================================

export const UI = {
  // Renders
  renderAgentGrid,
  renderWorkflowList,
  renderMetrics,
  renderCheckpointTimeline,
  updateDAGNode,

  // Log
  appendLog,

  // Modals
  showHITLModal,

  // Notifications
  notify,

  // PWA / shortcuts
  setupInstallPrompt,
  setupKeyboardShortcuts,
  setupNavigation,

  // Handlers (conectados por app.js bootstrap)
  handleSubmit: () => {},
  handlePause: () => {},
  handleResume: () => {},
  handleReset: () => {},
  handleTimeTravel: () => {},
};

export default UI;

// Compatibilidad con onclick inline en HTML y con código legacy
window.UI = UI;
