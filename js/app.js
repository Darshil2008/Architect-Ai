/**
 * Architect AI — Main Application Orchestrator Module (js/app.js)
 * 
 * Clean ES6 module integrating:
 * - storage.js (LocalStorage API key & session history CRUD)
 * - gemini.js (Live REST client & connection tester)
 * - mockEngine.js (Intelligent heuristic domain classifier & archetype blueprints)
 * - interview.js (Adaptive 4-6 turn state machine)
 * - blueprint.js (Multi-tab visualizer, schema cards, Mermaid SVG, roadmap)
 * - export.js (Markdown, JSON, PDF & Clipboard exports)
 * - ui.js (Modals, toasts, animations, suggestion chips, particle canvas)
 * 
 * @module app
 */

import {
  getApiKey,
  setApiKey,
  clearApiKey,
  hasApiKey,
  maskApiKey,
  getModelPreference,
  setModelPreference,
  getEngineMode,
  setEngineMode,
  getHistory,
  getBlueprintById,
  saveBlueprint,
  deleteBlueprint,
  clearHistory
} from "./storage.js";

import { testConnection } from "./gemini.js";
import { classifyDomain, ARCHETYPE_BLUEPRINTS } from "./mockEngine.js";
import { InterviewEngine } from "./interview.js";
import { renderBlueprint, switchTab, initMermaid } from "./blueprint.js";
import { exportMarkdown, exportJSON, exportPDF, copyMarkdown, copyJSON, copyMermaid } from "./export.js";
import {
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
} from "./ui.js";

// ============================================================
// APPLICATION STATE
// ============================================================

let interviewEngine = null;
let activeBlueprint = null;
let isAnswering = false;

