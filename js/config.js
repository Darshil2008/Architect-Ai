/**
 * Architect AI — Configuration & Constants Module
 * 
 * Central configuration for storage keys, Gemini API endpoints, model definitions,
 * interview stages, domain keywords, system prompts, and JSON schema definitions.
 * 
 * @module config
 */

// ============================================================
// STORAGE KEYS & PERSISTENCE CONFIGURATION
// ============================================================

export const STORAGE_KEYS = {
  API_KEY: 'architect_ai_gemini_key',
  LEGACY_KEY: 'gemini_api_key',
  MODEL: 'architect_ai_gemini_model',
  MODE: 'architect_ai_engine_mode',
  HISTORY: 'architect_ai_history_v1'
};

export const MAX_HISTORY_ITEMS = 20;

// ============================================================
// GEMINI API & MODEL CONFIGURATION
// ============================================================

export const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.5-flash',
  FALLBACK: 'gemini-1.5-flash',
  PRO: 'gemini-2.5-pro',
  DEFAULT: 'gemini-2.5-flash'
};

export const ENGINE_MODES = {
  AUTO: 'auto',   // Use Live API if key is present, fallback to Mock
  API: 'api',     // Force Live API (error if missing or failed)
  MOCK: 'mock'    // Force Intelligent Offline Mock Engine
};

export const GEMINI_CONFIG = {
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  DEFAULT_TEMPERATURE: 0.7,
  SYNTHESIS_TEMPERATURE: 0.4,
  DEFAULT_TOP_P: 0.95,
  QUESTION_MAX_TOKENS: 1024,
  SYNTHESIS_MAX_TOKENS: 4096,
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 1200
};

// ============================================================
// INTERVIEW LIFECYCLE STAGES
// ============================================================

export const INTERVIEW_STAGES = [
  {
    id: 'IDEA',
    index: 0,
    name: 'Domain & Core Idea',
    description: 'Probing core value proposition, target user persona, and primary use cases.',
    summaryKey: 'idea'
  },
  {
    id: 'SCALE',
    index: 1,
    name: 'Scale & Concurrency',
    description: 'Probing daily active users (DAU), peak RPS, read/write ratio, and data volume.',
    summaryKey: 'scale'
  },
  {
    id: 'STACK',
    index: 2,
    name: 'Tech Constraints & Stack',
    description: 'Probing preferred programming languages, framework preferences, and team skills.',
    summaryKey: 'techStack'
  },
  {
    id: 'STORAGE',
    index: 3,
    name: 'Data Architecture & Storage',
    description: 'Probing relational vs NoSQL, vector search, caching, and event queues.',
    summaryKey: 'storage'
  },
  {
    id: 'CONSTRAINTS',
    index: 4,
    name: 'Latency, Budget & Constraints',
    description: 'Probing latency SLAs, monthly infrastructure budget, and compliance mandates.',
    summaryKey: 'constraints'
  },
  {
    id: 'SYNTHESIS',
    index: 5,
    name: 'Blueprint Synthesis',
    description: 'Compiling architectural decisions into unified blueprint JSON specification.',
    summaryKey: 'synthesis'
  }
];

export const TOTAL_INTERVIEW_STAGES = 5; // Stages 0 through 4 are questions, 5 is synthesis

// ============================================================
// DEFAULT INITIAL QUESTIONS & SUGGESTION CHIPS
// ============================================================

export const DEFAULT_INITIAL_QUESTION = {
  question: "Hey 👋 I'm Architect AI. In one line, what project are you building?",
  options: [
    "AI-powered RAG knowledge assistant",
    "High-throughput E-Commerce store",
    "Real-time collaborative whiteboard",
    "B2B Multi-tenant SaaS dashboard",
    "FinTech payment & ledger platform",
    "IoT telemetry & analytics hub"
  ],
  stageName: "Domain & Core Idea",
  currentSummary: "Awaiting project concept"
};

// ============================================================
// DOMAIN KEYWORD MAP FOR INTENT CLASSIFICATION
// ============================================================

