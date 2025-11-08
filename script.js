// Ocultar splash luego de 3s
setTimeout(() => document.getElementById('splash').style.display = 'none', 3000);

// Chatbot
const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatbot');
const chatBody = document.getElementById('chatBody');
const sendBtn = document.getElementById('sendMessage');
const input = document.getElementById('chatMessage');

chatToggle.addEventListener('click', () => {
  chatBox.classList.toggle('hidden');
  if (!chatBox.classList.contains('hidden')) {
    chatBody.innerHTML = '<p>🤖 ¡Hola! Soy el asistente de Yankee & Panther.<br>¿En qué puedo ayudarte hoy?</p>';
  }
});

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  appendMessage('user', text);
  input.value = '';

  let response = 'No entendí bien, puedo ayudarte con precios, cursos o contacto.';
  if (text.toLowerCase().includes('precio') || text.toLowerCase().includes('costo')) {
    response = '💰 El curso básico cuesta $4500 MXN y se completa en 1 semana.';
  } else if (text.toLowerCase().includes('curso') || text.toLowerCase().includes('entrenamiento')) {
    response = 'Tenemos cursos básico, avanzado y de búsqueda. ¿Cuál te interesa?';
  } else if (text.toLowerCase().includes('contacto') || text.toLowerCase().includes('whatsapp')) {
    response = '📱 Puedes contactarnos directamente en nuestras redes o dejar tus datos aquí.';
  }

  setTimeout(() => appendMessage('bot', response), 800);
}

function appendMessage(sender, text) {
  const msg = document.createElement('p');
  msg.className = sender === 'user' ? 'user-msg' : 'bot-msg';
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}
