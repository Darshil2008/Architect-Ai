/* Architect AI — Interactive landing JS */

// ============================================================
// DATA
// ============================================================

const FEATURES = [
  {
    icon: '<path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-2 7.5A4 4 0 0 0 9 22h6a4 4 0 0 0 3-7.5A4 4 0 0 0 16 7V6a4 4 0 0 0-4-4z"/>',
    title: "Adaptive interview",
    body: "A conversational engine that probes your skills, constraints, and ambitions — not a static form."
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    title: "Skill-aware roadmap",
    body: "Milestones calibrated to what you already know and the gaps worth closing."
  },
  {
    icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    title: "Schema + APIs",
    body: "Generated database schema, REST/GraphQL surface, and auth model — ready to scaffold."
  },
  {
    icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    title: "Stack rationale",
    body: "Every framework, library, and service picked with a written tradeoff, not a vibe."
  },
  {
    icon: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
    title: "Deployment plan",
    body: "Hosting, CI/CD, environments, and observability mapped to your team size and budget."
  },
  {
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    title: "Resume impact",
    body: "A recruiter-grade summary of what the project demonstrates about you."
  },
];

const STEPS = [
  {
    n: "01",
    title: "Interview",
    body: "A guided conversation captures your idea, audience, skills, and constraints."
  },
  {
    n: "02",
    title: "Analysis",
    body: "The engine reasons over your profile to pick the stack, scope, and architecture."
  },
  {
    n: "03",
    title: "Blueprint",
    body: "You receive a complete plan: roadmap, schema, APIs, deployment, and resume impact."
  },
];

const FAQ = [
  {
    q: "Who is Architect AI for?",
    a: "Engineers, students, and indie builders who want a credible architecture for a new project — without spending a weekend whiteboarding it alone."
  },
  {
    q: "Does it write code?",
    a: "Not yet. The first release generates a complete blueprint: stack, schema, APIs, roadmap, and deployment plan. Scaffolding lands in a later phase."
  },
  {
    q: "What AI model powers the interview?",
    a: "A Dify workflow orchestrates the multi-step reasoning. The model layer is swappable without changing the product surface."
  },
  {
    q: "Can I export the blueprint?",
    a: "Yes — Markdown, PDF, and a shareable link are planned for the blueprint dashboard."
  },
];

// ============================================================
// INTERVIEW QUESTIONS
// ============================================================

const QUESTIONS = [
  {
    id: "idea",
    bot: "Hey 👋 I'm Architect. In one line, what are you building?",
    options: [
      "A SaaS dashboard",
      "A social mobile app",
      "An AI tool",
      "An e-commerce site"
    ],
    blueprintLabel: "Project idea"
  },

  {
    id: "users",
    bot: "Got it. Who is it for?",
    options: [
      "Developers",
      "Small businesses",
      "Consumers",
      "Enterprise teams"
    ],
    blueprintLabel: "Target users"
  },

  {
    id: "skill",
    bot: "What's your strongest stack right now?",
    options: [
      "React + Node",
      "Next.js + Postgres",
      "Python + FastAPI",
      "Beginner — pick for me"
    ],
    blueprintLabel: "Primary stack"
  },

  {
    id: "scope",
    bot: "Last one — how soon do you want a v1 shipped?",
    options: [
      "This weekend",
      "Two weeks",
      "One month",
      "Two months",
      "Three months"
    ],
    blueprintLabel: "Target timeline"
  }
];

// ============================================================
// RENDER FEATURES
// ============================================================

const featureGrid = document.querySelector(".feature-grid");

if (featureGrid) {
  featureGrid.innerHTML = FEATURES.map(f => `
    <div class="feature-card reveal">
      <div class="feature-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          ${f.icon}
        </svg>
      </div>

      <h3>${f.title}</h3>
      <p>${f.body}</p>
    </div>
  `).join("");
}

// Spotlight hover
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();

    card.style.setProperty(
      "--mx",
      (e.clientX - r.left) + "px"
    );

    card.style.setProperty(
      "--my",
      (e.clientY - r.top) + "px"
    );
  });
});

// ============================================================
// RENDER WORKFLOW
// ============================================================

const workflowGrid = document.querySelector(".workflow-grid");

if (workflowGrid) {
  workflowGrid.innerHTML = STEPS.map((s, i) => `
    <li class="step reveal">
      <span class="step-num" aria-hidden="true">${s.n}</span>
      <span class="step-kicker">Step ${i + 1}</span>

      <h3>${s.title}</h3>
      <p>${s.body}</p>
    </li>
  `).join("");
}

