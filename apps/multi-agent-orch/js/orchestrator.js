/**
 * orchestrator.js
 * DAG engine: ejecuta el flujo cíclico de agentes, maneja HITL y Time Travel.
 *
 * Flujo:
 *   research → supervisor → (loop si quality<0.7) → drafting → [HITL] → executor → END
 *
 * @module Orchestrator
 */

import { agents, getAgent } from './agents.js';
import { stateManager, WorkflowState } from './stateManager.js';

const NODE_FUNCTIONS = {
  research: 'runResearch',
  supervisor: 'runSupervisor',
  drafting: 'runDrafting',
  executor: 'runExecutor'
};

const DAG_EDGES = {
  research: 'supervisor',
  supervisor: 'drafting', // puede loop-ear a research vía decisión
  drafting: 'executor',
  executor: '__end__'
};

export class Orchestrator {
  constructor() {
    this.running = new Map(); // workflowId → AbortController
    this.hitlWaiters = new Map(); // approvalId → Promise resolver
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Inicia un nuevo workflow
   * @param {Object} config { workflowType, query, maxIterations }
   */
  async startWorkflow(config) {
    const workflow = new WorkflowState({
      workflowType: config.workflowType || 'custom',
      query: config.query,
      maxIterations: config.maxIterations || 5,
      status: 'running'
    });

    stateManager.addWorkflow(workflow);
    stateManager.setActiveWorkflow(workflow);
    stateManager.addHistory({
      type: 'workflow_started',
      workflowId: workflow.workflowId,
      message: `Workflow ${workflow.workflowType} iniciado: "${workflow.query.slice(0, 50)}..."`
    });

    const controller = new AbortController();
    this.running.set(workflow.workflowId, controller);

    // Async execution
    this._execute(workflow, controller.signal).catch((err) => {
      console.error('[Orchestrator] Execution error:', err);
      stateManager.updateWorkflow(workflow.workflowId, {
        status: 'failed',
        errors: [...workflow.errors, err.message]
      });
      stateManager.addHistory({
        type: 'workflow_failed',
        workflowId: workflow.workflowId,
        message: `Error: ${err.message}`
      });
    });

    return workflow;
  }

  /**
   * Pausa un workflow activo
   */
  pauseWorkflow(workflowId) {
    const wf = stateManager.getWorkflow(workflowId);
    if (!wf || wf.status !== 'running') return;
    stateManager.updateWorkflow(workflowId, { status: 'paused' });
    stateManager.addHistory({
      type: 'workflow_paused',
      workflowId,
      message: 'Workflow pausado'
    });
  }

  /**
   * Reanuda un workflow pausado
   */
  resumeWorkflow(workflowId) {
    const wf = stateManager.getWorkflow(workflowId);
    if (!wf || wf.status !== 'paused') return;
    stateManager.updateWorkflow(workflowId, { status: 'running' });
    stateManager.addHistory({
      type: 'workflow_resumed',
      workflowId,
      message: 'Workflow reanudado'
    });
    // Re-lanzar ejecución asíncrona
    const controller = new AbortController();
    this.running.set(workflowId, controller);
    this._execute(wf, controller.signal).catch((err) => {
      console.error('[Orchestrator] Resume execution error:', err);
    });
  }

  /**
   * Cancela un workflow
   */
  cancelWorkflow(workflowId) {
    const controller = this.running.get(workflowId);
    if (controller) controller.abort();
    this.running.delete(workflowId);
    stateManager.updateWorkflow(workflowId, { status: 'failed' });
    stateManager.addHistory({
      type: 'workflow_cancelled',
      workflowId,
      message: 'Workflow cancelado por el usuario'
    });
  }

  /**
   * Time Travel: restaura un workflow a un checkpoint anterior y lo re-ejecuta
   */
  async timeTravel(workflowId, checkpointId) {
    const checkpoints = stateManager.getCheckpointsForWorkflow(workflowId);
    const target = checkpoints.find((cp) => cp.id === checkpointId);
    if (!target) throw new Error(`Checkpoint ${checkpointId} not found`);

    const restored = WorkflowState.fromJSON({
      ...target.stateSnapshot,
      status: 'running',
      completedAt: null,
      iteration: target.stateSnapshot.iteration || 0
    });

    // Cancelar ejecución actual si existe
    const current = this.running.get(workflowId);
    if (current) current.abort();

    // Reemplazar
    stateManager._state.workflows.set(workflowId, restored);
    await stateManager._persist('workflows', restored);
    stateManager.setActiveWorkflow(restored);

    stateManager.addHistory({
      type: 'time_travel',
      workflowId,
      message: `Restaurado a checkpoint ${target.label} (${new Date(target.timestamp).toLocaleTimeString()})`
    });

    // Re-ejecutar
    const controller = new AbortController();
    this.running.set(workflowId, controller);
    this._execute(restored, controller.signal).catch((err) => {
      console.error('[Orchestrator] Time travel execution error:', err);
    });

    return restored;
  }

  /**
   * Procesa una decisión de approval
   */
  resolveApproval(approvalId, decision, reason = '') {
    const approval = stateManager._state.approvals.get(approvalId);
    if (!approval) throw new Error(`Approval ${approvalId} not found`);

    const updated = stateManager.updateApproval(approvalId, {
      status: decision === 'approved' ? 'approved' : 'rejected',
      reason,
      decidedAt: new Date().toISOString()
    });

    // Actualizar workflow
    const workflow = stateManager.getWorkflow(approval.workflowId);
    if (workflow) {
      stateManager.updateWorkflow(approval.workflowId, {
        humanApproval: {
          decision,
          reason,
          decidedAt: new Date().toISOString()
        }
      });
    }

    stateManager.addHistory({
      type: `approval_${decision}`,
      workflowId: approval.workflowId,
      message: `Aprobación ${decision} - ${reason || 'sin razón'}`
    });

    // Resolver la promesa pendiente
    const resolver = this.hitlWaiters.get(approvalId);
    if (resolver) {
      resolver(updated);
      this.hitlWaiters.delete(approvalId);
    }

    return updated;
  }

  // ============================================
  // CORE EXECUTION
  // ============================================

  async _execute(workflow, signal) {
    let current = workflow;

    while (current.status === 'running' || current.status === 'paused') {
      if (signal.aborted) {
        stateManager.updateWorkflow(workflow.workflowId, { status: 'failed' });
        break;
      }

      // Si está pausado, esperar decisión HITL
      if (current.status === 'paused') {
        await this._waitForResume(workflow.workflowId, signal);
        current = stateManager.getWorkflow(workflow.workflowId);
        continue;
      }

      const nextNode = current.nextNode || 'research';
      if (nextNode === '__end__') {
        stateManager.updateWorkflow(workflow.workflowId, {
          status: 'completed',
          completedAt: new Date().toISOString()
        });
        stateManager.addHistory({
          type: 'workflow_completed',
          workflowId: workflow.workflowId,
          message: 'Workflow completado con éxito'
        });
        this.running.delete(workflow.workflowId);
        break;
      }

      // Checkpoint antes del nodo
      await this._createCheckpoint(current, `before_${nextNode}`);

      stateManager.updateWorkflow(workflow.workflowId, {
        currentNode: nextNode,
        status: 'running'
      });
      stateManager.addHistory({
        type: 'node_started',
        workflowId: workflow.workflowId,
        message: `Ejecutando nodo ${nextNode}`
      });
      stateManager.emit('orchestrator:node_started', { workflowId: workflow.workflowId, node: nextNode });

      // Ejecutar el nodo
      const result = await this._runNode(nextNode, current);

      if (!result.success) {
        stateManager.updateWorkflow(workflow.workflowId, {
          status: 'failed',
          errors: [...current.errors, result.error]
        });
        stateManager.addHistory({
          type: 'node_failed',
          workflowId: workflow.workflowId,
          message: `Nodo ${nextNode} falló: ${result.error}`
        });
        this.running.delete(workflow.workflowId);
        break;
      }

      // Mergear output al estado
      const updated = stateManager.updateWorkflow(workflow.workflowId, {
        ...result.output,
        nextNode: result.output.nextNode || DAG_EDGES[nextNode],
        messages: [...(current.messages || []), result.output.message].filter(Boolean)
      });

      // Actualizar agent stats
      const agent = getAgent(nextNode);
      if (agent) {
        stateManager.updateAgentStats(nextNode, {
          executions: (agent.stats.executions || 0) + 1,
          successes: (agent.stats.successes || 0) + 1,
          totalTime: (agent.stats.totalTime || 0) + (result.durationMs || 0)
        });
      }

      // Checkpoint después del nodo
      await this._createCheckpoint(updated, `after_${nextNode}`);

      stateManager.addHistory({
        type: 'node_completed',
        workflowId: workflow.workflowId,
        message: `Nodo ${nextNode} completado`
      });
      stateManager.emit('orchestrator:node_completed', { workflowId: workflow.workflowId, node: nextNode });

      // HITL: drafting → pausa
      if (nextNode === 'drafting' && updated.proposal) {
        const approval = await this._requestHITL(updated);
        if (approval.status !== 'approved') {
          stateManager.updateWorkflow(workflow.workflowId, { status: 'failed' });
          this.running.delete(workflow.workflowId);
          break;
        }
      }

      current = stateManager.getWorkflow(workflow.workflowId);
    }
  }

  async _runNode(nodeName, state) {
    const agent = getAgent(nodeName);
    if (!agent) throw new Error(`Agent ${nodeName} not found`);
    return await agent.execute(state.toJSON());
  }

  // ============================================
  // HITL
  // ============================================

  async _requestHITL(workflow) {
    const approval = {
      id: crypto.randomUUID(),
      workflowId: workflow.workflowId,
      workflowName: workflow.query?.slice(0, 50) || workflow.workflowId,
      type: 'executor_proceed',
      proposal: workflow.proposal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    stateManager.addApproval(approval);
    stateManager.updateWorkflow(workflow.workflowId, { status: 'paused' });
    stateManager.addHistory({
      type: 'hitl_interrupt',
      workflowId: workflow.workflowId,
      message: `Esperando aprobación humana (${approval.id})`
    });
    stateManager.emit('orchestrator:approval_required', approval);

    // Pausar el workflow
    return new Promise((resolve) => {
      this.hitlWaiters.set(approval.id, resolve);
      // Timeout de 30 min - auto-rechazo
      setTimeout(() => {
        if (this.hitlWaiters.has(approval.id)) {
          this.resolveApproval(approval.id, 'rejected', 'timeout');
        }
      }, 30 * 60 * 1000);
    });
  }

  async _waitForResume(workflowId, signal) {
    return new Promise((resolve) => {
      const check = () => {
        const wf = stateManager.getWorkflow(workflowId);
        if (!wf || wf.status !== 'paused' || signal.aborted) return resolve();
        setTimeout(check, 100);
      };
      check();
    });
  }

  // ============================================
  // CHECKPOINTS
  // ============================================

  async _createCheckpoint(workflow, label) {
    const checkpoint = {
      id: crypto.randomUUID(),
      workflowId: workflow.workflowId,
      label,
      timestamp: new Date().toISOString(),
      stateSnapshot: workflow.toJSON()
    };
    stateManager.addCheckpoint(checkpoint);
    stateManager.emit('orchestrator:checkpoint_created', checkpoint);
  }
}

export const orchestrator = new Orchestrator();
export default orchestrator;
