/**
 * utils.js — Shared utility functions for CopilotClaw demo
 */

/**
 * Typewriter effect: renders text char by char into an element.
 * Returns a Promise that resolves when typing is complete.
 * @param {HTMLElement} element
 * @param {string} text
 * @param {number} speed - ms per character
 */
function typewriter(element, text, speed = 50) {
  return new Promise(resolve => {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
      element.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

/**
 * Delayed sequence: run an array of { fn, delay } steps in order.
 * delay is applied before fn is called.
 * @param {Array<{ fn: Function, delay?: number }>} steps
 */
async function runSequence(steps) {
  for (const step of steps) {
    if (step.delay) await wait(step.delay);
    await step.fn();
  }
}

/**
 * Simple wait / sleep utility.
 * @param {number} ms
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add a chat bubble to a container element.
 * @param {HTMLElement} container
 * @param {{ sender: string, text: string, isMe?: boolean, highlighted?: boolean }} options
 * @returns {HTMLElement} the created bubble
 */
function addChatBubble(container, { sender, text, isMe = false, highlighted = false }) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMe ? 'me' : 'other'}`;
  if (highlighted) bubble.classList.add('highlight');
  bubble.innerHTML = `<span class="sender">${sender}</span><p>${text}</p>`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}
