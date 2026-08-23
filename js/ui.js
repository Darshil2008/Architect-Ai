/**
 * Architect AI — UI Micro-Interactions, Modal Manager & Animations Module
 * 
 * Provides production-grade UI utilities:
 * - Glassmorphic Modal & Drawer controllers with focus trapping & ESC key handling
 * - Toast notification dispatch system
 * - Typing indicators & character streaming controls
 * - Suggestion chip rendering with ripple & active states
 * - Dynamic progress bar calculations
 * - Particle canvas background & spotlight cursor glow effects
 * - Animated statistics counters & FAQ accordions
 * 
 * @module ui
 */

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================

/**
 * Ensures the global toast notification container exists in the DOM.
 * @returns {HTMLElement} Toast container element
 */
function getOrCreateToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Displays a glassmorphic toast notification.
 * 
 * @param {string} message - Notification text
 * @param {"success"|"error"|"info"|"warning"} [type="info"] - Notification type
 * @param {number} [duration=3500] - Duration in ms before auto-dismiss
 * @returns {HTMLElement|null} Toast element
 */
export function showToast(message, type = "info", duration = 3500) {
  if (typeof document === "undefined") return null;

  const container = getOrCreateToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast-${type} glass`;

  // Icons for toast types
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  toast.innerHTML = `
    <div class="toast-content">
      ${icons[type] || icons.info}
      <span class="toast-message">${escapeHTML(message)}</span>
    </div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  const dismiss = () => {
    toast.classList.add("toast-dismiss");
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 280);
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", dismiss);
  }

  container.appendChild(toast);

  // Auto-dismiss timeout
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return toast;
}

// ============================================================
// MODAL & DRAWER MANAGER
// ============================================================

/**
 * Opens a modal dialog by ID with WAI-ARIA and body scroll lock.
 * 
 * @param {string} modalId - ID of modal container (e.g. "settings-modal", "history-modal")
 */
export function openModal(modalId) {
  if (typeof document === "undefined") return;
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Focus the first actionable input or close button
  const focusable = modal.querySelector("input, select, textarea, button:not([disabled])");
  if (focusable) {
    setTimeout(() => focusable.focus(), 50);
  }
}

/**
 * Closes a modal dialog by ID.
 * 
 * @param {string} modalId - ID of modal container
 */
export function closeModal(modalId) {
  if (typeof document === "undefined") return;
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  // Only remove body scroll lock if no other modals are open
  const anyOpen = document.querySelector(".modal.open");
  if (!anyOpen) {
    document.body.classList.remove("modal-open");
  }
}

/**
 * Initializes global modal event delegation for close buttons, backdrops, and ESC key.
 */
export function initModals() {
  if (typeof document === "undefined") return;

  // ESC key listener to close active modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const activeModal = document.querySelector(".modal.open");
      if (activeModal) {
        closeModal(activeModal.id);
      }
    }
  });

  // Delegated click handler for close triggers and backdrops
  document.addEventListener("click", (e) => {
    const closeTrigger = e.target.closest("[data-close-modal]");
    if (closeTrigger) {
      const modal = closeTrigger.closest(".modal");
      if (modal) {
        closeModal(modal.id);
      }
      return;
    }

    const openTrigger = e.target.closest("[data-open-modal]");
    if (openTrigger) {
      const targetId = openTrigger.dataset.openModal || openTrigger.getAttribute("data-target");
      if (targetId) {
        openModal(targetId);
      }
    }
  });
}

// ============================================================
// CHAT MICRO-INTERACTIONS: TYPING & CHIPS
// ============================================================

/**
 * Renders the animated typing indicator in the chat message stream.
 * 
 * @param {HTMLElement} [container] - Messages container (defaults to #messages)
 * @returns {HTMLElement|null} The created typing indicator element
 */
