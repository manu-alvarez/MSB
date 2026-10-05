'use strict';

class MSBrOSsAI {
  constructor() {
    this.models = [];
    this.currentModel = 'qwen3.5:4b';
    this.conversations = {};
    this.currentConvId = null;
    this.isLoading = false;
    this.init();
  }

  async init() {
    this.cacheDOM();
    this.bindEvents();
    await this.loadModels();
    this.loadConversations();
    this.registerSW();
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }

  cacheDOM() {
    this.el = {
      messages: document.getElementById('cm'),
      input: document.getElementById('ci'),
      sendBtn: document.getElementById('sb'),
      modelSelect: document.getElementById('ms'),
      chatList: document.getElementById('chat-list'),
      newChatBtn: document.getElementById('new-chat-btn'),
      newChatBtnSide: document.getElementById('new-chat-btn-side'),
      overlay: document.getElementById('ov'),
      toast: document.getElementById('tst'),
      sidebarToggle: document.getElementById('sidebar-toggle'),
      sidebar: document.getElementById('sidebar'),
      statusBadge: document.getElementById('status-badge'),
      welcomeScreen: document.getElementById('wc'),
      stitchBtn: document.getElementById('stitch-btn'),
      stitchViewer: document.getElementById('stitch-viewer'),
      stitchClose: document.getElementById('stitch-close'),
      stitchFrame: document.getElementById('stitch-frame'),
    };
  }