// Sample Recipe PWA blueprint for instant preview
const SAMPLE_RECIPE_BLUEPRINT = {
  id: "bp_sample_recipe_pwa",
  timestamp: new Date().toISOString(),
  summary: {
    title: "RecipeCraft PWA — Smart Culinary Companion",
    tagline: "High-performance offline-first recipe sharing and meal planning progressive web app",
    domain: "mobile",
    targetScale: "50K Daily Active Users · 1.2K peak RPS",
    estimatedMonthlyCost: "$45 - $90 / month",
    description: "An edge-rendered, local-first progressive web app engineered for instant recipe indexing, offline kitchen mode, ingredient scaling, and peer sharing with sub-50ms latency."
  },
  stack: {
    frontend: { name: "Next.js 15 (App Router) + PWA", reason: "Server Components with Service Worker caching for instant offline kitchen rendering.", tradeoffs: "Requires client hydration management for offline mutations." },
    backend: { name: "Supabase (PostgreSQL + Edge Functions)", reason: "Managed PostgreSQL with Row Level Security (RLS) and auto-generated REST/GraphQL APIs.", tradeoffs: "Vendor lock-in on Supabase Auth & Realtime infrastructure." },
    database: { name: "PostgreSQL 16 + pgvector", reason: "Relational integrity for user data combined with vector embeddings for semantic recipe search.", tradeoffs: "Requires memory provisioning for vector index caching." },
    caching: { name: "Upstash Redis + IndexedDB (Local)", reason: "Global edge session caching paired with IndexedDB for zero-latency offline browsing.", tradeoffs: "Bidirectional state synchronization complexity during reconnect." },
    hosting: { name: "Vercel Edge Network + Cloudflare CDN", reason: "Sub-20ms global time-to-first-byte (TTFB) and asset edge optimization.", tradeoffs: "Serverless execution timeout limits (15-30s)." },
    ci_cd: { name: "GitHub Actions + Vercel Preview Deployments", reason: "Automated end-to-end testing, lighthouse audits, and branch preview pipelines.", tradeoffs: "Build concurrency limits on free-tier runners." },
    observability: { name: "Sentry + OpenTelemetry", reason: "Real-time client crash reporting and distributed edge tracing.", tradeoffs: "High data volume ingestion costs at scale." }
  },
  schema: {
    databaseType: "PostgreSQL 16 with pgvector & RLS",
    tables: [
      {
        name: "users",
        purpose: "User authentication profiles, culinary preferences, and dietary restrictions.",
        columns: [
          { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Unique auth user ID" },
          { name: "handle", type: "VARCHAR(32)", constraints: ["UNIQUE", "NOT NULL"], description: "Public username handle" },
          { name: "email", type: "VARCHAR(255)", constraints: ["UNIQUE", "NOT NULL"], description: "Primary email address" },
          { name: "dietary_preferences", type: "JSONB", constraints: ["NOT NULL"], description: "Array of dietary restriction tags" },
          { name: "created_at", type: "TIMESTAMPTZ", constraints: ["NOT NULL"], description: "Account creation timestamp" }
        ],
        indexes: ["idx_users_handle", "idx_users_email"],
        relationships: ["1:N -> recipes (author_id)", "1:N -> recipe_likes (user_id)"]
      },
      {
        name: "recipes",
        purpose: "Core recipe catalog items with cooking steps, servings, and nutrition.",
        columns: [
          { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Primary recipe ID" },
          { name: "author_id", type: "UUID", constraints: ["FK", "NOT NULL"], description: "References users(id)" },
          { name: "title", type: "VARCHAR(128)", constraints: ["NOT NULL"], description: "Recipe title" },
          { name: "description", type: "TEXT", constraints: [], description: "Short summary" },
          { name: "prep_time_minutes", type: "INTEGER", constraints: ["NOT NULL"], description: "Preparation duration" },
          { name: "servings", type: "INTEGER", constraints: ["NOT NULL"], description: "Serving yield count" },
          { name: "embedding", type: "VECTOR(1536)", constraints: [], description: "Semantic vector for similarity search" }
        ],
        indexes: ["idx_recipes_author", "idx_recipes_embedding_cosine"],
        relationships: ["N:1 -> users (author_id)", "1:N -> ingredients (recipe_id)"]
      },
      {
        name: "ingredients",
        purpose: "Structured ingredient items linked to recipes with unit measures.",
        columns: [
          { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Primary ingredient ID" },
          { name: "recipe_id", type: "UUID", constraints: ["FK", "NOT NULL"], description: "References recipes(id)" },
          { name: "name", type: "VARCHAR(64)", constraints: ["NOT NULL"], description: "Ingredient name" },
          { name: "quantity", type: "NUMERIC(8,2)", constraints: ["NOT NULL"], description: "Numeric quantity" },
          { name: "unit", type: "VARCHAR(24)", constraints: ["NOT NULL"], description: "Measurement unit" }
        ],
        indexes: ["idx_ingredients_recipe"],
        relationships: ["N:1 -> recipes (recipe_id)"]
      }
    ]
  },
  architecture: {
    mermaid: `flowchart TD
  subgraph Client_Layer ["Client & PWA Layer"]
    Client["📱 RecipeCraft PWA<br/><b>Next.js 15 + Service Worker</b>"]
    IDB[("💾 Local Cache<br/><b>IndexedDB Offline Store</b>")]
    CDN["⚡ Edge CDN<br/><b>Vercel Edge Network</b>"]
  end

  subgraph Gateway_Layer ["API & Ingress"]
    Gateway["🛡️ Supabase API Gateway<br/><b>JWT Auth & RLS Proxy</b>"]
  end

  subgraph Service_Layer ["Application & Compute"]
    Functions["⚙️ Edge Functions<br/><b>Deno TypeScript Runtime</b>"]
    Workers["🔄 Background Worker<br/><b>Image Optimization & AI Vectorizer</b>"]
  end

  subgraph Storage_Layer ["Persistence & Caching"]
    DB[("🗄️ Primary Database<br/><b>PostgreSQL 16 + pgvector</b>")]
    Redis[("⚡ Edge Cache<br/><b>Upstash Redis</b>")]
  end

  Client -->|Offline Read/Write| IDB
  Client -->|HTTPS / WSS| CDN
  CDN --> Gateway
  Gateway --> Functions
  Functions -->|ACID Queries| DB
  Functions -->|Session / Rate Limit| Redis
  Functions -.->|Async Pipeline| Workers
  Workers --> DB

  classDef client fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
  classDef gateway fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
  classDef service fill:#1e1b4b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
  classDef storage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

  class Client,IDB,CDN client;
  class Gateway gateway;
  class Functions,Workers service;
  class DB,Redis storage;`,
    components: [
      { name: "RecipeCraft PWA Client", layer: "Client", description: "Next.js 15 App Router client with Service Worker offline kitchen mode." },
      { name: "Supabase API Gateway", layer: "Ingress", description: "Row Level Security proxy handling authentication and authorization." },
      { name: "PostgreSQL Database", layer: "Persistence", description: "Primary database with pgvector semantic similarity search." },
      { name: "Upstash Redis", layer: "Caching", description: "Global low-latency cache for recipe feeds and session state." }
    ]
  },
  roadmap: {
    totalDuration: "4 Weeks (4 Sprints)",
    phases: [
      {
        phaseNumber: 1,
        name: "Foundation & Offline PWA Scaffolding",
        duration: "Week 1",
        focus: "Next.js 15 setup, Service Worker caching, and Supabase database schema migrations.",
        tasks: [
          "Initialize Next.js 15 project with TypeScript & Tailwind CSS",
          "Configure Service Worker with Workbox for offline asset caching",
          "Execute PostgreSQL schema migrations for users, recipes, and ingredients tables",
          "Implement Supabase Auth with Google & Email OTP sign-in"
        ],
        risks: ["Service Worker cache invalidation quirks across mobile Safari"]
      },
      {
        phaseNumber: 2,
        name: "Recipe Engine & Local Storage Sync",
        duration: "Week 2",
        focus: "CRUD operations, IndexedDB local persistence, and background sync.",
        tasks: [
          "Build recipe creation and dynamic ingredient unit scaling UI",
          "Implement IndexedDB local storage layer with Dexie.js",
          "Create bidirectional synchronization queue for offline mutations",
          "Add pgvector similarity embeddings generation for recipe recommendations"
        ],
        risks: ["Merge conflict resolution when editing recipes across multiple devices"]
      },
      {
        phaseNumber: 3,
        name: "Kitchen Mode & Real-time Cooking Timer",
        duration: "Week 3",
        focus: "Interactive step-by-step cooking view and screen wake lock integration.",
        tasks: [
          "Implement screen wake lock API to prevent device sleep while cooking",
          "Create voice-assisted or hands-free step navigation",
          "Integrate Upstash Redis for trending recipe feeds and global analytics"
        ],
        risks: ["Screen wake lock API permission discrepancies on older devices"]
      },
      {
        phaseNumber: 4,
        name: "Performance Hardening & Production Launch",
        duration: "Week 4",
        focus: "Lighthouse PWA audit, automated CI/CD pipeline, and domain deployment.",
        tasks: [
          "Run full Lighthouse audit achieving 95+ scores on PWA, Performance, and A11y",
          "Configure GitHub Actions CI/CD pipeline with automated Playwright tests",
          "Deploy production cluster to Vercel with custom domain & SSL"
        ],
        risks: ["Cold start latencies on Edge Functions during initial spike traffic"]
      }
    ]
  },
  resumeImpact: {
    headline: "Engineered High-Performance Offline-First Recipe PWA with Next.js 15 & PostgreSQL",
    bulletPoints: [
      "Architected local-first progressive web app utilizing Service Workers and IndexedDB, enabling 100% offline usability with sub-50ms interaction latency.",
      "Designed PostgreSQL relational schema with Row Level Security (RLS) and pgvector semantic embeddings, scaling to 50K DAU.",
      "Built automated GitHub Actions CI/CD pipeline with Lighthouse validation, maintaining 98% test coverage and 99.9% uptime SLA."
    ],
    skillsDemonstrated: ["Next.js 15", "PWA", "PostgreSQL", "pgvector", "Supabase", "Redis", "TypeScript", "System Architecture"]
  }
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/**
 * Initializes all core application subsystems.
 */
function initApp() {
  // 1. Initialize Visual Effects & Micro-Interactions
  initParticles("particles");
  initCursorGlow("cursor-glow");
  initSpotlightHover(".feature-card, .cta-card");
  initStatsCounters(".stat-num");
  initFaqAccordion("faq-list");
  initMobileNav("menu-toggle", "mobile-nav");
  initSmoothScroll();
  initScrollReveal();
  initModals();
  initMermaid();

  // 2. Set Current Year in Footer
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Initialize Interview Engine & Event Listeners
  initInterviewEngine();

  // 4. Initialize Settings Modal & Controls
  initSettingsModal();

  // 5. Initialize History Modal & Drawer
  initHistoryModal();

  // 6. Initialize Sample Blueprint & Hero CTA Wiring
  initSampleAndCtaWiring();

  // 7. Initialize Export Action Buttons Delegation
  initExportActionsDelegation();

  // 8. Start Initial Interview Turn
  startInitialInterview();
}

// ============================================================
// INTERVIEW ENGINE INITIALIZATION & EVENT WIRING
// ============================================================

function initInterviewEngine() {
  const currentMode = getEngineMode();
  const currentModel = getModelPreference();

  interviewEngine = new InterviewEngine({
    mode: currentMode,
    model: currentModel
  });

  const messagesContainer = document.getElementById("messages");
  const optionsContainer = document.getElementById("options");
  const form = document.getElementById("answer-form");
  const input = document.getElementById("answer-input");
  const fillEl = document.getElementById("progress-fill");
  const labelEl = document.getElementById("progress-label");

  // --- Engine Event: Stage Change ---
  interviewEngine.on("stageChange", (data) => {
    updateProgressBar(fillEl, labelEl, data.stageIndex, data.totalStages);
  });

  // --- Engine Event: Message Added ---
  interviewEngine.on("message", async (data) => {
    if (data.sender === "user") {
      appendChatMessage(data.text, "user", messagesContainer);
    } else if (data.sender === "bot") {
      showTypingIndicator(messagesContainer);

      // Simulate typewriter effect for natural conversational pacing
      const msgEl = appendChatMessage("", "bot", messagesContainer);
      removeTypingIndicator(messagesContainer);

      await interviewEngine.simulateTyping(
        data.text,
        (partial) => {
          if (msgEl) {
            msgEl.textContent = partial;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        },
        14
      );

      if (data.usedFallback) {
        showToast("Switched to intelligent offline heuristic mode.", "info", 3000);
      }
    }
  });

  // --- Engine Event: Chips Update ---
  interviewEngine.on("chipsUpdate", (data) => {
    renderSuggestionChips(optionsContainer, data.options, (selectedText) => {
      handleAnswerSubmit(selectedText);
    });
  });

  // --- Engine Event: Blueprint Ready ---
  interviewEngine.on("blueprintReady", (data) => {
    activeBlueprint = data.blueprint;
    const bpContainer = document.getElementById("blueprint");
    if (bpContainer) {
      renderBlueprint(data.blueprint, bpContainer);
    }

    showToast("🎉 System Architecture Blueprint synthesized successfully!", "success", 4500);

    // If live API fallback occurred during synthesis, inform user gracefully
    if (data.usedFallback) {
      showToast("Blueprint synthesized using intelligent heuristic archetype engine.", "info", 3500);
    }
  });

  // --- Engine Event: Error ---
  interviewEngine.on("error", (data) => {
    if (data.fallbackUsed) {
      showToast("Live API request encountered rate limit / network error. Falling back seamlessly.", "warning", 4000);
    } else {
      showToast(data.error?.message || "An unexpected error occurred.", "error", 4000);
    }
  });

  // --- Chat Form Submit Handler ---
  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text.length > 0) {
        handleAnswerSubmit(text);
        input.value = "";
      }
    });
  }
}

/**
 * Submits an answer to the interview engine with UI disable locks.
 * 
 * @param {string} text - User response text
 */
async function handleAnswerSubmit(text) {
  if (isAnswering || !text) return;
  isAnswering = true;

  const form = document.getElementById("answer-form");
  const input = document.getElementById("answer-input");
  const submitBtn = form?.querySelector("button[type="submit"]");
  const optionsContainer = document.getElementById("options");

  if (input) input.disabled = true;
  if (submitBtn) submitBtn.disabled = true;
  if (optionsContainer) optionsContainer.innerHTML = "";

  try {
    await interviewEngine.submitAnswer(text);
  } catch (err) {
    console.error("[app] Submit answer error:", err);
    showToast(err.message || "Failed to process response.", "error", 3500);
  } finally {
    isAnswering = false;
    if (input) {
      input.disabled = false;
      input.focus();
    }
    if (submitBtn) submitBtn.disabled = false;
  }
}

/**
 * Starts or restarts the initial discovery question.
 */
async function startInitialInterview() {
  if (!interviewEngine) return;
  const messagesContainer = document.getElementById("messages");
  if (messagesContainer) {
    messagesContainer.innerHTML = "";
  }
  await interviewEngine.startInterview();
}

// ============================================================
// SETTINGS MODAL & API KEY MANAGEMENT
// ============================================================

function initSettingsModal() {
  const modal = document.getElementById("settings-modal");
  if (!modal) return;

  const keyInput = document.getElementById("api-key-input");
  const toggleVisibilityBtn = document.getElementById("btn-toggle-key-visibility");
  const modelSelect = document.getElementById("model-select");
  const modeSelect = document.getElementById("mode-select");
  const testConnBtn = document.getElementById("btn-test-connection");
  const saveBtn = document.getElementById("btn-save-settings");
  const clearKeyBtn = document.getElementById("btn-clear-key");
  const statusBadge = document.getElementById("settings-status-badge");
  const testResultBox = document.getElementById("test-connection-result");

  // Sync current storage state into modal inputs
  function refreshSettingsModalFields() {
    const currentKey = getApiKey();
    const currentModel = getModelPreference();
    const currentMode = getEngineMode();

    if (keyInput) {
      keyInput.value = currentKey || "";
    }
    if (modelSelect) {
      modelSelect.value = currentModel;
    }
    if (modeSelect) {
      modeSelect.value = currentMode;
    }

    if (statusBadge) {
      if (currentKey) {
        statusBadge.textContent = `Configured (${maskApiKey(currentKey)})`;
        statusBadge.className = "status-badge configured";
      } else {
        statusBadge.textContent = "Offline Heuristic Mode (No Key)";
        statusBadge.className = "status-badge unconfigured";
      }
    }

    if (testResultBox) {
      testResultBox.innerHTML = "";
      testResultBox.style.display = "none";
    }
  }

  // Open settings triggers
  document.querySelectorAll("[data-open-settings]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      refreshSettingsModalFields();
      openModal("settings-modal");
    });
  });

  // Key Visibility Toggle
  if (toggleVisibilityBtn && keyInput) {
    toggleVisibilityBtn.addEventListener("click", () => {
      const isPassword = keyInput.type === "password";
      keyInput.type = isPassword ? "text" : "password";
      toggleVisibilityBtn.innerHTML = isPassword
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  }

  // Test Connection Action
  if (testConnBtn) {
    testConnBtn.addEventListener("click", async () => {
      const keyToTest = (keyInput ? keyInput.value.trim() : "") || getApiKey();
      const modelToTest = modelSelect ? modelSelect.value : getModelPreference();

      if (!keyToTest) {
        showToast("Please enter an API key first to test connection.", "warning", 3000);
        if (testResultBox) {
          testResultBox.style.display = "block";
          testResultBox.innerHTML = `<span class="test-error">⚠️ No API key provided.</span>`;
        }
        return;
      }

      testConnBtn.disabled = true;
      testConnBtn.textContent = "Testing...";

      if (testResultBox) {
        testResultBox.style.display = "block";
        testResultBox.innerHTML = `<span class="test-loading">Connecting to Google Generative Language API (${escapeHTML(modelToTest)})...</span>`;
      }

      try {
        const isOk = await testConnection(keyToTest, modelToTest);
        if (isOk) {
          if (testResultBox) {
            testResultBox.innerHTML = `<span class="test-success">✔ Connection Successful! ${escapeHTML(modelToTest)} is responsive.</span>`;
          }
          showToast(`✔ Gemini API connection verified (${modelToTest})!`, "success", 3500);
        } else {
          if (testResultBox) {
            testResultBox.innerHTML = `<span class="test-error">✖ Connection failed. Verify API key and permissions.</span>`;
          }
          showToast("✖ Gemini API connection test failed.", "error", 3500);
        }
      } catch (connErr) {
        if (testResultBox) {
          testResultBox.innerHTML = `<span class="test-error">✖ Error: ${escapeHTML(connErr.message || "Connection failed")}</span>`;
        }
        showToast(`✖ Connection Error: ${connErr.message || "Failed"}`, "error", 4000);
      } finally {
        testConnBtn.disabled = false;
        testConnBtn.textContent = "Test Connection";
      }
    });
  }

  // Save Settings Action
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const newKey = keyInput ? keyInput.value.trim() : "";
      const newModel = modelSelect ? modelSelect.value : getModelPreference();
      const newMode = modeSelect ? modeSelect.value : getEngineMode();

      if (newKey) {
        setApiKey(newKey);
      } else {
        clearApiKey();
      }

      setModelPreference(newModel);
      setEngineMode(newMode);

      if (interviewEngine) {
        interviewEngine.setModel(newModel);
        interviewEngine.setEngineMode(newMode);
      }

      closeModal("settings-modal");
      showToast("Settings saved successfully.", "success", 3000);
    });
  }

  // Clear Key Action
  if (clearKeyBtn) {
    clearKeyBtn.addEventListener("click", () => {
      clearApiKey();
      if (keyInput) keyInput.value = "";
      refreshSettingsModalFields();
      showToast("API key cleared. Architect AI will run in offline heuristic mode.", "info", 3500);
    });
  }
}

