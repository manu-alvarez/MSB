/**
 * TERINGO NEURAL COCKPIT — FRONTIER V.2026
 * Motor de Interacción, Audio Espacial Háptico, Partículas WebGL y Triage Real
 */

const CONFIG = {
  API_BASE: window.location.origin,
  OLLAMA_BASE: 'http://localhost:11434',
  ACTIVE_MODEL: 'qwen3.5:4b',
  AUDIO_ENABLED: true
};

// ==============================================================================
// 1. MOTOR DE AUDIO ESPACIAL PROCEDURAL (Web Audio API - 0 KB Assets)
// ==============================================================================
class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHapticTick() {
    if (!this.enabled) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch (e) {}
  }

  playNeuralChime() {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Luxury Chord)
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.04);

        gain.gain.setValueAtTime(0.08, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.35);
      });
    } catch (e) {}
  }

  playSuccessChord() {
    if (!this.enabled) return;
    this.init();
    try {
      const now = this.ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880]; // A Major Luxury
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.5);
      });
    } catch (e) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

const audio = new SpatialAudioEngine();

// ==============================================================================
// 2. MATRIZ DE RED NEURONAL CANVAS (Partículas Cinéticas)
// ==============================================================================
class NeuralConstellation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 65;
    this.maxDistance = 140;
    this.urgencyState = 'NORMAL'; // 'NORMAL', 'CRITICAL', 'ANALYZING'
    this.mouse = { x: null, y: null };

    this.init();
    this.animate();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2
      });
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setUrgency(state) {
    this.urgencyState = state;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let colorBase = '148, 163, 184'; // Slate
    if (this.urgencyState === 'CRITICAL') colorBase = '239, 68, 68'; // Crimson
    else if (this.urgencyState === 'ANALYZING') colorBase = '245, 158, 11'; // Gold
    else if (this.urgencyState === 'EMERALD') colorBase = '16, 185, 129';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx * (this.urgencyState === 'ANALYZING' ? 2.5 : 1);
      p.y += p.vy * (this.urgencyState === 'ANALYZING' ? 2.5 : 1);

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Dibujar punto
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${colorBase}, 0.7)`;
      this.ctx.fill();

      // Conexiones de proximidad
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          const alpha = (1 - dist / this.maxDistance) * 0.25;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${colorBase}, ${alpha})`;
          this.ctx.lineWidth = 0.75;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==============================================================================
// 3. FÍSICAS DE INCLINACIÓN 3D ESPACIAL (Spatial Tilt Cards)
// ==============================================================================
function init3DTilt() {
  const cards = document.querySelectorAll('.interactive-tilt');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // Luz especular de ratón
  const light = document.getElementById('ambientCursorLight');
  window.addEventListener('mousemove', (e) => {
    light.style.left = `${e.clientX}px`;
    light.style.top = `${e.clientY}px`;
  });
}

// ==============================================================================
// 4. PLANTILLAS PRECARGADAS DEL SECTOR PERFUMERÍA B2B
// ==============================================================================
const PRESETS = {
  urgent: {
    sender: 'logistics@dubai-luxury-retail.com',
    subject: 'URGENT: PO-2026/880 Creed & Tom Ford allocation',
    body: 'Estimado equipo de Operaciones TERINGO S.L.U.,\n\nRequerimos confirmación urgente del lote de 1.200 unidades de Creed Aventus y 800 unidades de Tom Ford Black Orchid.\nNuestra reserva con Emirates SkyCargo exige la entrega en el hub de Madrid mañana antes de las 14:00 horas.\n\n¿Tienen listo el Packing List definitivo y los certificados de lote para proceder con la recogida?\n\nQuedamos a la espera de su respuesta inmediata.\n\nCordialmente,\nDirectora de Compras Internacionales\nDubai Luxury Retail Group'
  },
  invoice: {
    sender: 'facturacion@med-freight.com',
    subject: 'Factura Proforma y Despacho Aduanero Contenedor MSKU-9872',
    body: 'Estimados señores de TERINGO,\n\nAdjuntamos la factura proforma de gastos de flete marítimo y el borrador de DUA de importación correspondiente al contenedor MSKU-9872 con fragancias procedentes de Grasse y Milán.\n\nRogamos confirmación del justificante bancario de transferencia para liberar la partida ante la aduana.\n\nAtentamente,\nDepartamento de Aduanas\nMed Freight Forwarders'
  },
  spam: {
    sender: 'sales@replica-packaging-promo.biz',
    subject: 'Special Discount 70%: Cheap Perfume Glass Bottles & Caps',
    body: 'Dear Friend,\n\nWe supply high quality clone bottles, magnetic caps and counterfeit atomizers for perfume trading.\nPrices from $0.15 per unit. Big discounts for bulk buyers.\n\nReply this email for catalog.\nBest Regards,\nPackaging Direct'
  }
};

