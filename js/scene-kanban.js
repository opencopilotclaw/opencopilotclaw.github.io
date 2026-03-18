/**
 * scene-kanban.js — Scene 3: 14:00 归档
 * Case 3: Kanban/Todo Archiving Scene — Tasks 16-17
 */
window.SceneKanban = {
  start(container) {
    // ── Task 16: Render meeting UI with multi-trigger counter ─────────────
    container.innerHTML = `
      <div class="meeting-window" id="kanban-meeting-window" style="position:relative;">
        <div class="meeting-header">
          <span class="meeting-title">📹 Q2迭代计划讨论</span>
          <span class="meeting-timer">00:18:42</span>
        </div>

        <div class="participant-grid">
          <!-- 产品/PM -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-pm" style="background:#e17055;">产</div>
            <div class="avatar-name">产品 <span class="avatar-role">PM</span></div>
          </div>
          <!-- 领导/王 -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-leader" style="background:#3498db;">王</div>
            <div class="avatar-name">领导 <span class="avatar-role">王</span></div>
          </div>
          <!-- 设计/李 -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-designer" style="background:#00b894;">李</div>
            <div class="avatar-name">设计 <span class="avatar-role">李</span></div>
          </div>
          <!-- 小王/你 -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-me-k" style="background:#6c5ce7;">
              王
              <span class="avatar-badge">你</span>
            </div>
            <div class="avatar-name">小王</div>
          </div>
        </div>

        <div class="subtitle-bar">
          <span class="subtitle-text" id="kanban-subtitle-text"></span>
        </div>

        <!-- Counter badge -->
        <div class="claw-counter" id="claw-counter">🦞 ×0</div>
      </div>

      <div class="meeting-progress">
        <div class="meeting-progress-fill" id="kanban-progress-fill"></div>
      </div>
    `;

    SceneKanban._autoPlay(container);
  },

  async _autoPlay(container) {
    const subtitleEl   = container.querySelector('#kanban-subtitle-text');
    const progressFill = container.querySelector('#kanban-progress-fill');
    const avatarPM     = container.querySelector('#avatar-pm');
    const avatarLeader = container.querySelector('#avatar-leader');
    const avatarDesign = container.querySelector('#avatar-designer');
    const counter      = container.querySelector('#claw-counter');

    let triggerCount = 0;

    // Helper: increment counter with pulse
    function bumpCounter() {
      triggerCount++;
      counter.textContent = `🦞 ×${triggerCount}`;
      counter.classList.remove('pulse');
      void counter.offsetWidth;
      counter.classList.add('pulse');
      counter.addEventListener('animationend', () => counter.classList.remove('pulse'), { once: true });
    }

    // Step 1: Start progress bar
    await wait(100);
    progressFill.style.transition = 'width 25s linear';
    progressFill.style.width = '100%';

    // ── Speaker 1: PM ─────────────────────────────────────────────────────
    await wait(1000);
    avatarPM.classList.add('speaking');

    await typewriter(subtitleEl, '用户反馈搜索太慢了，下个版本优化一下', 55);

    // Highlight trigger word
    subtitleEl.innerHTML = subtitleEl.textContent
      .replace('下个版本优化', '<span class="trigger-word trigger-word--animate">下个版本优化</span>');
    subtitleEl.querySelectorAll('.trigger-word--animate').forEach(s => void s.offsetWidth);

    bumpCounter();

    // ── Speaker 2: Leader ──────────────────────────────────────────────────
    await wait(1000);
    avatarPM.classList.remove('speaking');
    avatarLeader.classList.add('speaking');
    subtitleEl.textContent = '';

    await typewriter(subtitleEl, '对，还有那个导出功能，这个月必须上', 55);

    subtitleEl.innerHTML = subtitleEl.textContent
      .replace('这个月必须上', '<span class="trigger-word trigger-word--animate">这个月必须上</span>');
    subtitleEl.querySelectorAll('.trigger-word--animate').forEach(s => void s.offsetWidth);

    bumpCounter();

    // ── Speaker 3: Designer ────────────────────────────────────────────────
    await wait(1000);
    avatarLeader.classList.remove('speaking');
    avatarDesign.classList.add('speaking');
    subtitleEl.textContent = '';

    await typewriter(subtitleEl, '我这边出一版新的交互稿，下周三前给你们', 55);

    subtitleEl.innerHTML = subtitleEl.textContent
      .replace('下周三前', '<span class="trigger-word trigger-word--animate">下周三前</span>');
    subtitleEl.querySelectorAll('.trigger-word--animate').forEach(s => void s.offsetWidth);

    bumpCounter();

    // ── All 3 triggers collected → Show task panel ────────────────────────
    await wait(1000);
    SceneKanban._showTaskPanel(container);
  },

  _showTaskPanel(container) {
    // Build side panel fixed to right of viewport
    const panel = document.createElement('div');
    panel.className = 'task-panel';
    panel.id = 'task-panel';
    panel.innerHTML = `
      <div class="task-panel-header">
        <span>🦞</span> 会议中捕获到 <strong>3</strong> 项待办：
      </div>
      <div class="task-panel-list">
        <div class="task-item">
          <span class="task-checkbox">☐</span>
          <span class="task-text">优化搜索性能</span>
          <span class="task-tag">下版本</span>
        </div>
        <div class="task-item">
          <span class="task-checkbox">☐</span>
          <span class="task-text">上线导出功能</span>
          <span class="task-tag tag-urgent">本月内</span>
        </div>
        <div class="task-item">
          <span class="task-checkbox">☐</span>
          <span class="task-text">新交互稿</span>
          <span class="task-tag">@设计师 下周三前</span>
        </div>
      </div>
      <div class="task-panel-actions">
        <button class="result-btn result-btn--primary" id="archive-all-btn">✓ 全部归档</button>
        <button class="result-btn result-btn--secondary result-btn--dark-border">逐条确认</button>
        <button class="result-btn result-btn--ghost">✗ 忽略</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Point guide finger at archive button after panel animates in
    wait(500).then(() => {
      const archiveBtn = document.getElementById('archive-all-btn');
      if (archiveBtn) GuideFinger.pointAt(archiveBtn);

      if (archiveBtn) {
        archiveBtn.addEventListener('click', () => {
          SceneKanban._onArchiveAll(container);
        }, { once: true });
      }
    });
  },

  // ── Task 17: Archive animation ────────────────────────────────────────────
  async _onArchiveAll(container) {
    GuideFinger.hide();

    // 1. Slide task panel out to the right
    const panel = document.getElementById('task-panel');
    if (panel) {
      panel.style.animation = 'slideOutToRight 0.4s ease forwards';
      await wait(420);
      panel.remove();
    }

    // 2. Fade meeting UI out
    const meetingWindow = container.querySelector('#kanban-meeting-window');
    const progressBar   = container.querySelector('.meeting-progress');
    if (meetingWindow) {
      meetingWindow.style.transition = 'opacity 0.5s ease';
      meetingWindow.style.opacity = '0';
    }
    if (progressBar) {
      progressBar.style.transition = 'opacity 0.5s ease';
      progressBar.style.opacity = '0';
    }
    await wait(550);

    // 3. Fade in split view
    container.innerHTML = '';

    const splitView = document.createElement('div');
    splitView.className = 'kanban-calendar-split';
    splitView.style.opacity = '0';
    splitView.style.transition = 'opacity 0.5s ease';
    splitView.innerHTML = `
      <!-- Kanban Board (left, 60%) -->
      <div class="kanban-board" id="kanban-board">
        <!-- Backlog column -->
        <div class="kanban-column" id="col-todo">
          <div class="kanban-column-header">
            待办
            <span class="kanban-count" id="count-todo">0</span>
          </div>
        </div>
        <!-- In-Progress column -->
        <div class="kanban-column" id="col-inprogress">
          <div class="kanban-column-header">
            进行中
            <span class="kanban-count">1</span>
          </div>
          <div class="kanban-card existing">
            <div class="card-title">用户调研报告</div>
          </div>
        </div>
        <!-- Done column -->
        <div class="kanban-column" id="col-done">
          <div class="kanban-column-header">
            已完成
            <span class="kanban-count">1</span>
          </div>
          <div class="kanban-card existing">
            <div class="card-title">竞品分析</div>
          </div>
        </div>
      </div>

      <!-- Calendar (right, 40%) -->
      <div class="calendar" id="calendar-view">
        <div class="calendar-header">2026年3月</div>
        <div class="calendar-weekdays">
          <span>一</span><span>二</span><span>三</span>
          <span>四</span><span>五</span><span>六</span><span>日</span>
        </div>
        <div class="calendar-days" id="calendar-days"></div>
      </div>
    `;
    container.appendChild(splitView);

    // Build calendar grid — March 2026 starts on Sunday (index 6 in Mon-first grid)
    const daysGrid = splitView.querySelector('#calendar-days');
    // Mon=0..Sun=6 headers; March 1 2026 is a Sunday → offset = 6
    const offset = 6;
    for (let i = 0; i < offset; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day calendar-day--empty';
      daysGrid.appendChild(blank);
    }
    for (let d = 1; d <= 31; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.id = `cal-day-${d}`;
      dayEl.innerHTML = `<span class="day-num">${d}</span>`;
      daysGrid.appendChild(dayEl);
    }

    // Fade split view in
    requestAnimationFrame(() => {
      splitView.style.opacity = '1';
    });
    await wait(600);

    // 4. Animate kanban cards into "待办" column one by one
    const todoCol = splitView.querySelector('#col-todo');
    const countEl = splitView.querySelector('#count-todo');

    const newCards = [
      {
        title: '优化搜索性能',
        tag: '下版本',
        tagClass: '',
        borderColor: 'var(--color-primary)',
      },
      {
        title: '上线导出功能',
        tag: '本月内',
        tagClass: 'tag-urgent',
        borderColor: 'var(--color-accent)',
      },
      {
        title: '新交互稿',
        tag: '@设计师 下周三前',
        tagClass: '',
        borderColor: '#00b894',
      },
    ];

    await wait(500);

    for (let i = 0; i < newCards.length; i++) {
      const c = newCards[i];
      const card = document.createElement('div');
      card.className = 'kanban-card new-card';
      card.style.borderLeftColor = c.borderColor;
      card.innerHTML = `
        <div class="card-title">${c.title}</div>
        <div class="card-tag ${c.tagClass}">${c.tag}</div>
      `;
      todoCol.appendChild(card);

      // Update count badge
      countEl.textContent = String(i + 1);

      await wait(500);
    }

    // 5. Light up calendar dates
    await wait(500);

    // Day 25 (Wednesday): red dot + "新交互稿"
    const day25 = splitView.querySelector('#cal-day-25');
    if (day25) {
      const dot = document.createElement('div');
      dot.className = 'day-marker day-marker--red';
      day25.appendChild(dot);
      const tag = document.createElement('div');
      tag.className = 'day-tag day-tag--red day-tag--fade';
      tag.textContent = '新交互稿';
      day25.appendChild(tag);
    }

    await wait(400);

    // Day 31: orange dot + "导出功能"
    const day31 = splitView.querySelector('#cal-day-31');
    if (day31) {
      const dot = document.createElement('div');
      dot.className = 'day-marker day-marker--orange';
      day31.appendChild(dot);
      const tag = document.createElement('div');
      tag.className = 'day-tag day-tag--orange day-tag--fade';
      tag.textContent = '导出功能';
      day31.appendChild(tag);
    }

    await wait(600);

    // 6. Show completion banner
    const banner = document.createElement('div');
    banner.className = 'archive-banner';
    banner.textContent = "✓ 已归档到项目 'Q2迭代计划'，共3项待办";
    container.appendChild(banner);

    // 7. Advance to next scene after 2.5s
    await wait(2500);
    SceneManager.nextScene();
  },
};