export function showTypingIndicator(container) {
  const target = container || (typeof document !== "undefined" ? document.getElementById("messages") : null);
  if (!target) return null;

  // Remove existing typing indicator if present
  removeTypingIndicator(target);

  const typingEl = document.createElement("div");
  typingEl.className = "msg bot typing";
  typingEl.id = "bot-typing-indicator";
  typingEl.innerHTML = "<span></span><span></span><span></span>";

  target.appendChild(typingEl);
  target.scrollTop = target.scrollHeight;

  return typingEl;
}

/**
 * Removes the typing indicator from the messages container.
 * 
 * @param {HTMLElement} [container] - Messages container
 */
export function removeTypingIndicator(container) {
  const target = container || (typeof document !== "undefined" ? document.getElementById("messages") : null);
  if (!target) return;

  const existing = target.querySelector("#bot-typing-indicator") || target.querySelector(".msg.typing");
  if (existing && existing.parentElement) {
    existing.parentElement.removeChild(existing);
  }
}

/**
 * Appends a message element to the chat messages stream.
 * 
 * @param {string} text - Message text
 * @param {"bot"|"user"} [sender="bot"] - Message sender
 * @param {HTMLElement} [container] - Messages container
 * @returns {HTMLElement|null} Created message element
 */
export function appendChatMessage(text, sender = "bot", container) {
  const target = container || (typeof document !== "undefined" ? document.getElementById("messages") : null);
  if (!target) return null;

  const msgEl = document.createElement("div");
  msgEl.className = `msg ${sender}`;
  msgEl.textContent = text;

  target.appendChild(msgEl);
  target.scrollTop = target.scrollHeight;

  return msgEl;
}

/**
 * Renders suggestion option chips into the options container.
 * 
 * @param {HTMLElement|string} container - Options container element or selector
 * @param {string[]} options - Array of option strings
 * @param {Function} onSelect - Callback when chip is clicked: (option: string) => void
 */
export function renderSuggestionChips(container, options, onSelect) {
  const target = typeof container === "string" ? document.querySelector(container) : container;
  if (!target) return;

  if (!options || !Array.isArray(options) || options.length === 0) {
    target.innerHTML = "";
    return;
  }

  target.innerHTML = options.map(opt => `
    <button type="button" class="option-chip" data-value="${escapeHTML(opt)}">
      ${escapeHTML(opt)}
    </button>
  `).join("");

  target.querySelectorAll(".option-chip").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const val = btn.dataset.value || btn.textContent.trim();
      if (typeof onSelect === "function") {
        onSelect(val);
      }
    });
  });
}

/**
 * Updates the interview progress bar fill and text label.
 * 
 * @param {HTMLElement} [fillEl] - Progress fill element
 * @param {HTMLElement} [labelEl] - Progress label element
 * @param {number} currentTurn - Current 0-based question turn
 * @param {number} totalTurns - Total number of question turns (e.g. 5)
 */
export function updateProgressBar(fillEl, labelEl, currentTurn, totalTurns = 5) {
  const fill = fillEl || (typeof document !== "undefined" ? document.getElementById("progress-fill") : null);
  const label = labelEl || (typeof document !== "undefined" ? document.getElementById("progress-label") : null);

  const percentage = Math.min(100, Math.max(0, (currentTurn / totalTurns) * 100));

  if (fill) {
    fill.style.width = `${percentage}%`;
  }

  if (label) {
    if (currentTurn >= totalTurns) {
      label.textContent = "Synthesis Complete (100%)";
    } else {
      label.textContent = `Question ${currentTurn + 1} / ${totalTurns}`;
    }
  }
}

// ============================================================
// PARTICLES BACKGROUND CANVAS
// ============================================================

/**
 * Initializes the interactive particle network on the target canvas.
 * 
 * @param {string} [canvasId="particles"] - Canvas element ID
 * @returns {Function} Cleanup function to stop animation loop
 */