export const DOMAIN_KEYWORDS = {
  ai: [
    'ai', 'llm', 'rag', 'agent', 'gpt', 'bot', 'assistant', 'embedding',
    'embeddings', 'vector', 'langchain', 'llamaindex', 'neural', 'vision',
    'speech', 'machine learning', 'ml', 'openai', 'claude', 'gemini', 'qdrant', 'pinecone'
  ],
  ecommerce: [
    'shop', 'store', 'ecommerce', 'e-commerce', 'cart', 'product', 'checkout',
    'marketplace', 'order', 'orders', 'inventory', 'catalog', 'stripe', 'medusa', 'shopify'
  ],
  realtime: [
    'chat', 'canvas', 'whiteboard', 'collab', 'collaboration', 'multiplayer',
    'game', 'gaming', 'live', 'messaging', 'presence', 'websocket', 'socket.io',
    'webrtc', 'crdt', 'yjs'
  ],
  saas: [
    'b2b', 'crm', 'dashboard', 'analytics', 'admin', 'tenant', 'multi-tenant',
    'hr', 'project management', 'workflow', 'subscription', 'portal', 'enterprise', 'saas'
  ],
  fintech: [
    'bank', 'banking', 'payment', 'payments', 'crypto', 'trading', 'wallet',
    'ledger', 'invoice', 'finance', 'billing', 'stock', 'transaction', 'pci', 'double-entry'
  ],
  streaming: [
    'video', 'audio', 'music', 'podcast', 'stream', 'streaming', 'hls', 'media',
    'transcode', 'vod', 'live stream', 'webrtc stream', 'ffmpeg'
  ],
  iot: [
    'iot', 'sensor', 'sensors', 'telemetry', 'hardware', 'device', 'devices',
    'fleet', 'tracker', 'smart home', 'mqtt', 'time series', 'timescale', 'clickhouse'
  ],
  mobile: [
    'pwa', 'mobile', 'ios', 'android', 'offline', 'react native', 'flutter',
    'indexeddb', 'local-first', 'sqlite'
  ],
  devtool: [
    'developer', 'api', 'gateway', 'sdk', 'cli', 'git', 'ci/cd', 'observability',
    'devops', 'monitoring', 'webhook', 'webhooks', 'platform', 'envoy'
  ],
  serverless: [
    'indie', 'solo', 'fast', 'weekend', 'prototype', 'mvp', 'cheap', 'free',
    'serverless', 'edge', 'zero-ops', 'supabase', 'vercel', 'upstash'
  ]
};

// ============================================================
// SYSTEM PROMPT INSTRUCTIONS FOR GEMINI API
// ============================================================

