/**
 * Architect AI — Intelligent Offline Heuristic Mock Engine
 * 
 * Provides an offline decision tree, keyword/intent domain classifier,
 * dynamic multi-turn question generator, and 10+ comprehensive recruiter-grade
 * architecture blueprints strictly conforming to the Unified Blueprint JSON Schema.
 * 
 * @module mockEngine
 */

import { DOMAIN_KEYWORDS, DEFAULT_INITIAL_QUESTION } from './config.js';

// ============================================================
// DOMAIN INTENT CLASSIFIER
// ============================================================

/**
 * Classifies user text into one of 10 architectural domains using weighted keyword scoring.
 * 
 * @param {string} text - User prompt or project idea
 * @returns {string} One of: 'ai', 'ecommerce', 'realtime', 'saas', 'fintech', 'streaming', 'iot', 'mobile', 'devtool', 'serverless'
 */
export function classifyDomain(text) {
  if (!text || typeof text !== 'string') {
    return 'saas';
  }

  const lower = text.toLowerCase();
  let bestDomain = 'saas';
  let maxScore = 0;

  // Evaluate weighted keyword matches across all registered domains
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Longer / multi-word keywords contribute higher weight
        score += keyword.length >= 6 ? 2 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestDomain = domain;
    }
  }

  return maxScore > 0 ? bestDomain : 'saas'; // Default fallback archetype
}

// ============================================================
// CURATED DOMAIN QUESTION DECISION TREES
// ============================================================

export const MOCK_QUESTION_TREES = {
  ai: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Exciting AI project! What daily query volume and latency SLA are you planning for v1?',
      options: [
        '< 1,000 queries/day (Prototyping)',
        '10K - 100K queries/day (Production RAG)',
        '1M+ high-throughput streaming queries',
        'Sub-200ms real-time voice/chat SLA'
      ],
      label: 'Query Scale'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: "What's your preferred LLM orchestration pipeline and vector search framework?",
      options: [
        'OpenAI / Gemini API + pgvector',
        'Self-hosted Ollama + Qdrant / Milvus',
        'Anthropic Claude + Pinecone Serverless',
        'FastAPI + LangChain / LlamaIndex'
      ],
      label: 'AI Pipeline'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will document chunking, user session memory, and embedding caching be structured?',
      options: [
        'Redis Semantic Cache + PostgreSQL',
        'Supabase (Auth + Vectors + Relational)',
        'S3 Document Lake + Pinecone + DynamoDB',
        'Hybrid MongoDB Atlas + OpenSearch'
      ],
      label: 'Knowledge Store'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'Final question: What is your primary architectural constraint or launch priority?',
      options: [
        'Tight API cost budget (< $100/mo)',
        'Strict enterprise data privacy & HIPAA',
        'Zero-latency streaming UX (< 50ms TTFT)',
        'Multi-modal vision & PDF OCR support'
      ],
      label: 'Key Constraint'
    }
  ],

  ecommerce: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'E-Commerce demands high resilience. What catalog size and peak transaction throughput are you targeting?',
      options: [
        '< 500 SKUs · 100 orders/day (Boutique)',
        '50K SKUs · Flash sale spikes (2.5K RPS)',
        'Multi-vendor marketplace (1M+ items)',
        'Global multi-currency checkout (< 100ms)'
      ],
      label: 'Store Scale'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What core commerce engine and backend framework do you favor?',
      options: [
        'Next.js 15 Commerce + Stripe + Node.js',
        'Medusa.js / Shopify Headless + React',
        'Go (Golang) Microservices + gRPC',
        'Python FastAPI + Celery Worker Queues'
      ],
      label: 'Commerce Engine'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will you handle inventory lock contention, shopping cart state, and product catalog search?',
      options: [
        'Postgres Row Locking (SELECT FOR UPDATE) + Algolia',
        'Redis Redlock Distributed Locks + Meilisearch',
        'DynamoDB Transactions + Elasticsearch',
        'Supabase + pg_trgm full-text search'
      ],
      label: 'Search & Inventory'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is your critical non-functional requirement for launch?',
      options: [
        '99.99% checkout uptime & PCI-DSS compliance',
        'Global sub-second edge page loads via CDN',
        'Automated webhook inventory reconciliation',
        'Minimal upfront cloud infrastructure costs'
      ],
      label: 'SLA Priority'
    }
  ],

  realtime: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Real-time state synchronization requires smart connection handling. How many concurrent connected sessions do you expect?',
      options: [
        '< 200 concurrent users (Peer-to-Peer)',
        '1K - 10K active WebSocket connections',
        '100K+ concurrent collaboration rooms',
        'High-frequency 60 FPS state sync'
      ],
      label: 'Concurrency'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'Which real-time transport protocol and backend runtime fits your development velocity best?',
      options: [
        'Node.js + Socket.io + Redis Pub/Sub',
        'Go (Goroutines) + Native WebSockets',
        'Elixir / Phoenix LiveView Channels',
        'PartyKit / Cloudflare Durable Objects'
      ],
      label: 'Transport Stack'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How should collaborative canvas persistence and conflict resolution be modeled?',
      options: [
        'CRDTs (Yjs) + PostgreSQL persistence',
        'Operational Transformation (OT) + Redis',
        'Event Sourcing (Kafka / EventStoreDB)',
        'Periodic snapshotting to S3 / Cloudflare R2'
      ],
      label: 'State Sync'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is the primary operational constraint for this collaborative platform?',
      options: [
        'Sub-30ms client-to-client latency SLA',
        'Offline-first sync with IndexedDB',
        'End-to-End Encryption (E2EE) for rooms',
        'Zero-downtime rolling deploys'
      ],
      label: 'Key SLA'
    }
  ],

  saas: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Great concept! What user volume, seat tiers, and tenant architecture are you targeting?',
      options: [
        'Solo & Small Teams (< 1K users)',
        'Mid-Market B2B (Multi-tenant orgs, 10K seats)',
        'Enterprise (SSO, Audit logs, 100K+ seats)',
        'High-volume freemium SaaS model'
      ],
      label: 'Tenant Model'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What tech stack are you and your team most productive building in?',
      options: [
        'Next.js 15 + Supabase + Tailwind CSS',
        'React (Vite) + FastAPI + PostgreSQL',
        'Node.js (NestJS) + React + Docker',
        'Ruby on Rails 7 + Hotwire + Sidekiq'
      ],
      label: 'Core Stack'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How do you plan to handle multi-tenancy isolation, background jobs, and file storage?',
      options: [
        'Row-Level Security (RLS) + Redis BullMQ',
        'Schema-per-tenant Postgres + AWS S3',
        'Shared DB with Org IDs + AWS SQS',
        'MongoDB multi-collection + Cloudflare R2'
      ],
      label: 'Storage & Queues'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: "What's the key milestone or constraint for version 1?",
      options: [
        'Ship MVP in < 2 weeks on minimal budget',
        'SOC2 & GDPR compliance ready from day 1',
        'Self-hostable Docker / Helm deployment',
        'Granular Role-Based Access Control (RBAC)'
      ],
      label: 'v1 Priority'
    }
  ],

  fintech: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Financial platforms require strict consistency. What transaction velocity and volume are you preparing for?',
      options: [
        '< 500 tx/day (Internal accounting)',
        '10K - 50K tx/day (Consumer wallet / checkout)',
        '1M+ tx/day (High-frequency ledger / exchange)',
        'Multi-currency cross-border settlement'
      ],
      label: 'Tx Volume'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What language and framework ecosystem will power your ledger services?',
      options: [
        'Go (Golang) + gRPC + Temporal Workflow',
        'Java / Spring Boot + Hibernate + Kafka',
        'Node.js (TypeScript) + Fastify + BullMQ',
        'Rust + Actix-web + PostgreSQL'
      ],
      label: 'Ledger Engine'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will double-entry bookkeeping, idempotency, and audit trails be enforced?',
      options: [
        'Immutable Append-Only PostgreSQL Ledger + Bitemporal indices',
        'CockroachDB distributed ACID transactions',
        'TigerBeetle dedicated financial accounting DB',
        'AWS Quantum Ledger Database (QLDB) / Aurora'
      ],
      label: 'Ledger DB'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What regulatory and security constraints must be satisfied?',
      options: [
        'PCI-DSS Level 1 & SOC2 Type II compliance',
        'Sub-50ms idempotency verification',
        'Hardware Security Module (HSM / KMS) key signing',
        'Real-time AML / Anti-Fraud anomaly detection'
      ],
      label: 'Compliance'
    }
  ],

  streaming: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Media streaming requires massive bandwidth handling. What audience scale and bitrate are you targeting?',
      options: [
        '< 1,000 concurrent viewers (Live podcast/show)',
        '50K concurrent streams (VOD / HLS streaming)',
        '1M+ concurrent global audience (Sports broadcast)',
        'Ultra-low latency (< 1s) interactive streaming'
      ],
      label: 'Viewer Scale'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What ingestion pipeline and transcoding stack do you plan to employ?',
      options: [
        'AWS Elemental MediaConvert + CloudFront CDN',
        'FFmpeg microservices on Kubernetes (EKS)',
        'Cloudflare Stream / Livepeer decentralized video',
        'Go RTMP Ingestion Server + HLS Packager'
      ],
      label: 'Transcode Stack'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will video segments, thumbnails, and playback metadata be stored?',
      options: [
        'S3 Glacier/Standard + CloudFront CDN + Postgres',
        'Cloudflare R2 (Zero egress fees) + DynamoDB',
        'MinIO distributed object storage + Redis',
        'Hybrid Fastly Varnish cache + MongoDB metadata'
      ],
      label: 'Media Storage'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is the top operational challenge for your media network?',
      options: [
        'Minimizing CDN bandwidth egress billing costs',
        'Adaptive Bitrate (ABR) switching smoothly on mobile',
        'DRM / tokenized signed URL copy protection',
        'Real-time viewer chat synchronization'
      ],
      label: 'Bandwidth SLA'
    }
  ],

  iot: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'IoT systems generate high data ingest frequency. How many active devices and telemetry packets are expected?',
      options: [
        '< 500 devices · 1 packet/minute (Smart facility)',
        '50K devices · 10-second heartbeat telemetry',
        '1M+ connected edge sensors (Vehicle fleet)',
        'High-frequency 100Hz vibration telemetry'
      ],
      label: 'Fleet Scale'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'Which message broker and ingestion gateway fits your device fleet best?',
      options: [
        'EMQX / Mosquitto MQTT Broker + Go Ingestion',
        'AWS IoT Core + Lambda + Kinesis Firehose',
        'Apache Kafka / Redpanda + Rust Stream Processors',
        'RabbitMQ + Python Celery Workers'
      ],
      label: 'Ingestion Bus'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will you store time-series metrics, device state, and alert rules?',
      options: [
        'TimescaleDB (PostgreSQL Hypertables) + Redis',
        'ClickHouse column-oriented database for analytics',
        'InfluxDB Cloud + DynamoDB Device Registry',
        'Apache Cassandra / ScyllaDB for ultra-high ingest'
      ],
      label: 'Time-Series DB'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is the critical constraint for this IoT deployment?',
      options: [
        'Sub-second real-time anomaly alerting',
        'Data retention rollup / 10x compression over 1 year',
        'Over-The-Air (OTA) firmware update rollback safety',
        'Edge offline buffering during network drops'
      ],
      label: 'Edge SLA'
    }
  ],

  mobile: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Mobile experiences must feel instant. What user base and synchronization model are you building?',
      options: [
        '< 5K DAU (Niche utility / Personal productivity)',
        '50K - 250K active mobile users',
        '1M+ global mobile installs',
        'High-churn offline-first local usage'
      ],
      label: 'App Scale'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What client framework and API synchronization pattern do you favor?',
      options: [
        'React Native (Expo) + TypeScript + Node.js',
        'Flutter + Dart + Go API backend',
        'Progressive Web App (PWA) + Next.js + Service Workers',
        'Swift / Kotlin Native + GraphQL backend'
      ],
      label: 'Mobile Framework'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will local client storage and cloud syncing handle network offline state?',
      options: [
        'WatermelonDB / RxDB (IndexedDB) + SQLite local sync',
        'PowerSync / ElectricSQL local-first Postgres sync',
        'Firebase Firestore offline persistence cache',
        'Custom optimistic mutation queue + REST API'
      ],
      label: 'Local Sync'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is the top constraint for the mobile product?',
      options: [
        'Zero data loss during airplane mode offline use',
        'Sub-1.5s initial app bundle cold start',
        'Battery efficiency & minimal background push wakeups',
        'Biometric authentication (FaceID / Fingerprint)'
      ],
      label: 'UX Priority'
    }
  ],

  devtool: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Developer platforms demand lightning-fast response times. What API traffic volume are you engineering for?',
      options: [
        '< 100K API calls/day (Early developer beta)',
        '5M - 20M API requests/day (Production SaaS API)',
        '100M+ high-throughput requests/day',
        'Global edge routing with sub-10ms P99 latency'
      ],
      label: 'API Volume'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What gateway infrastructure and backend microservice framework will you use?',
      options: [
        'Envoy / Kong API Gateway + Go Microservices',
        'Cloudflare Workers (V8 Edge Isolates) + Hono',
        'Rust (Axum / Tower) + Tokio async runtime',
        'Node.js Fastify + Redis token bucket rate limiter'
      ],
      label: 'Gateway Stack'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will API key validation, sliding-window rate limiting, and audit logs be stored?',
      options: [
        'Redis Cluster (In-memory token bucket) + PostgreSQL',
        'ClickHouse (API request logs) + DynamoDB keys',
        'Cloudflare KV + Durable Objects rate limiting',
        'Supabase (Auth + Webhooks) + Upstash Redis'
      ],
      label: 'Telemetry & Keys'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is the non-negotiable metric for developer satisfaction?',
      options: [
        '99.999% gateway availability SLA',
        'Sub-5ms overhead added by API authentication layer',
        'Reliable retry-backed webhook delivery with HMAC signatures',
        'Self-service automated SDK generation (OpenAPI/TypeScript)'
      ],
      label: 'Gateway SLA'
    }
  ],

  serverless: [
    {
      stage: 'SCALE',
      stageName: 'Scale & Concurrency',
      bot: 'Lean MVP architectures maximize speed to market. What is your expected launch trajectory?',
      options: [
        'Indie Hacker MVP (< 1K users, $0 fixed costs)',
        'Viral Product Hunt Launch (10K - 50K visits in 24h)',
        'B2B Micro-SaaS ($10K MRR target)',
        'Community project with zero ongoing DevOps maintenance'
      ],
      label: 'Launch Target'
    },
    {
      stage: 'STACK',
      stageName: 'Tech Constraints & Stack',
      bot: 'What zero-ops modern full-stack toolkit do you want to build on?',
      options: [
        'Next.js 15 (App Router) + Tailwind + Vercel',
        'SvelteKit + Supabase + Cloudflare Pages',
        'Remix / React Router 7 + Fly.io + Prisma',
        'Nuxt 3 + Firebase Auth & Firestore'
      ],
      label: 'Stack Choice'
    },
    {
      stage: 'STORAGE',
      stageName: 'Data Architecture & Storage',
      bot: 'How will data persistence, authentication, and file uploads be managed with minimal ops?',
      options: [
        'Supabase (PostgreSQL + Built-in Auth + Storage RLS)',
        'PlanetScale / Neon Serverless Postgres + Drizzle ORM',
        'MongoDB Atlas Serverless + AWS S3 Presigned URLs',
        'PocketBase / Convex reactive serverless backend'
      ],
      label: 'Backend-as-a-Service'
    },
    {
      stage: 'CONSTRAINTS',
      stageName: 'Latency, Budget & Constraints',
      bot: 'What is your core development constraint?',
      options: [
        'Launch functional prototype in under 7 days',
        'Zero fixed recurring server costs on free tiers',
        'Integrated Stripe Checkout & subscription webhooks',
        'Clean SEO and Lighthouse 100 performance score'
      ],
      label: 'Dev Goal'
    }
  ]
};