// ============================================================
// SESSION HISTORY MODAL & DRAWER
// ============================================================

function initHistoryModal() {
  const modal = document.getElementById("history-modal");
  if (!modal) return;

  const listContainer = document.getElementById("history-list");
  const clearAllBtn = document.getElementById("btn-clear-all-history");

  function renderHistoryList() {
    if (!listContainer) return;
    const history = getHistory();

    if (history.length === 0) {
      listContainer.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h4>No Saved Blueprints Yet</h4>
          <p>Complete an architecture interview to automatically save your blueprints here.</p>
        </div>
      `;
      if (clearAllBtn) clearAllBtn.style.display = "none";
      return;
    }

    if (clearAllBtn) clearAllBtn.style.display = "inline-flex";

    listContainer.innerHTML = history.map((item, index) => {
      const summary = item.summary || {};
      const title = summary.title || item.title || "Untitled Architecture";
      const domain = summary.domain || item.domain || "Architecture";
      const scale = summary.targetScale || "Scalable System";
      const cost = summary.estimatedMonthlyCost || "Cost-Optimized";
      const stack = item.stack || {};
      const stackSnippet = Object.values(stack).map(s => s?.name).filter(Boolean).slice(0, 3).join(" · ") || "Full Stack Blueprint";

      let formattedDate = "Recently";
      if (item.timestamp) {
        try {
          formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        } catch {
          formattedDate = String(item.timestamp);
        }
      }

      return `
        <div class="history-item-card glass" data-id="${escapeHTML(item.id)}">
          <div class="history-item-top">
            <div class="history-item-heading">
              <span class="history-domain-badge">${escapeHTML(domain)}</span>
              <h4 class="history-title">${escapeHTML(title)}</h4>
            </div>
            <span class="history-date">${escapeHTML(formattedDate)}</span>
          </div>

          <p class="history-meta">
            <span><strong>Scale:</strong> ${escapeHTML(scale)}</span>
            <span>·</span>
            <span><strong>Cost:</strong> ${escapeHTML(cost)}</span>
          </p>

          <p class="history-stack mono">${escapeHTML(stackSnippet)}</p>

          <div class="history-item-actions">
            <button class="btn btn-glass btn-sm btn-load-history" data-id="${escapeHTML(item.id)}" title="Load Blueprint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Load
            </button>
            <button class="btn btn-glass btn-sm btn-export-md-history" data-id="${escapeHTML(item.id)}" title="Export Markdown">
              MD
            </button>
            <button class="btn btn-glass btn-sm btn-export-json-history" data-id="${escapeHTML(item.id)}" title="Export JSON">
              JSON
            </button>
            <button class="btn btn-ghost btn-sm btn-delete-history" data-id="${escapeHTML(item.id)}" title="Delete from History">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Attach event listeners to history item action buttons
    listContainer.querySelectorAll(".btn-load-history").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const bp = getBlueprintById(id);
        if (bp) {
          activeBlueprint = bp;
          const bpContainer = document.getElementById("blueprint");
          if (bpContainer) {
            renderBlueprint(bp, bpContainer);
          }
          closeModal("history-modal");
          showToast(`Loaded "${bp.summary?.title || "Architecture"}" into blueprint visualizer.`, "success", 3000);

          // Scroll smoothly to demo view
          const demoSection = document.getElementById("demo");
          if (demoSection) {
            demoSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    listContainer.querySelectorAll(".btn-export-md-history").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const bp = getBlueprintById(id);
        if (bp) {
          exportMarkdown(bp);
          showToast("Exporting Markdown...", "info", 2000);
        }
      });
    });

    listContainer.querySelectorAll(".btn-export-json-history").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const bp = getBlueprintById(id);
        if (bp) {
          exportJSON(bp);
          showToast("Exporting JSON...", "info", 2000);
        }
      });
    });

    listContainer.querySelectorAll(".btn-delete-history").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (id) {
          deleteBlueprint(id);
          renderHistoryList();
          showToast("Session removed from history.", "info", 2500);
        }
      });
    });
  }

  // Open history triggers
  document.querySelectorAll("[data-open-history]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      renderHistoryList();
      openModal("history-modal");
    });
  });

  // Clear all history action
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all saved session blueprints?")) {
        clearHistory();
        renderHistoryList();
        showToast("Session history cleared.", "info", 3000);
      }
    });
  }
}

