/**
 * components.js — Shared UI overlay components
 *
 * All components render into #overlay-layer.
 * Requires utils.js to be loaded first (for wait()).
 */

/* =====================================================
   NotificationBar
   ===================================================== */
window.NotificationBar = (function () {
  let _el = null;

  function _getOverlay() {
    return document.getElementById('overlay-layer');
  }

  /**
   * Show a notification.
   * @param {{ description: string, acceptLabel?: string, rejectLabel?: string,
   *            onAccept?: Function, onReject?: Function,
   *            position?: 'top' | 'bottom-right' }} options
   */
  function show(options = {}) {
    hide(); // remove any existing one first

    const {
      description = '',
      acceptLabel = '接受',
      rejectLabel = '忽略',
      onAccept = null,
      onReject = null,
      position = 'top',
    } = options;

    const overlay = _getOverlay();
    if (!overlay) return;

    const bar = document.createElement('div');
    bar.className = `notification-bar notification-bar--${position}`;
    bar.innerHTML = `
      <span class="notif-icon">🦞</span>
      <span class="notif-desc">${description}</span>
      <div class="notif-actions">
        <button class="notif-btn notif-btn--accept">${acceptLabel}</button>
        <button class="notif-btn notif-btn--reject">${rejectLabel}</button>
      </div>
    `;

    bar.querySelector('.notif-btn--accept').addEventListener('click', () => {
      if (typeof onAccept === 'function') onAccept();
    });
    bar.querySelector('.notif-btn--reject').addEventListener('click', () => {
      if (typeof onReject === 'function') onReject();
      hide();
    });

    overlay.appendChild(bar);
    _el = bar;

    // Trigger animation on next frame
    requestAnimationFrame(() => bar.classList.add('notification-bar--visible'));
  }

  /** Slide the notification out and remove it. */
  function hide() {
    if (!_el) return;
    const el = _el;
    _el = null;
    el.classList.add('notification-bar--hiding');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  /**
   * Animate the notification bar morphing into the dynamic island capsule,
   * then remove the bar element.
   */
  function shrinkToIsland() {
    if (!_el) return;
    const el = _el;
    _el = null;
    el.classList.add('notification-bar--shrink');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  return { show, hide, shrinkToIsland };
})();


/* =====================================================
   DynamicIsland
   ===================================================== */
window.DynamicIsland = (function () {
  let _el = null;
  let _clickCb = null;

  function _getOverlay() {
    return document.getElementById('overlay-layer');
  }

  function _ensureElement() {
    if (_el) return _el;
    const overlay = _getOverlay();
    if (!overlay) return null;

    const island = document.createElement('div');
    island.className = 'dynamic-island';
    island.innerHTML = `<span class="island-status"></span>`;
    island.addEventListener('click', () => {
      if (typeof _clickCb === 'function') _clickCb();
    });
    overlay.appendChild(island);
    _el = island;
    return island;
  }

  /** Render the capsule at top-center of the demo area. */
  function show() {
    const island = _ensureElement();
    if (!island) return;
    requestAnimationFrame(() => island.classList.add('dynamic-island--visible'));
  }

  /**
   * Update the text shown inside the capsule.
   * Briefly pulses the island to draw attention.
   * @param {string} text
   */
  function updateStatus(text) {
    const island = _ensureElement();
    if (!island) return;
    island.querySelector('.island-status').textContent = text;
    island.classList.remove('dynamic-island--pulse');
    // Force reflow to restart animation
    void island.offsetWidth;
    island.classList.add('dynamic-island--pulse');
  }

  /** Change capsule color to gold/green to indicate completion. */
  function markComplete() {
    const island = _ensureElement();
    if (!island) return;
    island.classList.add('dynamic-island--complete');
  }

  /**
   * Expand the capsule downward to reveal a result panel.
   * @param {string} contentHTML
   */
  function expand(contentHTML) {
    const island = _ensureElement();
    if (!island) return;

    // Remove any previous expansion panel
    const existing = island.querySelector('.island-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'island-panel';
    panel.innerHTML = contentHTML;
    island.appendChild(panel);
    island.classList.add('dynamic-island--expanded');
  }

  /** Collapse back to the small capsule. */
  function collapse() {
    if (!_el) return;
    _el.classList.remove('dynamic-island--expanded');
    const panel = _el.querySelector('.island-panel');
    if (panel) {
      panel.addEventListener('transitionend', () => panel.remove(), { once: true });
    }
  }

  /** Remove the island entirely. */
  function hide() {
    if (!_el) return;
    const el = _el;
    _el = null;
    el.classList.remove('dynamic-island--visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }

  /**
   * Register a click handler on the island.
   * @param {Function} callback
   */
  function onClick(callback) {
    _clickCb = callback;
  }

  return { show, updateStatus, markComplete, expand, collapse, hide, onClick };
})();


/* =====================================================
   GuideFinger
   ===================================================== */
window.GuideFinger = (function () {
  let _el = null;

  function _getOverlay() {
    return document.getElementById('overlay-layer');
  }

  /**
   * Position a pulsing 👆 indicator near a target element
   * (slightly below-right of its bounding box).
   * @param {HTMLElement} targetElement
   */
  function pointAt(targetElement) {
    hide(); // remove any existing finger

    const overlay = _getOverlay();
    if (!overlay || !targetElement) return;

    // Use a small delay to ensure element is fully rendered/positioned
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = targetElement.getBoundingClientRect();

        const finger = document.createElement('div');
        finger.className = 'guide-finger';
        finger.innerHTML = `
          <div class="guide-finger__pulse"></div>
          <span class="guide-finger__emoji">👆</span>
        `;

        // Position centered below the target element
        const centerX = rect.left + rect.width / 2;
        const bottomY = rect.bottom + 4;

        finger.style.position = 'fixed';
        finger.style.left = `${centerX - 16}px`;
        finger.style.top  = `${bottomY}px`;
        finger.style.pointerEvents = 'none';
        finger.style.zIndex = '10001';

        overlay.appendChild(finger);
        _el = finger;
      });
    });
  }

  /** Remove the guide finger. */
  function hide() {
    if (_el) {
      _el.remove();
      _el = null;
    }
  }

  return { pointAt, hide };
})();
