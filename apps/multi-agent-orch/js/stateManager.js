/**
 * stateManager.js
 * Patrón Observer/Pub-Sub con validación de estado.
 * Centraliza el estado global de la aplicación.
 *
 * Expone:
 *   - export class StateManager    (la clase)
 *   - export const stateManager    (singleton — default para tests y código)
 *   - export class WorkflowState
 *
 * @module StateManager
 */

import { db } from './persistence.js';

/**
 * Estado de un workflow — inmutable una vez creado (se clona con update())
 */
export class WorkflowState {
  constructor(data = {}) {
    this.workflowId = data.workflowId || crypto.randomUUID();
    this.workflowType = data.workflowType || 'custom';
    this.query = data.query || '';
    this.currentNode = data.currentNode || 'research';
    this.nextNode = data.nextNode || null;
    this.iteration = data.iteration || 0;
    this.maxIterations = data.maxIterations || 5;
    this.status = data.status || 'pending'; // pending, running, paused, completed, failed
    this.messages = data.messages || [];
    this.researchData = data.researchData || null;
    this.proposal = data.proposal || null;
    this.executionResult = data.executionResult || null;
    this.supervisorDecision = data.supervisorDecision || null;
    this.qualityScore = data.qualityScore || 0;
    this.errors = data.errors || [];
    this.humanApproval = data.humanApproval || null;
    this.startedAt = data.startedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.checkpoints = data.checkpoints || [];
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(json) {
    return new WorkflowState(json);
  }

  /**
   * Crea un nuevo estado con los cambios aplicados (inmutabilidad)
   */
  update(patch) {
    return new WorkflowState({ ...this, ...patch });
  }
}

/**
 * StateManager — gestor de estado con pub-sub
 *
 * API de eventos (nombres exactos usados por app.js y orchestrator.js):
 *   agents:update           — stats de agentes actualizados
 *   workflow:created        — nuevo workflow añadido
 *   workflow:updated        — workflow modificado
 *   workflow:log            — entrada de log
 *   workflow:complete       — workflow llegó a estado terminal
 *   workflow:error          — error en workflow
 *   workflow:checkpoint     — checkpoint creado
 *   orchestrator:approval_required — HITL necesita decisión humana
 *   orchestrator:checkpoint_created — alias para checkpoint
 *   ui:theme-changed        — tema cambiado
 *   ui:view-changed         — vista de navegación cambiada
 *   ui:connection-changed    — online/offline cambió
 *   history:added           — entrada de historial añadida
 */
export class StateManager {
  constructor() {
    this._state = {
      workflows: new Map(),
      approvals: new Map(),
      checkpoints: new Map(),
      history: [],
      agents: new Map(),
      ui: {
        currentView: 'dashboard',
        theme: (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'dark',
        connection: (typeof navigator !== 'undefined' && navigator.onLine) ? 'online' : 'offline',
        notifications: [],
      },
      active: {
        workflow: null,
      },
    };
    this._listeners = new Map();
    this._history = [];
  }

  // ============================================
  // SUBSCRIPTION (pub/sub)
  // ============================================

  /** Registra un listener para un evento. Retorna función para desuscribirse. */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /** Alias para on() */
  subscribe(event, callback) {
    return this.on(event, callback);
  }

  /** Desregistra un listener */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  /** Emite un evento a todos los listeners registrados */
  emit(event, payload) {
    this._listeners.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[StateManager] Listener error for ${event}:`, err);
      }
    });
    // listeners wildcard
    this._listeners.get('*')?.forEach((cb) => cb({ event, payload }));
  }

  // ============================================
  // GENERIC GET/SET STATE
  // ============================================

  /**
   * setState(branch, value) — actualiza una rama del estado
   * setState(patchObject)  — mergea patch en _state
   */
  setState(branch, value) {
    if (typeof branch === 'object' && branch !== null) {
      Object.assign(this._state, branch);
      this.emit('state:patched', branch);
      return this._state;
    }
    if (typeof branch === 'string') {
      if (!(branch in this._state)) {
        this._state[branch] = {};
      }
      if (value !== undefined) {
        if (this._state[branch] instanceof Map) {
          if (value && typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => this._state[branch].set(k, v));
          }
        } else {
          this._state[branch] = { ...(this._state[branch] || {}), ...value };
        }
      }
      this.emit(`${branch}:updated`, this._state[branch]);
      return this._state[branch];
    }
  }

  /**
   * getState(branch) — retorna una rama del estado.
   * Si branch es undefined, retorna el estado completo.
   * Si la rama es Map, la convierte a objeto plano.
   */
  getState(branch) {
    if (branch === undefined) return this._state;
    const value = this._state[branch];
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  }

  // ============================================
  // WORKFLOWS
  // ============================================

  addWorkflow(workflowState) {
    this._state.workflows.set(workflowState.workflowId, workflowState);
    this._persist('workflows', workflowState);
    this.emit('workflow:created', { workflow: workflowState });
    return workflowState;
  }

  updateWorkflow(id, patch) {
    const current = this._state.workflows.get(id);
    if (!current) throw new Error(`Workflow ${id} not found`);
    const updated = current.update(patch);
    this._state.workflows.set(id, updated);
    this._persist('workflows', updated);
    this.emit('workflow:updated', updated);
    return updated;
  }

  getWorkflow(id) {
    return this._state.workflows.get(id);
  }

  getAllWorkflows() {
    return Array.from(this._state.workflows.values());
  }

  removeWorkflow(id) {
    const wf = this._state.workflows.get(id);
    if (wf) {
      this._state.workflows.delete(id);
      db.delete('workflows', id).catch(() => {});
      this.emit('workflow:removed', wf);
    }
    return wf;
  }

  // ============================================
  // APPROVALS (HITL)
  // ============================================

  addApproval(approval) {
    this._state.approvals.set(approval.id, approval);
    this._persist('approvals', approval);
    this.emit('approval:added', approval);
    return approval;
  }

  updateApproval(id, patch) {
    const current = this._state.approvals.get(id);
    if (!current) throw new Error(`Approval ${id} not found`);
    const updated = { ...current, ...patch };
    this._state.approvals.set(id, updated);
    this._persist('approvals', updated);
    this.emit('approval:updated', updated);
    return updated;
  }

  getApproval(id) {
    return this._state.approvals.get(id);
  }

  getPendingApprovals() {
    return Array.from(this._state.approvals.values()).filter((a) => a.status === 'pending');
  }

  // ============================================
  // CHECKPOINTS (Time Travel)
  // ============================================

  addCheckpoint(checkpoint) {
    this._state.checkpoints.set(checkpoint.id, checkpoint);
    this._persist('checkpoints', checkpoint);
    // Emitir en DOS nombres para cubrir ambos subscribers
    this.emit('workflow:checkpoint', checkpoint);
    this.emit('orchestrator:checkpoint_created', checkpoint);
    return checkpoint;
  }

  getCheckpointsForWorkflow(workflowId) {
    return Array.from(this._state.checkpoints.values())
      .filter((cp) => cp.workflowId === workflowId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // ============================================
  // HISTORY
  // ============================================

  addHistory(event) {
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...event,
    };
    this._state.history.unshift(entry);
    this._history.push(entry);
    if (this._state.history.length > 500) {
      this._state.history = this._state.history.slice(0, 500);
    }
    this._persist('history', entry);
    this.emit('history:added', entry);
    return entry;
  }

  getHistory(limit = 100) {
    return this._state.history.slice(0, limit);
  }

  // ============================================
  // LOG (conveniencia para workflow:log)
  // ============================================

  log(level, source, message, extra = {}) {
    const entry = { level, source, message, timestamp: new Date().toISOString(), ...extra };
    this.emit('workflow:log', entry);
    return entry;
  }

  // ============================================
  // AGENTS
  // ============================================

  updateAgentStats(agentId, stats) {
    const current = this._state.agents.get(agentId) || {
      agentId,
      executions: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
    };
    const updated = { ...current, ...stats, agentId, updatedAt: new Date().toISOString() };
    this._state.agents.set(agentId, updated);
    this._persist('agent_stats', updated);
    this.emit('agents:update', Object.fromEntries(this._state.agents));
    return updated;
  }

  getAgentStats(agentId) {
    return this._state.agents.get(agentId);
  }

  getAllAgentStats() {
    return Object.fromEntries(this._state.agents);
  }

  // ============================================
  // UI STATE
  // ============================================

  setView(view) {
    this._state.ui.currentView = view;
    this.emit('ui:view-changed', view);
  }

  /**
   * setTheme(theme) — aplica tema y persiste en localStorage
   * Aplica data-theme a <html> (documentElement) para CSS selectors
   */
  setTheme(theme) {
    this._state.ui.theme = theme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      // También mantener en #app para compatibilidad legacy
      const app = document.querySelector('#app');
      if (app) app.setAttribute('data-theme', theme);
    }
    this.emit('ui:theme-changed', theme);
  }

  setConnection(status) {
    if (this._state.ui.connection === status) return;
    this._state.ui.connection = status;
    this.emit('ui:connection-changed', status);
  }

  // ============================================
  // ACTIVE WORKFLOW
  // ============================================

  setActiveWorkflow(workflow) {
    this._state.active.workflow = workflow;
    this._state.active.workflowId = workflow?.workflowId || null;
    this.emit('active:workflow-changed', workflow);
  }

  getActiveWorkflowId() {
    return this._state.active.workflowId;
  }

  // ============================================
  // PERSISTENCE & HYDRATE
  // ============================================

  async _persist(store, data) {
    try {
      await db.put(store, data);
    } catch (err) {
      console.error(`[StateManager] Persist to ${store} failed:`, err);
    }
  }

  /**
   * hydrate() — carga todo el estado desde IndexedDB.
   * Sin args: carga desde persistencia.
   * Con workflow: lo añade al estado en memoria.
   */
  async hydrate(arg) {
    // Caso: workflow individual (tests / time-travel restore)
    if (arg && typeof arg === 'object' && (arg.workflowId || arg.id)) {
      const wf = arg.workflowId ? arg : new WorkflowState(arg);
      this._state.workflows.set(wf.workflowId, wf);
      this.emit('workflow:hydrated', wf);
      return wf;
    }

    // Caso: carga completa desde persistencia
    try {
      const [workflows, approvals, checkpoints, history, agentStats] = await Promise.all([
        db.getAll('workflows'),
        db.getAll('approvals'),
        db.getAll('checkpoints'),
        db.getAll('history'),
        db.getAll('agent_stats'),
      ]);

      workflows.forEach((w) =>
        this._state.workflows.set(w.workflowId || w.id, WorkflowState.fromJSON(w))
      );
      approvals.forEach((a) => this._state.approvals.set(a.id, a));
      checkpoints.forEach((c) => this._state.checkpoints.set(c.id, c));
      this._state.history = history
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 500);
      agentStats.forEach((s) => this._state.agents.set(s.agentId, s));

      this.emit('state:hydrated', this._state);
    } catch (err) {
      console.error('[StateManager] Hydration failed:', err);
    }
  }

  /** reset() — limpia todo el estado en memoria (tests) */
  reset() {
    this._state.workflows = new Map();
    this._state.approvals = new Map();
    this._state.checkpoints = new Map();
    this._state.history = [];
    this._state.agents = new Map();
    this._listeners = new Map();
  }

  /** getSnapshot() — serialización completa del estado */
  getSnapshot() {
    return {
      workflows: this.getAllWorkflows(),
      approvals: Array.from(this._state.approvals.values()),
      checkpoints: Array.from(this._state.checkpoints.values()),
      history: this.getHistory(),
      agents: this.getAllAgentStats(),
      ui: { ...this._state.ui },
    };
  }
}

// ============================================
// SINGLETON: instancia compartida
// ============================================
const stateManager = new StateManager();

export { StateManager, WorkflowState };
export { stateManager };
export default stateManager;