export function initParticles(canvasId = "particles") {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) return () => {};

  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let animId;
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const COUNT = window.innerWidth < 768 ? 26 : 52;
  let particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.6
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // Draw & update particle points
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139, 148, 255, 0.45)";
      ctx.fill();
    }

    // Connect close neighbors
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);

        if (d < 125) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - d / 125) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(step);
  }

  window.addEventListener("resize", resize);
  resize();
  createParticles();
  step();

  return () => {
    window.removeEventListener("resize", resize);
    if (animId) cancelAnimationFrame(animId);
  };
}

// ============================================================
// SPOTLIGHT HOVER & CURSOR GLOW
// ============================================================

/**
 * Initializes radial spotlight hover effect on feature cards and cards.
 * 
 * @param {string} [selector=".feature-card, .cta-card"] - Target elements
 */
export function initSpotlightHover(selector = ".feature-card, .cta-card") {
  if (typeof document === "undefined") return;

  const cards = document.querySelectorAll(selector);
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
}

/**
 * Initializes interactive cursor glow follower.
 * 
 * @param {string} [elementId="cursor-glow"] - Glow element ID
 */
export function initCursorGlow(elementId = "cursor-glow") {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const glow = document.getElementById(elementId);
  if (!glow || !window.matchMedia("(hover: hover)").matches) return;

  window.addEventListener("mousemove", (e) => {
    glow.classList.add("active");
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });

  window.addEventListener("mouseleave", () => {
    glow.classList.remove("active");
  });
}

// ============================================================
// ANIMATED COUNTERS, FAQ ACCORDION & NAVIGATION
// ============================================================

/**
 * Initializes animated number counters when scrolled into view.
 * 
 * @param {string} [selector=".stat-num"] - Target selector
 */
export function initStatsCounters(selector = ".stat-num") {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const targetVal = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1200;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(targetVal * eased);

        el.textContent = `${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

/**
 * Initializes FAQ Accordion expand/collapse buttons.
 * 
 * @param {string} [containerId="faq-list"] - FAQ list container ID
 */
export function initFaqAccordion(containerId = "faq-list") {
  if (typeof document === "undefined") return;
  const faqList = document.getElementById(containerId);
  if (!faqList) return;

  const items = faqList.querySelectorAll(".faq-item");
  items.forEach(item => {
    const button = item.querySelector(".faq-q");
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}

/**
 * Initializes mobile hamburger navigation toggle.
 * 
 * @param {string} [toggleId="menu-toggle"] - Hamburger button ID
 * @param {string} [navId="mobile-nav"] - Mobile nav container ID
 */
export function initMobileNav(toggleId = "menu-toggle", navId = "mobile-nav") {
  if (typeof document === "undefined") return;
  const toggle = document.getElementById(toggleId);
  const mobileNav = document.getElementById(navId);
  if (!toggle || !mobileNav) return;

  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/**
 * Initializes smooth scroll handlers for anchor links and data-scroll buttons.
 */
export function initSmoothScroll() {
  if (typeof document === "undefined") return;

  const scrollToSelector = (selector) => {
    if (!selector) return;
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  document.querySelectorAll("[data-scroll]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToSelector(btn.dataset.scroll);
    });
  });

  document.querySelectorAll("a[href^=\"#\"]").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.length > 1 && href.startsWith("#")) {
        e.preventDefault();
        scrollToSelector(href);
      }
    });
  });
}

/**
 * Initializes scroll reveal animations for .reveal elements.
 */
export function initScrollReveal() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ============================================================
// HELPER UTILITIES
// ============================================================

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default {
  showToast,
  openModal,
  closeModal,
  initModals,
  showTypingIndicator,
  removeTypingIndicator,
  appendChatMessage,
  renderSuggestionChips,
  updateProgressBar,
  initParticles,
  initSpotlightHover,
  initCursorGlow,
  initStatsCounters,
  initFaqAccordion,
  initMobileNav,
  initSmoothScroll,
  initScrollReveal
};
