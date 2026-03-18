/**
 * scene-chat.js — Scene 1: 09:00 聊天
 * Case 1: WeChat Chat Scene — Tasks 10, 11, 12
 */
window.SceneChat = {
  start(container) {
    // ── Task 10: Render WeChat-like chat window ──────────────────────────
    container.innerHTML = `
      <div class="chat-window">
        <div class="chat-header">
          <button class="chat-header__back">&#8249;</button>
          <div class="chat-header__contact">
            <span class="chat-header__online-dot"></span>
            <span class="chat-header__name">小李</span>
          </div>
          <div class="chat-header__spacer"></div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-bar">
          <input class="chat-input-bar__field" type="text" disabled placeholder="输入消息..." />
        </div>
      </div>
    `;

    const messagesEl = container.querySelector('#chat-messages');

    // ── Task 11: Auto-play messages + trigger detection ──────────────────
    runSequence([
      // Step 1: 小李's first message
      {
        delay: 1000,
        fn: () => {
          addChatBubble(messagesEl, {
            sender: '小李',
            text: '这次活动的场地费用是多少？合同那边怎么说的？',
            isMe: false,
          });
        },
      },
      // Step 2: 小王's reply
      {
        delay: 1500,
        fn: () => {
          const bubble = addChatBubble(messagesEl, {
            sender: '小王',
            text: '我不太清楚，我问一下老张，回头告诉你',
            isMe: true,
          });

          // Step 3: Wrap trigger words in <span class="trigger-word"> and animate
          const p = bubble.querySelector('p');
          if (p) {
            p.innerHTML = p.innerHTML
              .replace('我问一下老张', '<span class="trigger-word">我问一下老张</span>')
              .replace('告诉你', '<span class="trigger-word">告诉你</span>');

            // Apply the highlight animation to each trigger span
            p.querySelectorAll('.trigger-word').forEach(span => {
              span.classList.add('trigger-word--animate');
              // Re-trigger animation if needed
              void span.offsetWidth;
            });
          }
        },
      },
      // Step 4: Show NotificationBar with guide finger on accept button
      {
        delay: 800,
        fn: () => {
          NotificationBar.show({
            description: '检测到跨人沟通任务：向老张询问活动场地费用及合同情况 → 获取答案后回复小李',
            acceptLabel: '✓ 交给Claw',
            rejectLabel: '✗ 我自己来',
            onAccept: () => SceneChat._onAccept(),
            onReject: null,
          });

          // Point guide finger at the accept button after a brief layout tick
          requestAnimationFrame(() => {
            const acceptBtn = document.querySelector('.notif-btn--accept');
            if (acceptBtn) GuideFinger.pointAt(acceptBtn);
          });
        },
      },
    ]);
  },

  // ── Task 12: Handle accept → dynamic island progress → expand → send ──
  _onAccept() {
    GuideFinger.hide();
    NotificationBar.shrinkToIsland();

    const messagesEl = document.getElementById('chat-messages');

    // Show island after shrink animation completes
    wait(500).then(() => {
      DynamicIsland.show();

      // Status update sequence
      return runSequence([
        {
          delay: 0,
          fn: () => { DynamicIsland.updateStatus('正在向老张发起询问...'); },
        },
        {
          delay: 2000,
          fn: () => { DynamicIsland.updateStatus('老张已回复：场地费3万，合同已签'); },
        },
        {
          delay: 1500,
          fn: () => {
            DynamicIsland.updateStatus('已草拟回复小李，待你确认');
            DynamicIsland.markComplete();
          },
        },
      ]);
    }).then(() => {
      // Wait then point guide finger at the island
      return wait(500);
    }).then(() => {
      const islandEl = document.querySelector('.dynamic-island');
      if (islandEl) GuideFinger.pointAt(islandEl);

      // Register click handler on island
      DynamicIsland.onClick(() => {
        GuideFinger.hide();

        DynamicIsland.expand(`
          <div class="result-section">
            <h4>📨 老张的回复</h4>
            <p class="result-quote">"场地费3万，合同已经签好了，下周一付款。"</p>
          </div>
          <div class="result-section">
            <h4>📝 草拟回复小李</h4>
            <p class="result-draft">"小李，问了老张了——场地费3万，合同已签好。"</p>
          </div>
          <div class="result-actions">
            <button class="result-btn result-btn--primary" id="send-reply-btn">✓ 发送</button>
            <button class="result-btn result-btn--secondary">✎ 编辑后发送</button>
          </div>
        `);

        // Point at send button after expansion renders
        wait(300).then(() => {
          const sendBtn = document.getElementById('send-reply-btn');
          if (sendBtn) GuideFinger.pointAt(sendBtn);

          // Wire up send button
          if (sendBtn) {
            sendBtn.addEventListener('click', () => {
              GuideFinger.hide();
              DynamicIsland.collapse();

              wait(300).then(() => {
                DynamicIsland.hide();

                // Add final reply bubble from 小王
                if (messagesEl) {
                  addChatBubble(messagesEl, {
                    sender: '小王',
                    text: '小李，问了老张了——场地费3万，合同已签好。',
                    isMe: true,
                  });
                }

                // Advance to next scene
                return wait(1500);
              }).then(() => {
                SceneManager.nextScene();
              });
            });
          }
        });
      });
    });
  },
};