  bindEvents() {
    this.el.sendBtn.addEventListener('click', () => this.sendMessage());
    this.el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
    });
    this.el.newChatBtn.addEventListener('click', () => this.newChat());
    this.el.newChatBtnSide.addEventListener('click', () => this.newChat());
    this.el.sidebarToggle.addEventListener('click', () => this.el.sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      const s = this.el.sidebar;
      if (s.classList.contains('open') && !s.contains(e.target) && e.target.id !== 'sidebar-toggle') {
        s.classList.remove('open');
      }
    });
    this.el.modelSelect.addEventListener('change', (e) => { this.currentModel = e.target.value; });
    document.addEventListener('msbross-send', (e) => { this.el.input.value = e.detail.text; this.sendMessage(); });

    // Stitch prototyping
    if (this.el.stitchBtn) {
      this.el.stitchBtn.addEventListener('click', () => this.generateStitch());
    }
    if (this.el.stitchClose) {
      this.el.stitchClose.addEventListener('click', () => {
        this.el.stitchViewer.classList.remove('open');
      });
    }

    // Voice recognition
    this.initVoice();

    // File upload
    const fileBtn = document.getElementById('file-btn');
    const fileInput = document.getElementById('file-input');
    if (fileBtn && fileInput) {
      fileBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
          this.showToast(`📎 ${fileInput.files.length} archivo(s) seleccionado(s)`);
        }
      });
    }
  }

  initVoice() {
    const btn = document.getElementById('voice-btn');
    if (!btn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    let rec = null;
    if (SR) {
      rec = new SR();
      rec.lang = 'es-ES'; rec.continuous = false; rec.interimResults = true;
      rec.onresult = (e) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
        this.el.input.value = t;
      };
    }

    let mediaRecorder = null;
    let audioChunks = [];
    let active = false;

    const stopAll = () => {
      active = false;
      btn.innerHTML = '🎤'; btn.classList.remove('rec');
      if (rec) { try { rec.stop(); } catch{} }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };

    if (rec) {
      rec.onend = () => { if(active) stopAll(); };
      rec.onerror = () => { stopAll(); this.showToast('Error de voz'); };
    }

    btn.addEventListener('click', async () => {
      if (active) {
        stopAll();
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Safari may not support webm, fallback to whatever browser supports
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              this.currentAudio = {
                data: reader.result.split(',')[1],
                mimeType: mediaRecorder.mimeType || 'audio/webm'
              };
              stream.getTracks().forEach(t => t.stop());
              // Auto-send voice
              this.sendMessage();
            };
          };

          mediaRecorder.start();
          if (rec) rec.start();
          active = true;
          btn.innerHTML = '⏺'; btn.classList.add('rec');
        } catch (e) {
          console.error(e);
          this.showToast('Voz no disponible o sin permisos');
        }
      }
    });
  }

  async loadModels() {
    // Use pre-injected config if available (instant, no network needed)
    if (window.MODELS_CONFIG && window.MODELS_CONFIG.length) {
      this.models = window.MODELS_CONFIG;
    } else {
      const FALLBACK = [
        { id: 'qwen3.5:4b', name: 'Qwen 3.5 4B', provider: 'Ollama', free: true },
        { id: 'gemma4:latest', name: 'Gemma 4 8B', provider: 'Ollama', free: true },
        { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', provider: 'Ollama', free: true },
        { id: 'phi4-mini-reasoning:latest', name: 'Phi-4 Mini Reasoning', provider: 'Ollama', free: true },
      ];
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 3000); // 3s timeout max
        const resp = await fetch('/_msbross/api/models', { signal: ctrl.signal });
        if (!resp.ok) throw new Error();
        this.models = await resp.json();
        if (!Array.isArray(this.models) || !this.models.length) throw new Error();
      } catch { this.models = FALLBACK; }
    }
    // Populate hidden native select (for sendMessage compatibility)
    this.el.modelSelect.innerHTML = '';
    for (const m of this.models) {
      const opt = document.createElement('option');
      opt.value = m.id; opt.textContent = m.name;
      this.el.modelSelect.appendChild(opt);
    }
    if (!this.currentModel) this.currentModel = this.models[0]?.id;
    this.el.modelSelect.value = this.currentModel;
    // Build visual custom picker
    this.initPicker(this.models);
    this.el.statusBadge.textContent = `En línea · ${this.models.length} modelos`;
  }

  initPicker(models) {
    const picker = document.getElementById('model-picker');
    const label  = document.getElementById('mp-label');
    const dd     = document.getElementById('mp-dropdown');
    const current = document.getElementById('mp-current');
    if (!picker) return;

    // Group by provider
    const groups = {};
    for (const m of models) {
      if (!groups[m.provider]) groups[m.provider] = [];
      groups[m.provider].push(m);
    }

    dd.innerHTML = '';
    for (const [provider, ms] of Object.entries(groups)) {
      const gl = document.createElement('div');
      gl.className = 'mp-group-label';
      gl.textContent = '» ' + provider;
      dd.appendChild(gl);
      for (const m of ms) {
        const opt = document.createElement('div');
        opt.className = 'mp-option' + (m.id === this.currentModel ? ' selected' : '');
        opt.dataset.id = m.id;
        opt.innerHTML = `<span>${m.name}</span>${m.free ? '<span class="mp-free">✦ gratis</span>' : ''}`;
        opt.addEventListener('click', () => {
          this.currentModel = m.id;
          this.el.modelSelect.value = m.id;
          label.textContent = m.name;
          dd.querySelectorAll('.mp-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          picker.classList.remove('open');
        });
        dd.appendChild(opt);
      }
    }

    // Set initial label
    const first = models.find(m => m.id === this.currentModel) || models[0];
    if (first) label.textContent = first.name;

    // Toggle open/close
    current.addEventListener('click', (e) => {
      e.stopPropagation();
      picker.classList.toggle('open');
    });
    document.addEventListener('click', () => picker.classList.remove('open'));
  }

  async loadConversations() {
    try {
      const res = await fetch('/_msbross/api/conversations');
      const data = await res.json();
      this.conversations = {};
      data.forEach(c => this.conversations[c.id] = c);
      this.renderChatList();
      localStorage.setItem('msbross-convs', JSON.stringify(this.conversations));
    } catch (e) {
      console.warn('DB Load failed, using local cache', e);
      const saved = localStorage.getItem('msbross-convs');
      if (saved) { try { this.conversations = JSON.parse(saved); this.renderChatList(); } catch {} }
    }
  }

  saveConversations() {
    localStorage.setItem('msbross-convs', JSON.stringify(this.conversations));
    this.renderChatList();
  }

  renderChatList() {
    this.el.chatList.innerHTML = '';
    const convs = Object.values(this.conversations);
    convs.sort((a, b) => (b.created || 0) - (a.created || 0));
    for (const c of convs) {
      const div = document.createElement('div');
      div.className = 'ci-item' + (c.id === this.currentConvId ? ' active' : '');
      div.textContent = c.title || 'New Chat';
      div.addEventListener('click', () => this.switchChat(c.id));
      this.el.chatList.appendChild(div);
    }
  }

  switchChat(id) {
    this.currentConvId = id; this.renderChatList();
    const conv = this.conversations[id];
    if (conv) {
      this.renderMessages(conv.messages || []);
      this.el.welcomeScreen.style.display = 'none';
      this.el.messages.style.display = 'flex';
    }
    this.el.sidebar.classList.remove('open');
  }

  newChat() {
    const id = Date.now().toString();
    this.conversations[id] = { id, title: 'New Chat', messages: [], created: Date.now() };
    this.currentConvId = id; this.saveConversations();
    this.el.messages.innerHTML = '';
    this.el.welcomeScreen.style.display = 'flex';
    this.el.messages.style.display = 'none';
    this.renderChatList(); this.el.input.focus();
  }

  renderMessages(messages) {
    this.el.messages.innerHTML = '';
    this.el.messages.style.display = 'flex';
    this.el.welcomeScreen.style.display = 'none';
    for (const msg of messages) this.appendMessage(msg.role, msg.content, false);
    this.scrollToBottom();
  }

  appendMessage(role, content, animate = true) {
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'u' : 'a'}`;
    if (!animate) div.style.animation = 'none';

    const avatar = document.createElement('div');
    avatar.className = 'av';
    avatar.textContent = role === 'user' ? 'U' : 'M';

    const bubble = document.createElement('div');
    bubble.className = 'b';
    bubble.innerHTML = this.renderContent(content);

    div.appendChild(avatar); div.appendChild(bubble);
    this.el.messages.appendChild(div);
    this.scrollToBottom();
    return bubble;
  }

  renderContent(text) {
    if (!text) return '';
    let h = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    h = h.replace(/\n/g, '<br>');
    return h;
  }

  scrollToBottom() {
    requestAnimationFrame(() => { this.el.messages.scrollTop = this.el.messages.scrollHeight; });
  }

  async generateStitch() {
    const prompt = this.el.input.value.trim();
    if (!prompt && !this.currentAudio) return;
    if (this.isLoading) return;

    this.el.input.value = '';
    this.appendMessage('user', prompt + ' *(Generar UI con Stitch)*');
    if (!this.currentConvId || !this.conversations[this.currentConvId]) this.newChat();

    this.el.welcomeScreen.style.display = 'none';
    this.el.messages.style.display = 'flex';

    const conv = this.conversations[this.currentConvId];
    if (conv.title === 'New Chat') conv.title = "Stitch: " + prompt.substring(0, 30);
    conv.messages.push({ role: 'user', content: prompt + ' *(Generar UI con Stitch)*', timestamp: Date.now() });
    this.saveConversations();

    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg a';
    typingDiv.innerHTML = '<div class="av">M</div><div class="b"><div class="td"><span></span><span></span><span></span></div></div>';
    this.el.messages.appendChild(typingDiv);
    this.scrollToBottom();

    this.isLoading = true; this.el.sendBtn.disabled = true; this.el.stitchBtn.disabled = true;

    try {
      const history = conv.messages.slice(0, -1);
      const systemPrompt = `Eres un experto diseñador UI/UX y programador Frontend. Tu tarea es generar el código de una interfaz solicitada usando HTML, CSS y JS, todo en un solo archivo. IMPORTANTE: Tu respuesta SOLO debe contener código, nada de explicaciones antes o después. Envuelve todo en un bloque \`\`\`html. Utiliza CSS moderno y un diseño espectacular y minimalista.`;
      
      const payload = { 
        model: this.currentModel, 
        message: `${systemPrompt}\n\nRequerimiento: ${prompt}`, 
        conversation_id: this.currentConvId, 
        history: [] // Don't send history to avoid confusing the UI generation
      };
      
      this.currentAudio = null;

      const resp = await fetch('/_msbross/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      typingDiv.remove();

      if (!resp.ok) {
        this.appendMessage('assistant', 'Error en la generación de Stitch');
        return;
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let fullContent = '';
      
      let bubble = document.createElement('div');
      bubble.className = 'msg a';
      let av = document.createElement('div'); av.className = 'av'; av.textContent = 'M';
      let bd = document.createElement('div'); bd.className = 'b';
      bubble.appendChild(av); bubble.appendChild(bd);
      this.el.messages.appendChild(bubble);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = dec.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const chunk = JSON.parse(data);
              if (chunk.type === 'text') {
                fullContent += chunk.content;
                bd.innerHTML = "Generando UI con Stitch...<br><i>(El código no se mostrará aquí, se abrirá el visor al terminar)</i>";
                this.scrollToBottom();
              }
            } catch {}
          }
        }
      }

      conv.messages.push({ role: 'assistant', content: fullContent, timestamp: Date.now() });
      this.saveConversations();
      
      // Extract HTML content
      let htmlCode = fullContent;
      const htmlMatch = fullContent.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch) {
        htmlCode = htmlMatch[1];
      } else {
        const codeMatch = fullContent.match(/```[\w]*\s*([\s\S]*?)```/);
        if (codeMatch) htmlCode = codeMatch[1];
      }

      // Show in iframe
      bd.innerHTML = `UI generada con éxito. <a href="#" onclick="document.getElementById('stitch-viewer').classList.add('open');return false;">Abrir visor</a>`;
      this.el.stitchViewer.classList.add('open');
      const doc = this.el.stitchFrame.contentDocument || this.el.stitchFrame.contentWindow.document;
      doc.open();
      doc.write(htmlCode);
      doc.close();

    } catch (e) { typingDiv.remove(); this.showToast('Error de conexión Stitch'); }

    this.isLoading = false; this.el.sendBtn.disabled = false; this.el.stitchBtn.disabled = false;
  }

  async sendMessage() {
    const text = this.el.input.value.trim();
    if ((!text && !this.currentAudio) || this.isLoading) return;

    this.el.input.value = '';
    this.appendMessage('user', text || '🎙️ *(Audio)*');

    if (!this.currentConvId || !this.conversations[this.currentConvId]) this.newChat();

    this.el.welcomeScreen.style.display = 'none';
    this.el.messages.style.display = 'flex';

    const conv = this.conversations[this.currentConvId];
    if (conv.title === 'New Chat') conv.title = text.substring(0, 50);
    conv.messages.push({ role: 'user', content: text, timestamp: Date.now() });
    this.saveConversations();

    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg a';
    typingDiv.innerHTML = '<div class="av">M</div><div class="b"><div class="td"><span></span><span></span><span></span></div></div>';
    this.el.messages.appendChild(typingDiv);
    this.scrollToBottom();

    this.isLoading = true; this.el.sendBtn.disabled = true;

    try {
      const history = conv.messages.slice(0, -1);
      const payload = { model: this.currentModel, message: text, conversation_id: this.currentConvId, history };
      this.currentAudio = null;

      const resp = await fetch('/_msbross/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      typingDiv.remove();

      const msgDiv = document.createElement('div');
      msgDiv.className = 'msg a';
      msgDiv.innerHTML = '<div class="av">M</div><div class="b"></div>';
      this.el.messages.appendChild(msgDiv);
      const bubble = msgDiv.querySelector('.b');
      let fullContent = '';

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const chunk = JSON.parse(data);
              if (chunk.type === 'text') {
                fullContent += chunk.content;
                bubble.innerHTML = this.renderContent(fullContent);
                this.scrollToBottom();
              } else if (chunk.type === 'error') {
                bubble.innerHTML = `<span style="color:var(--md-error)">Error: ${chunk.content}</span>`;
              }
            } catch {}
          }
        }
      }

      conv.messages.push({ role: 'assistant', content: fullContent, timestamp: Date.now() });
      this.saveConversations();
      this.speak(fullContent);
    } catch (e) { typingDiv.remove(); this.showToast('Error de conexión'); }

    this.isLoading = false; this.el.sendBtn.disabled = false;
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[#*_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.name.toLowerCase().includes('adele') && v.lang.includes('es')) 
             || voices.find(v => v.name.includes('Google español'))
             || voices.find(v => v.name.includes('Monica')) // Common Spanish voice name
             || voices.find(v => v.lang.startsWith('es-') && (v.name.includes('Female') || v.name.includes('Mujer')))
             || voices.find(v => v.lang.startsWith('es-'));
             
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  showToast(msg) {
    this.el.toast.textContent = msg;
    this.el.toast.classList.add('s');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('s'), 3000);
  }

  registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { window.msbross = new MSBrOSsAI(); });
