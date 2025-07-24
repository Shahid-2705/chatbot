document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-container');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const clearBtn = document.getElementById('clear-btn');
  const fileInput = document.getElementById('pdf-upload');
  const micBtn = document.getElementById('mic-btn');

  // 🕒 Format time
  function getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // 💾 Save chat to localStorage
  function saveToLocalStorage() {
    const all = Array.from(document.querySelectorAll('.message')).map(msg => ({
      sender: msg.classList.contains('user') ? 'user' : 'bot',
      text: msg.querySelector('.text')?.innerHTML || '',
      time: msg.querySelector('.time')?.innerHTML || ''
    }));
    localStorage.setItem('zoro_history', JSON.stringify(all));
  }

  // ♻️ Load chat from localStorage
  function loadHistory() {
    try {
      const saved = localStorage.getItem('zoro_history');
      if (!saved) return;
      const messages = JSON.parse(saved);
      messages.forEach(msg => appendMessage(msg.sender, msg.text, msg.time));
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
      console.warn("🛑 Failed to load chat history:", err);
    }
  }

  // 💬 Append message
  function appendMessage(sender, text, time = '') {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    if (sender === 'bot') {
      if (text.includes('From PDF:')) msgDiv.classList.add('pdf');
      else if (text.includes('From Wikipedia:')) msgDiv.classList.add('wiki');
      else if (text.includes('From LLaMA:')) msgDiv.classList.add('llama');
      else if (text.includes('From Cohere:')) msgDiv.classList.add('cohere');
    }

    msgDiv.innerHTML = `
      <span class="text">${text}</span>
      <span class="time">${time}</span>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    saveToLocalStorage();
    return msgDiv;
  }

  loadHistory(); // 🔁 Restore on load

  // 📨 Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    const timeNow = getCurrentTime();
    appendMessage('user', userMessage, timeNow);
    input.value = '';

    const thinkingBubble = document.createElement('div');
    thinkingBubble.classList.add('message', 'bot');
    thinkingBubble.innerHTML = `
      <span class="text typing-indicator">ZoroBot is thinking...</span>
      <span class="time">${timeNow}</span>
    `;
    chatBox.appendChild(thinkingBubble);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      thinkingBubble.remove();

      data.chat.forEach(botMsg => {
        appendMessage('bot', botMsg.message, botMsg.time || getCurrentTime());
      });

    } catch (err) {
      thinkingBubble.innerHTML = `
        <span class="text">⚠️ Error sending message.</span>
        <span class="time">${getCurrentTime()}</span>
      `;
      console.error(err);
    }
  });

  // 📄 Handle PDF upload
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file || !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      appendMessage('bot', `📄 ${data.message}`, getCurrentTime());
    } catch (err) {
      appendMessage('bot', '⚠️ Error uploading PDF.', getCurrentTime());
      console.error(err);
    }
  });

  // 🧹 Clear chat and history
  clearBtn.addEventListener('click', async () => {
    try {
      await fetch('/clear', { method: 'POST' });
      chatBox.innerHTML = '';
      localStorage.removeItem('zoro_history');
    } catch (err) {
      appendMessage('bot', '⚠️ Error clearing chat.', getCurrentTime());
    }
  });

  // 🎙️ Voice recognition
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      recognition.start();
      micBtn.textContent = '🎙️...';
    });

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      micBtn.textContent = '🎤';
    };

    recognition.onerror = recognition.onend = function () {
      micBtn.textContent = '🎤';
    };
  } else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported";
  }
});