// ============================================================
// SAMPLE BLUEPRINT & HERO CTA WIRING
// ============================================================

function initSampleAndCtaWiring() {
  const openSampleBtn = document.getElementById("open-sample");
  const loadSampleIntoVisualizerBtn = document.getElementById("btn-load-sample-visualizer");

  if (openSampleBtn) {
    openSampleBtn.addEventListener("click", () => {
      openModal("sample-modal");
    });
  }

  if (loadSampleIntoVisualizerBtn) {
    loadSampleIntoVisualizerBtn.addEventListener("click", () => {
      activeBlueprint = SAMPLE_RECIPE_BLUEPRINT;
      const bpContainer = document.getElementById("blueprint");
      if (bpContainer) {
        renderBlueprint(SAMPLE_RECIPE_BLUEPRINT, bpContainer);
      }
      closeModal("sample-modal");
      showToast("Loaded sample RecipeCraft PWA blueprint!", "success", 3000);

      const demoSection = document.getElementById("demo");
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// ============================================================
// DELEGATED EXPORT ACTIONS (MARKDOWN, JSON, PRINT, CLIPBOARD)
// ============================================================

function initExportActionsDelegation() {
  document.addEventListener("click", (e) => {
    // Export Markdown Button (#btn-export-md)
    const exportMdBtn = e.target.closest("#btn-export-md, [data-action="export-md"]");
    if (exportMdBtn) {
      e.preventDefault();
      const bp = activeBlueprint || SAMPLE_RECIPE_BLUEPRINT;
      exportMarkdown(bp);
      showToast("Downloading formatted GitHub Markdown blueprint (.md)...", "success", 3000);
      return;
    }

    // Export JSON Button (#btn-export-json)
    const exportJsonBtn = e.target.closest("#btn-export-json, [data-action="export-json"]");
    if (exportJsonBtn) {
      e.preventDefault();
      const bp = activeBlueprint || SAMPLE_RECIPE_BLUEPRINT;
      exportJSON(bp);
      showToast("Downloading structured blueprint JSON (.json)...", "success", 3000);
      return;
    }

    // Print to PDF Button (#btn-print-pdf)
    const printPdfBtn = e.target.closest("#btn-print-pdf, [data-action="print-pdf"]");
    if (printPdfBtn) {
      e.preventDefault();
      exportPDF();
      return;
    }

    // Copy Markdown to Clipboard
    const copyMdBtn = e.target.closest("[data-action="copy-md"]");
    if (copyMdBtn) {
      e.preventDefault();
      const bp = activeBlueprint || SAMPLE_RECIPE_BLUEPRINT;
      copyMarkdown(bp).then(ok => {
        showToast(ok ? "Copied Markdown blueprint to clipboard!" : "Failed to copy.", ok ? "success" : "error", 2500);
      });
      return;
    }

    // Copy JSON to Clipboard
    const copyJsonBtn = e.target.closest("[data-action="copy-json"]");
    if (copyJsonBtn) {
      e.preventDefault();
      const bp = activeBlueprint || SAMPLE_RECIPE_BLUEPRINT;
      copyJSON(bp).then(ok => {
        showToast(ok ? "Copied blueprint JSON to clipboard!" : "Failed to copy.", ok ? "success" : "error", 2500);
      });
      return;
    }
  });
}

// ============================================================
// HELPER ESCAPING
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
  initApp
};
