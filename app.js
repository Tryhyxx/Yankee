/* app.js - simple behavior and chatbot logic (no external libs) */

document.addEventListener('DOMContentLoaded', function () {
  // splash & app show
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');

  // if using the provided splash, it will hide after 3000ms
  setTimeout(() => {
    splash.style.display = 'none';
    app.classList.remove('hidden');
  }, 3000);

  // smooth scroll for nav CTA
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sel = e.currentTarget.getAttribute('data-scroll');
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // course buttons -> open modal with details and simulated payment
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalBody = document.getElementById('modal-body');
  const btnPay = document.getElementById('modal-pay');
  const btnCancel = document.getElementById('modal-cancel');
  const btnClose = document.getElementById('modal-close');

  function openModal(title, price, duration, features) {
    modal.classList.remove('hidden');
    modalTitle.textContent = `Comprar — ${title}`;
    modalDesc.textContent = `${price} • ${duration}`;
    modalBody.innerHTML = '<ul>' + features.map(f => `<li>${f}</li>`).join('') + '</ul>';
    btnPay.dataset.info = JSON.stringify({ title, price });
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  document.querySelectorAll('.course-card .btn-primary, .course-card .btn-block').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.course-card');
      const title = e.currentTarget.dataset.course || (card && card.querySelector('h4')?.textContent) || 'Curso';
      const price = card && card.querySelector('.price')?.textContent || '';
      const durationText = card && (card.querySelector('.muted')?.textContent || card.querySelector('p')?.textContent) || '';
      const features = Array.from(card.querySelectorAll('.card-features li')).map(li => li.textContent);
      openModal(title, price, durationText, features);
    });
  });

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (btnPay) btnPay.addEventListener('click', () => {
    const info = JSON.parse(btnPay.dataset.info || '{}');
    // simulated payment flow
    alert(`Pago simulado: ${info.title} — ${info.price}\nGracias, en breve te contactaremos.`);
    closeModal();
  });

  // contact form submit (simulated)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      alert(`Gracias ${data.get('name')}. Mensaje recibido — te contactamos pronto.`);
      contactForm.reset();
    });
  }

  // Chatbot: mount into #chat-root
  const chatRoot = document.getElementById('chat-root');
  let chatVisible = false;

  // Responses knowledge base (expandable)
  const KB = {
    saludo: '👋 ¡Hola! Soy el asistente de Yankee & Panther. Puedo ayudarte con cursos, precios, métodos de pago, entrenamiento o contacto.',
    precios: '💸 El Curso Básico cuesta $4,500 MXN y se completa en 1 semana. El Avanzado y Búsqueda tienen planes diferentes.',
    pagos: 'Aceptamos transferencia y pagos con tarjeta. Para pagos en línea te facilitamos instrucciones al confirmar el curso.',
    horario: 'Las sesiones se agendan según disponibilidad, se trabaja en horarios diurnos (y algunos slots nocturnos).',
    contacto: 'Puedes dejar tus datos en el formulario o escribir al WhatsApp oficial para un contacto inmediato.',
    ayuda: 'Puedo dar información sobre cursos, precios, duración, instructores y pasos para inscribirte.',
    default: 'No entendí exactamente — intenta preguntar por "precio", "horario", "contacto" o "inscribirme".'
  };

  function createChatWidget() {
    const root = document.createElement('div');
    root.className = 'chat-widget hidden';
    root.innerHTML = `
      <div class="chat-panel">
        <div class="chat-header">💬 Chatbot • Yankee & Panther <button id="chat-close" class="chat-close">✕</button></div>
        <div class="chat-body" id="chat-body"></div>
        <div class="chat-input">
          <input id="chat-input" placeholder="Escribe tu pregunta..." />
          <button id="chat-send">Enviar</button>
        </div>
      </div>
    `;
    chatRoot.appendChild(root);

    // styles for chat widget (scoped small)
    const style = document.createElement('style');
    style.innerHTML = `
      .chat-widget{ position:fixed; right:20px; bottom:20px; width:320px; max-width:94vw; z-index:999; font-family:inherit; }
      .chat-panel{ background:linear-gradient(180deg,#071009,#0b0b0b); border:1px solid rgba(0,255,136,0.08); border-radius:12px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,0.6); color:#e6e6df; }
      .chat-header{ padding:10px 12px; background:linear-gradient(90deg,#004400,#222); color:#c4ffc4; display:flex; justify-content:space-between; align-items:center; font-weight:700; }
      .chat-body{ max-height:260px; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
      .chat-input{ display:flex; gap:8px; padding:10px; border-top:1px solid rgba(0,255,136,0.03); }
      .chat-input input{ flex:1; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:rgba(0,0,0,0.2); color:inherit; outline:none; }
      .chat-input button{ padding:8px 10px; border-radius:8px; background:var(--neon, #00ff88); border:none; color:#000; font-weight:700; cursor:pointer; }
      .msg{ padding:8px 10px; border-radius:10px; max-width:86%; font-size:13px; line-height:1.3; }
      .msg.bot{ background:rgba(255,255,255,0.03); align-self:flex-start; color:#e6e6df; }
      .msg.user{ background:rgba(255,255,255,0.02); align-self:flex-end; color:var(--muted, #aeb99d); }
      .chat-close{ border:0; background:transparent; color:inherit; cursor:pointer; font-size:14px; }
    `;
    document.head.appendChild(style);

    // references
    const panel = root.querySelector('.chat-panel');
    const body = root.querySelector('#chat-body');
    const input = root.querySelector('#chat-input');
    const send = root.querySelector('#chat-send');
    const close = root.querySelector('#chat-close');

    // initial bot message
    appendBotMessage(KB.saludo);

    // handlers
    send.addEventListener('click', () => handleSend());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
    close.addEventListener('click', () => toggleChat(false));

    function appendBotMessage(text) {
      const el = document.createElement('div'); el.className = 'msg bot'; el.textContent = text; body.appendChild(el); body.scrollTop = body.scrollHeight;
    }
    function appendUserMessage(text) {
      const el = document.createElement('div'); el.className = 'msg user'; el.textContent = text; body.appendChild(el); body.scrollTop = body.scrollHeight;
    }

    function handleSend() {
      const txt = input.value.trim();
      if (!txt) return;
      appendUserMessage(txt);
      input.value = '';
      // rule-based response with blocking for +18
      const l = txt.toLowerCase();
      if (l.includes('+18') || l.includes('sexual') || l.includes('porn') || l.includes('sexo') ) {
        setTimeout(() => appendBotMessage('🚫 Lo siento, no puedo ayudar con contenido +18. Puedo atender temas de entrenamiento canino.'), 600);
        return;
      }

      // simple pattern matching
      if (l.includes('precio') || l.includes('costo') || l.includes('cuesta')) {
        setTimeout(() => appendBotMessage(KB.precios), 500); return;
      }
      if (l.includes('pago') || l.includes('tarjeta') || l.includes('transfer')) {
        setTimeout(() => appendBotMessage(KB.pagos), 500); return;
      }
      if (l.includes('horario') || l.includes('hora') || l.includes('dispon')) {
        setTimeout(() => appendBotMessage(KB.horario), 500); return;
      }
      if (l.includes('contacto') || l.includes('whatsapp') || l.includes('telefono')) {
        setTimeout(() => appendBotMessage(KB.contacto), 500); return;
      }
      if (l.includes('ayuda') || l.includes('info') || l.includes('informacion')) {
        setTimeout(() => appendBotMessage(KB.ayuda), 500); return;
      }

      // fallback - be helpful and suggest options
      setTimeout(() => appendBotMessage(KB.default + ' Por ejemplo: "precio", "pago", "contacto", "inscribirme".'), 600);
    }

    return root;
  }

  // create & attach chat widget
  const widget = createChatWidget();
  const chatWidgetElem = document.querySelector('.chat-widget');

  // toggle function
  function toggleChat(show) {
    chatVisible = (typeof show === 'boolean') ? show : !chatVisible;
    if (chatVisible) {
      chatWidgetElem.classList.remove('hidden');
      chatWidgetElem.style.display = 'block';
      // focus input
      setTimeout(() => {
        const input = chatWidgetElem.querySelector('#chat-input');
        if (input) input.focus();
      }, 120);
    } else {
      chatWidgetElem.classList.add('hidden');
      chatWidgetElem.style.display = 'none';
    }
  }

  // wire chat toggle(s)
  document.getElementById('chat-toggle').addEventListener('click', () => toggleChat());
  // also any nav 'Chat' if present
  document.querySelectorAll('button, a').forEach(el=>{
    if (el.textContent && el.textContent.toLowerCase().includes('chat') && el.id !== 'chat-toggle') {
      el.addEventListener('click', (e)=>{ e.preventDefault(); toggleChat(true) });
    }
  });

  // open chat if someone clicks hero CTA "Contacto" after small delay (friendly)
  document.querySelectorAll('.btn-outline').forEach(b=>{
    b.addEventListener('click', ()=> setTimeout(()=>toggleChat(true), 600));
  });

});
