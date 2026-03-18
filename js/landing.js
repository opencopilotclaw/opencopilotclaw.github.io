/**
 * landing.js — Scroll reveal animations for landing page cards
 */

(function () {
  'use strict';

  /**
   * IntersectionObserver-based scroll reveal.
   * Cards with class `.scroll-reveal` transition in when they enter the viewport.
   */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.scroll-reveal');

    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once visible, stop observing to keep it visible
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,       // trigger when 15% of the card is in view
        rootMargin: '0px 0px -40px 0px'  // slightly before reaching the bottom edge
      }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();
