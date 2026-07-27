/* Architect AI — Interactive landing JS */

// ---------- Data ----------
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
  { n: "01", title: "Interview", body: "A guided conversation captures your idea, audience, skills, and constraints." },
  { n: "02", title: "Analysis", body: "The engine reasons over your profile to pick the stack, scope, and architecture." },
  { n: "03", title: "Blueprint", body: "You receive a complete plan: roadmap, schema, APIs, deployment, and resume impact." },
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

// Interview script
const QUESTIONS = [
  {
    id: "idea",
    bot: "Hey 👋 I'm Architect. In one line, what are you building?",
    options: ["A SaaS dashboard", "A social mobile app", "An AI tool", "An e-commerce site"],
    blueprintLabel: "Project idea"
  },
  {
    id: "users",
    bot: "Got it. Who is it for?",
    options: ["Developers", "Small businesses", "Consumers", "Enterprise teams"],
    blueprintLabel: "Target users"
  },
  {
    id: "skill",
    bot: "What's your strongest stack right now?",
    options: ["React + Node", "Next.js + Postgres", "Python + FastAPI", "Beginner — pick for me"],
    blueprintLabel: "Primary stack"
  },
  {
    id: "scope",
    bot: "Last one — how soon do you want a v1 shipped?",
    options: ["This weekend", "Two weeks", "One month", "Three months"],
    blueprintLabel: "Target timeline"
  },
];

// ---------- Render: Features ----------
const featureGrid = document.querySelector(".feature-grid");
featureGrid.innerHTML = FEATURES.map(
  f => `
  <div class="feature-card reveal">
    <div class="feature-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${f.icon}</svg>
    </div>
    <h3>${f.title}</h3>
    <p>${f.body}</p>
  </div>`
).join("");

// Spotlight hover on feature cards
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
});

// ---------- Render: Workflow ----------
const workflowGrid = document.querySelector(".workflow-grid");
workflowGrid.innerHTML = STEPS.map(
  (s, i) => `
  <li class="step reveal">
    <span class="step-num" aria-hidden="true">${s.n}</span>
    <span class="step-kicker">Step ${i + 1}</span>
    <h3>${s.title}</h3>
    <p>${s.body}</p>
  </li>`
).join("");

// ---------- Render: FAQ ----------
const faqList = document.getElementById("faq-list");
faqList.innerHTML = FAQ.map(
  (item, i) => `
  <div class="faq-item reveal" data-i="${i}">
    <button class="faq-q" aria-expanded="false">
      <span>${item.q}</span>
      <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="faq-a"><div class="faq-a-inner">${item.a}</div></div>
  </div>`
).join("");

faqList.querySelectorAll(".faq-item").forEach(item => {
  item.querySelector(".faq-q").addEventListener("click", () => {
    const open = item.classList.toggle("open");
    item.querySelector(".faq-q").setAttribute("aria-expanded", open);
  });
});

// ---------- Sticky header ----------
const header = document.getElementById("site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile nav ----------
const toggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
toggle.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
mobileNav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => mobileNav.classList.remove("open"))
);

// ---------- Smooth scroll ----------
function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
  b.addEventListener("click", () => scrollToHash(b.dataset.scroll));
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// ---------- Animated stat counters ----------
const statIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll(".stat-num").forEach(s => statIO.observe(s));

