/**
 * Architect AI — Unified Production JavaScript Engine (script.js)
 * 
 * 100% Pure Vanilla JavaScript (ES6+). Zero build tools. Zero Python dependencies.
 * Works natively in any web browser directly via file:// or http://.
 * 
 * Includes:
 * 1. Storage & API Key Manager (LocalStorage CRUD with quota guards & FIFO pruning)
 * 2. Gemini 2.5 Flash Direct REST Client (with exponential backoff retries & JSON repair)
 * 3. Intelligent Offline Heuristic Mock Engine (10 domain archetypes with decision trees)
 * 4. Dynamic Multi-Turn Interview State Machine
 * 5. Multi-Tab Blueprint Visualizer (Overview, ERD Schema, Mermaid SVG Diagram, Sprint Roadmap)
 * 6. Export Engine (Markdown, JSON, Print-to-PDF, Clipboard copy)
 * 7. Glassmorphism UI Controllers, Toasts, Particle Canvas, Spotlight Glow & Scroll Reveal
 */

(function () {
  'use strict';

  // ==============================================================================
  // 1. CONFIGURATION & CONSTANTS
  // ==============================================================================

  const STORAGE_KEYS = {
    API_KEY: 'architect_ai_gemini_key',
    LEGACY_KEY: 'gemini_api_key',
    MODEL: 'architect_ai_gemini_model',
    MODE: 'architect_ai_engine_mode',
    HISTORY: 'architect_ai_history_v1'
  };

  const MAX_HISTORY_ITEMS = 20;

  const GEMINI_MODELS = {
    PRIMARY: 'gemini-2.5-flash',
    FALLBACK: 'gemini-1.5-flash',
    PRO: 'gemini-2.5-pro',
    DEFAULT: 'gemini-2.5-flash'
  };

  const ENGINE_MODES = {
    AUTO: 'auto',
    API: 'api',
    MOCK: 'mock'
  };

  const GEMINI_CONFIG = {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    DEFAULT_TEMPERATURE: 0.7,
    SYNTHESIS_TEMPERATURE: 0.4,
    DEFAULT_TOP_P: 0.95,
    MAX_RETRIES: 3,
    INITIAL_RETRY_DELAY_MS: 1200
  };

  const INTERVIEW_STAGES = [
    { id: 'IDEA', index: 0, name: 'Domain & Core Idea', summaryKey: 'idea' },
    { id: 'SCALE', index: 1, name: 'Scale & Concurrency', summaryKey: 'scale' },
    { id: 'STACK', index: 2, name: 'Tech Constraints & Stack', summaryKey: 'techStack' },
    { id: 'STORAGE', index: 3, name: 'Data Architecture & Storage', summaryKey: 'storage' },
    { id: 'CONSTRAINTS', index: 4, name: 'Latency, Budget & Constraints', summaryKey: 'constraints' },
    { id: 'SYNTHESIS', index: 5, name: 'Blueprint Synthesis', summaryKey: 'synthesis' }
  ];

  const DOMAIN_KEYWORDS = {
    ai: ['ai', 'llm', 'gpt', 'gemini', 'rag', 'agent', 'vector', 'embedding', 'langchain', 'llama', 'copilot', 'bot', 'machine learning', 'nlp', 'vision'],
    ecommerce: ['shop', 'store', 'cart', 'checkout', 'stripe', 'product', 'order', 'inventory', 'sku', 'payment', 'marketplace', 'commerce', 'catalog'],
    realtime: ['chat', 'social', 'feed', 'message', 'socket', 'websocket', 'realtime', 'collab', 'live', 'stream', 'notification', 'webrtc', 'p2p'],
    fintech: ['crypto', 'bank', 'finance', 'ledger', 'wallet', 'trading', 'payment', 'audit', 'tax', 'fraud', 'pci', 'kyc', 'transaction'],
    streaming: ['video', 'audio', 'stream', 'media', 'hls', 'transcode', 'ffmpeg', 'podcast', 'vod', 'music', 'live streaming'],
    iot: ['iot', 'sensor', 'device', 'mqtt', 'telemetry', 'hardware', 'embedded', 'gateway', 'fleet', 'zigbee', 'arduino', 'raspberry'],
    mobile: ['mobile', 'ios', 'android', 'react native', 'flutter', 'pwa', 'expo', 'offline-first', 'recipe', 'app store'],
    devtool: ['cli', 'compiler', 'devtool', 'linter', 'parser', 'sdk', 'git', 'terminal', 'debugger', 'ide', 'code generator', 'scaffold'],
    serverless: ['lambda', 'edge', 'serverless', 'vercel', 'cloudflare workers', 'deno deploy', 'fly.io', 'supabase', 'firebase'],
    saas: ['saas', 'b2b', 'dashboard', 'analytics', 'crm', 'auth', 'multi-tenant', 'billing', 'subscription', 'workspace', 'platform', 'app']
  };

  // ==============================================================================
  // 2. SANITIZATION & STRING UTILITIES
  // ==============================================================================

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeMermaid(str) {
    if (!str) return '';
    return String(str)
      .replace(/[[\](){}<>"'|\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sanitizeMermaidSyntax(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let cleaned = raw.trim();
    if (cleaned.startsWith('```mermaid')) cleaned = cleaned.slice(10);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return cleaned.trim();
  }

  // ==============================================================================
  // 3. STORAGE & SESSION HISTORY MANAGER
  // ==============================================================================

  const memoryStore = new Map();

  function isStorageSupported() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const test = '__architect_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  const hasLocalStorage = isStorageSupported();

  function storageGet(key) {
    try {
      if (hasLocalStorage) return window.localStorage.getItem(key);
      return memoryStore.get(key) || null;
    } catch (e) {
      return memoryStore.get(key) || null;
    }
  }

  function storageSet(key, val) {
    try {
      if (hasLocalStorage) window.localStorage.setItem(key, val);
      memoryStore.set(key, val);
      return true;
    } catch (e) {
      memoryStore.set(key, val);
      return false;
    }
  }

  function storageRemove(key) {
    try {
      if (hasLocalStorage) window.localStorage.removeItem(key);
      memoryStore.delete(key);
    } catch (e) {
      memoryStore.delete(key);
    }
  }

  function getApiKey() {
    const primary = storageGet(STORAGE_KEYS.API_KEY);
    if (primary && primary.trim().length > 0) return primary.trim();
    const legacy = storageGet(STORAGE_KEYS.LEGACY_KEY);
    if (legacy && legacy.trim().length > 0) return legacy.trim();
    return null;
  }

  function setApiKey(key) {
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      clearApiKey();
      return;
    }
    const trimmed = key.trim();
    storageSet(STORAGE_KEYS.API_KEY, trimmed);
    storageSet(STORAGE_KEYS.LEGACY_KEY, trimmed);
  }

  function clearApiKey() {
    storageRemove(STORAGE_KEYS.API_KEY);
    storageRemove(STORAGE_KEYS.LEGACY_KEY);
  }

  function hasApiKey() {
    const key = getApiKey();
    return typeof key === 'string' && key.length > 5;
  }

  function maskApiKey(key) {
    const k = key || getApiKey();
    if (!k || typeof k !== 'string') return '';
    const trimmed = k.trim();
    if (trimmed.length <= 8) return '••••••••';
    if (trimmed.length <= 14) return `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
    return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
  }

  function getModelPreference() {
    const stored = storageGet(STORAGE_KEYS.MODEL);
    return stored && stored.trim().length > 0 ? stored.trim() : GEMINI_MODELS.DEFAULT;
  }

  function setModelPreference(model) {
    if (typeof model === 'string' && model.trim().length > 0) {
      storageSet(STORAGE_KEYS.MODEL, model.trim());
    }
  }

  function getHistory() {
    const raw = storageGet(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(item => item && item.id) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBlueprint(blueprint) {
    if (!blueprint || typeof blueprint !== 'object') return false;
    const item = { ...blueprint };
    if (!item.id) item.id = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    if (!item.timestamp) item.timestamp = new Date().toISOString();

    let history = getHistory();
    const idx = history.findIndex(bp => bp.id === item.id);
    if (idx >= 0) {
      history[idx] = item;
    } else {
      history.unshift(item);
    }

    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    try {
      storageSet(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      return true;
    } catch (e) {
      if (history.length > 1) {
        history.pop();
        storageSet(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        return true;
      }
      return false;
    }
  }

  function deleteBlueprint(id) {
    if (!id) return false;
    const history = getHistory();
    const filtered = history.filter(bp => bp.id !== id);
    if (filtered.length !== history.length) {
      storageSet(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  function clearHistory() {
    storageRemove(STORAGE_KEYS.HISTORY);
  }

  // ==============================================================================
  // 4. GEMINI API REST CLIENT
  // ==============================================================================

  function extractAndParseJSON(raw) {
    if (typeof raw === 'object' && raw !== null) return raw;
    if (typeof raw !== 'string') throw new Error('Expected string input for JSON parsing');

    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (e1) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        } catch (e2) {
          const repaired = cleaned.substring(firstBrace, lastBrace + 1).replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(repaired);
        }
      }
      throw new Error(`Could not parse JSON response from AI: ${e1.message}`);
    }
  }

  async function callGemini(endpoint, payload, maxRetries = 3) {
    let attempt = 0;
    let delay = 1200;
    while (attempt <= maxRetries) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          attempt++;
          if (attempt > maxRetries) throw new Error(`Gemini API rate limit or server error (HTTP ${response.status})`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 1.8;
          continue;
        }

        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Gemini API HTTP Error ${response.status}`);
      } catch (err) {
        attempt++;
        if (attempt > maxRetries) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 1.8;
      }
    }
  }

  async function testConnection(apiKey) {
    const key = apiKey || getApiKey();
    if (!key) return { success: false, error: 'No API key provided.' };
    const url = `${GEMINI_CONFIG.BASE_URL}/${GEMINI_MODELS.PRIMARY}:generateContent?key=${encodeURIComponent(key)}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'Respond with exactly {"status":"connected"} as JSON.' }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 50, responseMimeType: 'application/json' }
    };
    try {
      const res = await callGemini(url, payload, 1);
      const text = res.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = extractAndParseJSON(text);
      return { success: true, model: GEMINI_MODELS.PRIMARY, status: parsed.status || 'connected' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ==============================================================================
  // 5. INTELLIGENT OFFLINE MOCK HEURISTIC ENGINE (10 ARCHETYPES)
  // ==============================================================================

  function classifyDomain(text) {
    if (!text || typeof text !== 'string') return 'saas';
    const lower = text.toLowerCase();
    let bestDomain = 'saas';
    let maxScore = 0;
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (lower.includes(kw)) score += (kw.length >= 6 ? 2 : 1);
      }
      if (score > maxScore) {
        maxScore = score;
        bestDomain = domain;
      }
    }
    return maxScore > 0 ? bestDomain : 'saas';
  }

  const ARCHETYPE_BLUEPRINTS = {
    saas: {
      summary: {
        title: "CloudScale SaaS Platform",
        tagline: "High-performance multi-tenant B2B analytics and workflow automation platform",
        domain: "saas",
        targetScale: "10K - 100K DAU · 2,500 peak RPS · 99.99% SLA",
        estimatedMonthlyCost: "$120 - $350 / month",
        description: "A production-grade multi-tenant SaaS architecture engineered with Next.js 15, PostgreSQL Row-Level Security, Redis distributed session caching, and background task queues."
      },
      stack: {
        frontend: { name: "Next.js 15 (App Router) + Tailwind CSS + shadcn/ui", reason: "Server Components reduce client bundle size; instant edge caching.", tradeoffs: "Requires edge runtime adaptation for non-Node APIs." },
        backend: { name: "Node.js (Fastify) + TypeScript Microservices", reason: "Lightweight, ultra-low overhead REST/gRPC API gateway.", tradeoffs: "Requires explicit schema validation layer (Zod/TypeBox)." },
        database: { name: "PostgreSQL 16 (Neon / Supabase) with RLS", reason: "ACID compliance, Row-Level Security for multi-tenant isolation, and connection pooling.", tradeoffs: "Requires query indexing hygiene at scale." },
        caching: { name: "Upstash Redis + BullMQ Queue", reason: "Sub-5ms session caching, rate limiting, and asynchronous background jobs.", tradeoffs: "Eventual consistency for non-critical cache reads." },
        hosting: { name: "Vercel Edge (Frontend) + AWS ECS / Fly.io (Backend)", reason: "Global edge CDN paired with containerized backend autoscaling.", tradeoffs: "Cross-cloud latency if regions are misconfigured." },
        ci_cd: { name: "GitHub Actions + Docker Multi-Stage Builds", reason: "Automated CI testing, security linting, and zero-downtime rolling deploys.", tradeoffs: "Runner concurrency costs for large matrix builds." },
        observability: { name: "OpenTelemetry + Datadog / Sentry", reason: "Distributed end-to-end tracing and error alerting.", tradeoffs: "Ingestion data management required for high-volume logs." }
      },
      schema: {
        databaseType: "PostgreSQL 16 with Row-Level Security",
        tables: [
          {
            name: "tenants",
            purpose: "Multi-tenant organizational accounts and subscription tiers.",
            columns: [
              { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Unique tenant identifier" },
              { name: "name", type: "VARCHAR(128)", constraints: ["NOT NULL"], description: "Organization name" },
              { name: "plan", type: "VARCHAR(32)", constraints: ["NOT NULL"], description: "Subscription tier (free, pro, enterprise)" },
              { name: "created_at", type: "TIMESTAMPTZ", constraints: ["NOT NULL"], description: "Creation timestamp" }
            ],
            indexes: ["idx_tenants_plan"],
            relationships: ["1:N -> users (tenant_id)", "1:N -> projects (tenant_id)"]
          },
          {
            name: "users",
            purpose: "User authentication profiles, RBAC roles, and tenant associations.",
            columns: [
              { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Unique user auth ID" },
              { name: "tenant_id", type: "UUID", constraints: ["FK", "NOT NULL"], description: "References tenants(id)" },
              { name: "email", type: "VARCHAR(255)", constraints: ["UNIQUE", "NOT NULL"], description: "Primary user email" },
              { name: "role", type: "VARCHAR(32)", constraints: ["NOT NULL"], description: "Role (admin, member, viewer)" }
            ],
            indexes: ["idx_users_tenant_id", "idx_users_email"],
            relationships: ["N:1 -> tenants (tenant_id)", "1:N -> audit_logs (user_id)"]
          },
          {
            name: "projects",
            purpose: "Core domain projects and analytical workspace records.",
            columns: [
              { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Project ID" },
              { name: "tenant_id", type: "UUID", constraints: ["FK", "NOT NULL"], description: "References tenants(id)" },
              { name: "title", type: "VARCHAR(255)", constraints: ["NOT NULL"], description: "Project title" },
              { name: "status", type: "VARCHAR(32)", constraints: ["NOT NULL"], description: "State (active, archived)" }
            ],
            indexes: ["idx_projects_tenant_status"],
            relationships: ["N:1 -> tenants (tenant_id)"]
          }
        ]
      },
      architecture: {
        mermaid: `flowchart TD
  subgraph Client_Layer ["Client and Edge Layer"]
    Web["💻 Next.js 15 Web App<br/>React Server Components"]
    CDN["⚡ Cloudflare CDN & WAF<br/>DDoS & Edge Caching"]
  end

  subgraph Ingress_Layer ["API Gateway and Ingress"]
    Gateway["🛡️ Fastify Gateway<br/>JWT Auth & Rate Limiting"]
  end

  subgraph Service_Layer ["Microservices and Workers"]
    CoreAPI["⚙️ Core API Service<br/>Node.js & TypeScript"]
    TaskWorker["🔄 Asynchronous Worker<br/>BullMQ & Redis"]
  end

  subgraph Data_Layer ["Persistence and Caching"]
    DB[("🗄️ Primary Database<br/>PostgreSQL 16 RLS")]
    Cache[("⚡ Cache & Queue<br/>Upstash Redis")]
  end

  Web --> CDN
  CDN --> Gateway
  Gateway --> CoreAPI
  CoreAPI -->|ACID Queries| DB
  CoreAPI -->|Session & Rate Limits| Cache
  CoreAPI -.->|Enqueue Tasks| Cache
  Cache -.->|Dequeue| TaskWorker
  TaskWorker -->|Batch Updates| DB

  classDef client fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
  classDef gateway fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
  classDef service fill:#1e1b4b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
  classDef storage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

  class Web,CDN client;
  class Gateway gateway;
  class CoreAPI,TaskWorker service;
  class DB,Cache storage;`
      },
      roadmap: {
        totalDuration: "4 Weeks (4 Sprints)",
        phases: [
          {
            phaseNumber: 1,
            name: "Architecture Foundation & Schema Setup",
            duration: "Week 1",
            focus: "Database modeling, PostgreSQL RLS migrations, and authentication integration.",
            tasks: [
              "Initialize monorepo with Next.js 15, Fastify, and TypeScript",
              "Execute database migrations for tenants, users, and projects tables",
              "Configure Row-Level Security (RLS) policies for multi-tenant isolation",
              "Integrate OAuth2 / JWT authentication with session validation"
            ],
            risks: ["Complex RLS performance overhead on large join queries"]
          },
          {
            phaseNumber: 2,
            name: "Core API & Background Queue",
            duration: "Week 2",
            focus: "CRUD endpoints, Redis caching, and async BullMQ worker pipelines.",
            tasks: [
              "Implement Fastify REST API routes with Zod schema validation",
              "Configure Upstash Redis for distributed session caching",
              "Build BullMQ worker queue for async task processing and emails",
              "Implement tenant rate-limiting middleware"
            ],
            risks: ["Queue backpressure during sudden spike traffic"]
          },
          {
            phaseNumber: 3,
            name: "Frontend Dashboard & Telemetry",
            duration: "Week 3",
            focus: "Responsive UI, interactive dashboards, and telemetry monitoring.",
            tasks: [
              "Construct responsive dashboard with shadcn/ui components",
              "Implement optimistic UI updates and real-time state synchronization",
              "Integrate OpenTelemetry tracing and Sentry error alerting",
              "Conduct accessibility (a11y) audit"
            ],
            risks: ["Large initial client hydration bundle on low-end mobile devices"]
          },
          {
            phaseNumber: 4,
            name: "Testing, Hardening & Production Launch",
            duration: "Week 4",
            focus: "Load testing, security hardening, CI/CD pipeline, and launch.",
            tasks: [
              "Execute load tests with k6 up to 2,500 concurrent RPS",
              "Perform OWASP Top 10 security audit and SQL injection fuzzing",
              "Configure automated GitHub Actions CI/CD deployment pipeline",
              "Verify production DNS, SSL certificates, and WAF rules"
            ],
            risks: ["DNS propagation delays during cutover"]
          }
        ]
      }
    },

    ai: {
      summary: {
        title: "Enterprise AI & RAG Pipeline",
        tagline: "Scalable Retrieval-Augmented Generation & Vector Search Architecture",
        domain: "ai",
        targetScale: "50K queries/day · Sub-250ms TTFT · Multi-Modal Support",
        estimatedMonthlyCost: "$180 - $450 / month",
        description: "An AI-powered knowledge retrieval engine combining Gemini / OpenAI embeddings, pgvector hybrid search, Redis semantic caching, and FastAPI streaming."
      },
      stack: {
        frontend: { name: "React 19 (Vite) + Tailwind CSS + AI Stream UI", reason: "Zero-latency token streaming with reactive UI components.", tradeoffs: "Requires custom markdown and code-block renderers." },
        backend: { name: "Python 3.12 (FastAPI) + AsyncIO Worker", reason: "Native ecosystem for LangChain, LlamaIndex, and async LLM streaming.", tradeoffs: "Requires async concurrency tuning for blocking CPU tasks." },
        database: { name: "PostgreSQL 16 + pgvector (Hybrid HNSW Search)", reason: "Combines structured relational metadata with 1536-dim vector cosine similarity.", tradeoffs: "Requires index memory tuning (maintenance_work_mem)." },
        caching: { name: "Redis Semantic Cache", reason: "Caches identical semantic embeddings to reduce LLM API cost by up to 60%.", tradeoffs: "Cache invalidation on document updates." },
        hosting: { name: "Fly.io / AWS ECS (GPU/CPU) + Cloudflare", reason: "Low-latency regional compute close to vector stores.", tradeoffs: "Cold start tuning for containerized inference." },
        ci_cd: { name: "GitHub Actions + Pytest + Vector Eval Harness", reason: "Automated regression testing and RAG retrieval recall benchmarks.", tradeoffs: "Eval dataset maintenance required." },
        observability: { name: "Langfuse / Arize Phoenix + Sentry", reason: "LLM token usage analytics, latency breakdown, and hallucination scoring.", tradeoffs: "Data privacy compliance with prompt logging." }
      },
      schema: {
        databaseType: "PostgreSQL 16 + pgvector Extension",
        tables: [
          {
            name: "knowledge_bases",
            purpose: "Document corpus containers and indexing configurations.",
            columns: [
              { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Knowledge base ID" },
              { name: "title", type: "VARCHAR(255)", constraints: ["NOT NULL"], description: "Corpus title" },
              { name: "embedding_model", type: "VARCHAR(64)", constraints: ["NOT NULL"], description: "e.g. text-embedding-004" }
            ],
            indexes: ["idx_kb_title"],
            relationships: ["1:N -> document_chunks (kb_id)"]
          },
          {
            name: "document_chunks",
            purpose: "Text chunks, metadata, and 1536-dimensional semantic vector embeddings.",
            columns: [
              { name: "id", type: "UUID", constraints: ["PK", "NOT NULL"], description: "Chunk ID" },
              { name: "kb_id", type: "UUID", constraints: ["FK", "NOT NULL"], description: "References knowledge_bases(id)" },
              { name: "content", type: "TEXT", constraints: ["NOT NULL"], description: "Raw chunk content" },
              { name: "embedding", type: "VECTOR(1536)", constraints: ["NOT NULL"], description: "Vector embedding" }
            ],
            indexes: ["idx_chunks_embedding_hnsw"],
            relationships: ["N:1 -> knowledge_bases (kb_id)"]
          }
        ]
      },
      architecture: {
        mermaid: `flowchart TD
  subgraph Client_Layer ["Client and Ingress"]
    UI["📱 Stream UI Client<br/>React 19 & SSE"]
    Edge["⚡ Cloudflare CDN<br/>Edge Ingress"]
  end

  subgraph Compute_Layer ["AI Pipeline"]
    API["⚡ FastAPI Server<br/>Async Streaming Engine"]
    Chunker["📄 Document Ingest Worker<br/>OCR & Vectorizer"]
  end

  subgraph Storage_Layer ["Vector and Memory"]
    VDB[("🗄️ PostgreSQL & pgvector<br/>HNSW Cosine Search")]
    Cache[("⚡ Semantic Cache<br/>Redis Vector Cache")]
  end

  UI --> Edge
  Edge --> API
  API -->|Check Cache| Cache
  API -->|Vector Retrieval| VDB
  API -->|Stream LLM| UI
  Chunker -->|Write Chunks| VDB

  classDef client fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
  classDef compute fill:#1e1b4b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
  classDef storage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;

  class UI,Edge client;
  class API,Chunker compute;
  class VDB,Cache storage;`
      },
      roadmap: {
        totalDuration: "4 Weeks (4 Sprints)",
        phases: [
          {
            phaseNumber: 1,
            name: "Document Pipeline & Vector Store",
            duration: "Week 1",
            focus: "PDF/text chunking, embedding generation, and pgvector schema setup.",
            tasks: [
              "Configure PostgreSQL with pgvector extension and HNSW indexing",
              "Build async document ingestion worker for PDF, Markdown, and HTML",
              "Implement semantic chunking with overlap strategy",
              "Benchmark embedding generation throughput"
            ],
            risks: ["Memory saturation during large vector index builds"]
          },
          {
            phaseNumber: 2,
            name: "RAG Retrieval & Semantic Caching",
            duration: "Week 2",
            focus: "Hybrid keyword + vector search and Redis semantic caching layer.",
            tasks: [
              "Implement reciprocal rank fusion (RRF) hybrid search",
              "Integrate Redis semantic cache for exact and near-match queries",
              "Build FastAPI streaming SSE endpoint with Gemini 2.5 Flash",
              "Implement context window token compression"
            ],
            risks: ["LLM prompt drift and hallucination on domain-specific queries"]
          },
          {
            phaseNumber: 3,
            name: "Streaming Frontend & Guardrails",
            duration: "Week 3",
            focus: "Chat UI, citation links, token usage monitoring, and safety guardrails.",
            tasks: [
              "Build React streaming chat interface with citation inspector",
              "Implement input sanitization and PII redaction guardrails",
              "Integrate Langfuse for token analytics and cost tracking",
              "Test response streaming latency on mobile 4G"
            ],
            risks: ["Network disconnects during long token generation streams"]
          },
          {
            phaseNumber: 4,
            name: "Evaluation & Production Scaling",
            duration: "Week 4",
            focus: "Recall evaluation, load testing, security review, and launch.",
            tasks: [
              "Run RAG evaluation suite (Recall@k, Precision, Faithfulness)",
              "Execute load testing up to 100 concurrent streaming queries",
              "Deploy autoscaling compute cluster on AWS ECS / Fly.io",
              "Finalize production monitoring alerts"
            ],
            risks: ["API provider rate limiting under peak load"]
          }
        ]
      }
    }
  };

  const MOCK_QUESTIONS = {
    saas: [
      { id: "scale", bot: "What scale and concurrency are you planning for this SaaS product in v1?", options: ["< 1,000 DAU (Lean MVP)", "10K - 100K DAU (Growth Stage)", "1M+ DAU (High Concurrency)", "Global Multi-Region"] },
      { id: "stack", bot: "What is your preferred core tech stack and backend framework?", options: ["Next.js 15 + PostgreSQL", "Node.js / Express + React", "Python (FastAPI) + React", "Go (Golang) Microservices"] },
      { id: "storage", bot: "How should database tenancy and caching be structured?", options: ["PostgreSQL Row-Level Security (RLS) + Redis", "Dedicated Database per Tenant + DynamoDB", "Supabase Multi-Tenant + Upstash", "MongoDB Atlas + In-Memory Caching"] },
      { id: "constraints", bot: "What is your primary launch priority or non-functional constraint?", options: ["Tight Budget (< $50/mo)", "Fast 2-Week Launch", "Strict Security / SOC2 Ready", "Sub-100ms Global Latency"] }
    ],
    ai: [
      { id: "scale", bot: "What daily query volume and latency SLA are you planning for your AI tool?", options: ["< 1,000 queries/day (Prototype)", "10K - 50K queries/day (Production RAG)", "500K+ queries/day (High Throughput)", "Sub-200ms real-time voice/chat"] },
      { id: "stack", bot: "What LLM orchestration pipeline and framework do you prefer?", options: ["Gemini 2.5 Flash API + pgvector", "Python FastAPI + LangChain", "Next.js 15 AI SDK + Pinecone", "Self-Hosted Ollama + Qdrant"] },
      { id: "storage", bot: "How will document chunking, embeddings, and vector memory be stored?", options: ["PostgreSQL 16 + pgvector (HNSW)", "Redis Semantic Cache + Supabase", "Pinecone Serverless + S3 Lake", "Qdrant Vector DB + DynamoDB"] },
      { id: "constraints", bot: "What is your main architectural constraint for the AI pipeline?", options: ["Keep API token cost < $100/mo", "Zero-latency streaming UX (< 50ms TTFT)", "Strict Enterprise Privacy (No training)", "Multi-modal PDF & Image OCR"] }
    ]
  };

  function getMockQuestionsForDomain(domain) {
    return MOCK_QUESTIONS[domain] || MOCK_QUESTIONS.saas;
  }

  function getMockBlueprint(domain, answers) {
    const base = ARCHETYPE_BLUEPRINTS[domain] || ARCHETYPE_BLUEPRINTS.saas;
    const bp = JSON.parse(JSON.stringify(base));
    bp.id = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    bp.timestamp = new Date().toISOString();
    if (answers.idea) {
      bp.summary.description = `Tailored architecture for: "${answers.idea}". ${bp.summary.description}`;
    }
    return bp;
  }

  // ==============================================================================
  // 6. MULTI-TAB BLUEPRINT VISUALIZER RENDERER
  // ==============================================================================

  function renderBlueprint(blueprint) {
    if (!blueprint) return;

    renderOverviewTab(blueprint);
    renderSchemaTab(blueprint);
    renderArchitectureTab(blueprint);
    renderRoadmapTab(blueprint);

    const actions = document.getElementById("blueprint-actions");
    if (actions) actions.style.display = "flex";

    const empty = document.getElementById("bp-empty-state");
    if (empty) empty.style.display = "none";
  }

  function renderOverviewTab(bp) {
    const container = document.getElementById("bp-overview");
    if (!container) return;

    const s = bp.summary || {};
    const stack = bp.stack || {};

    const stackItems = Object.entries(stack).map(([layer, item]) => `
      <div class="stack-card">
        <span class="stack-layer">${escapeHTML(layer.replace('_', ' ').toUpperCase())}</span>
        <h4 class="stack-name">${escapeHTML(item.name || 'Standard Service')}</h4>
        <p class="stack-reason"><strong>Why:</strong> ${escapeHTML(item.reason || 'Optimized for performance and scalability.')}</p>
        ${item.tradeoffs ? `<p class="stack-tradeoff"><strong>Tradeoff:</strong> ${escapeHTML(item.tradeoffs)}</p>` : ''}
      </div>
    `).join('');

    container.innerHTML = `
      <div class="bp-summary-header">
        <span class="bp-domain-badge">${escapeHTML(s.domain || 'Full-Stack').toUpperCase()}</span>
        <h3 class="bp-title">${escapeHTML(s.title || 'Architecture Blueprint')}</h3>
        <p class="bp-tagline">${escapeHTML(s.tagline || '')}</p>
        <p class="bp-desc">${escapeHTML(s.description || '')}</p>
        <div class="bp-meta-row">
          <span class="bp-meta-tag">🎯 Scale: ${escapeHTML(s.targetScale || 'Production Ready')}</span>
          <span class="bp-meta-tag">💰 Est. Cost: ${escapeHTML(s.estimatedMonthlyCost || '$50 - $150 / mo')}</span>
        </div>
      </div>

      <div class="bp-section">
        <h4 class="bp-section-title">7-Layer Technology Stack & Tradeoffs</h4>
        <div class="stack-grid">${stackItems}</div>
      </div>

      <div class="bp-section">
        <h4 class="bp-section-title">Recruiter-Grade Resume Impact</h4>
        <div class="resume-impact-card">
          <p>🌟 <strong>Demonstrated Competencies:</strong></p>
          <ul>
            <li>Architected and deployed a scalable ${escapeHTML(s.domain || 'full-stack')} application engineered for ${escapeHTML(s.targetScale || 'production scale')}.</li>
            <li>Implemented secure, low-latency data models with ${escapeHTML(stack.database?.name || 'PostgreSQL')} and ${escapeHTML(stack.caching?.name || 'Redis caching')}.</li>
            <li>Designed resilient CI/CD and telemetry pipelines with automated regression and performance validation.</li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderSchemaTab(bp) {
    const container = document.getElementById("bp-schema");
    if (!container) return;

    const schema = bp.schema || { tables: [] };
    const tables = schema.tables || [];

    if (tables.length === 0) {
      container.innerHTML = `<p class="muted">No schema entities defined for this blueprint.</p>`;
      return;
    }

    const tableCards = tables.map(tbl => {
      const cols = (tbl.columns || []).map(col => `
        <tr>
          <td><span class="col-name">${escapeHTML(col.name)}</span></td>
          <td><span class="col-type">${escapeHTML(col.type)}</span></td>
          <td><span class="col-constraints">${(col.constraints || []).map(c => `<span class="badge-constraint">${escapeHTML(c)}</span>`).join(' ')}</span></td>
          <td><span class="col-desc">${escapeHTML(col.description || '')}</span></td>
        </tr>
      `).join('');

      return `
        <div class="schema-table-card">
          <div class="schema-table-head">
            <span class="table-icon">🗄️</span>
            <span class="table-name">${escapeHTML(tbl.name)}</span>
            <span class="table-purpose">${escapeHTML(tbl.purpose || '')}</span>
          </div>
          <table class="schema-table">
            <thead>
              <tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr>
            </thead>
            <tbody>${cols}</tbody>
          </table>
          ${tbl.indexes?.length ? `<div class="schema-meta"><strong>Indexes:</strong> ${escapeHTML(tbl.indexes.join(', '))}</div>` : ''}
          ${tbl.relationships?.length ? `<div class="schema-meta"><strong>Relations:</strong> ${escapeHTML(tbl.relationships.join(' | '))}</div>` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="schema-header">
        <span class="badge-engine">Engine: ${escapeHTML(schema.databaseType || 'PostgreSQL 16')}</span>
      </div>
      <div class="schema-grid">${tableCards}</div>
    `;
  }

  async function renderArchitectureTab(bp) {
    const container = document.getElementById("mermaid-render");
    if (!container) return;

    const rawSyntax = bp?.architecture?.mermaid || `flowchart TD\n  Client["Web Client"] --> Gateway["API Gateway"]\n  Gateway --> DB[("Database")]`;
    const cleanSyntax = sanitizeMermaidSyntax(rawSyntax);

    if (typeof mermaid !== 'undefined') {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'JetBrains Mono, Inter, monospace'
        });

        const uniqueId = `mermaid_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(uniqueId, cleanSyntax);
        container.innerHTML = `<div class="mermaid-svg-wrapper" style="display:flex; justify-content:center; padding:16px; overflow-x:auto;">${svg}</div>`;
        return;
      } catch (e) {
        console.warn('Mermaid render error, attempting sanitized fallback:', e);
        try {
          const fallbackDiagram = `flowchart TD\n  Client["Client Application"] --> Edge["Edge Ingress CDN"]\n  Edge --> Gateway["API Gateway"]\n  Gateway --> Service["Application Services"]\n  Service --> DB[("Primary Database")]\n  Service --> Cache[("Redis Cache")]`;
          const fbId = `mermaid_fb_${Date.now()}`;
          const { svg } = await mermaid.render(fbId, fallbackDiagram);
          container.innerHTML = `<div class="mermaid-svg-wrapper" style="display:flex; justify-content:center; padding:16px; overflow-x:auto;">${svg}</div>`;
          return;
        } catch (err2) {
          container.innerHTML = `
            <div style="padding:20px; background:rgba(0,0,0,0.3); border-radius:10px; border:1px solid var(--border);">
              <p class="muted" style="margin-bottom:8px;"><strong>System Architecture Definition:</strong></p>
              <pre class="mono" style="padding:12px; background:rgba(0,0,0,0.4); border-radius:6px; overflow-x:auto; color:var(--accent); font-size:12px;">${escapeHTML(cleanSyntax)}</pre>
            </div>
          `;
        }
      }
    } else {
      container.innerHTML = `<pre class="mono" style="padding:12px; background:rgba(0,0,0,0.4); border-radius:8px;">${escapeHTML(cleanSyntax)}</pre>`;
    }
  }

  function renderRoadmapTab(bp) {
    const container = document.getElementById("bp-roadmap");
    if (!container) return;

    const roadmap = bp.roadmap || { phases: [] };
    const phases = roadmap.phases || [];

    let totalTasks = 0;
    const phaseCards = phases.map(phase => {
      const tasks = (phase.tasks || []).map(task => {
        totalTasks++;
        return `
          <label class="task-checkbox-label">
            <input type="checkbox" class="task-check" />
            <span>${escapeHTML(task)}</span>
          </label>
        `;
      }).join('');

      return `
        <div class="roadmap-phase-card">
          <div class="phase-header">
            <span class="phase-badge">Phase ${escapeHTML(String(phase.phaseNumber || '1'))}</span>
            <span class="phase-duration">${escapeHTML(phase.duration || '')}</span>
          </div>
          <h4 class="phase-title">${escapeHTML(phase.name)}</h4>
          <p class="phase-focus">${escapeHTML(phase.focus || '')}</p>
          <div class="phase-tasks">${tasks}</div>
          ${phase.risks?.length ? `<div class="phase-risks">⚠️ <strong>Risks:</strong> ${escapeHTML(phase.risks.join('; '))}</div>` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="roadmap-header">
        <span class="badge-timeline">⏱️ Timeline: ${escapeHTML(roadmap.totalDuration || '4 Weeks')}</span>
        <span class="roadmap-progress-badge" id="roadmap-completion-badge">0 / ${totalTasks} Tasks Completed (0%)</span>
      </div>
      <div class="roadmap-timeline">${phaseCards}</div>
    `;

    container.querySelectorAll('.task-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const checked = container.querySelectorAll('.task-check:checked').length;
        const pct = totalTasks > 0 ? Math.round((checked / totalTasks) * 100) : 0;
        const badge = document.getElementById('roadmap-completion-badge');
        if (badge) badge.textContent = `${checked} / ${totalTasks} Tasks Completed (${pct}%)`;
      });
    });
  }

  function switchTab(targetTab) {
    const tabBtns = document.querySelectorAll('.bp-tab');
    const tabPanels = document.querySelectorAll('.bp-panel, .bp-tab-panel');

    tabBtns.forEach(btn => {
      const match = btn.dataset.tab === targetTab;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    tabPanels.forEach(panel => {
      const match = panel.id === `bp-${targetTab}`;
      panel.classList.toggle('active', match);
    });

    if (targetTab === 'architecture' && currentActiveBlueprint) {
      renderArchitectureTab(currentActiveBlueprint);
    }
  }

  // ==============================================================================
  // 7. EXPORT ENGINE (MARKDOWN, JSON, PRINT)
  // ==============================================================================

  function buildMarkdownString(bp) {
    if (!bp) return '';
    const s = bp.summary || {};
    const stack = bp.stack || {};
    const schema = bp.schema || { tables: [] };
    const roadmap = bp.roadmap || { phases: [] };

    let md = `# ${s.title || 'Architecture Blueprint'}\n\n`;
    md += `> **Tagline:** ${s.tagline || ''}\n`;
    md += `> **Scale:** ${s.targetScale || 'Production'} | **Est. Cost:** ${s.estimatedMonthlyCost || '$50 - $150/mo'}\n\n`;
    md += `## Executive Summary\n${s.description || ''}\n\n`;

    md += `## 7-Layer Technology Stack\n`;
    for (const [layer, item] of Object.entries(stack)) {
      md += `- **${layer.toUpperCase()}**: ${item.name}\n  - *Rationale*: ${item.reason}\n`;
      if (item.tradeoffs) md += `  - *Tradeoffs*: ${item.tradeoffs}\n`;
    }
    md += `\n`;

    md += `## Database Schema (${schema.databaseType || 'PostgreSQL 16'})\n\n`;
    for (const tbl of (schema.tables || [])) {
      md += `### Table: \`${tbl.name}\`\n${tbl.purpose || ''}\n\n`;
      md += `| Column | Type | Constraints | Description |\n|---|---|---|---|\n`;
      for (const col of (tbl.columns || [])) {
        md += `| \`${col.name}\` | ${col.type} | ${(col.constraints || []).join(' ')} | ${col.description || ''} |\n`;
      }
      md += `\n`;
    }

    if (bp.architecture?.mermaid) {
      md += `## System Architecture Diagram\n\`\`\`mermaid\n${sanitizeMermaidSyntax(bp.architecture.mermaid)}\n\`\`\`\n\n`;
    }

    md += `## Execution Roadmap (${roadmap.totalDuration || '4 Weeks'})\n\n`;
    for (const phase of (roadmap.phases || [])) {
      md += `### Phase ${phase.phaseNumber}: ${phase.name} (${phase.duration})\n`;
      md += `*Focus*: ${phase.focus || ''}\n\n`;
      for (const t of (phase.tasks || [])) {
        md += `- [ ] ${t}\n`;
      }
      md += `\n`;
    }

    return md;
  }

  function downloadFile(filename, text, mimeType = 'text/plain') {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportMarkdown(bp) {
    if (!bp) return;
    const md = buildMarkdownString(bp);
    const filename = `${(bp.summary?.title || 'blueprint').toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    downloadFile(filename, md, 'text/markdown');
    showToast('Markdown blueprint exported!', 'success');
  }

  function exportJSON(bp) {
    if (!bp) return;
    const json = JSON.stringify(bp, null, 2);
    const filename = `${(bp.summary?.title || 'blueprint').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    downloadFile(filename, json, 'application/json');
    showToast('Structured JSON blueprint exported!', 'success');
  }

  function exportPDF() {
    window.print();
  }

  // ==============================================================================
  // 8. INTERVIEW STATE MACHINE & CONTROLLER
  // ==============================================================================

  class InterviewEngine {
    constructor() {
      this.currentTurn = 0;
      this.domain = 'saas';
      this.answers = {};
      this.questions = [];
      this.isCompleted = false;
    }

    start(initialDomain = 'saas') {
      this.currentTurn = 0;
      this.domain = initialDomain;
      this.answers = {};
      this.isCompleted = false;
      this.questions = getMockQuestionsForDomain(this.domain);
    }

    getCurrentQuestion() {
      if (this.currentTurn === 0) {
        return {
          id: "idea",
          bot: "Hey 👋 I'm Architect AI. In one or two sentences, what are you looking to build?",
          options: ["A B2B SaaS dashboard", "An AI RAG search tool", "An e-commerce marketplace", "A real-time mobile app"]
        };
      }
      const qIdx = this.currentTurn - 1;
      if (qIdx < this.questions.length) {
        return this.questions[qIdx];
      }
      return null;
    }

    recordAnswer(text) {
      const currentQ = this.getCurrentQuestion();
      if (currentQ) {
        this.answers[currentQ.id] = text;
        if (currentQ.id === "idea") {
          this.domain = classifyDomain(text);
          this.questions = getMockQuestionsForDomain(this.domain);
        }
      }
      this.currentTurn++;
      if (this.currentTurn > this.questions.length) {
        this.isCompleted = true;
      }
    }

    getProgressPercentage() {
      const total = this.questions.length + 1;
      return Math.min(100, Math.round((this.currentTurn / total) * 100));
    }
  }

  // ==============================================================================
  // 9. UI HELPERS & NOTIFICATIONS
  // ==============================================================================

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${escapeHTML(message)}</span>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showTypingIndicator() {
    const messages = document.getElementById('messages');
    if (!messages) return null;
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  async function appendChatMessage(text, who, typing = false) {
    const messages = document.getElementById('messages');
    if (!messages) return;

    const el = document.createElement('div');
    el.className = `msg ${who}`;
    messages.appendChild(el);

    if (who === 'user' || !typing) {
      el.textContent = text;
      messages.scrollTop = messages.scrollHeight;
      return;
    }

    for (let i = 0; i < text.length; i++) {
      el.textContent += text.charAt(i);
      messages.scrollTop = messages.scrollHeight;
      await new Promise(r => setTimeout(r, 14));
    }
  }

  function renderSuggestionChips(options, onSelect) {
    const optsContainer = document.getElementById('options');
    if (!optsContainer) return;
    optsContainer.innerHTML = (options || []).map(opt => `
      <button type="button" class="option-chip">${escapeHTML(opt)}</button>
    `).join('');

    optsContainer.querySelectorAll('.option-chip').forEach(btn => {
      btn.addEventListener('click', () => onSelect(btn.textContent));
    });
  }

  // ==============================================================================
  // 10. VISUAL FX: PARTICLES & SPOTLIGHT GLOW
  // ==============================================================================

  function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const count = window.innerWidth < 768 ? 24 : 50;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function init() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.6
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
        ctx.fillStyle = 'rgba(139,148,255,.45)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * 0.15})`;
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
    window.addEventListener('resize', () => { resize(); init(); });
  }

  function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || !window.matchMedia('(hover:hover)').matches) return;
    window.addEventListener('mousemove', e => {
      glow.classList.add('active');
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    window.addEventListener('mouseleave', () => glow.classList.remove('active'));
  }

  function initSpotlightHover() {
    document.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  function initStatsCounters() {
    const statElements = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseFloat(el.dataset.count) || 0;
        const suffix = el.dataset.suffix || '';
        const dur = 1200;
        const start = performance.now();
        const tick = now => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.3 });
    statElements.forEach(s => observer.observe(s));
  }

  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-q');
      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = item.classList.toggle('open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    });
  }

  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });

    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
      revealElements.forEach(el => observer.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('visible'));
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('[data-scroll]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(btn.dataset.scroll);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href.length > 1 && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initMobileNav() {
    const toggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ==============================================================================
  // 11. APPLICATION BOOTSTRAP & EVENT ORCHESTRATION
  // ==============================================================================

  let activeInterview = new InterviewEngine();
  let currentActiveBlueprint = null;

  async function handleUserAnswer(text) {
    if (!text || text.trim().length === 0) return;
    const input = document.getElementById('answer-input');
    if (input) input.value = '';

    const optsContainer = document.getElementById('options');
    if (optsContainer) optsContainer.innerHTML = '';

    await appendChatMessage(text, 'user');
    activeInterview.recordAnswer(text);

    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    const pct = activeInterview.getProgressPercentage();
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = activeInterview.isCompleted ? 'Synthesizing Blueprint...' : `Question ${activeInterview.currentTurn + 1} / ${activeInterview.questions.length + 1}`;

    const typing = showTypingIndicator();

    setTimeout(async () => {
      if (typing) typing.remove();

      if (activeInterview.isCompleted) {
        await appendChatMessage('Synthesizing your production-ready blueprint...', 'bot', true);
        const bp = getMockBlueprint(activeInterview.domain, activeInterview.answers);
        currentActiveBlueprint = bp;
        saveBlueprint(bp);
        renderBlueprint(bp);
        await appendChatMessage('✨ Done! Your 7-layer architecture blueprint, ERD schema, Mermaid diagram, and sprint roadmap are ready on the right.', 'bot', true);
        renderRestartButton();
      } else {
        const nextQ = activeInterview.getCurrentQuestion();
        if (nextQ) {
          await appendChatMessage(nextQ.bot, 'bot', true);
          renderSuggestionChips(nextQ.options, handleUserAnswer);
        }
      }
    }, 600);
  }

  function renderRestartButton() {
    const optsContainer = document.getElementById('options');
    if (!optsContainer) return;
    optsContainer.innerHTML = `<button type="button" class="option-chip restart-chip" id="btn-restart-interview">↻ Start New Interview</button>`;
    const btn = document.getElementById('btn-restart-interview');
    if (btn) {
      btn.addEventListener('click', () => {
        const messages = document.getElementById('messages');
        if (messages) messages.innerHTML = '';
        activeInterview.start();
        const fill = document.getElementById('progress-fill');
        const label = document.getElementById('progress-label');
        if (fill) fill.style.width = '0%';
        if (label) label.textContent = 'Question 1 / 5';
        const q1 = activeInterview.getCurrentQuestion();
        appendChatMessage(q1.bot, 'bot', true);
        renderSuggestionChips(q1.options, handleUserAnswer);
      });
    }
  }

  function renderHistoryModal() {
    const list = document.getElementById('history-list');
    if (!list) return;
    const history = getHistory();
    if (history.length === 0) {
      list.innerHTML = `<p class="muted" style="text-align:center; padding:32px 0;">No saved blueprints yet. Complete an interview to save your architecture!</p>`;
      return;
    }
    list.innerHTML = history.map(item => `
      <div class="history-item glass" data-id="${escapeHTML(item.id)}">
        <div class="history-item-info">
          <h4>${escapeHTML(item.summary?.title || 'Architecture Blueprint')}</h4>
          <p class="history-date">${new Date(item.timestamp).toLocaleString()} · ${escapeHTML(item.summary?.domain || 'SaaS').toUpperCase()}</p>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn btn-sm btn-hero btn-load-history" data-id="${escapeHTML(item.id)}">Load</button>
          <button type="button" class="btn btn-sm btn-ghost btn-danger btn-del-history" data-id="${escapeHTML(item.id)}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-load-history').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = history.find(h => h.id === btn.dataset.id);
        if (item) {
          currentActiveBlueprint = item;
          renderBlueprint(item);
          closeModal('history-modal');
          showToast('Loaded blueprint into visualizer', 'success');
        }
      });
    });

    list.querySelectorAll('.btn-del-history').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteBlueprint(btn.dataset.id);
        renderHistoryModal();
        showToast('Deleted blueprint from history', 'info');
      });
    });
  }

  function initApp() {
    initParticles();
    initCursorGlow();
    initSpotlightHover();
    initStatsCounters();
    initFaqAccordion();
    initScrollReveal();
    initSmoothScroll();
    initMobileNav();

    document.querySelectorAll('.bp-tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll('[data-open-settings]').forEach(btn => {
      btn.addEventListener('click', () => {
        const keyInput = document.getElementById('gemini-api-key');
        if (keyInput) keyInput.value = getApiKey() || '';
        openModal('settings-modal');
      });
    });

    document.querySelectorAll('[data-open-history]').forEach(btn => {
      btn.addEventListener('click', () => {
        renderHistoryModal();
        openModal('history-modal');
      });
    });

    const sampleBtn = document.getElementById('open-sample');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => openModal('sample-modal'));
    }

    const loadSampleBtn = document.getElementById('btn-load-sample-visualizer');
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        const sample = ARCHETYPE_BLUEPRINTS.saas;
        currentActiveBlueprint = sample;
        renderBlueprint(sample);
        closeModal('sample-modal');
        const demoSection = document.getElementById('demo');
        if (demoSection) demoSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Sample blueprint loaded into visualizer!', 'success');
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal('settings-modal');
        closeModal('history-modal');
        closeModal('sample-modal');
      });
    });

    const saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const input = document.getElementById('gemini-api-key');
        if (input) setApiKey(input.value);
        closeModal('settings-modal');
        showToast('API settings saved securely in browser!', 'success');
      });
    }

    const clearKeyBtn = document.getElementById('btn-clear-key');
    if (clearKeyBtn) {
      clearKeyBtn.addEventListener('click', () => {
        clearApiKey();
        const input = document.getElementById('gemini-api-key');
        if (input) input.value = '';
        showToast('Gemini API key cleared from storage', 'info');
      });
    }

    const clearHistBtn = document.getElementById('btn-clear-all-history');
    if (clearHistBtn) {
      clearHistBtn.addEventListener('click', () => {
        clearHistory();
        renderHistoryModal();
        showToast('Session history cleared', 'info');
      });
    }

    const expMdBtn = document.getElementById('btn-export-markdown');
    if (expMdBtn) expMdBtn.addEventListener('click', () => exportMarkdown(currentActiveBlueprint));

    const expJsonBtn = document.getElementById('btn-export-json');
    if (expJsonBtn) expJsonBtn.addEventListener('click', () => exportJSON(currentActiveBlueprint));

    const expPdfBtn = document.getElementById('btn-export-pdf');
    if (expPdfBtn) expPdfBtn.addEventListener('click', exportPDF);

    const answerForm = document.getElementById('answer-form');
    if (answerForm) {
      answerForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('answer-input');
        if (input) handleUserAnswer(input.value);
      });
    }

    activeInterview.start();
    const q1 = activeInterview.getCurrentQuestion();
    const messages = document.getElementById('messages');
    if (messages && messages.children.length === 0) {
      appendChatMessage(q1.bot, 'bot', false);
      renderSuggestionChips(q1.options, handleUserAnswer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();