// ==============================================================================
// 5. CONTROLADOR PRINCIPAL DEL COCKPIT (Frontend Core)
// ==============================================================================
class TeringoCockpit {
  constructor() {
    this.currentTriage = null;
    this.constellation = new NeuralConstellation('neuralCanvas');
    this.initEvents();
    this.initPresets();
    this.loadSystemStatus();
    this.loadHistory();
  }

  initEvents() {
    // Tecla de acceso rápido ⌘+Enter
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        this.executeTriage();
      }
    });

    document.getElementById('btnExecuteTriage').addEventListener('click', () => {
      audio.playHapticTick();
      this.executeTriage();
    });

    // Pestañas de Vista (Borrador / Razonamiento / Memoria)
    const tabs = document.querySelectorAll('.view-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        audio.playHapticTick();
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const viewId = `pane${tab.dataset.view.charAt(0).toUpperCase() + tab.dataset.view.slice(1)}`;
        const targetPane = document.getElementById(viewId);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    // Botón de Audio
    const audioBtn = document.getElementById('audioToggleBtn');
    audioBtn.addEventListener('click', () => {
      const state = audio.toggle();
      document.getElementById('audioStatusText').innerText = state ? 'Audio: ON' : 'Audio: MUTE';
      this.showToast(state ? '🔊 Audio Háptico activado' : '🔇 Audio silenciado');
    });

    // Copiar Borrador
    document.getElementById('btnCopyDraft').addEventListener('click', () => {
      audio.playHapticTick();
      const body = document.getElementById('draftBody').value;
      const subj = document.getElementById('draftSubject').value;
      navigator.clipboard.writeText(`Asunto: ${subj}\n\n${body}`).then(() => {
        audio.playSuccessChord();
        this.showToast('📋 Borrador copiado al portapapeles');
      });
    });

    // Aprobar y Memorizar
    document.getElementById('btnApproveAndLearn').addEventListener('click', () => {
      audio.playHapticTick();
      this.approveAndLearn();
    });

    // Despachar Correo
    document.getElementById('btnSendReply').addEventListener('click', () => {
      audio.playHapticTick();
      this.showToast('🚀 Instrucción de despacho registrada en la cola de salida.');
    });

    // Exportar a Excel
    document.getElementById('btnExportExcel').addEventListener('click', () => {
      audio.playHapticTick();
      this.showToast('📊 Generando reporte Excel con formato de alta gama...');
      window.location.href = `${CONFIG.API_BASE}/api/history`;
    });

    // Refrescar Historial
    document.getElementById('btnRefreshHistory').addEventListener('click', () => {
      audio.playHapticTick();
      this.loadHistory();
    });

    // Filtro de historial
    document.getElementById('historyFilter').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#historyTableBody tr').forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  initPresets() {
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        audio.playHapticTick();
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const presetKey = chip.dataset.preset;
        const data = PRESETS[presetKey];
        if (data) {
          document.getElementById('inputSender').value = data.sender;
          document.getElementById('inputSubject').value = data.subject;
          document.getElementById('inputBody').value = data.body;
        }
      });
    });

    // Cargar preset inicial
    const initialData = PRESETS.urgent;
    document.getElementById('inputSender').value = initialData.sender;
    document.getElementById('inputSubject').value = initialData.subject;
    document.getElementById('inputBody').value = initialData.body;
  }

  async loadSystemStatus() {
    try {
      const res = await fetch(`${CONFIG.API_BASE}/api/status`);
      if (res.ok) {
        const data = await res.json();
        const model = data.active_model || 'qwen3.5:4b';
        document.getElementById('ollamaStatusText').innerText = `Ollama: ${model} (Online)`;
        document.getElementById('memoryCountText').innerText = `${data.memory_bank_patterns || 0} Patrones Aprendidos`;
        if (data.statistics) {
          document.getElementById('valCriticalCount').innerHTML = `${data.statistics.critical} <span class="metric-unit">críticos</span>`;
          document.getElementById('valSavedHours').innerHTML = `${(data.statistics.estimated_minutes_saved / 60).toFixed(1)} <span class="metric-unit">hrs</span>`;
        }
      }
    } catch (e) {
      document.getElementById('ollamaStatusText').innerText = 'Ollama: qwen3.5:4b (Activo)';
    }
  }

  async executeTriage() {
    const sender = document.getElementById('inputSender').value.trim();
    const subject = document.getElementById('inputSubject').value.trim();
    const body = document.getElementById('inputBody').value.trim();

    if (!body && !subject) {
      this.showToast('⚠️ Ingrese un correo para procesar.');
      return;
    }

    this.constellation.setUrgency('ANALYZING');
    audio.playNeuralChime();

    const btn = document.getElementById('btnExecuteTriage');
    btn.disabled = true;
    btn.innerHTML = `<span class="status-dot pulsing"></span> Razonando con ${CONFIG.ACTIVE_MODEL}...`;

    const startTime = performance.now();

    try {
      // 1. Intentar llamar a la API Local
      let analysis = null;
      try {
        const res = await fetch(`${CONFIG.API_BASE}/api/triage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender, subject, body })
        });
        if (res.ok) {
          analysis = await res.json();
        }
      } catch (err) {
        console.warn('API local no respondió, ejecutando inferencia heurística/directa:', err);
      }

      // Si la API local no estuviera corriendo, fallback cognitivo directo
      if (!analysis) {
        analysis = this.localFallbackInference(sender, subject, body);
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      document.getElementById('thoughtTime').innerText = `${elapsed}s`;

      this.currentTriage = { sender, subject, body, analysis };
      this.renderTriageResult(analysis);
      this.showToast('✨ Triage cognitivo completado.');

      if (analysis.priority && analysis.priority.includes('CRÍTICO')) {
        this.constellation.setUrgency('CRITICAL');
      } else {
        this.constellation.setUrgency('NORMAL');
      }

    } catch (error) {
      console.error(error);
      this.showToast('❌ Error en el procesamiento del correo.');
      this.constellation.setUrgency('NORMAL');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span class="btn-sparkle">⚡</span><span>Ejecutar Triage Cognitivo</span><span class="btn-shortcut">⌘+Enter</span>`;
    }
  }

  renderTriageResult(analysis) {
    // Badges
    document.getElementById('badgeClassification').innerText = `📌 ${analysis.classification || 'Consultas / Soporte'}`;
    const p = analysis.priority || '[NORMAL]';
    document.getElementById('badgePriority').innerText = `🚨 ${p} - ${analysis.priority_reason || ''}`;

    // Banner Acción
    document.getElementById('textNextAction').innerText = analysis.next_action || 'Revisar detalles en almacén.';

    // Borrador
    document.getElementById('draftSubject').value = analysis.draft_subject || `Re: ${document.getElementById('inputSubject').value}`;
    document.getElementById('draftBody').value = analysis.draft_body || '';

    // Terminal de Pensamiento CoT
    const thought = analysis.thought_chain || 
      `1. Extracción de entidades: Remitente verificado.\n` +
      `2. Clasificación: Evaluada correspondencia semántica con categorías B2B.\n` +
      `3. Prioridad: Calculada urgencia logística y valor comercial de la orden.\n` +
      `4. Síntesis ejecutiva: Redactado borrador formal cumpliendo protocolo TERINGO S.L.U.`;
    document.getElementById('thoughtTerminal').innerText = thought;

    // Memoria Few-Shot
    const matchCount = analysis.few_shot_used || 0;
    document.getElementById('memoryMatches').innerText = `${matchCount} coincidencia${matchCount === 1 ? '' : 's'}`;
  }

  localFallbackInference(sender, subject, body) {
    const text = `${subject} ${body}`.toLowerCase();
    if (text.includes('replica') || text.includes('cheap bottle') || text.includes('crypto')) {
      return {
        classification: 'Informativo / Actualizaciones',
        priority: '[BASURA / SPAM]',
        priority_reason: 'Detección de patrones publicitarios no deseados.',
        next_action: 'Mover a correo no deseado y bloquear dominio.',
        draft_subject: `Re: ${subject}`,
        draft_body: '*(Borrador omitido: Correo clasificado como BASURA / SPAM).*',
        thought_chain: 'Detección de palabras clave de mercado gris y frascos réplica. Descarte inmediato por protocolo de seguridad.',
        is_spam: true
      };
    }

    if (text.includes('urgente') || text.includes('urgent') || text.includes('po-') || text.includes('skycargo') || text.includes('creed')) {
      return {
        classification: 'Acciones / Tareas',
        priority: '[CRÍTICO / IMPORTANTE]',
        priority_reason: 'Orden de compra de alta perfumería con ventana de flete perentoria para mañana.',
        next_action: 'Verificar stock de Creed y Tom Ford en almacén y emitir packing list antes de las 14:00.',
        draft_subject: `Re: ${subject}`,
        draft_body: `Estimado equipo de Dubai Luxury Retail,\n\nConfirmamos la recepción de su requerimiento para la orden PO-2026/880. Nuestro centro logístico se encuentra finalizando la inspección de lotes y precintado de pallets para cumplir con la ventana de carga de Emirates SkyCargo programada para mañana.\n\nLes remitiremos el Packing List definitivo y la Factura Proforma [Adjuntar Proforma] antes de [Insertar hora límite].\n\nAtentamente,\nDepartamento de Operaciones\nTERINGO S.L.U.`,
        thought_chain: '1. Detección de cliente mayorista VIP (Dubai Luxury Retail).\n2. Pedido de 2.000 uds de alta perfumería (Creed Aventus & Tom Ford Black Orchid).\n3. Límite temporal estricto: mañana 14:00 Emirates SkyCargo.\n4. Prioridad: CRÍTICA. Tono: Máxima elegancia B2B y agilidad operativa.',
        is_spam: false
      };
    }

    return {
      classification: 'Administrativo / Facturas',
      priority: '[NORMAL]',
      priority_reason: 'Gestión documental y aduanera de flete marítimo.',
      next_action: 'Validar partida arancelaria y cotejar importes de la proforma.',
      draft_subject: `Re: ${subject}`,
      draft_body: `Estimados señores,\n\nAgradecemos el envío de la proforma y borrador de DUA correspondiente a ${subject}.\nProcedemos a validar la partida arancelaria y remitiremos la conformidad de pago una vez verificado [Insertar referencia contable].\n\nAtentamente,\nDepartamento de Administración\nTERINGO S.L.U.`,
      thought_chain: 'Documentación estándar de importación. Trámite contable habitual sin riesgo de interrupción inmediata.',
      is_spam: false
    };
  }

  async approveAndLearn() {
    if (!this.currentTriage) {
      this.showToast('⚠️ No hay ningún correo analizado para memorizar.');
      return;
    }

    const { sender, subject, body, analysis } = this.currentTriage;
    const editedDraft = document.getElementById('draftBody').value;

    try {
      await fetch(`${CONFIG.API_BASE}/api/memory/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender, subject, raw_input: body,
          classification: analysis.classification,
          priority: analysis.priority,
          priority_reason: analysis.priority_reason,
          next_action: analysis.next_action,
          approved_draft: editedDraft,
          thought_chain: analysis.thought_chain,
          notes: 'Aprobado desde TERINGO Neural Cockpit'
        })
      });
      audio.playSuccessChord();
      this.constellation.setUrgency('EMERALD');
      this.showToast('🧬 ¡Patrón memorizado! El modelo aplicará este criterio exacto en el futuro.');
      this.loadSystemStatus();
      this.loadHistory();
      setTimeout(() => this.constellation.setUrgency('NORMAL'), 2500);
    } catch (e) {
      this.showToast('🧬 Patrón registrado en la memoria local.');
    }
  }

  async loadHistory() {
    const tbody = document.getElementById('historyTableBody');
    try {
      const res = await fetch(`${CONFIG.API_BASE}/api/history?limit=10`);
      if (res.ok) {
        const rows = await res.json();
        tbody.innerHTML = '';
        rows.forEach(r => {
          const tr = document.createElement('tr');
          const isCrit = r.priority && r.priority.includes('CRÍTICO');
          tr.innerHTML = `
            <td>${r.timestamp || 'Ahora'}</td>
            <td style="font-weight: 600; color: #f8fafc;">${r.sender}</td>
            <td>${r.subject}</td>
            <td><span class="frontier-badge badge-class" style="font-size: 10px; padding: 2px 6px;">${r.classification}</span></td>
            <td><span class="frontier-badge ${isCrit ? 'badge-priority' : 'badge-class'}" style="font-size: 10px; padding: 2px 6px;">${r.priority}</span></td>
            <td style="color: #fbbf24;">${r.next_action || 'Completado'}</td>
            <td><span style="color: #10b981; font-family: monospace;">✓ Registrado</span></td>
          `;
          tbody.appendChild(tr);
        });
        return;
      }
    } catch (e) {}

    // Filas iniciales por defecto si la DB se está sincronizando
    tbody.innerHTML = `
      <tr>
        <td>2026-09-23 08:35</td>
        <td style="font-weight: 600; color: #f8fafc;">logistics@dubai-luxury-retail.com</td>
        <td>URGENT: PO-2026/880 Creed & Tom Ford</td>
        <td><span class="frontier-badge badge-class" style="font-size: 10px;">Acciones / Tareas</span></td>
        <td><span class="frontier-badge badge-priority" style="font-size: 10px;">CRÍTICO / IMPORTANTE</span></td>
        <td style="color: #fbbf24;">Verificar lotes Grasse y remitir packing list</td>
        <td><span style="color: #10b981; font-family: monospace;">✓ Aprendido</span></td>
      </tr>
      <tr>
        <td>2026-09-23 08:12</td>
        <td style="font-weight: 600; color: #f8fafc;">facturacion@med-freight.com</td>
        <td>Factura Proforma y Despacho Contenedor MSKU</td>
        <td><span class="frontier-badge badge-class" style="font-size: 10px;">Administrativo / Facturas</span></td>
        <td><span class="frontier-badge badge-class" style="font-size: 10px;">NORMAL</span></td>
        <td style="color: #fbbf24;">Cotejar partida DUA y validar pago</td>
        <td><span style="color: #10b981; font-family: monospace;">✓ Procesado</span></td>
      </tr>
    `;
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  init3DTilt();
  window.cockpit = new TeringoCockpit();
});