// ---------- Cursor glow (desktop) ----------
const glow = document.getElementById("cursor-glow");
if (window.matchMedia("(hover:hover)").matches) {
  window.addEventListener("mousemove", e => {
    glow.classList.add("active");
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  window.addEventListener("mouseleave", () => glow.classList.remove("active"));
}

// ---------- Particle network ----------
(() => {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const COUNT = window.innerWidth < 768 ? 28 : 56;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,148,255,.55)";
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j];
        const dx = a.x - b.x,
          dy = a.y - b.y,
          d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 130) * 0.18})`;
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
  window.addEventListener("resize", () => {
    resize();
    init();
  });
})();

// ---------- Interactive interview demo ----------
const messagesEl = document.getElementById("messages");
const optionsEl = document.getElementById("options");
const inputEl = document.getElementById("answer-input");
const formEl = document.getElementById("answer-form");
const fillEl = document.getElementById("progress-fill");
const progLabel = document.getElementById("progress-label");
const blueprintEl = document.getElementById("blueprint");
const answers = {};
let qIndex = 0;

// ---- AI Thinking Panel ----
let thinkingInterval = null;
const thinkingMessages = [
  "Analyzing scalability...",
  "Considering authentication models...",
  "Matching stack to your skill level...",
  "Choosing optimal database...",
  "Evaluating deployment options...",
  "Weighing trade-offs for your timeline...",
  "Estimating complexity...",
  "Generating schema outline...",
];
let thinkingPanel = null;

function createThinkingPanel() {
  if (thinkingPanel) return thinkingPanel;
  // Inject panel right after the options area
  thinkingPanel = document.createElement("div");
  thinkingPanel.id = "thinking-panel";
  thinkingPanel.className = "thinking-panel";
  thinkingPanel.innerHTML = `<span class="thinking-text"></span>`;
  optionsEl.insertAdjacentElement("afterend", thinkingPanel);
  return thinkingPanel;
}

function startThinking() {
  if (thinkingInterval) return;
  const panel = createThinkingPanel();
  const textEl = panel.querySelector(".thinking-text");
  let idx = 0;
  textEl.textContent = thinkingMessages[0];
  thinkingInterval = setInterval(() => {
    idx = (idx + 1) % thinkingMessages.length;
    textEl.textContent = thinkingMessages[idx];
    // Small fade animation
    textEl.style.opacity = 0;
    setTimeout(() => (textEl.style.opacity = 1), 100);
  }, 1800);
}

function stopThinking() {
  if (thinkingInterval) {
    clearInterval(thinkingInterval);
    thinkingInterval = null;
  }
  if (thinkingPanel) {
    thinkingPanel.remove();
    thinkingPanel = null;
  }
}

// ---- Progress Timeline (premium) ----
const progressSteps = [
  "Understanding idea",
  "Finding audience",
  "Choosing stack",
  "Building architecture",
  "Finalizing blueprint"
];

function setProgress() {
  const filled = qIndex / QUESTIONS.length;
  fillEl.style.width = `${filled * 100}%`;

  // Build the visual progress timeline inside progLabel
  let html = '<div class="progress-timeline">';
  progressSteps.forEach((step, i) => {
    // Determine state based on current qIndex
    // Questions 0-3 map to steps 0-3; step 4 (Finalizing) is only active when qIndex === 4
    let state = "pending";
    if (i < qIndex) state = "completed";
    else if (i === qIndex && qIndex < QUESTIONS.length) state = "active";
    else if (qIndex >= QUESTIONS.length && i === progressSteps.length - 1) state = "active";

    const icon =
      state === "completed"
        ? "✓"
        : state === "active"
          ? "●"
          : "○";
    const cssClass = state === "completed" ? "done" : state === "active" ? "current" : "";
    html += `<span class="step-indicator ${cssClass}">${icon} ${step}</span>`;
  });
  html += '</div>';
  progLabel.innerHTML = html;
}

// ---- Blueprint streaming ----
function recommendStack(a) {
  const s = (a.skill || "").toLowerCase();
  if (s.includes("next")) return "Next.js 15 · Postgres (Supabase) · Tailwind · Vercel Edge";
  if (s.includes("python")) return "FastAPI · Postgres · React (Vite) · Fly.io";
  if (s.includes("react")) return "React + Node/Express · Postgres · Railway";
  return "Next.js 15 · Supabase · Tailwind · Vercel ← beginner-friendly default";
}

function generateRoadmap(scope) {
  switch (scope) {
    case "This weekend":
      return `Day 1 — Project setup + authentication\nDay 2 — Core features\nDay 3 — Testing + deployment`;
    case "Two weeks":
      return `Week 1 — Database, authentication & backend\nWeek 2 — Frontend, testing & deployment`;
    case "One month":
      return `Week 1 — Planning + authentication\nWeek 2 — Core features\nWeek 3 — Advanced features\nWeek 4 — Testing, optimization & deployment`;
    case "Three months":
      return `Month 1 — Research, planning & MVP\nMonth 2 — Advanced features & integrations\nMonth 3 — Testing, scaling & production deployment`;
    default:
      return `Week 1 — Planning\nWeek 2 — Development\nWeek 3 — Testing\nWeek 4 — Deployment`;
  }
}

async function appendBlueprintBlock(label, value) {
  if (blueprintEl.querySelector(".bp-empty")) blueprintEl.innerHTML = "";
  const block = document.createElement("div");
  block.className = "bp-block";
  block.innerHTML = `<div class="bp-label">${label}</div><div class="bp-content">${value.replace(/\n/g, "<br>")}</div>`;
  blueprintEl.appendChild(block);
  blueprintEl.scrollTop = blueprintEl.scrollHeight;
}

// Streaming helper: show a "Generating..." message, then replace with final content
async function streamBlueprintBlock(label, finalValue, delay = 1200) {
  const tempLabel = `Generating ${label}...`;
  await appendBlueprintBlock(tempLabel, "");
  const block = blueprintEl.lastElementChild;
  const contentEl = block.querySelector(".bp-content");
  // small pause then reveal final
  await new Promise(r => setTimeout(r, delay));
  block.querySelector(".bp-label").textContent = `✔ ${label}`;
  contentEl.innerHTML = finalValue.replace(/\n/g, "<br>");
  blueprintEl.scrollTop = blueprintEl.scrollHeight;
}

// ---- Interview flow with premium enhancements ----
async function addMessage(text, who, typing = false) {
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  messagesEl.appendChild(el);

  if (who === "user" || !typing) {
    el.textContent = text;
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  let i = 0;
  while (i < text.length) {
    el.textContent += text.charAt(i);
    i++;
    messagesEl.scrollTop = messagesEl.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 18));
  }
  return el;
}

function showTyping() {
  const t = document.createElement("div");
  t.className = "msg bot typing";
  t.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(t);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return t;
}

function renderOptions(opts) {
  optionsEl.innerHTML = opts.map(o => `<button type="button" class="option-chip">${o}</button>`).join("");
  optionsEl.querySelectorAll(".option-chip").forEach(b =>
    b.addEventListener("click", () => submitAnswer(b.textContent))
  );
}

async function submitAnswer(text) {
  const t = text.trim();
  if (!t) return;

  await addMessage(t, "user");
  const q = QUESTIONS[qIndex];
  answers[q.id] = t;

  // Append answer to blueprint instantly (still good for preview)
  appendBlueprintBlock(q.blueprintLabel, t);

  qIndex++;
  setProgress();
  optionsEl.innerHTML = "";
  inputEl.value = "";

  const typing = showTyping();
  setTimeout(async () => {
    typing.remove();
    if (qIndex < QUESTIONS.length) {
      await askNext();
    } else {
      await finishInterview();
    }
  }, 700 + Math.random() * 400);
}

async function askNext() {
  const q = QUESTIONS[qIndex];
  await addMessage(q.bot, "bot", true);
  renderOptions(q.options);
  setProgress();
}

async function finishInterview() {
  // Show AI thinking panel and start rotating messages
  startThinking();

  // Simulate blueprint generation streaming
  // 1. Recommended stack
  await streamBlueprintBlock("Stack", recommendStack(answers), 1400);

  // 2. Database
  const db = recommendStack(answers).includes("Supabase") ? "PostgreSQL (via Supabase)" : "PostgreSQL";
  await streamBlueprintBlock("Database", db, 1200);

  // 3. APIs
  await streamBlueprintBlock("APIs", "REST + JWT auth", 1000);

  // 4. Deployment
  const deploy = recommendStack(answers).includes("Vercel") ? "Vercel" : "Railway / Fly.io";
  await streamBlueprintBlock("Deployment", deploy, 1000);

  // 5. Roadmap
  await streamBlueprintBlock("Roadmap (v1)", generateRoadmap(answers.scope), 1400);

  // 6. Resume impact (with a slight delay)
  await new Promise(r => setTimeout(r, 800));
  await appendBlueprintBlock(
    "Resume impact",
    `Shipped a full-stack ${(answers.idea || "product").toLowerCase()} for ${(answers.users || "users").toLowerCase()} in ${(answers.scope || "a sprint").toLowerCase()}.`
  );

  // Stop thinking and clean up
  stopThinking();

  await addMessage(
    "Done! Your blueprint preview is on the right. Tap 'See a sample blueprint' for a full example.",
    "bot",
    true
  );

  optionsEl.innerHTML = `<button type="button" class="option-chip" id="restart">↻ Restart interview</button>`;
  document.getElementById("restart").addEventListener("click", restart);
  inputEl.disabled = true;

  // Final progress – mark all steps complete
  qIndex = QUESTIONS.length;
  setProgress();
}

function restart() {
  qIndex = 0;
  for (const k of Object.keys(answers)) delete answers[k];
  messagesEl.innerHTML = "";
  blueprintEl.innerHTML = `
    <div class="bp-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <p>Your blueprint will materialize here as you answer.</p>
    </div>`;
  inputEl.disabled = false;
  stopThinking();  // in case it was left hanging
  askNext();
}

formEl.addEventListener("submit", e => {
  e.preventDefault();
  submitAnswer(inputEl.value);
});

// Kick off the interview when demo enters view
const demoIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && qIndex === 0 && messagesEl.children.length === 0) {
      askNext();
      demoIO.disconnect();
    }
  });
}, { threshold: 0.3 });
demoIO.observe(document.getElementById("demo"));

// ---------- Sample-blueprint modal ----------
const modal = document.getElementById("sample-modal");
document.getElementById("open-sample").addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
});
modal.querySelectorAll("[data-close-modal]").forEach(el =>
  el.addEventListener("click", closeModal)
);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ---------- Year ----------
document.getElementById("year").textContent = new Date().getFullYear();