// ============================================================
// RENDER FAQ
// ============================================================

const faqList = document.getElementById("faq-list");

if (faqList) {
  faqList.innerHTML = FAQ.map((item, i) => `
    <div class="faq-item reveal" data-i="${i}">
      <button
        class="faq-q"
        aria-expanded="false"
        type="button"
      >
        <span>${item.q}</span>

        <svg
          class="faq-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div class="faq-a">
        <div class="faq-a-inner">
          ${item.a}
        </div>
      </div>
    </div>
  `).join("");

  faqList.querySelectorAll(".faq-item").forEach(item => {
    const button = item.querySelector(".faq-q");

    button.addEventListener("click", () => {
      const open = item.classList.toggle("open");

      button.setAttribute(
        "aria-expanded",
        open
      );
    });
  });
}

// ============================================================
// STICKY HEADER
// ============================================================

const header = document.getElementById("site-header");

if (header) {
  const onScroll = () => {
    header.classList.toggle(
      "scrolled",
      window.scrollY > 12
    );
  };

  window.addEventListener(
    "scroll",
    onScroll,
    { passive: true }
  );

  onScroll();
}

// ============================================================
// MOBILE NAV
// ============================================================

const toggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");

if (toggle && mobileNav) {
  toggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      open
    );
  });

  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
    });
  });
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

function scrollToHash(hash) {
  if (!hash) return;

  const el = document.querySelector(hash);

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href");

    if (id && id.length > 1) {
      e.preventDefault();
      scrollToHash(id);
    }
  });
});

document.querySelectorAll("[data-scroll]").forEach(b => {
  b.addEventListener("click", () => {
    scrollToHash(b.dataset.scroll);
  });
});

// ============================================================
// REVEAL ON SCROLL
// ============================================================

const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document
  .querySelectorAll(".reveal")
  .forEach(el => io.observe(el));

// ============================================================
// ANIMATED STAT COUNTERS
// ============================================================

const statIO = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";

      const dur = 1400;
      const start = performance.now();

      const tick = now => {
        const p = Math.min(
          1,
          (now - start) / dur
        );

        const eased =
          1 - Math.pow(1 - p, 3);

        el.textContent =
          Math.round(end * eased) + suffix;

        if (p < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);

      statIO.unobserve(el);
    });
  },
  {
    threshold: 0.5
  }
);

document
  .querySelectorAll(".stat-num")
  .forEach(s => statIO.observe(s));

// ============================================================
// CURSOR GLOW
// ============================================================

const glow = document.getElementById("cursor-glow");

