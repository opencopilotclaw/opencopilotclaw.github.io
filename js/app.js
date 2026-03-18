/**
 * app.js — Top-level application controller
 */

/* =====================================================
   Demo Entry
   ===================================================== */
window.startDemo = function () {
  const landingPage = document.getElementById('landing-page');
  const demoMode    = document.getElementById('demo-mode');

  if (landingPage && demoMode) {
    landingPage.classList.add('hidden');
    demoMode.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Kick off the first scene
    window.SceneManager.start();
  }
};


/* =====================================================
   Scene Manager
   ===================================================== */
window.SceneManager = {
  scenes: ['chat', 'meeting', 'kanban'],

  // Human-readable labels for the progress tabs
  sceneLabels: ['09:00 聊天', '10:30 会议', '14:00 归档'],

  // Clock labels and transition text used in the time-display overlay
  sceneClocks: ['🕘', '🕙', '🕑'],
  sceneTransitionText: [
    null,                    // no transition entering scene 0
    '09:00 → 10:30',
    '10:30 → 14:00',
  ],

  currentIndex: 0,

  /** Start from the first scene. */
  start() {
    this.currentIndex = 0;
    this.loadScene(0);
  },

  /**
   * Load a scene by index, clearing the container and overlay.
   * @param {number} index
   */
  loadScene(index) {
    this.currentIndex = index;
    this.updateProgressBar();

    const container = document.getElementById('scene-container');
    if (container) container.innerHTML = '';

    const overlay = document.getElementById('overlay-layer');
    if (overlay) overlay.innerHTML = '';

    if (index === 0 && window.SceneChat)    window.SceneChat.start(container);
    else if (index === 1 && window.SceneMeeting) window.SceneMeeting.start(container);
    else if (index === 2 && window.SceneKanban)  window.SceneKanban.start(container);
  },

  /** Advance to the next scene, or show summary on last. */
  nextScene() {
    if (this.currentIndex < 2) {
      this.playTransition(this.currentIndex + 1);
    } else {
      this.showSummary();
    }
  },

  /**
   * Animated transition between scenes.
   * 1. Fade out scene container
   * 2. Show centered time-display overlay
   * 3. Hold 1.5 s
   * 4. Fade out overlay, fade in new scene
   * @param {number} nextIndex
   */
  async playTransition(nextIndex) {
    const container = document.getElementById('scene-container');
    const overlay   = document.getElementById('overlay-layer');

    // 1. Fade out current scene
    if (container) {
      container.style.transition = 'opacity 0.35s ease';
      container.style.opacity = '0';
    }
    await _wait(380);

    // 2. Build and inject the time-display overlay
    const transitionEl = document.createElement('div');
    transitionEl.className = 'scene-transition';
    transitionEl.innerHTML = `
      <div class="scene-transition__clock">${this.sceneClocks[nextIndex]}</div>
      <div class="scene-transition__label">${this.sceneTransitionText[nextIndex]}</div>
      <div class="scene-transition__sub">切换中…</div>
    `;
    if (overlay) overlay.appendChild(transitionEl);

    // 3. Hold so the user can read it
    await _wait(1500);

    // 4. Fade out time display
    transitionEl.classList.add('scene-transition--out');
    transitionEl.addEventListener('animationend', () => transitionEl.remove(), { once: true });
    await _wait(380);

    // Load new scene content while container is still transparent
    this.loadScene(nextIndex);

    // 5. Fade container back in
    if (container) {
      container.style.opacity = '0';
      // Force a reflow so the transition fires
      void container.offsetWidth;
      container.style.transition = 'opacity 0.4s ease';
      container.style.opacity = '1';
    }
  },

  /** Update progress tab active state and fill-line width. */
  updateProgressBar() {
    const tabs = document.querySelectorAll('.progress-tab');
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === this.currentIndex);
    });

    const fill = document.querySelector('.progress-line-fill');
    if (fill) {
      const pct = ((this.currentIndex + 1) / this.scenes.length) * 100;
      fill.style.width = `${pct.toFixed(2)}%`;
    }
  },

  /** Show end-of-demo summary. */
  showSummary() {
    // Hide the progress bar
    const progressBar = document.getElementById('demo-progress-bar');
    if (progressBar) progressBar.style.display = 'none';

    const container = document.getElementById('scene-container');
    if (!container) return;

    // Remove the top margin that accounts for the fixed progress bar
    container.style.marginTop = '0';

    container.innerHTML = `
      <div class="summary-page">
        <h2 class="summary-title">小王的一天，有Claw不一样</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon">🗨️</div>
            <h3>跨人沟通</h3>
            <p>帮你问了老张，拿到答案，回复了小李。你只点了两下。</p>
          </div>
          <div class="summary-card">
            <div class="summary-icon">🎙️</div>
            <h3>后台改文件</h3>
            <p>会还没开完，方案已经改好发出去了。</p>
          </div>
          <div class="summary-card">
            <div class="summary-icon">📋</div>
            <h3>待办归档</h3>
            <p>3条会议待办，已进入看板和日程。不会再忘。</p>
          </div>
        </div>
        <div class="summary-brand">
          <div class="summary-logo">🦞</div>
          <h1 class="summary-brand-name">
            <span style="color: var(--color-dark)">Copilot</span><span style="color: var(--color-primary)">Claw</span>
          </h1>
          <p class="summary-slogan">说过的事，不再忘；该做的事，不用停下来做。</p>
          <p class="summary-tagline">生产力龙虾 🦞 | 中关村北纬龙虾大赛参赛作品</p>
        </div>
        <div class="summary-actions">
          <button class="cta-btn" id="replay-btn">重新体验 ↻</button>
          <button class="cta-btn cta-btn--outline" id="back-home-btn">返回首页</button>
        </div>
      </div>
    `;

    // Replay button: restart demo from scene 0
    document.getElementById('replay-btn').addEventListener('click', () => {
      // Restore progress bar
      if (progressBar) {
        progressBar.style.display = '';
      }
      container.style.marginTop = '';
      window.SceneManager.start();
    });

    // Back home button: hide demo, show landing
    document.getElementById('back-home-btn').addEventListener('click', () => {
      const demoMode   = document.getElementById('demo-mode');
      const landingPage = document.getElementById('landing-page');
      if (demoMode)    demoMode.classList.add('hidden');
      if (landingPage) landingPage.classList.remove('hidden');
      // Restore progress bar state for next demo entry
      if (progressBar) {
        progressBar.style.display = '';
      }
      container.style.marginTop = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },
};

/* Internal wait helper (mirrors utils.js but keeps app.js self-contained) */
function _wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
