/**
 * scene-meeting.js — Scene 2: 10:30 会议
 * Case 2: Video Meeting Scene — Tasks 13, 14, 15
 */
window.SceneMeeting = {
  start(container) {
    // ── Task 13: Render video meeting mockup ─────────────────────────────
    container.innerHTML = `
      <div class="meeting-window" id="meeting-window">
        <div class="meeting-header">
          <span class="meeting-title">📹 产品部周会</span>
          <span class="meeting-timer">00:32:15</span>
        </div>

        <div class="participant-grid">
          <!-- 王总 (领导) -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-boss" style="background:#3498db;">王</div>
            <div class="avatar-name">王总 <span class="avatar-role">领导</span></div>
          </div>
          <!-- 小王 (你) -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-me" style="background:#e17055;">
              王
              <span class="avatar-badge">你</span>
            </div>
            <div class="avatar-name">小王</div>
          </div>
          <!-- 张总 -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-zhang" style="background:#00b894;">张</div>
            <div class="avatar-name">张总</div>
          </div>
          <!-- 小陈 -->
          <div class="participant-cell">
            <div class="avatar" id="avatar-chen" style="background:#6c5ce7;">陈</div>
            <div class="avatar-name">小陈</div>
          </div>
        </div>

        <div class="subtitle-bar">
          <span class="subtitle-text" id="subtitle-text"></span>
        </div>
      </div>

      <div class="meeting-progress">
        <div class="meeting-progress-fill" id="meeting-progress-fill"></div>
      </div>
    `;

    // ── Task 14: Auto-play subtitles and trigger detection ───────────────
    SceneMeeting._autoPlay(container);
  },

  async _autoPlay(container) {
    const subtitleEl = container.querySelector('#subtitle-text');
    const progressFill = container.querySelector('#meeting-progress-fill');
    const avatarBoss = container.querySelector('#avatar-boss');

    // Step 1: Start progress bar animation (CSS transition over 25s)
    await wait(100); // allow DOM to settle
    progressFill.style.transition = 'width 25s linear';
    progressFill.style.width = '100%';

    // Step 2: Wait 1s → set 王总 to speaking
    await wait(1000);
    avatarBoss.classList.add('speaking');

    // Step 3: Typewriter the subtitle text
    const subtitleText = '...上次那个Q2方案，小王你把第三部分的预算改一下，改完发我邮箱...';
    await typewriter(subtitleEl, subtitleText, 55);

    // Step 4: Highlight trigger words in subtitle
    // Replace plain text content with highlighted spans
    subtitleEl.innerHTML = subtitleEl.textContent
      .replace('小王', '<span class="trigger-word trigger-word--animate">小王</span>')
      .replace('改一下', '<span class="trigger-word trigger-word--animate">改一下</span>')
      .replace('发我邮箱', '<span class="trigger-word trigger-word--animate">发我邮箱</span>');

    // Re-trigger animations
    subtitleEl.querySelectorAll('.trigger-word--animate').forEach(span => {
      void span.offsetWidth;
    });

    // Step 5: Wait 0.8s → Show NotificationBar
    await wait(800);
    NotificationBar.show({
      description: '检测到任务：修改Q2方案第三部分预算，完成后发送至领导邮箱',
      acceptLabel: '✓ 后台处理',
      rejectLabel: '✗ 稍后再说',
      position: 'bottom-right',
      onAccept: () => SceneMeeting._onAccept(container),
      onReject: null,
    });

    // Point guide finger at accept button
    requestAnimationFrame(() => {
      const acceptBtn = document.querySelector('.notif-btn--accept');
      if (acceptBtn) GuideFinger.pointAt(acceptBtn);
    });
  },

  // ── Task 15: Background processing + highlight moment ────────────────
  async _onAccept(container) {
    GuideFinger.hide();
    NotificationBar.shrinkToIsland();

    await wait(500);
    DynamicIsland.show();

    const subtitleEl = container.querySelector('#subtitle-text');
    const avatarBoss = container.querySelector('#avatar-boss');

    // Key moment: Meeting continues while task processes in parallel
    // Run both tracks concurrently with Promise.all
    await Promise.all([
      // Track A: Meeting continues with new topic
      SceneMeeting._meetingContinues(avatarBoss, subtitleEl),
      // Track B: Island status updates
      SceneMeeting._islandUpdates(container),
    ]);
  },

  async _meetingContinues(avatarBoss, subtitleEl) {
    // Remove speaking from 王总, continue with new topic
    await wait(300);
    avatarBoss.classList.remove('speaking');

    // Clear subtitle and start new topic
    subtitleEl.textContent = '';
    await wait(500);
    await typewriter(subtitleEl, '下一个议题，关于客户回访的安排...', 60);
  },

  async _islandUpdates(container) {
    DynamicIsland.updateStatus('正在定位Q2方案.docx...');
    await wait(1500);

    DynamicIsland.updateStatus('已找到第三部分，正在修改预算数据...');
    await wait(2000);

    DynamicIsland.updateStatus('修改完成 ✓ 已生成delta对比');
    DynamicIsland.markComplete();

    // HIGHLIGHT MOMENT: flash overlay
    SceneMeeting._showHighlightMoment(container);

    await wait(500);

    // Point guide finger at the island
    const islandEl = document.querySelector('.dynamic-island');
    if (islandEl) GuideFinger.pointAt(islandEl);

    // Register expand click on island
    DynamicIsland.onClick(() => {
      GuideFinger.hide();

      DynamicIsland.expand(`
        <div class="result-section">
          <h4>📄 文件修改 Delta</h4>
          <div class="diff-view">
            <div class="diff-line diff-remove">- 预算：15万</div>
            <div class="diff-line diff-add">+ 预算：12万（已根据最新报价调整）</div>
            <div class="diff-line diff-remove">- 执行周期：8周</div>
            <div class="diff-line diff-add">+ 执行周期：6周</div>
          </div>
        </div>
        <div class="result-section">
          <h4>📧 草拟邮件</h4>
          <div class="email-draft">
            <p><strong>收件人：</strong>王总</p>
            <p><strong>标题：</strong>Q2方案（预算修订版）</p>
            <p><strong>正文：</strong>王总好，Q2方案第三部分预算已按要求修改，主要调整了预算金额和执行周期。详见附件。</p>
            <p><strong>附件：</strong>📎 Q2方案_v2.docx</p>
          </div>
        </div>
        <div class="result-actions">
          <button class="result-btn result-btn--primary" id="send-email-btn">✓ 发送给领导</button>
          <button class="result-btn result-btn--secondary">✎ 修改</button>
        </div>
      `);

      // Point at send button after expansion
      wait(300).then(() => {
        const sendBtn = document.getElementById('send-email-btn');
        if (sendBtn) GuideFinger.pointAt(sendBtn);

        if (sendBtn) {
          sendBtn.addEventListener('click', () => {
            GuideFinger.hide();
            DynamicIsland.collapse();

            wait(300).then(() => {
              DynamicIsland.hide();
              return wait(1500);
            }).then(() => {
              SceneManager.nextScene();
            });
          });
        }
      });
    });
  },

  _showHighlightMoment(container) {
    // Create centered overlay flash
    const overlay = document.createElement('div');
    overlay.className = 'highlight-moment';
    overlay.innerHTML = `<span>🦞 会还没开完，事已经办好了 ✓</span>`;
    document.body.appendChild(overlay);

    // Fade in, hold 2s, fade out
    requestAnimationFrame(() => {
      overlay.classList.add('highlight-moment--visible');
    });

    wait(2200).then(() => {
      overlay.classList.add('highlight-moment--out');
      overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
    });
  },
};