if (
  glow &&
  window.matchMedia("(hover:hover)").matches
) {
  window.addEventListener("mousemove", e => {
    glow.classList.add("active");

    glow.style.transform =
      `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });

  window.addEventListener("mouseleave", () => {
    glow.classList.remove("active");
  });
}

// ============================================================
// PARTICLE NETWORK
// ============================================================

(() => {
  const canvas =
    document.getElementById("particles");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let w;
  let h;
  let particles = [];

  const COUNT =
    window.innerWidth < 768
      ? 28
      : 56;

  function resize() {
    w = canvas.width =
      window.innerWidth;

    h = canvas.height =
      window.innerHeight;
  }

  function init() {
    particles =
      Array.from(
        { length: COUNT },
        () => ({
          x: Math.random() * w,
          y: Math.random() * h,

          vx:
            (Math.random() - 0.5) *
            0.3,

          vy:
            (Math.random() - 0.5) *
            0.3,

          r:
            Math.random() * 1.6 +
            0.6
        })
      );
  }

  function step() {
    ctx.clearRect(
      0,
      0,
      w,
      h
    );

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (
        p.x < 0 ||
        p.x > w
      ) {
        p.vx *= -1;
      }

      if (
        p.y < 0 ||
        p.y > h
      ) {
        p.vy *= -1;
      }

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(139,148,255,.55)";

      ctx.fill();
    }

    for (
      let i = 0;
      i < particles.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < particles.length;
        j++
      ) {
        const a = particles[i];
        const b = particles[j];

        const dx =
          a.x - b.x;

        const dy =
          a.y - b.y;

        const d =
          Math.hypot(
            dx,
            dy
          );

        if (d < 130) {
          ctx.beginPath();

          ctx.moveTo(
            a.x,
            a.y
          );

          ctx.lineTo(
            b.x,
            b.y
          );

          ctx.strokeStyle =
            `rgba(99,102,241,${(1 - d / 130) * 0.18})`;

          ctx.lineWidth = 1;

          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  resize();
  init();
  step();

  window.addEventListener(
    "resize",
    () => {
      resize();
      init();
    }
  );
})();

// ============================================================
// INTERACTIVE INTERVIEW
// ============================================================

const messagesEl =
  document.getElementById("messages");

const optionsEl =
  document.getElementById("options");

const inputEl =
  document.getElementById("answer-input");

const formEl =
  document.getElementById("answer-form");

const fillEl =
  document.getElementById("progress-fill");

const progLabel =
  document.getElementById("progress-label");

const blueprintEl =
  document.getElementById("blueprint");

const answers = {};

let qIndex = 0;

// ============================================================
// AI MESSAGE
// ============================================================

async function addMessage(
  text,
  who,
  typing = false
) {
  if (!messagesEl) return;

  const el =
    document.createElement("div");

  el.className =
    `msg ${who}`;

  messagesEl.appendChild(el);

  // User messages
  if (
    who === "user" ||
    !typing
  ) {
    el.textContent = text;

    messagesEl.scrollTop =
      messagesEl.scrollHeight;

    return el;
  }

  // AI typing animation
  let i = 0;

  while (
    i < text.length
  ) {
    el.textContent +=
      text.charAt(i);

    i++;

    messagesEl.scrollTop =
      messagesEl.scrollHeight;

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          18
        )
    );
  }

  return el;
}

// ============================================================
// TYPING INDICATOR
// ============================================================

function showTyping() {
  if (!messagesEl) return null;

  const t =
    document.createElement("div");

  t.className =
    "msg bot typing";

  t.innerHTML =
    "<span></span><span></span><span></span>";

  messagesEl.appendChild(t);

  messagesEl.scrollTop =
    messagesEl.scrollHeight;

  return t;
}

// ============================================================
// RENDER ANSWER OPTIONS
// ============================================================

function renderOptions(opts) {
  if (!optionsEl) return;

  optionsEl.innerHTML =
    opts
      .map(
        o =>
          `<button type="button" class="option-chip">${o}</button>`
      )
      .join("");

  optionsEl
    .querySelectorAll(".option-chip")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          submitAnswer(
            button.textContent
          );
        }
      );
    });
}

// ============================================================
// PROGRESS
// ============================================================

function setProgress() {
  if (!fillEl || !progLabel) return;

  const percentage =
    (qIndex /
      QUESTIONS.length) *
    100;

  fillEl.style.width =
    `${percentage}%`;

  progLabel.textContent =
    qIndex >= QUESTIONS.length
      ? "Complete"
      : `Question ${qIndex + 1} / ${QUESTIONS.length}`;
}

// ============================================================
// BLUEPRINT BLOCK
// ============================================================

function appendBlueprintBlock(
  label,
  value
) {
  if (!blueprintEl) return;

  const empty =
    blueprintEl.querySelector(
      ".bp-empty"
    );

  if (empty) {
    blueprintEl.innerHTML = "";
  }

  const block =
    document.createElement("div");

  block.className =
    "bp-block";

  block.innerHTML = `
    <div class="bp-label">
      ${label}
    </div>

    <div class="bp-content">
      ${value}
    </div>
  `;

  blueprintEl.appendChild(
    block
  );

  blueprintEl.scrollTop =
    blueprintEl.scrollHeight;
}

// ============================================================
// STACK RECOMMENDATION
// ============================================================

function recommendStack(a) {
  const s =
    (a.skill || "")
      .toLowerCase();

  if (
    s.includes("next")
  ) {
    return "Next.js 15 · Postgres (Supabase) · Tailwind · Vercel Edge";
  }

  if (
    s.includes("python")
  ) {
    return "FastAPI · Postgres · React (Vite) · Fly.io";
  }

  if (
    s.includes("react")
  ) {
    return "React + Node/Express · Postgres · Railway";
  }

  return "Next.js 15 · Supabase · Tailwind · Vercel — beginner-friendly default";
}

// ============================================================
// ROADMAP GENERATOR
// ============================================================

function generateRoadmap(scope) {

  switch (scope) {

    case "This weekend":
      return `
        <strong>Roadmap — 3-Day MVP Sprint</strong><br><br>
        <strong>Day 1 — Foundation</strong><br>
        Project setup, repository, database schema, authentication and environment configuration.<br><br>
        <strong>Day 2 — Core Product</strong><br>
        Build the main user flow, core CRUD operations, primary UI and API integration.<br><br>
        <strong>Day 3 — Ship</strong><br>
        Testing, bug fixing, responsive polish and production deployment.
      `;

    case "Two weeks":
      return `
        <strong>Roadmap — 2-Week MVP</strong><br><br>
        <strong>Week 1 — Foundation & Backend</strong><br>
        Project architecture, database schema, authentication, API layer and core backend logic.<br><br>
        <strong>Week 2 — Product & Launch</strong><br>
        Frontend implementation, core user flows, integration, testing, responsive polish and deployment.
      `;

    case "One month":
      return `
        <strong>Roadmap — 1-Month MVP</strong><br><br>
        <strong>Week 1 — Foundation</strong><br>
        Requirements, project setup, architecture, database schema, authentication and API foundation.<br><br>
        <strong>Week 2 — Core Features</strong><br>
        Build the primary user flows, CRUD operations, frontend screens and backend integration.<br><br>
        <strong>Week 3 — Product Depth</strong><br>
        Advanced features, validation, error handling, search/filtering, UX improvements and integrations.<br><br>
        <strong>Week 4 — Production</strong><br>
        Testing, performance optimization, security review, responsive polish, CI/CD and deployment.
      `;

    case "Two months":
      return `
        <strong>Roadmap — 2-Month Production Build</strong><br><br>
        <strong>Month 1 — Build the MVP</strong><br><br>
        <strong>Week 1 — Discovery & Architecture</strong><br>
        Finalize requirements, define user flows, choose architecture, initialize repository and configure environments.<br><br>
        <strong>Week 2 — Database & Authentication</strong><br>
        Design database schema, implement authentication, authorization, API structure and core backend services.<br><br>
        <strong>Week 3 — Core Product</strong><br>
        Build the main frontend, CRUD functionality, dashboards, forms and primary user workflows.<br><br>
        <strong>Week 4 — MVP Integration</strong><br>
        Connect frontend and backend, complete the main product flow, handle errors and release an internal MVP.<br><br>
        <strong>Month 2 — Improve & Launch</strong><br><br>
        <strong>Week 5 — Advanced Features</strong><br>
        Add secondary features, integrations, search/filtering, notifications and quality-of-life improvements.<br><br>
        <strong>Week 6 — UX & Performance</strong><br>
        Responsive design, accessibility, loading states, caching, performance optimization and UX refinement.<br><br>
        <strong>Week 7 — Testing & Security</strong><br>
        Unit tests, integration tests, edge cases, validation, security checks and production-readiness review.<br><br>
        <strong>Week 8 — Production Launch</strong><br>
        CI/CD, monitoring, analytics, final QA, production deployment and post-launch iteration plan.
      `;

    case "Three months":
      return `
        <strong>Roadmap — 3-Month Production Build</strong><br><br>
        <strong>Month 1 — Research & MVP</strong><br>
        Research, requirements, architecture, database, authentication, backend foundation and core product development.<br><br>
        <strong>Month 2 — Product Expansion</strong><br>
        Advanced features, integrations, improved UX, performance optimization and internal testing.<br><br>
        <strong>Month 3 — Production & Scale</strong><br>
        Security hardening, automated testing, CI/CD, observability, production deployment and scalability improvements.
      `;

    default:
      return `
        <strong>Roadmap</strong><br><br>
        <strong>Phase 1 — Planning</strong><br>
        Define requirements and architecture.<br><br>
        <strong>Phase 2 — Development</strong><br>
        Build the core product and integrations.<br><br>
        <strong>Phase 3 — Testing</strong><br>
        Test, optimize and fix issues.<br><br>
        <strong>Phase 4 — Deployment</strong><br>
        Deploy and monitor the production application.
      `;
  }
}

// ============================================================
// FINISH INTERVIEW
// ============================================================

async function finishInterview() {

  appendBlueprintBlock(
    "Recommended stack",
    recommendStack(answers)
  );

  const roadmap =
    generateRoadmap(
      answers.scope
    );

  appendBlueprintBlock(
    "Roadmap",
    roadmap
  );

  setTimeout(() => {

    appendBlueprintBlock(
      "Resume impact",
      `Shipped a full-stack ${(answers.idea || "product")
        .toLowerCase()
      } for ${(answers.users || "users")
        .toLowerCase()
      } in ${(answers.scope || "a sprint")
        .toLowerCase()
      }.`
    );

  }, 800);

  await addMessage(
    "Done! Your blueprint preview is on the right. Your roadmap has been generated based on your selected timeline.",
    "bot",
    true
  );

  if (optionsEl) {

    optionsEl.innerHTML = `
      <button
        type="button"
        class="option-chip"
        id="restart"
      >
        ↻ Restart interview
      </button>
    `;

    const restartButton =
      document.getElementById(
        "restart"
      );

    if (restartButton) {
      restartButton.addEventListener(
        "click",
        restart
      );
    }
  }

  if (inputEl) {
    inputEl.disabled = true;
  }
}

// ============================================================
// SUBMIT ANSWER
// ============================================================

async function submitAnswer(text) {

  const t =
    text.trim();

  if (!t) return;

  if (
    qIndex >= QUESTIONS.length
  ) {
    return;
  }

  await addMessage(
    t,
    "user"
  );

  const q =
    QUESTIONS[qIndex];

  answers[q.id] = t;

  appendBlueprintBlock(
    q.blueprintLabel,
    t
  );

  qIndex++;

  setProgress();

  if (optionsEl) {
    optionsEl.innerHTML = "";
  }

  if (inputEl) {
    inputEl.value = "";
  }

  const typing =
    showTyping();

  setTimeout(
    async () => {

      if (typing) {
        typing.remove();
      }

      if (
        qIndex <
        QUESTIONS.length
      ) {
        await askNext();
      } else {
        await finishInterview();
      }

    },
    700 +
    Math.random() * 400
  );
}

// ============================================================
// ASK NEXT QUESTION
// ============================================================

async function askNext() {

  if (
    qIndex >=
    QUESTIONS.length
  ) {
    return;
  }

  const q =
    QUESTIONS[qIndex];

  await addMessage(
    q.bot,
    "bot",
    true
  );

  renderOptions(
    q.options
  );

  setProgress();
}

// ============================================================
// RESTART INTERVIEW
// ============================================================

function restart() {

  qIndex = 0;

  for (
    const k of Object.keys(
      answers
    )
  ) {
    delete answers[k];
  }

  if (messagesEl) {
    messagesEl.innerHTML = "";
  }

  if (blueprintEl) {

    blueprintEl.innerHTML = `
      <div class="bp-empty">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline
            points="14 2 14 8 20 8"
          />
        </svg>
        <p>
          Your blueprint will materialize here as you answer.
        </p>
      </div>
    `;
  }

  if (inputEl) {
    inputEl.disabled = false;
    inputEl.value = "";
  }

  if (optionsEl) {
    optionsEl.innerHTML = "";
  }

  setProgress();

  askNext();
}

// ============================================================
// FORM SUBMISSION
// ============================================================

if (formEl) {

  formEl.addEventListener(
    "submit",
    e => {

      e.preventDefault();

      submitAnswer(
        inputEl.value
      );

    }
  );
}

// ============================================================
// START INTERVIEW WHEN DEMO ENTERS VIEW
// ============================================================

const demo =
  document.getElementById(
    "demo"
  );

if (
  demo &&
  messagesEl
) {

  const demoIO =
    new IntersectionObserver(
      entries => {

        entries.forEach(e => {

          if (
            e.isIntersecting &&
            qIndex === 0 &&
            messagesEl.children.length === 0
          ) {

            askNext();

            demoIO.disconnect();
          }

        });

      },
      {
        threshold: 0.3
      }
    );

  demoIO.observe(demo);
}

// ============================================================
// SAMPLE BLUEPRINT MODAL
// ============================================================

const modal =
  document.getElementById(
    "sample-modal"
  );

const openSample =
  document.getElementById(
    "open-sample"
  );

if (
  modal &&
  openSample
) {

  openSample.addEventListener(
    "click",
    () => {

      modal.classList.add(
        "open"
      );

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";
    }
  );

  modal
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(el => {

      el.addEventListener(
        "click",
        closeModal
      );

    });

  document.addEventListener(
    "keydown",
    e => {

      if (
        e.key === "Escape"
      ) {
        closeModal();
      }

    }
  );
}

function closeModal() {

  if (!modal) return;

  modal.classList.remove(
    "open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";
}

// ============================================================
// CURRENT YEAR
// ============================================================

const year =
  document.getElementById(
    "year"
  );

if (year) {
  year.textContent =
    new Date().getFullYear();
}