export const SYSTEM_PROMPTS = {
  INTERVIEW_SYSTEM_PROMPT: `You are Architect AI, an elite principal software architect conducting a friendly, highly focused architecture discovery interview.
Your goal is to gather requirements across 4-6 conversational turns to build a comprehensive system architecture blueprint.

Always return a valid JSON object strictly matching this schema:
{
  "question": "The next probing follow-up question (concise, 1-2 sentences)",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "stageName": "Scale & Concurrency | Tech Constraints & Stack | Data Architecture & Storage | Latency, Budget & Constraints",
  "currentSummary": "Brief 1-line recap of what is understood so far",
  "isLast": false
}

Rules:
1. Always tailor follow-up questions and smart option chips directly to the user's prior answers.
2. If the interview has gathered sufficient information (idea, scale, tech stack, data model, constraints) or reaches turn 5, set "isLast": true.
3. Keep questions sharp, technical, and approachable.
4. Output raw JSON only. Do not wrap in markdown code blocks (\`\`\`json).`,

  SYNTHESIS_SYSTEM_PROMPT: `You are Architect AI, an enterprise-grade Principal Cloud Architect.
Based on the completed interview transcript, synthesize a complete, production-ready system architecture blueprint formatted strictly as a single JSON object.

Follow standard Mermaid.js syntax for diagrams (valid flowchart TD syntax), provide granular database schemas with data types and keys, realistic sprint roadmaps, and recruiter-grade resume impact statements.

Strict JSON Output Schema:
{
  "id": "bp_<timestamp>_<slug>",
  "timestamp": "ISO8601 string",
  "summary": {
    "title": "Clear, professional project title",
    "tagline": "Punchy 1-line value proposition",
    "domain": "ai | ecommerce | realtime | saas | fintech | streaming | iot | mobile | devtool | serverless",
    "targetScale": "Target scale description (e.g., 50K DAU, 2.5K peak RPS)",
    "estimatedMonthlyCost": "Estimated cloud budget (e.g., $85 - $150 / mo)",
    "description": "2-3 sentence executive architectural overview"
  },
  "stack": {
    "frontend": { "name": "Frontend framework", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "backend": { "name": "Backend runtime/framework", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "database": { "name": "Database engine", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "caching": { "name": "Cache/Queue layer", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "hosting": { "name": "Compute/Cloud provider", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "ci_cd": { "name": "CI/CD Pipeline", "reason": "Why chosen", "tradeoffs": "Key tradeoff" },
    "observability": { "name": "Monitoring & Logging", "reason": "Why chosen", "tradeoffs": "Key tradeoff" }
  },
  "schema": {
    "databaseType": "PostgreSQL | MongoDB | TimescaleDB | etc.",
    "tables": [
      {
        "name": "table_name",
        "purpose": "What this table stores",
        "columns": [
          { "name": "id", "type": "UUID", "constraints": "PRIMARY KEY", "description": "Unique identifier", "index": true },
          { "name": "created_at", "type": "TIMESTAMPTZ", "constraints": "NOT NULL DEFAULT NOW()", "description": "Creation timestamp", "index": true }
        ],
        "relationships": ["table_b.id via foreign_key_id"]
      }
    ]
  },
  "architecture": {
    "mermaid": "flowchart TD\\n  Client[Web / Mobile Client] --> CDN[Cloudflare CDN]\\n  CDN --> Gateway[API Gateway]\\n  Gateway --> API[Backend API Service]\\n  API --> DB[(Primary Database)]\\n  API --> Cache[(Redis Cache)]",
    "components": [
      { "id": "client", "name": "Web/Mobile Client", "layer": "Presentation", "description": "Single-page application client" },
      { "id": "gateway", "name": "API Gateway", "layer": "Routing", "description": "Reverse proxy, rate limiting, auth validation" },
      { "id": "api", "name": "Core Backend API", "layer": "Application", "description": "Business logic & orchestration" },
      { "id": "db", "name": "Primary Database", "layer": "Persistence", "description": "ACID transactional relational data store" },
      { "id": "cache", "name": "In-Memory Cache", "layer": "Caching", "description": "Session caching and fast key-value lookups" }
    ]
  },
  "roadmap": {
    "totalDuration": "6 - 8 Weeks",
    "phases": [
      {
        "phaseNumber": 1,
        "name": "Phase 1: Foundation & Core Data Models",
        "duration": "Weeks 1-2",
        "focus": "Database schema migrations, authentication, project scaffolding",
        "tasks": ["Scaffold monorepo with TypeScript", "Define DB schemas & run initial migrations", "Implement OAuth2 / JWT authentication"],
        "risks": ["Underestimating auth integration complexity", "Schema design churn"]
      },
      {
        "phaseNumber": 2,
        "name": "Phase 2: Core Business Logic & APIs",
        "duration": "Weeks 3-4",
        "focus": "Primary domain workflows, CRUD endpoints, caching integration",
        "tasks": ["Implement core domain business logic", "Integrate Redis caching layer", "Write integration test suite"],
        "risks": ["N+1 database query bottlenecks", "Third-party API rate limits"]
      },
      {
        "phaseNumber": 3,
        "name": "Phase 3: Real-Time / Advanced Capabilities",
        "duration": "Weeks 5-6",
        "focus": "Event handling, async worker queues, edge optimization",
        "tasks": ["Configure background job worker queue", "Implement client notifications & real-time sync", "Establish CI/CD deploy pipeline"],
        "risks": ["Worker queue backpressure under spike loads"]
      },
      {
        "phaseNumber": 4,
        "name": "Phase 4: Observability, Hardening & Launch",
        "duration": "Weeks 7-8",
        "focus": "Telemetry, security audits, load testing, production deploy",
        "tasks": ["Setup OpenTelemetry & Sentry error tracking", "Perform load tests up to 2x target RPS", "Deploy to production with zero-downtime rolling updates"],
        "risks": ["Unmonitored production edge cases", "Cold start latencies"]
      }
    ]
  },
  "resumeImpact": {
    "headline": "Full-Stack System Architect — High-Performance Distributed Web Application",
    "bulletPoints": [
      "Architected scalable distributed system handling target workload with sub-100ms P99 latency SLA.",
      "Designed modular database schema with optimized indexing and foreign key constraints supporting high read/write throughput.",
      "Engineered automated CI/CD and observability pipeline with OpenTelemetry and Sentry, reducing deployment lead time."
    ],
    "skillsDemonstrated": ["Distributed Systems", "Cloud Architecture", "Database Design", "Performance Optimization", "API Design"]
  }
}

Do not wrap output in markdown code fences. Output raw valid JSON only.`
};