// ============================================================
// 10+ RICH ARCHETYPE BLUEPRINT GENERATORS
// ============================================================

export const ARCHETYPE_BLUEPRINTS = {
  ai: {
    summary: {
      title: "AI RAG & Multi-Agent Knowledge Engine",
      tagline: "High-throughput retrieval-augmented intelligence with hybrid semantic search",
      domain: "ai",
      targetScale: "50K Daily Queries · Sub-250ms Retrieval SLA",
      estimatedMonthlyCost: "$120 - $280 / mo",
      description: "Production-ready AI orchestration platform featuring asynchronous document ingestion, vector similarity search with pgvector, Redis semantic caching, and resilient multi-model LLM routing."
    },
    stack: {
      frontend: {
        name: "Next.js 15 (App Router) + Tailwind CSS + AI SDK",
        reason: "Streaming token UX with React Server Components and fast edge rendering.",
        tradeoffs: "Hydration overhead on complex markdown charts; mitigated via dynamic imports."
      },
      backend: {
        name: "FastAPI (Python 3.12) + LangChain / LlamaIndex",
        reason: "Async Python ecosystem with native LLM tooling, type validation, and streaming SSE.",
        tradeoffs: "Requires dedicated ASGI worker pools; mitigated via Uvicorn on ECS."
      },
      database: {
        name: "PostgreSQL 16 + pgvector (AWS Aurora / Supabase)",
        reason: "Unified relational schema and HNSW vector index in a single ACID-compliant database.",
        tradeoffs: "Vector index memory overhead; mitigated with HNSW m=16, ef_construction=64 tuning."
      },
      caching: {
        name: "Redis Cluster (Upstash / AWS ElastiCache)",
        reason: "Semantic embedding cache (avoiding duplicate LLM billing) and rate-limiting store.",
        tradeoffs: "Cache invalidation on document updates; mitigated with versioned cache keys."
      },
      hosting: {
        name: "AWS ECS (Fargate) + Vercel Edge Frontend",
        reason: "Serverless container compute for Python workers and zero-latency frontend delivery.",
        tradeoffs: "Slight cold start latency on scale-out; mitigated with min instance count = 1."
      },
      ci_cd: {
        name: "GitHub Actions + Docker Multi-Arch Builds",
        reason: "Automated linting, Pytest vector assertions, and zero-downtime rolling deploys.",
        tradeoffs: "Docker build duration; mitigated with GitHub Actions layer caching."
      },
      observability: {
        name: "OpenTelemetry + Arize Phoenix / LangSmith + Sentry",
        reason: "Full-trace LLM token tracking, latency waterfall breakdowns, and hallucination scoring.",
        tradeoffs: "Telemetry storage costs; mitigated with 20% head-based trace sampling."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 with pgvector extension",
      tables: [
        {
          name: "users",
          purpose: "Stores user identities, organization tenancy, and API quota limits.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique user identifier", index: true },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "User email address", index: true },
            { name: "plan_tier", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'pro'", description: "Billing tier (free, pro, enterprise)", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Creation timestamp", index: false }
          ],
          relationships: ["has_many documents", "has_many chat_sessions"]
        },
        {
          name: "documents",
          purpose: "Catalog of uploaded source documents for knowledge ingestion.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Document ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE", description: "Owner ID", index: true },
            { name: "title", type: "VARCHAR(500)", constraints: "NOT NULL", description: "Original file name", index: false },
            { name: "storage_uri", type: "VARCHAR(1000)", constraints: "NOT NULL", description: "S3 object storage location", index: false },
            { name: "chunk_count", type: "INTEGER", constraints: "NOT NULL DEFAULT 0", description: "Number of embedding chunks", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'pending'", description: "Ingestion status", index: true }
          ],
          relationships: ["belongs_to users", "has_many document_chunks"]
        },
        {
          name: "document_chunks",
          purpose: "Stores text chunks with 1536-dimensional vector embeddings for cosine search.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Chunk ID", index: true },
            { name: "document_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES documents(id) ON DELETE CASCADE", description: "Parent document", index: true },
            { name: "content", type: "TEXT", constraints: "NOT NULL", description: "Extracted text segment", index: false },
            { name: "embedding", type: "vector(1536)", constraints: "NOT NULL", description: "OpenAI/Gemini vector embedding", index: true },
            { name: "token_length", type: "INTEGER", constraints: "NOT NULL", description: "Token count of chunk", index: false }
          ],
          relationships: ["belongs_to documents"]
        },
        {
          name: "chat_sessions",
          purpose: "Manages conversation threads and contextual memory buffers.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Session ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE", description: "User ID", index: true },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL DEFAULT 'New Conversation'", description: "Thread title", index: false },
            { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Last message timestamp", index: true }
          ],
          relationships: ["belongs_to users", "has_many chat_messages"]
        },
        {
          name: "chat_messages",
          purpose: "Stores individual user queries, LLM completions, latency, and token metrics.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Message ID", index: true },
            { name: "session_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES chat_sessions(id) ON DELETE CASCADE", description: "Session thread", index: true },
            { name: "role", type: "VARCHAR(20)", constraints: "NOT NULL", description: "'user' | 'assistant' | 'system'", index: false },
            { name: "content", type: "TEXT", constraints: "NOT NULL", description: "Message text payload", index: false },
            { name: "prompt_tokens", type: "INTEGER", constraints: "DEFAULT 0", description: "Input token usage", index: false },
            { name: "completion_tokens", type: "INTEGER", constraints: "DEFAULT 0", description: "Output token usage", index: false },
            { name: "latency_ms", type: "INTEGER", constraints: "DEFAULT 0", description: "Response generation latency in ms", index: false }
          ],
          relationships: ["belongs_to chat_sessions"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  User([User Client]) -->|HTTPS / WSS| CDN[Cloudflare Edge]
  CDN -->|Next.js App| NextFrontend[Next.js 15 UI]
  NextFrontend -->|REST / SSE| APIGW[FastAPI Gateway]
  APIGW -->|Check Semantic Cache| Redis[(Redis Semantic Cache)]
  APIGW -->|Vector Similarity Query| PGVector[(PostgreSQL + pgvector)]
  APIGW -->|Async Ingest| Worker[Ingestion Celery Worker]
  Worker -->|Store Raw Files| S3[(S3 Document Store)]
  Worker -->|Generate Embeddings| LLM[Google Gemini / OpenAI API]
  APIGW -->|Stream Completion| LLM
  APIGW -->|Traces & Metrics| Telemetry[OpenTelemetry + Sentry]`,
      components: [
        { id: "frontend", name: "Next.js UI Client", layer: "Presentation", description: "Streaming chat interface with optimistic updates and markdown rendering" },
        { id: "gateway", name: "FastAPI Gateway", layer: "Application Gateway", description: "Async orchestration server handling token streaming, auth, and routing" },
        { id: "vector_db", name: "pgvector Knowledge Store", layer: "Persistence", description: "Stores relational user metadata and 1536-dim vector embeddings with HNSW indexing" },
        { id: "cache", name: "Redis Semantic Cache", layer: "Caching", description: "Caches frequent query embeddings and responses to reduce LLM costs" },
        { id: "worker", name: "Celery Ingest Worker", layer: "Processing", description: "Handles OCR parsing, text chunking, and embedding generation asynchronously" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Ingestion Pipeline & Storage Foundation",
          duration: "Weeks 1-2",
          focus: "Data extraction, chunking algorithms, pgvector setup, and S3 file lake.",
          tasks: ["Scaffold FastAPI + Next.js repository", "Provision PostgreSQL with pgvector extension", "Implement LangChain document chunking & embedding ingestion", "Build S3 pre-signed URL upload pipeline"],
          risks: ["Irregular chunk boundaries degrading retrieval accuracy", "S3 IAM permission misconfigurations"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: RAG Retrieval & Prompt Engineering",
          duration: "Weeks 3-4",
          focus: "Hybrid semantic search, context compression, and Gemini API integration.",
          tasks: ["Implement HNSW cosine similarity query endpoint", "Integrate Redis semantic cache for frequent queries", "Build streaming Server-Sent Events (SSE) chat response endpoint", "Configure system prompt context injection"],
          risks: ["Context window overflow with large document sets", "High initial LLM token costs"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Multi-Modal & Evaluation Suite",
          duration: "Weeks 5-6",
          focus: "PDF parsing, citation highlighting, and RAG evaluation metrics.",
          tasks: ["Add PDF table extraction & vision OCR processing", "Implement inline citation footnote linking in UI", "Build automated RAGAS evaluation harness (Faithfulness & Answer Relevance)", "Setup OpenTelemetry LLM trace instrumentation"],
          risks: ["OCR latency on high-resolution image uploads"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: Security Hardening, Rate Limiting & Launch",
          duration: "Weeks 7-8",
          focus: "Tenant data isolation, token bucket rate limiting, and production deploy.",
          tasks: ["Implement Redis sliding-window user quota limiting", "Configure Row-Level Security for multi-tenant isolation", "Perform load testing simulating 100 concurrent streaming sessions", "Deploy to AWS ECS with zero-downtime rolling updates"],
          risks: ["Streaming socket timeouts behind AWS ALB"]
        }
      ]
    },
    resumeImpact: {
      headline: "Principal AI Architect — High-Throughput RAG Knowledge Platform",
      bulletPoints: [
        "Architected an enterprise RAG knowledge engine utilizing Next.js 15, FastAPI, and PostgreSQL with pgvector, achieving sub-250ms semantic retrieval across 1M+ chunk embeddings.",
        "Engineered an in-memory Redis semantic caching layer, reducing redundant LLM API invocations by 42% and saving an estimated $1,800/mo in inference costs.",
        "Implemented end-to-end OpenTelemetry observability and automated RAGAS evaluation pipelines, sustaining 98.4% answer faithfulness across production workloads."
      ],
      skillsDemonstrated: ["Vector Databases (pgvector)", "LangChain / LlamaIndex", "FastAPI Asynchronous Architecture", "Redis Semantic Caching", "OpenTelemetry"]
    }
  },

  ecommerce: {
    summary: {
      title: "High-Throughput Distributed E-Commerce Platform",
      tagline: "Scalable multi-region commerce engine with distributed inventory locking",
      domain: "ecommerce",
      targetScale: "50K SKUs · 2.5K Peak Orders/Sec (Flash Sales)",
      estimatedMonthlyCost: "$180 - $450 / mo",
      description: "Fault-tolerant e-commerce architecture designed to handle severe flash sale traffic spikes, zero double-selling via Redis distributed locking, asynchronous Stripe payment reconciliation, and sub-100ms global catalog searches."
    },
    stack: {
      frontend: {
        name: "Next.js 15 Commerce + React 19 + Tailwind CSS",
        reason: "Edge-rendered storefront with Incremental Static Regeneration (ISR) for instant product pages.",
        tradeoffs: "Build times scale with catalog size; mitigated by on-demand ISR revalidation tags."
      },
      backend: {
        name: "Go (Golang 1.22) Microservices + gRPC",
        reason: "High concurrency, minimal memory footprint (<20MB per pod), and ultra-fast serialization.",
        tradeoffs: "Higher boilerplate than dynamic languages; mitigated with code generators."
      },
      database: {
        name: "PostgreSQL (Aurora Serverless v2) + Meilisearch",
        reason: "ACID consistency for financial orders coupled with typo-tolerant instant search index.",
        tradeoffs: "Search index sync lag; mitigated with transactional outbox event publisher."
      },
      caching: {
        name: "Redis Cluster (AWS ElastiCache)",
        reason: "Distributed locking (Redlock) for cart reservations and hot catalog caching.",
        tradeoffs: "Memory cost on large cart sessions; mitigated with 15-minute TTL eviction."
      },
      hosting: {
        name: "AWS EKS (Kubernetes) + Cloudflare Enterprise CDN",
        reason: "Horizontal pod autoscaling based on CPU/RPS and global edge static caching.",
        tradeoffs: "Kubernetes configuration complexity; mitigated with Terraform infrastructure as code."
      },
      ci_cd: {
        name: "GitHub Actions + ArgoCD (GitOps)",
        reason: "Declarative continuous delivery with automated canary deployments and rollbacks.",
        tradeoffs: "Learning curve for GitOps team workflows."
      },
      observability: {
        name: "Datadog + Prometheus + Sentry",
        reason: "Real-time cart abandonment tracking, checkout error rate monitoring, and APM tracing.",
        tradeoffs: "Datadog log ingestion costs; mitigated by filtering debug logs in production."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 with Aurora Serverless v2",
      tables: [
        {
          name: "users",
          purpose: "Stores customer profile, shipping addresses, and Stripe customer IDs.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Customer ID", index: true },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Customer email", index: true },
            { name: "stripe_customer_id", type: "VARCHAR(255)", constraints: "UNIQUE", description: "Payment gateway ID", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Account creation", index: false }
          ],
          relationships: ["has_many orders", "has_many cart_items"]
        },
        {
          name: "products",
          purpose: "Master catalog of SKUs, pricing, inventory stock counts, and variants.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Product ID", index: true },
            { name: "sku", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL", description: "Stock Keeping Unit code", index: true },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Product title", index: false },
            { name: "price_cents", type: "INTEGER", constraints: "NOT NULL CHECK (price_cents >= 0)", description: "Price in smallest currency unit", index: true },
            { name: "inventory_count", type: "INTEGER", constraints: "NOT NULL DEFAULT 0 CHECK (inventory_count >= 0)", description: "Available physical units", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'active'", description: "'active' | 'draft' | 'archived'", index: true }
          ],
          relationships: ["has_many order_items", "has_many inventory_reservations"]
        },
        {
          name: "orders",
          purpose: "Immutable financial ledger of completed customer purchases.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Order ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)", description: "Customer ID", index: true },
            { name: "total_cents", type: "INTEGER", constraints: "NOT NULL", description: "Final charge amount", index: false },
            { name: "payment_status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'pending'", description: "'pending' | 'paid' | 'failed' | 'refunded'", index: true },
            { name: "stripe_payment_intent_id", type: "VARCHAR(255)", constraints: "UNIQUE", description: "Stripe intent token", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Order placement time", index: true }
          ],
          relationships: ["belongs_to users", "has_many order_items"]
        },
        {
          name: "order_items",
          purpose: "Snapshot line items within an order with historical price preservation.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Line item ID", index: true },
            { name: "order_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES orders(id) ON DELETE CASCADE", description: "Parent order", index: true },
            { name: "product_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES products(id)", description: "Purchased product", index: true },
            { name: "quantity", type: "INTEGER", constraints: "NOT NULL CHECK (quantity > 0)", description: "Item count", index: false },
            { name: "unit_price_cents", type: "INTEGER", constraints: "NOT NULL", description: "Price at time of purchase", index: false }
          ],
          relationships: ["belongs_to orders", "belongs_to products"]
        },
        {
          name: "inventory_reservations",
          purpose: "Temporary cart reservation holds with TTL expiration to prevent double-selling.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Hold ID", index: true },
            { name: "product_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES products(id)", description: "Reserved SKU", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)", description: "Reserving customer", index: true },
            { name: "quantity", type: "INTEGER", constraints: "NOT NULL", description: "Reserved count", index: false },
            { name: "expires_at", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Automatic release timestamp", index: true }
          ],
          relationships: ["belongs_to products", "belongs_to users"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  Shopper([Shopper Browser / Mobile]) -->|HTTPS| CF[Cloudflare CDN & WAF]
  CF -->|Static Cache Hits| Storefront[Next.js 15 Storefront]
  CF -->|API Traffic| APIGW[Envoy API Gateway]
  APIGW -->|Catalog & Search| SearchSvc[Catalog Service + Meilisearch]
  APIGW -->|Checkout & Orders| OrderSvc[Go Order Service]
  OrderSvc -->|Acquire Lock| RedisCluster[(Redis Cluster - Redlock)]
  OrderSvc -->|ACID Transaction| PostgresDB[(PostgreSQL Primary)]
  OrderSvc -->|Publish Event| Kafka[Event Broker]
  Kafka -->|Reconcile Payment| StripeWorker[Payment Worker]
  StripeWorker -->|Process Charge| StripeAPI[Stripe Payment Gateway]
  StripeAPI -->|Webhook Callback| WebhookSvc[Webhook Ingestion Svc]`,
      components: [
        { id: "storefront", name: "Next.js Storefront", layer: "Presentation", description: "ISR edge-rendered catalog with instant optimistic shopping cart" },
        { id: "gateway", name: "Envoy Gateway", layer: "Routing", description: "TLS termination, JWT authentication, and rate limiting against scraping bots" },
        { id: "order_svc", name: "Go Order Microservice", layer: "Core Commerce", description: "High-concurrency order creation with distributed inventory locking" },
        { id: "redis_locks", name: "Redis Distributed Locks", layer: "Concurrency Control", description: "Redlock algorithm ensuring single-winner checkout during flash sales" },
        { id: "database", name: "PostgreSQL Aurora DB", layer: "Persistence", description: "Strict ACID relational store with read replicas for historical analytics" }
      ]
    },
    roadmap: {
      totalDuration: "8 - 10 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Catalog & Shopping Cart Scaffolding",
          duration: "Weeks 1-2",
          focus: "Product schemas, Meilisearch indexing, Next.js storefront, and Redis cart storage.",
          tasks: ["Build Go catalog service with gRPC endpoints", "Configure Meilisearch instant search index", "Scaffold Next.js 15 ISR storefront with Tailwind", "Setup Redis cart session storage"],
          risks: ["Search index desynchronization with Postgres"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Concurrency Locks & Payment Saga",
          duration: "Weeks 3-4",
          focus: "Redlock inventory reservation, Stripe integration, and idempotent order creation.",
          tasks: ["Implement Redis Redlock distributed locking mechanism", "Build Stripe Payment Intent checkout workflow", "Write idempotent webhook processor with signature validation", "Implement automated reservation expiry cleanup worker"],
          risks: ["Stripe webhook network retries causing duplicate orders"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: High-Load Stress Testing & Caching",
          duration: "Weeks 5-6",
          focus: "Load testing flash sales (2.5K RPS), Cloudflare edge caching, and read replicas.",
          tasks: ["Run k6 distributed load tests simulating 2,500 RPS checkout bursts", "Configure Cloudflare edge cache rules for static assets & catalog", "Implement Postgres read-replica query routing in Go", "Tune connection pooling with pgBouncer"],
          risks: ["Database connection exhaustion under flash sale load"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: Observability, PCI-DSS Hardening & Launch",
          duration: "Weeks 7-8",
          focus: "Datadog APM dashboards, security scans, and production deployment on AWS EKS.",
          tasks: ["Setup Datadog APM tracing across all Go microservices", "Execute OWASP security vulnerability scan", "Establish zero-downtime rolling deployment with ArgoCD", "Configure PagerDuty alerts for checkout error spikes"],
          risks: ["Third-party payment gateway latency spikes during peak events"]
        }
      ]
    },
    resumeImpact: {
      headline: "Senior Backend Systems Architect — High-Concurrency E-Commerce Infrastructure",
      bulletPoints: [
        "Architected a distributed e-commerce checkout engine in Go and PostgreSQL, successfully stress-tested to sustain 2,500 orders/sec with zero inventory overselling.",
        "Engineered a Redis-backed Redlock distributed reservation system with automatic TTL expiry, reducing cart lock contention by 65%.",
        "Configured an automated GitOps deployment pipeline using ArgoCD and AWS EKS, achieving 99.99% availability during peak promotional flash sales."
      ],
      skillsDemonstrated: ["Go (Golang)", "Distributed Systems & Redlock", "PostgreSQL Aurora", "Stripe Payment Architecture", "Kubernetes & GitOps"]
    }
  },

  realtime: {
    summary: {
      title: "Real-Time Collaborative Canvas & Multiplayer Whiteboard",
      tagline: "Sub-30ms state sync with CRDT conflict-free replication and Redis Pub/Sub",
      domain: "realtime",
      targetScale: "10K Concurrent WebSockets · 100K Active Rooms",
      estimatedMonthlyCost: "$95 - $220 / mo",
      description: "Ultra-low-latency real-time collaborative workspace supporting multi-user canvas drawing, presence cursors, CRDT-based offline-first conflict resolution (Yjs), and horizontal WebSocket scaling."
    },
    stack: {
      frontend: {
        name: "React 19 + HTML5 Canvas / Fabric.js + Yjs",
        reason: "High-performance 60 FPS vector rendering with client-side CRDT state management.",
        tradeoffs: "Canvas event hit-testing overhead; mitigated by spatial R-tree indexing."
      },
      backend: {
        name: "Node.js (Fastify / ws) + TypeScript",
        reason: "Event-loop concurrency ideal for thousands of simultaneous persistent WebSocket connections.",
        tradeoffs: "Single-thread CPU bottlenecks on heavy computation; mitigated by offloading to worker threads."
      },
      database: {
        name: "PostgreSQL 16 + Cloudflare R2 / S3 Snapshots",
        reason: "Relational metadata storage combined with compressed binary CRDT room snapshots.",
        tradeoffs: "Snapshot file I/O overhead; mitigated by debounced 30-second snapshotting."
      },
      caching: {
        name: "Redis Pub/Sub Cluster",
        reason: "Cross-server message routing backplane for horizontal multi-node WebSocket scaling.",
        tradeoffs: "Redis Pub/Sub is fire-and-forget; mitigated by in-memory room event buffer."
      },
      hosting: {
        name: "Fly.io / AWS ECS Edge Nodes + Cloudflare WebSockets",
        reason: "Close-to-user edge deployment for sub-30ms network round-trip time.",
        tradeoffs: "Multi-region database latency; mitigated with edge-to-origin connection pooling."
      },
      ci_cd: {
        name: "GitHub Actions + Docker Automated Health Checks",
        reason: "Zero-downtime rolling node replacement without disconnecting active WebSocket rooms.",
        tradeoffs: "Requires sticky sessions or WebSocket reconnect retry handlers."
      },
      observability: {
        name: "Prometheus + Grafana + Sentry WebSocket Tracing",
        reason: "Monitors active connection count, message latency percentiles, and room memory consumption.",
        tradeoffs: "High volume of metric data points; mitigated with 15-second scrape intervals."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 + Binary S3 Document Store",
      tables: [
        {
          name: "users",
          purpose: "Stores user profiles, display avatars, and workspace memberships.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "User ID", index: true },
            { name: "username", type: "VARCHAR(100)", constraints: "NOT NULL", description: "Display name", index: false },
            { name: "avatar_color", type: "VARCHAR(20)", constraints: "NOT NULL DEFAULT '#6366F1'", description: "Cursor color code", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Creation date", index: false }
          ],
          relationships: ["has_many workspaces", "has_many room_participants"]
        },
        {
          name: "workspaces",
          purpose: "Grouping container for multi-canvas projects and team access rights.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Workspace ID", index: true },
            { name: "owner_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)", description: "Owner ID", index: true },
            { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Workspace title", index: false }
          ],
          relationships: ["belongs_to users", "has_many rooms"]
        },
        {
          name: "rooms",
          purpose: "Individual collaborative canvas sessions with state metadata and active room flags.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Room ID", index: true },
            { name: "workspace_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES workspaces(id) ON DELETE CASCADE", description: "Workspace ID", index: true },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL DEFAULT 'Untitled Canvas'", description: "Room title", index: false },
            { name: "snapshot_storage_uri", type: "VARCHAR(1000)", constraints: "DEFAULT NULL", description: "S3 path to latest binary CRDT snapshot", index: false },
            { name: "last_modified_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Last state change", index: true }
          ],
          relationships: ["belongs_to workspaces", "has_many room_participants"]
        },
        {
          name: "room_participants",
          purpose: "Tracks active presence and permissions for connected clients.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Participant ID", index: true },
            { name: "room_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES rooms(id) ON DELETE CASCADE", description: "Room ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)", description: "User ID", index: true },
            { name: "role", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'editor'", description: "'owner' | 'editor' | 'viewer'", index: false },
            { name: "last_seen_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Heartbeat timestamp", index: true }
          ],
          relationships: ["belongs_to rooms", "belongs_to users"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  UserA([Collaborator A]) -->|WebSocket / WSS| WSEdge[Fly.io Edge Node]
  UserB([Collaborator B]) -->|WebSocket / WSS| WSEdge
  WSEdge -->|Local Room CRDT Sync| YjsServer[Yjs Node.js Server]
  YjsServer <-->|Cross-Node Broadcast| RedisBackplane[(Redis Pub/Sub Cluster)]
  YjsServer -->|Debounced Snapshots (30s)| S3[(Cloudflare R2 / S3 Object Storage)]
  YjsServer -->|User & Room Metadata| Postgres[(PostgreSQL 16)]
  YjsServer -->|Prometheus Metrics| Grafana[Grafana Dashboard]`,
      components: [
        { id: "canvas_ui", name: "React + Yjs Canvas", layer: "Client Presentation", description: "60 FPS vector canvas with client-side CRDT state, spatial indexing, and cursor sync" },
        { id: "ws_server", name: "Node.js WebSocket Cluster", layer: "Real-Time Gateway", description: "Scalable WebSocket servers handling connection lifecycle and delta updates" },
        { id: "redis_pubsub", name: "Redis Pub/Sub Backplane", layer: "Message Bus", description: "Inter-server event routing enabling multi-node horizontal scaling" },
        { id: "snapshot_store", name: "R2 / S3 Binary Snapshots", layer: "Persistence", description: "Compressed binary storage for full CRDT document state histories" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Canvas Engine & Local CRDT State",
          duration: "Weeks 1-2",
          focus: "Fabric.js canvas integration, Yjs document structure, and basic shape drawing.",
          tasks: ["Scaffold React 19 + TypeScript canvas UI", "Integrate Yjs CRDT binding with local undo/redo manager", "Build vector shape rendering (rectangles, arrows, freehand)", "Implement client-side viewport pan & zoom controls"],
          risks: ["Canvas re-render lag with > 5,000 vector elements"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: WebSocket Server & Live Collaboration",
          duration: "Weeks 3-4",
          focus: "Node.js WebSocket gateway, multi-user presence cursors, and room routing.",
          tasks: ["Build Fastify + ws WebSocket server with Y-WebSocket protocol", "Implement live cursor coordinate broadcast with 30ms throttling", "Create Redis Pub/Sub cluster for multi-instance message routing", "Add user authentication and room permission gates"],
          risks: ["WebSocket connection storms upon server restart"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Persistence & Binary Snapshotting",
          duration: "Weeks 5-6",
          focus: "Cloudflare R2 snapshot pipeline, room archiving, and export utilities.",
          tasks: ["Implement debounced binary CRDT state serialization to R2", "Build canvas image export (PNG / SVG / PDF)", "Implement room access control (Public, Password, Invite-only)", "Add automated inactive room memory garbage collection"],
          risks: ["Memory leak in long-lived active rooms"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: Edge Deployment & Stress Verification",
          duration: "Weeks 7-8",
          focus: "Multi-region edge deploy, Prometheus metrics, and automated stress testing.",
          tasks: ["Deploy WebSocket cluster to Fly.io edge nodes", "Execute Artillery stress tests simulating 10,000 concurrent sockets", "Setup Prometheus connection metrics and Grafana alerts", "Perform zero-downtime rolling update verification"],
          risks: ["Socket disconnection drops during edge network handoffs"]
        }
      ]
    },
    resumeImpact: {
      headline: "Lead Real-Time Systems Architect — Collaborative Multiplayer Canvas",
      bulletPoints: [
        "Architected an ultra-low-latency real-time collaborative workspace utilizing React 19, Yjs CRDTs, and Node.js WebSockets, sustaining sub-30ms synchronization latency across 10,000 active sockets.",
        "Engineered a Redis Pub/Sub cross-server message backplane and debounced binary snapshotting to Cloudflare R2, slashing persistent database write IOPS by 88%.",
        "Implemented client-side spatial R-tree indexing and coordinate broadcast throttling, ensuring smooth 60 FPS canvas rendering with 1,000+ simultaneous vector mutations."
      ],
      skillsDemonstrated: ["WebSockets & Yjs CRDTs", "Redis Pub/Sub Architecture", "Node.js Concurrency", "Real-Time State Synchronization", "Canvas Performance Tuning"]
    }
  },

  saas: {
    summary: {
      title: "B2B Multi-Tenant Enterprise SaaS Platform",
      tagline: "Enterprise-grade SaaS with Row-Level Security, RBAC, and background jobs",
      domain: "saas",
      targetScale: "10K Organizations · 500K Active Seats",
      estimatedMonthlyCost: "$140 - $350 / mo",
      description: "Robust enterprise SaaS architecture featuring multi-tenant database isolation via PostgreSQL Row-Level Security (RLS), fine-grained Role-Based Access Control (RBAC), asynchronous BullMQ worker queues, and SOC2-ready audit logging."
    },
    stack: {
      frontend: {
        name: "React 19 + Vite + Tailwind CSS + TanStack Query",
        reason: "Fast client-side caching, optimistic mutations, and responsive dashboard UI.",
        tradeoffs: "Initial bundle size; mitigated by code-splitting routes with React.lazy()."
      },
      backend: {
        name: "Node.js (NestJS) + TypeScript + Prisma / Drizzle",
        reason: "Structured enterprise architecture with dependency injection and strong typing.",
        tradeoffs: "Slight framework overhead; mitigated by modular architecture."
      },
      database: {
        name: "PostgreSQL 16 with Row-Level Security (RLS)",
        reason: "Guaranteed data isolation between customer tenants at the database engine layer.",
        tradeoffs: "RLS policy execution overhead; mitigated with compound tenant indexes."
      },
      caching: {
        name: "Redis (BullMQ) + Key-Value Cache",
        reason: "Background job processing for email dispatch, webhook triggers, and CSV exports.",
        tradeoffs: "Requires dedicated worker processes for queue draining."
      },
      hosting: {
        name: "AWS App Runner / Docker on ECS + AWS RDS",
        reason: "Fully managed container execution with auto-scaling and zero server management.",
        tradeoffs: "Slight scaling delay during sudden traffic spikes."
      },
      ci_cd: {
        name: "GitHub Actions + Playwright E2E Test Suite",
        reason: "Automated regression testing, database migrations, and seamless production deployments.",
        tradeoffs: "Playwright test run time; mitigated by parallelizing test shards."
      },
      observability: {
        name: "Sentry + PostHog + OpenTelemetry",
        reason: "Full error reporting, user session replays, and backend trace latency profiling.",
        tradeoffs: "Client-side telemetry script size; mitigated by lazy-loading PostHog."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 with Row-Level Security",
      tables: [
        {
          name: "organizations",
          purpose: "Primary tenant boundary storing company profiles, subscription status, and settings.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Tenant ID", index: true },
            { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Organization name", index: false },
            { name: "slug", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL", description: "Subdomain slug", index: true },
            { name: "plan_tier", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'starter'", description: "Subscription tier", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Signup date", index: false }
          ],
          relationships: ["has_many memberships", "has_many projects", "has_many audit_logs"]
        },
        {
          name: "users",
          purpose: "Global user identity accounts that can belong to multiple organizations.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "User ID", index: true },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Login email", index: true },
            { name: "full_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "User display name", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Registration timestamp", index: false }
          ],
          relationships: ["has_many memberships", "has_many audit_logs"]
        },
        {
          name: "memberships",
          purpose: "Join table mapping users to organizations with specific RBAC roles.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Membership ID", index: true },
            { name: "org_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE", description: "User ID", index: true },
            { name: "role", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'member'", description: "'owner' | 'admin' | 'member' | 'viewer'", index: true }
          ],
          relationships: ["belongs_to organizations", "belongs_to users"]
        },
        {
          name: "projects",
          purpose: "Tenant-isolated business resources protected by PostgreSQL Row-Level Security.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Project ID", index: true },
            { name: "org_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant ID (RLS Key)", index: true },
            { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Project name", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'active'", description: "Workflow state", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Creation date", index: false }
          ],
          relationships: ["belongs_to organizations"]
        },
        {
          name: "audit_logs",
          purpose: "Immutable compliance log recording all sensitive security and mutation actions.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Audit ID", index: true },
            { name: "org_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES organizations(id) ON DELETE CASCADE", description: "Tenant ID", index: true },
            { name: "actor_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id)", description: "Performing user", index: true },
            { name: "action", type: "VARCHAR(100)", constraints: "NOT NULL", description: "e.g. 'user.invite', 'project.delete'", index: true },
            { name: "ip_address", type: "VARCHAR(45)", constraints: "NOT NULL", description: "Client IP", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Action timestamp", index: true }
          ],
          relationships: ["belongs_to organizations", "belongs_to users"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  User([B2B Customer]) -->|HTTPS / OAuth2| Cloudflare[Cloudflare CDN & WAF]
  Cloudflare -->|Vite SPA| Frontend[React 19 Dashboard]
  Frontend -->|REST / GraphQL| NestAPI[NestJS API Gateway]
  NestAPI -->|Set Tenant Context| Postgres[(PostgreSQL with RLS)]
  NestAPI -->|Enqueue Jobs| BullMQ[(Redis BullMQ Queue)]
  BullMQ -->|Process Emails & Webhooks| WorkerPool[Async Worker Pool]
  WorkerPool -->|Transactional Emails| Resend[Resend / SendGrid]
  WorkerPool -->|Customer Webhooks| ExternalEndpoints[Customer Webhook URLs]
  NestAPI -->|Audit Events| AuditStore[(Audit Logs Archive)]`,
      components: [
        { id: "frontend_app", name: "React 19 Dashboard", layer: "Presentation", description: "Role-aware administrative dashboard with TanStack Query caching" },
        { id: "api_gateway", name: "NestJS API Gateway", layer: "Application", description: "Modular TypeScript backend handling auth, RBAC permissions, and business logic" },
        { id: "rls_db", name: "Postgres RLS Database", layer: "Persistence", description: "Multi-tenant relational database with strict engine-enforced Row-Level Security" },
        { id: "queue", name: "Redis BullMQ Workers", layer: "Background Processing", description: "Reliable asynchronous queue for webhook delivery, exports, and email dispatch" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Multi-Tenant Schema & Auth Scaffolding",
          duration: "Weeks 1-2",
          focus: "Postgres RLS policies, NestJS project structure, and OAuth2 / Magic Link auth.",
          tasks: ["Implement PostgreSQL Row-Level Security policies per organization", "Scaffold NestJS API with Prisma ORM", "Build JWT authentication with tenant context middleware", "Create React dashboard login & team invite flow"],
          risks: ["RLS query performance on complex deep joins"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: RBAC Permissions & Core Workflows",
          duration: "Weeks 3-4",
          focus: "Granular roles (Owner, Admin, Member), CRUD APIs, and audit logging.",
          tasks: ["Implement NestJS RBAC Guards & Decorators", "Build full CRUD resource management for projects", "Create immutable audit log interceptor", "Write automated unit and integration tests"],
          risks: ["Over-permissioning bugs allowing cross-tenant data access"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Background Worker Queues & Billing",
          duration: "Weeks 5-6",
          focus: "Redis BullMQ queues, Stripe customer portal, and webhook dispatch.",
          tasks: ["Integrate Stripe Billing subscription checkout & webhooks", "Build BullMQ worker for asynchronous customer webhooks with retries", "Implement transactional email notifications", "Create CSV export background generator"],
          risks: ["Worker queue backlog during mass email campaigns"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: SOC2 Hardening, Playwright E2E & Launch",
          duration: "Weeks 7-8",
          focus: "Security audit compliance, automated Playwright E2E tests, and cloud deploy.",
          tasks: ["Write comprehensive Playwright multi-tenant test suite", "Configure Sentry error tracking and PostHog product analytics", "Deploy to AWS App Runner with autoscaling rules", "Conduct vulnerability penetration testing"],
          risks: ["Third-party API rate limits on outbound customer webhooks"]
        }
      ]
    },
    resumeImpact: {
      headline: "Senior Software Architect — B2B Multi-Tenant Enterprise SaaS",
      bulletPoints: [
        "Architected an enterprise B2B SaaS platform using React 19, NestJS, and PostgreSQL with Row-Level Security (RLS), enforcing zero-leakage multi-tenant data isolation across 10,000 organizations.",
        "Engineered an asynchronous BullMQ queue system processing 250,000 daily webhook deliveries with exponential backoff and automated dead-letter queues.",
        "Implemented SOC2-ready immutable audit logging and granular RBAC authorization, reducing enterprise security onboarding review cycles by 70%."
      ],
      skillsDemonstrated: ["PostgreSQL Row-Level Security (RLS)", "NestJS Enterprise Architecture", "BullMQ & Redis Queues", "Multi-Tenant System Design", "SOC2 Compliance Engineering"]
    }
  },

  fintech: {
    summary: {
      title: "FinTech Transactional Ledger & Payment Hub",
      tagline: "Immutable double-entry bookkeeping with strict ACID guarantees and KMS signing",
      domain: "fintech",
      targetScale: "100K Daily Transactions · Sub-50ms Settlement Check",
      estimatedMonthlyCost: "$220 - $550 / mo",
      description: "Mission-critical financial ledger platform featuring immutable append-only double-entry bookkeeping, cryptographic transaction signing with AWS KMS, automated fraud velocity checks, and PCI-DSS compliance."
    },
    stack: {
      frontend: {
        name: "React 19 + TypeScript + Tailwind CSS",
        reason: "Strictly typed financial dashboards with real-time balance updates and audit views.",
        tradeoffs: "Requires strict state immutability to prevent balance display desync."
      },
      backend: {
        name: "Go (Golang) + gRPC + Temporal Workflows",
        reason: "Deterministic financial saga execution with built-in retries and state rollbacks.",
        tradeoffs: "Temporal orchestration server operational overhead."
      },
      database: {
        name: "PostgreSQL 16 (Bitemporal Append-Only Schema)",
        reason: "Immutable credit/debit records ensuring zero-drift balance calculations.",
        tradeoffs: "Table growth requires periodic partition archiving."
      },
      caching: {
        name: "Redis Cluster (In-Memory Idempotency Keys)",
        reason: "Prevents double-charging by caching idempotency tokens with 24-hour TTL.",
        tradeoffs: "Redis memory sizing for high transaction volumes."
      },
      hosting: {
        name: "AWS EKS with Hardware Security Module (AWS KMS / HSM)",
        reason: "Compliant container orchestration and tamper-proof cryptographic key management.",
        tradeoffs: "AWS KMS per-request API pricing; mitigated with envelope encryption."
      },
      ci_cd: {
        name: "GitLab CI / GitHub Actions + Strict Security Scanners",
        reason: "Automated vulnerability scanning (Trivy, SonarQube) and strict pull request sign-offs.",
        tradeoffs: "Longer pipeline run durations for exhaustive security checks."
      },
      observability: {
        name: "OpenTelemetry + AWS CloudWatch + PagerDuty",
        reason: "Real-time ledger balance integrity alerts and payment gateway error rate alarms.",
        tradeoffs: "CloudWatch high-resolution metric storage costs."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 with Append-Only Constraints",
      tables: [
        {
          name: "accounts",
          purpose: "Financial accounts (User wallets, merchant balances, settlement reserves).",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Account ID", index: true },
            { name: "owner_id", type: "UUID", constraints: "NOT NULL", description: "Account owner ID", index: true },
            { name: "currency", type: "VARCHAR(3)", constraints: "NOT NULL DEFAULT 'USD'", description: "ISO currency code", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'active'", description: "'active' | 'frozen' | 'closed'", index: true }
          ],
          relationships: ["has_many ledger_entries"]
        },
        {
          name: "transactions",
          purpose: "High-level transfer records grouping balanced credit and debit ledger entries.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Transaction ID", index: true },
            { name: "idempotency_key", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Client idempotency key", index: true },
            { name: "amount_cents", type: "BIGINT", constraints: "NOT NULL CHECK (amount_cents > 0)", description: "Transfer amount", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'pending'", description: "'pending' | 'posted' | 'voided'", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Transaction timestamp", index: true }
          ],
          relationships: ["has_many ledger_entries"]
        },
        {
          name: "ledger_entries",
          purpose: "Immutable double-entry balance records. Sum of debits and credits MUST equal zero.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Entry ID", index: true },
            { name: "transaction_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES transactions(id)", description: "Parent transaction", index: true },
            { name: "account_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES accounts(id)", description: "Affected account", index: true },
            { name: "entry_type", type: "VARCHAR(10)", constraints: "NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT'))", description: "Entry direction", index: false },
            { name: "amount_cents", type: "BIGINT", constraints: "NOT NULL CHECK (amount_cents > 0)", description: "Entry amount", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Immutable entry time", index: true }
          ],
          relationships: ["belongs_to transactions", "belongs_to accounts"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  Client([Banking Client / API]) -->|mTLS HTTPS| APIGateway[Kong API Gateway]
  APIGateway -->|Idempotency Check| RedisIdemp[(Redis Idempotency Cache)]
  APIGateway -->|Initiate Transfer| Temporal[Temporal Saga Orchestrator]
  Temporal -->|Execute Double-Entry| LedgerSvc[Go Ledger Microservice]
  LedgerSvc -->|Cryptographic Signing| AWSKMS[AWS KMS HSM]
  LedgerSvc -->|Atomic Append| PostgresLedger[(PostgreSQL Double-Entry DB)]
  Temporal -->|Disburse Funds| BankConnector[Banking / Stripe Gateway]
  LedgerSvc -->|Publish Audit Log| AuditStore[(WORM Compliant S3 Archive)]`,
      components: [
        { id: "gateway", name: "Kong mTLS Gateway", layer: "Security Gateway", description: "Mutual TLS authentication and rate limiting for banking integrations" },
        { id: "saga", name: "Temporal Workflow Orchestrator", layer: "Orchestration", description: "Distributed financial sagas ensuring zero-drift transactional rollbacks" },
        { id: "ledger", name: "Go Ledger Service", layer: "Core Banking", description: "Atomic double-entry balance computation and cryptographic ledger verification" },
        { id: "database", name: "PostgreSQL Ledger DB", layer: "Persistence", description: "Append-only relational ledger with balance check constraints" }
      ]
    },
    roadmap: {
      totalDuration: "8 - 10 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Double-Entry Ledger Core",
          duration: "Weeks 1-2",
          focus: "Append-only database schema, check constraints, and balance validation.",
          tasks: ["Design immutable double-entry database schema", "Build Go ledger service with atomic transaction posting", "Implement idempotency key validation with Redis", "Write mathematical balance invariant tests"],
          risks: ["Rounding errors on multi-currency decimal operations"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Temporal Sagas & Banking Connectors",
          duration: "Weeks 3-4",
          focus: "Distributed saga orchestration, external payment rails, and rollback handlers.",
          tasks: ["Implement Temporal workflows for multi-step bank payouts", "Integrate external banking/Stripe ACH payment rails", "Build automated compensation rollback workflows", "Setup AWS KMS cryptographic transaction payload signing"],
          risks: ["Third-party banking API timeouts causing dangling transfer states"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Fraud Prevention & Velocity Checks",
          duration: "Weeks 5-6",
          focus: "Real-time velocity limits, anomaly detection, and AML screening.",
          tasks: ["Implement sliding-window velocity limit checks in Redis", "Build automated transaction freeze on abnormal volume bursts", "Create compliance audit dashboard for operational staff", "Setup WORM (Write Once Read Many) S3 audit archival"],
          risks: ["False-positive transaction freezes degrading user trust"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: PCI-DSS Audit & Production Rollout",
          duration: "Weeks 7-8",
          focus: "Security certification, penetration testing, and AWS EKS deployment.",
          tasks: ["Conduct independent penetration and compliance security audits", "Configure AWS CloudWatch real-time balance integrity monitors", "Deploy to AWS EKS with dedicated VPC and private subnets", "Perform chaos engineering tests simulating database failovers"],
          risks: ["Database read-replica replication lag on balance queries"]
        }
      ]
    },
    resumeImpact: {
      headline: "Principal Systems Architect — Distributed Financial Ledger & Banking Hub",
      bulletPoints: [
        "Architected an immutable double-entry financial ledger platform in Go and PostgreSQL, guaranteeing strict zero-drift balance consistency across 100K+ daily transactions.",
        "Engineered a distributed saga orchestration pipeline with Temporal and AWS KMS cryptographic signing, achieving 100% automated failure recovery and idempotent execution.",
        "Implemented real-time Redis velocity limiters and automated WORM audit archival, securing full PCI-DSS and SOC2 Type II regulatory compliance readiness."
      ],
      skillsDemonstrated: ["Double-Entry Accounting Systems", "Go & Temporal Distributed Sagas", "AWS KMS Cryptography", "Financial Idempotency", "PCI-DSS Compliance"]
    }
  },

  streaming: {
    summary: {
      title: "Global Video & Media Streaming Network",
      tagline: "Adaptive bitrate HLS media processing with edge CDN caching",
      domain: "streaming",
      targetScale: "50K Concurrent Streams · Sub-1s Playback Start Time",
      estimatedMonthlyCost: "$250 - $650 / mo",
      description: "High-capacity video streaming infrastructure featuring distributed FFmpeg transcoding workers, Adaptive Bitrate (ABR) HLS packaging, CloudFront edge caching with signed URLs, and real-time playback analytics."
    },
    stack: {
      frontend: {
        name: "Next.js 15 + Video.js / Hls.js + Tailwind CSS",
        reason: "Adaptive Bitrate video player with custom video controls and DRM token handling.",
        tradeoffs: "Browser codec compatibility variances; mitigated with standard H.264/AAC fallbacks."
      },
      backend: {
        name: "Go (Golang) Transcoding Orchestrator + Python Workers",
        reason: "High-throughput upload ingestion and efficient FFmpeg subprocess management.",
        tradeoffs: "FFmpeg CPU consumption during peak upload batches."
      },
      database: {
        name: "PostgreSQL 16 + MongoDB (Metadata & Analytics)",
        reason: "Relational user permissions paired with flexible JSON metadata for video tags.",
        tradeoffs: "Dual database synchronization; mitigated with change data capture (CDC)."
      },
      caching: {
        name: "CloudFront Edge Locations + Redis Cluster",
        reason: "Global CDN video segment caching ensuring 95%+ cache hit ratio and low latency.",
        tradeoffs: "CDN egress costs on viral videos; mitigated by aggressive segment caching headers."
      },
      hosting: {
        name: "AWS S3 + Elemental MediaConvert / GPU Transcoding Nodes",
        reason: "Scalable object storage paired with hardware-accelerated video transcode jobs.",
        tradeoffs: "Storage costs on multiple video resolutions (1080p, 720p, 480p, 360p)."
      },
      ci_cd: {
        name: "GitHub Actions + Docker GPU Containers",
        reason: "Automated transcode test pipelines and zero-downtime frontend deployments.",
        tradeoffs: "GPU container build times on CI runners."
      },
      observability: {
        name: "Datadog Video APM + Mux Data / OpenTelemetry",
        reason: "Monitors video startup time (TTFB), rebuffer rates, and playback error spikes.",
        tradeoffs: "Analytics tracking bandwidth overhead on mobile clients."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 + MongoDB Metadata Store",
      tables: [
        {
          name: "media_assets",
          purpose: "Catalog of uploaded video content, master S3 locations, and processing status.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Asset ID", index: true },
            { name: "uploader_id", type: "UUID", constraints: "NOT NULL", description: "Owner ID", index: true },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Video title", index: false },
            { name: "duration_seconds", type: "INTEGER", constraints: "DEFAULT 0", description: "Length of video", index: false },
            { name: "hls_playlist_url", type: "VARCHAR(1000)", constraints: "DEFAULT NULL", description: "Master .m3u8 CDN link", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'processing'", description: "'uploading' | 'processing' | 'ready' | 'failed'", index: true }
          ],
          relationships: ["has_many transcode_jobs", "has_many playback_tokens"]
        },
        {
          name: "transcode_jobs",
          purpose: "Tracks asynchronous multi-bitrate transcode tasks and output resolutions.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Job ID", index: true },
            { name: "asset_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES media_assets(id) ON DELETE CASCADE", description: "Asset ID", index: true },
            { name: "resolution", type: "VARCHAR(20)", constraints: "NOT NULL", description: "'1080p' | '720p' | '480p' | '360p'", index: false },
            { name: "progress_percent", type: "INTEGER", constraints: "DEFAULT 0", description: "Encoding progress", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'queued'", description: "Job status", index: true }
          ],
          relationships: ["belongs_to media_assets"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  Viewer([Viewer Client]) -->|HTTPS / HLS| CloudFront[AWS CloudFront Edge CDN]
  CloudFront -->|Fetch Segments (.ts / .m4s)| S3HLS[(S3 HLS Segment Storage)]
  Creator([Content Creator]) -->|TUS Resumable Upload| IngestSvc[Go Ingest Service]
  IngestSvc -->|Raw Video (.mp4)| S3Raw[(S3 Raw Storage Lake)]
  S3Raw -->|S3 Event Trigger| SQSQueue[AWS SQS Transcode Queue]
  SQSQueue -->|Draining Jobs| WorkerPool[FFmpeg Transcoding Workers]
  WorkerPool -->|Write HLS Playlists| S3HLS
  WorkerPool -->|Update Status| PostgresDB[(PostgreSQL Database)]
  Viewer -->|Request Playback Token| AuthAPI[Playback Auth API]`,
      components: [
        { id: "cdn", name: "AWS CloudFront Edge", layer: "Content Delivery", description: "Global CDN caching video chunks and media playlists close to viewers" },
        { id: "ingest", name: "Resumable Ingest Service", layer: "Ingestion", description: "TUS protocol server supporting paused and resumed large video uploads" },
        { id: "transcoder", name: "FFmpeg Transcode Worker Pool", layer: "Media Processing", description: "Asynchronous worker nodes converting raw video into adaptive HLS bitrates" },
        { id: "segment_storage", name: "S3 HLS Storage Lake", layer: "Persistence", description: "Organized object storage containing master playlists and segmented chunk files" }
      ]
    },
    roadmap: {
      totalDuration: "8 - 10 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Ingestion Pipeline & Raw Storage",
          duration: "Weeks 1-2",
          focus: "TUS resumable upload protocol, S3 bucket lifecycle rules, and database schema.",
          tasks: ["Build Go resumable upload service with TUS protocol", "Configure S3 bucket lifecycle and upload bucket policies", "Scaffold Next.js creator upload portal", "Write metadata database migration scripts"],
          risks: ["Upload failures on flaky mobile network connections"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: FFmpeg Adaptive Transcoding Worker Pool",
          duration: "Weeks 3-4",
          focus: "Multi-bitrate HLS segmentation, SQS job queue, and GPU worker nodes.",
          tasks: ["Build FFmpeg worker generating 1080p/720p/480p/360p HLS segments", "Implement SQS queue with dead-letter queue for failed encodings", "Generate master .m3u8 playlist manifests automatically", "Implement video thumbnail sprite sheet generation"],
          risks: ["Transcode bottleneck during high-volume creator uploads"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: CDN Caching & Signed URLs",
          duration: "Weeks 5-6",
          focus: "CloudFront edge caching, signed URL playback tokens, and video player UI.",
          tasks: ["Configure CloudFront CDN cache policies for .m3u8 and .ts files", "Implement HMAC signed URL playback authorization", "Build responsive Next.js video player with Video.js / Hls.js", "Add dynamic quality selector and playback speed controls"],
          risks: ["CDN cache misses causing origin S3 request spikes"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: QoS Telemetry, Stress Tests & Launch",
          duration: "Weeks 7-8",
          focus: "Playback quality telemetry, load testing (50K streams), and launch.",
          tasks: ["Implement real-time buffer health and TTFB telemetry", "Execute distributed load testing verifying 50K concurrent streams", "Configure CloudWatch alerts for transcoding queue latency", "Deploy to production with automated horizontal autoscaling"],
          risks: ["Sudden bandwidth billing spikes during viral stream events"]
        }
      ]
    },
    resumeImpact: {
      headline: "Principal Media Infrastructure Architect — Global Video Streaming Platform",
      bulletPoints: [
        "Architected an end-to-end video streaming and ingestion platform using Go, FFmpeg, and AWS CloudFront, supporting 50,000 concurrent viewers with sub-1s initial playback start times.",
        "Engineered an automated Adaptive Bitrate (ABR) transcoding pipeline on AWS SQS and GPU worker nodes, reducing origin bandwidth consumption by 74% via multi-resolution HLS optimization.",
        "Implemented HMAC-signed playback tokens and CloudFront edge caching rules, achieving a 96.2% CDN cache hit ratio across global viewer traffic."
      ],
      skillsDemonstrated: ["HLS Video Streaming & FFmpeg", "AWS CloudFront & S3 Architecture", "Distributed Queue Processing (SQS)", "Go High-Throughput Ingestion", "Quality-of-Service Telemetry"]
    }
  },

  iot: {
    summary: {
      title: "Event-Driven IoT Telemetry & Analytics Hub",
      tagline: "High-frequency time-series telemetry ingestion with TimescaleDB and Kafka",
      domain: "iot",
      targetScale: "50K Devices · 100K Ingested Metrics / Sec",
      estimatedMonthlyCost: "$150 - $380 / mo",
      description: "Scalable event-driven IoT architecture supporting MQTT device heartbeats, high-throughput Kafka streaming ingestion, TimescaleDB time-series hypertables, and sub-second rule-based anomaly alerting."
    },
    stack: {
      frontend: {
        name: "React 19 + D3.js / Chart.js + Tailwind CSS",
        reason: "Real-time telemetry line charts and interactive device fleet map visualizer.",
        tradeoffs: "Browser rendering limits on 100K+ data points; mitigated by server-side bucketing."
      },
      backend: {
        name: "Rust / Go Ingestion Gateway + Python Alerting Engine",
        reason: "Zero-allocation ultra-fast MQTT packet decoding and efficient memory usage.",
        tradeoffs: "Rust development time; mitigated by clean protocol libraries."
      },
      database: {
        name: "TimescaleDB (PostgreSQL 16 Hypertables) + ClickHouse",
        reason: "Automatic time-based chunk partitioning and 10x compression on historical metrics.",
        tradeoffs: "Write volume limits; mitigated by batching inserts in 1-second micro-batches."
      },
      caching: {
        name: "Apache Kafka / Redpanda + Redis Fleet State Cache",
        reason: "Durable event bus buffering peak telemetry bursts and real-time device status cache.",
        tradeoffs: "Kafka cluster operational overhead; mitigated by using managed Redpanda."
      },
      hosting: {
        name: "AWS EKS (Kubernetes) + EMQX Distributed MQTT Broker",
        reason: "Clustered MQTT broker handling hundreds of thousands of persistent device sockets.",
        tradeoffs: "Clustering network complexity; mitigated with automated Helm charts."
      },
      ci_cd: {
        name: "GitHub Actions + Embedded Device Firmware Test Simulator",
        reason: "Continuous integration with mock virtual hardware packet generators.",
        tradeoffs: "Simulation fidelity compared to physical hardware."
      },
      observability: {
        name: "Prometheus + Grafana + Vector Logging",
        reason: "Telemetry throughput monitoring, lag alerts on Kafka consumer groups, and drop metrics.",
        tradeoffs: "High-volume scrape metrics; mitigated by downsampling older telemetry."
      }
    },
    schema: {
      databaseType: "TimescaleDB (PostgreSQL 16 Hypertables)",
      tables: [
        {
          name: "devices",
          purpose: "Master registry of provisioned hardware devices, firmware versions, and auth keys.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Device ID", index: true },
            { name: "device_eui", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "Hardware unique MAC/EUI", index: true },
            { name: "firmware_version", type: "VARCHAR(50)", constraints: "NOT NULL", description: "Current firmware build", index: false },
            { name: "status", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'offline'", description: "'online' | 'offline' | 'error'", index: true }
          ],
          relationships: ["has_many device_telemetry_metrics", "has_many alert_logs"]
        },
        {
          name: "device_telemetry_metrics",
          purpose: "Time-series hypertable storing temperature, vibration, voltage, and battery telemetry.",
          columns: [
            { name: "recorded_at", type: "TIMESTAMPTZ", constraints: "NOT NULL", description: "Sensor timestamp (Partition Key)", index: true },
            { name: "device_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES devices(id)", description: "Originating device", index: true },
            { name: "metric_name", type: "VARCHAR(50)", constraints: "NOT NULL", description: "'temp_c' | 'vibration_g' | 'battery_pct'", index: true },
            { name: "metric_value", type: "DOUBLE PRECISION", constraints: "NOT NULL", description: "Measured sensor reading", index: false }
          ],
          relationships: ["belongs_to devices"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  IoTDevices([50K Hardware Sensors]) -->|MQTT / TLS 1.3| MQTTBroker[EMQX Clustered MQTT Broker]
  MQTTBroker -->|Stream Packets| Kafka[Apache Kafka / Redpanda]
  Kafka -->|Batch Micro-Inserts| IngestWorker[Go / Rust Ingestion Worker]
  IngestWorker -->|Time-Series Partitioning| TimescaleDB[(TimescaleDB Hypertables)]
  Kafka -->|Real-Time Rule Evaluation| AlertEngine[Python Anomaly Alert Engine]
  AlertEngine -->|Trigger SMS / Webhook| PagerDuty[PagerDuty / Twilio]
  TimescaleDB -->|Time-Bucket Aggregates| DashboardAPI[FastAPI Reporting Service]
  DashboardAPI -->|Live Telemetry WebSockets| WebUI[React 19 IoT Dashboard]`,
      components: [
        { id: "mqtt", name: "EMQX MQTT Broker", layer: "Device Gateway", description: "Lightweight, highly scalable MQTT message broker managing device heartbeats" },
        { id: "event_bus", name: "Apache Kafka Event Bus", layer: "Message Ingestion", description: "High-throughput distributed log decoupling device ingest from persistent storage" },
        { id: "timeseries_db", name: "TimescaleDB Hypertables", layer: "Persistence", description: "PostgreSQL-powered time-series database with automatic compression & rollups" },
        { id: "alert_engine", name: "Anomaly Alert Engine", layer: "Stream Analytics", description: "Sub-second threshold evaluator detecting sensor spikes and safety anomalies" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: MQTT Gateway & Telemetry Ingest",
          duration: "Weeks 1-2",
          focus: "EMQX MQTT broker cluster, Kafka message pipeline, and TimescaleDB hypertable setup.",
          tasks: ["Deploy clustered EMQX broker with mutual TLS device authentication", "Configure Redpanda/Kafka broker topics with partitioning", "Setup TimescaleDB hypertables with 7-day chunk intervals", "Build Go micro-batching consumer worker"],
          risks: ["Database connection exhaustion from unbatched writes"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Anomaly Detection & Live Dashboard",
          duration: "Weeks 3-4",
          focus: "Real-time alerting rules, WebSocket telemetry stream, and React dashboard.",
          tasks: ["Build stream evaluator detecting sensor threshold violations", "Implement live WebSocket telemetry dispatch for active web operators", "Build interactive D3.js time-series charts with downsampling", "Implement Twilio / SendGrid alert integration"],
          risks: ["Alert fatigue caused by noisy sensor readings"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Rollup Aggregations & Data Compression",
          duration: "Weeks 5-6",
          focus: "TimescaleDB continuous aggregates, 10x columnar compression, and fleet management.",
          tasks: ["Configure automated continuous aggregates for 1-hour and 1-day rollups", "Enable TimescaleDB columnar compression on data older than 14 days", "Build device firmware OTA staging and deployment manager", "Implement fleet geographic map clustering"],
          risks: ["High CPU usage during compression policy execution"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: Hardware Simulation & Scale Verification",
          duration: "Weeks 7-8",
          focus: "Simulating 50K devices with load generators, Prometheus alerts, and launch.",
          tasks: ["Execute Locust simulation testing 100K metrics/sec peak ingest", "Configure Prometheus lag monitors on Kafka consumer groups", "Deploy to AWS EKS with autoscaling worker pods", "Perform disaster recovery failover drill"],
          risks: ["Network saturation on cloud load balancers under raw packet storms"]
        }
      ]
    },
    resumeImpact: {
      headline: "Principal IoT Infrastructure Architect — High-Frequency Telemetry Pipeline",
      bulletPoints: [
        "Architected an event-driven IoT ingestion pipeline using EMQX, Apache Kafka, and TimescaleDB, processing 100,000 metrics/sec across 50,000 connected hardware devices.",
        "Engineered automated TimescaleDB continuous rollups and columnar compression policies, achieving an 11.4x storage reduction on multi-terabyte time-series data.",
        "Implemented a sub-second stream anomaly detection engine with real-time alerting, reducing critical hardware failure incident response times by 85%."
      ],
      skillsDemonstrated: ["TimescaleDB & Time-Series Design", "Apache Kafka & Redpanda", "MQTT & Embedded Protocol Ingestion", "Go Concurrency", "Prometheus & Grafana Alerting"]
    }
  },

  mobile: {
    summary: {
      title: "Mobile-First PWA with Offline-First Local Sync",
      tagline: "Offline-first IndexedDB architecture with bidirectional delta synchronization",
      domain: "mobile",
      targetScale: "100K Mobile Installs · Zero Data Loss Offline Sync",
      estimatedMonthlyCost: "$75 - $180 / mo",
      description: "Offline-first mobile application architecture featuring client-side IndexedDB persistence (RxDB / SQLite), background service worker caching, optimistic UI updates, and conflict-resolved delta sync with PostgreSQL."
    },
    stack: {
      frontend: {
        name: "React 19 (PWA) / React Native + RxDB (IndexedDB)",
        reason: "Offline-first local reactive database with instant UI updates and background synchronization.",
        tradeoffs: "IndexedDB storage quotas on iOS WebKit; mitigated with compact JSON schemas."
      },
      backend: {
        name: "Node.js (Fastify) + TypeScript",
        reason: "Lightweight JSON delta synchronization endpoints with low latency and low CPU overhead.",
        tradeoffs: "Requires custom conflict resolution logic (Last-Write-Wins / CRDTs)."
      },
      database: {
        name: "PostgreSQL 16 + SQLite (Local Mobile Replica)",
        reason: "ACID cloud master database coupled with embedded SQLite/IndexedDB on client devices.",
        tradeoffs: "Delta sync pagination overhead; mitigated with sequence revision checkpoints."
      },
      caching: {
        name: "Service Worker Cache API + Redis Sync Checkpoints",
        reason: "Instant sub-second application launch from local cache even without internet connectivity.",
        tradeoffs: "Service worker cache staleness; mitigated with automated update notification prompts."
      },
      hosting: {
        name: "Fly.io / AWS ECS + Cloudflare Pages CDN",
        reason: "Global static frontend hosting with edge API nodes for fast mobile sync roundtrips.",
        tradeoffs: "Distributed data consistency across intermittent client connections."
      },
      ci_cd: {
        name: "GitHub Actions + Lighthouse PWA Automated Audits",
        reason: "Enforces 100/100 PWA score, offline asset bundle checks, and automated API testing.",
        tradeoffs: "Testing offline states requires headless browser network throttling scripts."
      },
      observability: {
        name: "Sentry Mobile + PostHog Analytics",
        reason: "Captures offline client error queues and sync conflict statistics upon reconnection.",
        tradeoffs: "Batched offline telemetry queues must not overwhelm network upon reconnection."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 (Cloud) + SQLite / IndexedDB (Local)",
      tables: [
        {
          name: "users",
          purpose: "User identity, authentication tokens, and mobile push registration IDs.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "User ID", index: true },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Account email", index: true },
            { name: "push_token", type: "VARCHAR(500)", constraints: "DEFAULT NULL", description: "Expo / FCM push token", index: false }
          ],
          relationships: ["has_many sync_entities"]
        },
        {
          name: "sync_entities",
          purpose: "Master entity table tracking revisions, soft deletes, and client mutation hashes.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Entity ID", index: true },
            { name: "user_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE", description: "Owner ID", index: true },
            { name: "entity_type", type: "VARCHAR(50)", constraints: "NOT NULL", description: "'note' | 'task' | 'document'", index: true },
            { name: "data_payload", type: "JSONB", constraints: "NOT NULL", description: "Entity content payload", index: false },
            { name: "revision_number", type: "BIGINT", constraints: "NOT NULL DEFAULT 1", description: "Monotonic revision version", index: true },
            { name: "is_deleted", type: "BOOLEAN", constraints: "NOT NULL DEFAULT FALSE", description: "Soft delete tombstone flag", index: true },
            { name: "updated_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Server update time", index: true }
          ],
          relationships: ["belongs_to users"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  MobileUser([Mobile Device / PWA]) -->|Reads / Writes Locally| LocalDB[(Local IndexedDB / SQLite)]
  MobileUser -->|Offline Assets| ServiceWorker[Service Worker Cache]
  LocalDB -->|Network Available| SyncManager[Client Sync Engine]
  SyncManager -->|POST /sync/deltas| FastifyAPI[Fastify Cloud API]
  FastifyAPI -->|Check Revision Checkpoints| PostgresDB[(PostgreSQL Cloud Database)]
  FastifyAPI -->|Resolve Conflicts (LWW / CRDT)| ConflictResolver[Conflict Resolution Logic]
  FastifyAPI -->|Store Push Notifications| FCM[Firebase Cloud Messaging (FCM)]`,
      components: [
        { id: "local_storage", name: "IndexedDB / SQLite Engine", layer: "Local Client", description: "Full local database providing instant zero-latency UI reads and optimistic writes" },
        { id: "sync_engine", name: "Bidirectional Sync Client", layer: "Synchronization", description: "Manages optimistic mutation queues, network retry policies, and revision diffs" },
        { id: "api_gateway", name: "Fastify Cloud Gateway", layer: "Cloud Backend", description: "High-performance delta sync endpoint reconciling client changes against master DB" },
        { id: "cloud_db", name: "PostgreSQL Master DB", layer: "Cloud Persistence", description: "Master relational source of truth maintaining revision histories and tombstones" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Local-First Storage & PWA Scaffolding",
          duration: "Weeks 1-2",
          focus: "RxDB / IndexedDB integration, service worker caching, and UI shell.",
          tasks: ["Configure PWA manifest and service worker asset caching", "Integrate RxDB with React 19 for optimistic local state", "Build mobile-optimized responsive layout with touch gestures", "Implement local mutation queue with IndexedDB"],
          risks: ["iOS Safari WebKit 7-day IndexedDB eviction policies"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Bidirectional Delta Synchronization",
          duration: "Weeks 3-4",
          focus: "Revision sequence checkpoints, batch push/pull API, and soft deletes.",
          tasks: ["Build Fastify delta sync API endpoint with PostgreSQL", "Implement revision number increment and tombstone soft deletes", "Build automatic sync trigger on network online event", "Implement Last-Write-Wins (LWW) conflict resolution strategy"],
          risks: ["Race conditions during simultaneous edits across two offline devices"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Push Notifications & Background Sync",
          duration: "Weeks 5-6",
          focus: "Firebase Cloud Messaging, background sync API, and biometric auth.",
          tasks: ["Integrate FCM push notification dispatch for remote updates", "Implement Background Sync API for queued mutations", "Add biometric authentication (WebAuthn / FaceID)", "Build data export and full local cache reset tools"],
          risks: ["Background Sync API lack of support on certain iOS versions"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: Lighthouse Audits, Stress Tests & Launch",
          duration: "Weeks 7-8",
          focus: "Lighthouse 100/100 PWA score, offline reconnect chaos tests, and deployment.",
          tasks: ["Optimize app bundle size achieving sub-1.2s cold start", "Run automated offline reconnection tests verifying zero data loss", "Deploy API to Fly.io edge nodes and frontend to Cloudflare Pages", "Publish PWA and generate Google Play / App Store wrappers"],
          risks: ["Cold start bundle parsing overhead on low-end Android hardware"]
        }
      ]
    },
    resumeImpact: {
      headline: "Senior Mobile & Offline-First Architect — Resilient Mobile PWA Platform",
      bulletPoints: [
        "Architected an offline-first mobile web application utilizing React 19, RxDB (IndexedDB), and PostgreSQL, guaranteeing 100% data persistence without network connectivity.",
        "Engineered a bidirectional delta synchronization protocol with monotonic revision checkpoints, reducing payload transfer size by 82% compared to full-state syncing.",
        "Achieved a perfect 100/100 Lighthouse PWA score and sub-1.2s cold start times on mobile devices through optimized service worker caching and code-splitting."
      ],
      skillsDemonstrated: ["Offline-First Architecture & IndexedDB", "Delta Synchronization Protocols", "Progressive Web Apps (PWAs)", "Fastify & PostgreSQL", "Service Workers & WebAuthn"]
    }
  },

  devtool: {
    summary: {
      title: "Developer Platform & High-Performance API Gateway",
      tagline: "Sub-5ms edge authentication, sliding-window rate limiting, and webhook dispatch",
      domain: "devtool",
      targetScale: "25M Daily API Requests · Sub-5ms Edge Authentication",
      estimatedMonthlyCost: "$160 - $420 / mo",
      description: "Developer-first infrastructure platform featuring an ultra-fast edge API Gateway, cryptographically verified API key management, distributed sliding-window token bucket rate limiting, and an automated webhook dispatch engine."
    },
    stack: {
      frontend: {
        name: "React 19 / Vite + Tailwind CSS + OpenAPI Interactive Docs",
        reason: "Interactive developer documentation with live API console and usage analytics charts.",
        tradeoffs: "Doc rendering complexity; mitigated by static build generation."
      },
      backend: {
        name: "Go (Golang 1.22) + Fiber / Envoy Gateway",
        reason: "Microsecond HTTP request processing with minimal GC latency pauses.",
        tradeoffs: "Writing custom gateway filters requires low-level network understanding."
      },
      database: {
        name: "PostgreSQL 16 + ClickHouse (Telemetry & Request Logs)",
        reason: "ACID storage for developer accounts and keys coupled with column-oriented log queries.",
        tradeoffs: "Managing dual databases; mitigated by Kafka logging pipeline."
      },
      caching: {
        name: "Redis Cluster (Distributed Sliding-Window Rate Limiting)",
        reason: "Atomic Lua scripts executing sliding-window token bucket checks in sub-1ms.",
        tradeoffs: "Redis network roundtrips; mitigated by local in-memory L1 cache with 1s TTL."
      },
      hosting: {
        name: "AWS ECS (Fargate) / Cloudflare Workers Edge",
        reason: "Global edge points-of-presence terminating TLS close to developer clients.",
        tradeoffs: "Edge worker compute memory constraints; mitigated by streaming responses."
      },
      ci_cd: {
        name: "GitHub Actions + Automated OpenAPI SDK Generator",
        reason: "Automatically generates and publishes TypeScript and Python SDKs on release.",
        tradeoffs: "SDK generation pipeline complexity across multiple languages."
      },
      observability: {
        name: "Prometheus + Jaeger Distributed Tracing + Grafana",
        reason: "Granular P50, P95, and P99 gateway overhead tracing and upstream health status.",
        tradeoffs: "High volume of trace spans; mitigated by 10% probabilistic trace sampling."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 (Config) + ClickHouse (Logs)",
      tables: [
        {
          name: "developers",
          purpose: "Stores developer accounts, organizations, and tier rate limit quotas.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Developer ID", index: true },
            { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Account email", index: true },
            { name: "tier", type: "VARCHAR(50)", constraints: "NOT NULL DEFAULT 'developer'", description: "'free' | 'growth' | 'enterprise'", index: false },
            { name: "rate_limit_rps", type: "INTEGER", constraints: "NOT NULL DEFAULT 100", description: "Max allowed requests/sec", index: false }
          ],
          relationships: ["has_many api_keys", "has_many webhooks"]
        },
        {
          name: "api_keys",
          purpose: "Stores hashed API keys, prefixes for UI masking, and access scopes.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Key ID", index: true },
            { name: "developer_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES developers(id) ON DELETE CASCADE", description: "Owner ID", index: true },
            { name: "key_prefix", type: "VARCHAR(12)", constraints: "NOT NULL", description: "Public prefix e.g. 'ak_live_'", index: true },
            { name: "key_hash", type: "VARCHAR(64)", constraints: "UNIQUE NOT NULL", description: "SHA-256 hashed secret token", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Creation date", index: false }
          ],
          relationships: ["belongs_to developers"]
        },
        {
          name: "webhooks",
          purpose: "Registered developer webhook endpoints and HMAC signing secrets.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Webhook ID", index: true },
            { name: "developer_id", type: "UUID", constraints: "FOREIGN KEY REFERENCES developers(id)", description: "Owner ID", index: true },
            { name: "target_url", type: "VARCHAR(1000)", constraints: "NOT NULL", description: "Destination HTTPS URL", index: false },
            { name: "secret_hash", type: "VARCHAR(64)", constraints: "NOT NULL", description: "HMAC signing secret", index: false }
          ],
          relationships: ["belongs_to developers"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  DevClient([Developer Client / App]) -->|HTTPS with API Key| EdgeGateway[Go Edge API Gateway]
  EdgeGateway -->|Verify SHA-256 Hash| LocalCache[(In-Memory L1 + Redis L2)]
  EdgeGateway -->|Sliding-Window Token Bucket| RedisRateLimit[(Redis Rate Limiter)]
  EdgeGateway -->|Forward Request| UpstreamServices[Backend Microservices]
  EdgeGateway -->|Async Telemetry Event| Kafka[Kafka Event Log]
  Kafka -->|Ingest Request Metrics| ClickHouse[(ClickHouse Analytics DB)]
  UpstreamServices -->|Dispatch Webhooks| WebhookWorker[Webhook Dispatch Engine]
  WebhookWorker -->|HMAC-SHA256 Signed HTTP| DevEndpoint[Developer Webhook URL]`,
      components: [
        { id: "gateway", name: "Go Edge API Gateway", layer: "Gateway", description: "Ultra-fast reverse proxy validating API keys and enforcing rate limits in < 5ms" },
        { id: "rate_limiter", name: "Redis Token Bucket", layer: "Rate Limiting", description: "Distributed atomic sliding-window rate limiting preventing upstream denial-of-service" },
        { id: "analytics_db", name: "ClickHouse Logging Store", layer: "Analytics", description: "Column-oriented database processing billions of API request logs for developer analytics" },
        { id: "webhook_engine", name: "Webhook Dispatch Engine", layer: "Event Delivery", description: "Reliable webhook dispatcher with exponential backoff retries and HMAC signatures" }
      ]
    },
    roadmap: {
      totalDuration: "6 - 8 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Gateway Architecture & Key Authentication",
          duration: "Weeks 1-2",
          focus: "Go Fiber gateway, SHA-256 API key hashing, and L1/L2 key caching.",
          tasks: ["Build Go API Gateway reverse proxy with Fiber", "Implement SHA-256 API key generation, hashing, and prefix storage", "Integrate in-memory LRU cache with Redis L2 synchronization", "Write benchmark test verifying sub-5ms auth verification"],
          risks: ["Memory bloat on local LRU cache under 1M+ active keys"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Distributed Sliding-Window Rate Limiting",
          duration: "Weeks 3-4",
          focus: "Redis Lua scripts, sliding-window token bucket, and 429 response headers.",
          tasks: ["Implement atomic Redis Lua script for sliding-window rate limiting", "Add standard RFC rate limit response headers (X-RateLimit-Remaining)", "Build developer dashboard with live quota usage visualizations", "Write concurrency stress tests validating quota enforcement"],
          risks: ["Redis cluster network partitioning during traffic spikes"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Webhook Dispatcher & ClickHouse Logging",
          duration: "Weeks 5-6",
          focus: "HMAC signed webhooks, retry worker queue, and ClickHouse analytics.",
          tasks: ["Build asynchronous webhook dispatch engine with exponential backoff", "Implement HMAC-SHA256 payload signature generation", "Configure Kafka to ClickHouse pipeline for request log analytics", "Build interactive developer API log viewer in React"],
          risks: ["Slow developer webhook endpoints causing worker thread pool starvation"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: SDK Generator, Load Testing & Launch",
          duration: "Weeks 7-8",
          focus: "Automated SDK generation (TypeScript/Python), 25M request load test, and launch.",
          tasks: ["Setup automated OpenAPI 3.1 schema export and SDK generator", "Execute k6 distributed load tests simulating 10,000 RPS sustained throughput", "Configure Prometheus & Jaeger distributed tracing monitors", "Deploy Gateway across multi-region AWS ECS clusters"],
          risks: ["Cross-region database replication latency on key revocations"]
        }
      ]
    },
    resumeImpact: {
      headline: "Principal Infrastructure Architect — High-Performance API Gateway & Developer Platform",
      bulletPoints: [
        "Architected an ultra-low-latency API Gateway in Go and Redis, enforcing sub-5ms cryptographic authentication and rate limiting across 25M+ daily requests.",
        "Engineered an atomic sliding-window token bucket rate limiter and asynchronous HMAC-signed webhook engine with automatic exponential backoff retries.",
        "Built a real-time request analytics pipeline utilizing Kafka and ClickHouse, delivering instant query access across 500M+ historical API invocation records."
      ],
      skillsDemonstrated: ["Go (Golang) High-Performance Gateway", "Redis Lua & Sliding-Window Rate Limiting", "ClickHouse & Kafka Analytics", "HMAC Cryptographic Signatures", "OpenAPI & SDK Automation"]
    }
  },

  serverless: {
    summary: {
      title: "Indie Hacker Fast MVP / Zero-Ops Serverless App",
      tagline: "Rapid deployment serverless architecture with Supabase and Vercel Edge",
      domain: "serverless",
      targetScale: "0 to 50K Users · $0 Fixed Upfront Infrastructure Costs",
      estimatedMonthlyCost: "$0 - $45 / mo",
      description: "Lean, zero-ops full-stack architecture optimized for extreme development velocity, instant edge page loads, managed Supabase authentication and database storage, and zero fixed recurring server expenses."
    },
    stack: {
      frontend: {
        name: "Next.js 15 (App Router) + Tailwind CSS + Lucide Icons",
        reason: "React Server Components and edge routing for instant load times and SEO.",
        tradeoffs: "Server component learning curve; mitigated with clear component boundaries."
      },
      backend: {
        name: "Next.js Route Handlers + Supabase Edge Functions (Deno)",
        reason: "Serverless execution scaling automatically from 0 to thousands of requests.",
        tradeoffs: "Execution time limits (15s); mitigated by keeping handlers focused."
      },
      database: {
        name: "Supabase (PostgreSQL 16 + Built-in Auth + Storage)",
        reason: "Instant managed PostgreSQL with Row-Level Security and generous free tier.",
        tradeoffs: "Platform vendor dependency; mitigated by standard PostgreSQL database dump export."
      },
      caching: {
        name: "Upstash Redis (Serverless REST Redis)",
        reason: "HTTP-based serverless Redis for rate limiting and lightweight session storage.",
        tradeoffs: "REST latency (~15ms) slightly higher than persistent TCP; ideal for serverless."
      },
      hosting: {
        name: "Vercel Edge Network + Supabase Cloud",
        reason: "Zero server management with automatic global CDN and preview deployments on PRs.",
        tradeoffs: "Usage overage pricing if sudden viral spike occurs."
      },
      ci_cd: {
        name: "GitHub Actions + Vercel Preview Deployments",
        reason: "Instant preview URLs for every pull request and automated production deploy on merge.",
        tradeoffs: "Requires clean environment variable secret management across branches."
      },
      observability: {
        name: "Axiom Logging + Sentry + Vercel Web Analytics",
        reason: "Zero-configuration log ingestion and Core Web Vitals performance tracking.",
        tradeoffs: "Free tier log retention limits (30 days)."
      }
    },
    schema: {
      databaseType: "PostgreSQL 16 (Supabase Managed)",
      tables: [
        {
          name: "profiles",
          purpose: "User public profiles linked to Supabase auth.users.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE", description: "Auth User ID", index: true },
            { name: "username", type: "VARCHAR(50)", constraints: "UNIQUE NOT NULL", description: "Handle", index: true },
            { name: "avatar_url", type: "VARCHAR(500)", constraints: "DEFAULT NULL", description: "Profile photo URL", index: false },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Joined date", index: false }
          ],
          relationships: ["has_many items"]
        },
        {
          name: "items",
          purpose: "Core application entity table protected with Supabase Row-Level Security.",
          columns: [
            { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Item ID", index: true },
            { name: "user_id", type: "UUID", constraints: "REFERENCES profiles(id) ON DELETE CASCADE", description: "Creator ID", index: true },
            { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Item title", index: false },
            { name: "content", type: "TEXT", constraints: "NOT NULL", description: "Item details", index: false },
            { name: "is_published", type: "BOOLEAN", constraints: "NOT NULL DEFAULT TRUE", description: "Visibility flag", index: true },
            { name: "created_at", type: "TIMESTAMPTZ", constraints: "NOT NULL DEFAULT NOW()", description: "Creation date", index: true }
          ],
          relationships: ["belongs_to profiles"]
        }
      ]
    },
    architecture: {
      mermaid: `flowchart TD
  User([User Browser / Mobile]) -->|HTTPS| VercelEdge[Vercel Global Edge Network]
  VercelEdge -->|Server Components & ISR| NextApp[Next.js 15 App Router]
  NextApp -->|Direct Data Query via RLS| SupabaseDB[(Supabase Managed PostgreSQL)]
  NextApp -->|OAuth / Passwordless Login| SupabaseAuth[Supabase Auth Engine]
  NextApp -->|Rate Limiting| Upstash[(Upstash Serverless Redis)]
  NextApp -->|Checkout & Webhooks| Stripe[Stripe Checkout]
  NextApp -->|Logs & Vitals| Axiom[Axiom Telemetry]`,
      components: [
        { id: "frontend_edge", name: "Next.js App Router on Vercel", layer: "Edge Presentation", description: "React Server Components with edge caching and zero client hydration overhead" },
        { id: "database_auth", name: "Supabase Platform", layer: "Backend-as-a-Service", description: "Managed PostgreSQL, Row-Level Security, social authentication, and file storage" },
        { id: "serverless_redis", name: "Upstash Redis", layer: "Serverless Cache", description: "HTTP-based Redis for rate limiting and lightweight key-value caching" },
        { id: "payments", name: "Stripe Checkout", layer: "Monetization", description: "Hosted checkout and subscription billing with webhook reconciliation" }
      ]
    },
    roadmap: {
      totalDuration: "3 - 4 Weeks",
      phases: [
        {
          phaseNumber: 1,
          name: "Phase 1: Project Scaffolding & Supabase Setup",
          duration: "Week 1",
          focus: "Next.js 15 repository setup, Supabase database schema, and Google/GitHub OAuth.",
          tasks: ["Scaffold Next.js 15 project with Tailwind CSS", "Configure Supabase PostgreSQL schema with Row-Level Security", "Implement social login (Google & GitHub) and magic link auth", "Setup Vercel deployment pipeline with GitHub integration"],
          risks: ["Local development Supabase Docker sync issues"]
        },
        {
          phaseNumber: 2,
          name: "Phase 2: Core Feature Implementation",
          duration: "Week 2",
          focus: "CRUD operations, image upload to Supabase Storage, and optimistic UI.",
          tasks: ["Build core entity CRUD operations using Server Actions", "Implement image upload with client-side compression to Supabase Storage", "Create responsive mobile navigation and dark glassmorphic UI", "Add Upstash Redis API rate limiting"],
          risks: ["Server Action validation errors not reflected in UI"]
        },
        {
          phaseNumber: 3,
          name: "Phase 3: Stripe Monetization & Webhooks",
          duration: "Week 3",
          focus: "Stripe Checkout integration, customer portal, and webhook reconciliation.",
          tasks: ["Integrate Stripe Checkout for one-time and recurring payments", "Build secure Next.js webhook handler updating user subscription tiers", "Implement Stripe Customer Portal redirect", "Write automated end-to-end checkout test"],
          risks: ["Stripe webhook signature validation failures in local testing"]
        },
        {
          phaseNumber: 4,
          name: "Phase 4: SEO, Analytics & Product Hunt Launch",
          duration: "Week 4",
          focus: "OpenGraph dynamic image generation, Lighthouse 100 score, and launch.",
          tasks: ["Generate dynamic OpenGraph social preview images with @vercel/og", "Optimize Core Web Vitals achieving 100/100 Lighthouse performance", "Setup Axiom error monitoring and PostHog analytics", "Launch on Product Hunt and Hacker News"],
          risks: ["Unexpected viral traffic triggering serverless function concurrency caps"]
        }
      ]
    },
    resumeImpact: {
      headline: "Full-Stack Software Architect — Zero-Ops Serverless SaaS Platform",
      bulletPoints: [
        "Architected and deployed a production serverless web application using Next.js 15, Supabase, and Vercel Edge, achieving sub-50ms Time-to-First-Byte (TTFB) at $0 fixed infrastructure cost.",
        "Engineered secure multi-tenant data access with Supabase Row-Level Security policies and integrated Stripe subscription checkout webhooks.",
        "Achieved a perfect 100/100 Google Lighthouse score across Performance, SEO, and Accessibility through React Server Components and edge caching."
      ],
      skillsDemonstrated: ["Next.js 15 & React Server Components", "Supabase & PostgreSQL RLS", "Serverless Architecture & Vercel Edge", "Stripe Monetization", "Web Performance Optimization"]
    }
  }
};

// ============================================================
// DYNAMIC MOCK QUESTION GENERATOR
// ============================================================

/**
 * Generates the appropriate mock question for a given turn index and accumulated context.
 * 
 * @param {number} turnIndex - Current question turn index (0-based)
 * @param {object} previousAnswers - Dictionary of answers gathered so far { idea, scale, techStack, storage, constraints }
 * @param {string} [domain] - Optional pre-classified domain
 * @returns {{ question: string, options: string[], stageName: string, isLast: boolean, currentSummary: string }}
 */
export function getMockQuestion(turnIndex, previousAnswers = {}, domain) {
  // Stage 0: Always return initial idea discovery question
  if (turnIndex === 0) {
    return {
      question: DEFAULT_INITIAL_QUESTION.question,
      options: DEFAULT_INITIAL_QUESTION.options,
      stageName: DEFAULT_INITIAL_QUESTION.stageName,
      isLast: false,
      currentSummary: DEFAULT_INITIAL_QUESTION.currentSummary
    };
  }

  // Determine domain from user's idea or explicit parameter
  const activeDomain = domain || classifyDomain(previousAnswers.idea || '');
  const questionTree = MOCK_QUESTION_TREES[activeDomain] || MOCK_QUESTION_TREES.saas;

  // The decision tree has 4 follow-up stages (indices 0 to 3, corresponding to turnIndex 1 to 4)
  const treeIndex = Math.min(turnIndex - 1, questionTree.length - 1);
  const stageData = questionTree[treeIndex];

  const isLast = turnIndex >= questionTree.length; // If we reached the end of the decision tree

  // Generate an intelligent current summary
  let currentSummary = `Domain: ${activeDomain.toUpperCase()}`;
  if (previousAnswers.idea) {
    const trimmedIdea = previousAnswers.idea.length > 35
      ? `${previousAnswers.idea.slice(0, 35)}...`
      : previousAnswers.idea;
    currentSummary += ` · Idea: "${trimmedIdea}"`;
  }
  if (previousAnswers.scale) {
    currentSummary += ` · Scale: ${previousAnswers.scale.split('(')[0].trim()}`;
  }

  return {
    question: stageData.bot,
    options: stageData.options,
    stageName: stageData.stageName,
    isLast,
    currentSummary
  };
}

// ============================================================
// DYNAMIC BLUEPRINT SYNTHESIZER
// ============================================================

/**
 * Synthesizes a comprehensive architectural blueprint strictly conforming
 * to the Unified Blueprint JSON Schema from the accumulated interview answers.
 * 
 * @param {object} answers - Accumulated answers from the interview session
 * @returns {object} Complete Blueprint object
 */
export function generateMockBlueprint(answers = {}) {
  const domain = answers.domain || classifyDomain(answers.idea || '');
  const archetype = ARCHETYPE_BLUEPRINTS[domain] || ARCHETYPE_BLUEPRINTS.saas;

  // Deep clone archetype template
  const blueprint = JSON.parse(JSON.stringify(archetype));

  // Generate unique session blueprint ID and timestamp
  const timestamp = new Date().toISOString();
  const slug = domain.toLowerCase().replace(/[^a-z0-9]/g, '_');
  blueprint.id = `bp_${Date.now()}_${slug}`;
  blueprint.timestamp = timestamp;

  // Customize Summary based on user's actual idea and scale
  if (answers.idea && typeof answers.idea === 'string' && answers.idea.trim().length > 3) {
    const cleanIdea = answers.idea.trim();
    // Capitalize first letter
    const formattedTitle = cleanIdea.charAt(0).toUpperCase() + cleanIdea.slice(1);
    blueprint.summary.title = formattedTitle.length > 50 ? `${formattedTitle.slice(0, 50)} Architecture` : `${formattedTitle} System Architecture`;
    blueprint.summary.description = `Custom system architecture engineered for "${cleanIdea}". Features high-availability cloud infrastructure, modular database schema with automated indexing, and production deployment automation.`;
  }

  if (answers.scale && typeof answers.scale === 'string') {
    blueprint.summary.targetScale = answers.scale;
  }

  if (answers.constraints && typeof answers.constraints === 'string') {
    if (answers.constraints.toLowerCase().includes('budget') || answers.constraints.toLowerCase().includes('cost') || answers.constraints.toLowerCase().includes('$')) {
      blueprint.summary.estimatedMonthlyCost = '$30 - $95 / mo (Optimized Budget)';
    }
  }

  // Dynamically tailor stack reasons if specific tools were picked
  if (answers.techStack && typeof answers.techStack === 'string') {
    const stackAns = answers.techStack;
    if (stackAns.includes('Python') || stackAns.includes('FastAPI')) {
      blueprint.stack.backend = {
        name: 'FastAPI (Python 3.12) + Uvicorn ASGI',
        reason: 'Chosen per team preference for asynchronous Python performance and rapid prototyping.',
        tradeoffs: 'Higher memory consumption than Go/Rust; mitigated with container autoscaling.'
      };
    } else if (stackAns.includes('Go') || stackAns.includes('Golang')) {
      blueprint.stack.backend = {
        name: 'Go (Golang 1.22) Microservices + gRPC',
        reason: 'Ultra-low latency concurrency, minimal memory footprint (<20MB), and instant cold starts.',
        tradeoffs: 'Strict type boilerplate; mitigated by code generation tooling.'
      };
    } else if (stackAns.includes('Node') || stackAns.includes('NestJS')) {
      blueprint.stack.backend = {
        name: 'Node.js (NestJS / Fastify) + TypeScript',
        reason: 'Full-stack TypeScript code sharing, large NPM package ecosystem, and high async I/O throughput.',
        tradeoffs: 'Single-threaded event loop CPU bottlenecks on intensive tasks.'
      };
    }
  }

  return blueprint;
}
