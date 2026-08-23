/**
 * Architect AI — Multi-Tab Blueprint & System Visualizer Module
 * 
 * Implements Milestone 2 (Requirement 2):
 * - Tab Controller with WAI-ARIA accessibility & keyboard navigation (ArrowLeft, ArrowRight, Home, End)
 * - Tab 1: Overview Renderer (Executive summary, 7-layer stack & tradeoffs, key components, resume impact)
 * - Tab 2: Schema & ERD Renderer (Database engine badge, entity cards, column constraints, indexes, relations)
 * - Tab 3: Mermaid.js Architecture Visualizer (Dark theme SVG, Pan & Zoom, Copy Syntax, error fallback)
 * - Tab 4: Roadmap Renderer (Duration badge, sprint milestone phases, interactive task checklists, risks)
 * 
 * @module blueprint
 */

// ==============================================================================
// SANITIZATION & STRING UTILITIES
// ==============================================================================

/**
 * Escapes HTML characters in string to prevent XSS.
 * 
 * @param {string} str - Raw string
 * @returns {string} Safe HTML string
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes strings for Mermaid node labels to prevent syntax breakdown.
 * 
 * @param {string} str - Raw label
 * @returns {string} Sanitized label for Mermaid
 */
export function escapeMermaid(str) {
  if (!str) return '';
  return String(str)
    .replace(/[[\](){}<>"'|\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes raw Mermaid diagram syntax by stripping markdown code fences.
 * 
 * @param {string} raw - Raw mermaid syntax or markdown code block
 * @returns {string} Clean Mermaid flowchart syntax
 */
export function sanitizeMermaidSyntax(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```mermaid')) cleaned = cleaned.slice(10);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

// ==============================================================================
// MERMAID SYNTAX GENERATOR & VALIDATOR
// ==============================================================================

/**
 * Generates or sanitizes Mermaid flowchart syntax from a blueprint object.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Valid Mermaid flowchart TD syntax
 */
export function generateMermaidSyntax(blueprint) {
  if (!blueprint) return 'flowchart TD\n  Empty[No Architecture Available]';

  // If pre-existing valid Mermaid syntax is provided in blueprint, sanitize and return
  if (blueprint.architecture?.mermaid && typeof blueprint.architecture.mermaid === 'string') {
    const sanitized = sanitizeMermaidSyntax(blueprint.architecture.mermaid);
    if (sanitized.length > 10 && (sanitized.startsWith('flowchart') || sanitized.startsWith('graph'))) {
      return sanitized;
    }
  }

  const stack = blueprint.stack || {};
  const summary = blueprint.summary || {};

  const frontendName = escapeMermaid(stack.frontend?.name || 'SPA / Web Client');
  const hostingName = escapeMermaid(stack.hosting?.name || 'Cloudflare CDN / Edge');
  const backendName = escapeMermaid(stack.backend?.name || 'Backend API Service');
  const dbName = escapeMermaid(stack.database?.name || 'Primary Database (PostgreSQL)');
  const cacheName = escapeMermaid(stack.caching?.name || 'Redis Cache / Queue');
  const cicdName = escapeMermaid(stack.ci_cd?.name || 'CI/CD & Task Workers');
  const obsName = escapeMermaid(stack.observability?.name || 'Telemetry & APM');

  return `flowchart TD
  subgraph Client_Layer ["Client & Edge Layer"]
    Client["💻 Client Application<br/><b>${frontendName}</b>"]
    CDN["⚡ Edge CDN & DNS<br/><b>${hostingName}</b>"]
  end

  subgraph Gateway_Layer ["API & Security Gateway"]
    Gateway["🛡️ Reverse Proxy & Gateway<br/><b>Rate Limiting & Auth</b>"]
  end

  subgraph Service_Layer ["Application & Compute Services"]
    Backend["⚙️ Core Application Server<br/><b>${backendName}</b>"]
    Worker["🔄 Background Task Worker<br/><b>${cicdName}</b>"]
  end

  subgraph Storage_Layer ["Data & Persistence Layer"]
    DB[("🗄️ Primary Database<br/><b>${dbName}</b>")]
    Cache[("⚡ In-Memory Cache<br/><b>${cacheName}</b>")]
  end

  subgraph External_Layer ["Observability & External Services"]
    Metrics["📊 Telemetry & Monitoring<br/><b>${obsName}</b>"]
  end

  Client -->|HTTPS / WSS| CDN
  CDN --> Gateway
  Gateway -->|Authenticated Requests| Backend
  Backend -->|Query / Transact| DB
  Backend -->|Cache Reads / Writes| Cache
  Backend -.->|Dispatch Jobs| Worker
  Worker --> DB
  Backend -.->|Metrics & Traces| Metrics

  classDef client fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
  classDef gateway fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
  classDef service fill:#1e1b4b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
  classDef storage fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
  classDef ext fill:#312e81,stroke:#a855f7,stroke-width:2px,color:#f8fafc;

  class Client,CDN client;
  class Gateway gateway;
  class Backend,Worker service;
  class DB,Cache storage;
  class Metrics ext;`.trim();
}

/**
 * Initializes global Mermaid instance with dark glassmorphic theme.
 */
let mermaidInitialized = false;

export function initMermaid() {
  if (typeof window === 'undefined' || typeof window.mermaid === 'undefined') {
    return;
  }
  if (mermaidInitialized) return;

  try {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background: 'transparent',
        primaryColor: '#161a23',
        primaryTextColor: '#e7eaf2',
        primaryBorderColor: '#6366f1',
        lineColor: '#22d3ee',
        secondaryColor: '#10131a',
        tertiaryColor: '#070810',
        clusterBkg: 'rgba(22, 26, 35, 0.75)',
        clusterBorder: '#8b5cf6',
        defaultLinkColor: '#22d3ee',
        fontFamily: '"Inter", sans-serif',
        fontSize: '13px'
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false
      },
      securityLevel: 'loose'
    });
    mermaidInitialized = true;
  } catch (err) {
    console.warn('Mermaid initialization error:', err);
  }
}

// ==============================================================================
// TAB 1: OVERVIEW TAB RENDERER
// ==============================================================================

/**
 * Generates HTML string for the Overview tab panel.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Rendered HTML string
 */
export function renderOverviewHTML(blueprint) {
  if (!blueprint) {
    return '<div class="bp-empty"><p>No blueprint data available.</p></div>';
  }

  const summary = blueprint.summary || {};
  const stack = blueprint.stack || {};
  const resumeImpact = blueprint.resumeImpact || {};
  const components = blueprint.architecture?.components || [];

  // 7-layer stack mapping
  const layerLabels = {
    frontend: 'Frontend & UI',
    backend: 'Backend & Compute',
    database: 'Database & Storage',
    caching: 'Caching & Queues',
    hosting: 'Hosting & Infrastructure',
    ci_cd: 'CI / CD & Deployment',
    observability: 'Observability & Telemetry'
  };

  const stackEntries = Object.entries(stack);

  return `
    <div class="bp-overview-container">
      <!-- 1. EXECUTIVE SUMMARY CARD -->
      <div class="bp-card summary-card">
        <div class="card-badges">
          <span class="bp-badge badge-domain">${escapeHTML(summary.domain || 'Architecture')}</span>
          <span class="bp-badge badge-scale">${escapeHTML(summary.targetScale || 'Scalable System')}</span>
          <span class="bp-badge badge-cost">${escapeHTML(summary.estimatedMonthlyCost || 'Cost-Optimized')}</span>
        </div>
        <h2 class="bp-summary-title">${escapeHTML(summary.title || 'System Architecture')}</h2>
        ${summary.tagline ? `<p class="bp-summary-tagline">${escapeHTML(summary.tagline)}</p>` : ''}
        ${summary.description ? `<p class="bp-summary-desc">${escapeHTML(summary.description)}</p>` : ''}
      </div>

      <!-- 2. RECOMMENDED 7-LAYER STACK & TRADEOFF MATRIX -->
      <div class="bp-card stack-card">
        <div class="bp-card-header">
          <h3 class="bp-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-inline">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            7-Layer Tech Stack &amp; Architecture Tradeoffs
          </h3>
        </div>
        <div class="stack-grid">
          ${stackEntries.map(([category, item]) => {
            const catLabel = layerLabels[category] || category.replace('_', ' ').toUpperCase();
            return `
              <div class="stack-item" data-layer="${escapeHTML(category)}">
                <div class="stack-item-header">
                  <span class="stack-cat">${escapeHTML(catLabel)}</span>
                  <strong class="stack-tech-name">${escapeHTML(item?.name || 'TBD')}</strong>
                </div>
                <div class="stack-item-body">
                  <div class="stack-row">
                    <span class="stack-row-label">Why:</span>
                    <span class="stack-row-val">${escapeHTML(item?.reason || 'Optimized for target scale and requirements.')}</span>
                  </div>
                  <div class="stack-row tradeoff-row">
                    <span class="stack-row-label">Tradeoff:</span>
                    <span class="stack-row-val">${escapeHTML(item?.tradeoffs || 'Standard architectural tradeoffs apply.')}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. KEY ARCHITECTURAL COMPONENTS -->
      ${components && components.length > 0 ? `
        <div class="bp-card components-card">
          <div class="bp-card-header">
            <h3 class="bp-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-inline">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 9h6v6H9z"></path>
                <path d="M3 9h6m6 0h6M9 15H3m12 0h6"></path>
              </svg>
              Key Architecture Components
            </h3>
          </div>
          <div class="components-grid">
            ${components.map(comp => `
              <div class="component-box">
                <div class="comp-header">
                  <strong class="comp-name">${escapeHTML(comp.name)}</strong>
                  ${comp.layer ? `<span class="comp-layer-badge">${escapeHTML(comp.layer)}</span>` : ''}
                </div>
                <p class="comp-desc">${escapeHTML(comp.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 4. RECRUITER-GRADE RESUME IMPACT SECTION -->
      <div class="bp-card resume-card">
        <div class="bp-card-header">
          <h3 class="bp-card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-inline">
              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              <rect width="20" height="14" x="2" y="6" rx="2"></rect>
            </svg>
            Recruiter-Grade XYZ Resume Impact
          </h3>
        </div>
        ${resumeImpact.headline ? `
          <div class="resume-headline-box">
            <span class="resume-headline-label">Executive Headline</span>
            <p class="resume-headline-text">${escapeHTML(resumeImpact.headline)}</p>
          </div>
        ` : ''}
        ${resumeImpact.bulletPoints && resumeImpact.bulletPoints.length > 0 ? `
          <ul class="resume-bullet-list">
            ${resumeImpact.bulletPoints.map(bullet => `
              <li class="resume-bullet-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="bullet-check-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${escapeHTML(bullet)}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}
        ${resumeImpact.skillsDemonstrated && resumeImpact.skillsDemonstrated.length > 0 ? `
          <div class="skills-demonstrated-box">
            <span class="skills-label">Skills Demonstrated:</span>
            <div class="skills-tag-cloud">
              ${resumeImpact.skillsDemonstrated.map(skill => `
                <span class="skill-tag">${escapeHTML(skill)}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Mounts Overview tab content into DOM container.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @param {HTMLElement} [container] - Target DOM container
 */
export function renderOverview(blueprint, container) {
  const target = container || (typeof document !== 'undefined' ? document.getElementById('panel-overview') : null);
  if (!target) return;
  target.innerHTML = renderOverviewHTML(blueprint);
}

// ==============================================================================
// TAB 2: SCHEMA & ERD TAB RENDERER
// ==============================================================================

/**
 * Generates HTML string for the Schema & ERD tab panel.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Rendered HTML string
 */
export function renderSchemaHTML(blueprint) {
  if (!blueprint || !blueprint.schema) {
    return '<div class="bp-empty"><p>No database schema defined for this blueprint.</p></div>';
  }

  const { schema } = blueprint;
  const tables = schema.tables || [];

  if (tables.length === 0) {
    return '<div class="bp-empty"><p>No tables configured in schema.</p></div>';
  }

  return `
    <div class="bp-schema-container">
      <div class="schema-top-bar">
        <div class="db-info">
          <span class="db-type-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-inline">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M3 5v14a9 3 0 0 0 18 0V5"></path>
              <path d="M3 12a9 3 0 0 0 18 0"></path>
            </svg>
            ${escapeHTML(schema.databaseType || 'Relational Database')}
          </span>
          <span class="table-count-badge">${tables.length} Core ${tables.length === 1 ? 'Entity' : 'Entities'}</span>
        </div>
      </div>

      <div class="schema-tables-grid">
        ${tables.map(table => {
          const cols = table.columns || [];
          const relationships = table.relationships || [];
          const indexes = table.indexes || [];

          return `
            <div class="bp-card table-card" data-table="${escapeHTML(table.name)}">
              <div class="table-card-header">
                <div class="table-name-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="table-icon">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18M3 15h18M9 3v18"></path>
                  </svg>
                  <h4 class="table-name mono">${escapeHTML(table.name)}</h4>
                </div>
                ${table.purpose || table.description ? `
                  <p class="table-purpose">${escapeHTML(table.purpose || table.description)}</p>
                ` : ''}
              </div>

              <div class="table-columns-scroll">
                <table class="columns-table">
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Data Type</th>
                      <th>Constraints / Keys</th>
                      ${cols.some(c => c.description) ? '<th>Description</th>' : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${cols.map(col => {
                      const constraintStr = Array.isArray(col.constraints) 
                        ? col.constraints.join(' ') 
                        : String(col.constraints || '');
                      
                      const upperConstraint = constraintStr.toUpperCase();
                      const isPK = upperConstraint.includes('PRIMARY') || upperConstraint.includes('PK');
                      const isFK = upperConstraint.includes('FOREIGN') || upperConstraint.includes('FK') || upperConstraint.includes('REFERENCES') || constraintStr.includes('->');
                      const isUnique = upperConstraint.includes('UNIQUE');
                      const isNotNull = upperConstraint.includes('NOT NULL');
                      const hasIndex = Boolean(col.index) || upperConstraint.includes('INDEX') || upperConstraint.includes('IDX');

                      return `
                        <tr>
                          <td class="col-name-cell mono">
                            <strong>${escapeHTML(col.name)}</strong>
                          </td>
                          <td class="col-type-cell mono">
                            <span class="type-pill">${escapeHTML(col.type)}</span>
                          </td>
                          <td class="col-constraints-cell">
                            <div class="constraint-badges">
                              ${isPK ? '<span class="badge-pk" title="Primary Key">PK</span>' : ''}
                              ${isFK ? '<span class="badge-fk" title="Foreign Key">FK</span>' : ''}
                              ${isUnique ? '<span class="badge-unique" title="Unique Constraint">UNIQUE</span>' : ''}
                              ${isNotNull ? '<span class="badge-notnull" title="Not Null">NOT NULL</span>' : ''}
                              ${hasIndex && !isPK ? '<span class="badge-idx" title="Indexed Column">IDX</span>' : ''}
                              ${constraintStr && !isPK && !isFK && !isUnique && !isNotNull ? `
                                <span class="constraint-text mono">${escapeHTML(constraintStr)}</span>
                              ` : ''}
                            </div>
                          </td>
                          ${cols.some(c => c.description) ? `
                            <td class="col-desc-cell">${escapeHTML(col.description || '')}</td>
                          ` : ''}
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              ${indexes.length > 0 ? `
                <div class="table-indexes-section">
                  <span class="section-label">Database Indexes:</span>
                  <div class="index-badges-wrap">
                    ${indexes.map(idx => `
                      <span class="index-badge mono">${escapeHTML(idx)}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${relationships.length > 0 ? `
                <div class="table-relations-section">
                  <span class="section-label">Entity Relationships:</span>
                  <ul class="relations-list">
                    ${relationships.map(rel => {
                      const relText = typeof rel === 'string' 
                        ? rel 
                        : `${rel.type || 'Relates'} -> ${rel.targetTable || rel.table || ''} (${rel.foreignKey || ''})`;
                      return `
                        <li class="relation-item mono">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="rel-arrow-icon">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                          <span>${escapeHTML(relText)}</span>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Mounts Schema & ERD tab content into DOM container.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @param {HTMLElement} [container] - Target DOM container
 */
export function renderSchema(blueprint, container) {
  const target = container || (typeof document !== 'undefined' ? document.getElementById('panel-schema') : null);
  if (!target) return;
  target.innerHTML = renderSchemaHTML(blueprint);
}

// ==============================================================================
// TAB 3: MERMAID.JS ARCHITECTURE VISUALIZER
// ==============================================================================

/**
 * Generates HTML string for the Architecture tab panel.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Rendered HTML string
 */
export function renderArchitectureHTML(blueprint) {
  const rawSyntax = generateMermaidSyntax(blueprint);

  return `
    <div class="bp-architecture-container">
      <div class="arch-toolbar">
        <div class="zoom-controls" role="group" aria-label="Diagram Zoom Controls">
          <button class="bp-ctrl-btn" id="arch-zoom-in" title="Zoom In (+)" aria-label="Zoom In">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button class="bp-ctrl-btn" id="arch-zoom-out" title="Zoom Out (-)" aria-label="Zoom Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button class="bp-ctrl-btn" id="arch-reset" title="Reset View" aria-label="Reset View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            <span class="btn-text">Reset</span>
          </button>
          <button class="bp-ctrl-btn" id="arch-fullscreen" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>

        <div class="action-controls">
          <button class="bp-ctrl-btn btn-copy-syntax" id="arch-copy-code" title="Copy Mermaid Syntax">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
            <span id="copy-syntax-label">Copy Syntax</span>
          </button>
        </div>
      </div>

      <div class="arch-viewport" id="arch-viewport" tabindex="0" role="region" aria-label="Architecture Diagram Canvas">
        <div class="arch-canvas" id="arch-canvas" style="transform: translate(0px, 0px) scale(1);">
          <div class="arch-loading" id="arch-loading">
            <div class="loading-spinner"></div>
            <span>Rendering Architecture Visualizer...</span>
          </div>
        </div>
      </div>

      <!-- Hidden pre container for fallback / copy -->
      <textarea id="raw-mermaid-syntax" style="display: none;" readonly>${escapeHTML(rawSyntax)}</textarea>
    </div>
  `;
}

/**
 * State and listeners for Mermaid Pan & Zoom viewport.
 */
function attachPanZoomControls(viewport, canvas, rawSyntax) {
  if (!viewport || !canvas) return;

  let zoom = 1.0;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  }

  // Zoom In
  const zoomInBtn = document.getElementById('arch-zoom-in');
  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      zoom = Math.min(3.0, zoom + 0.2);
      updateTransform();
    };
  }

  // Zoom Out
  const zoomOutBtn = document.getElementById('arch-zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      zoom = Math.max(0.4, zoom - 0.2);
      updateTransform();
    };
  }

  // Reset View
  const resetBtn = document.getElementById('arch-reset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      zoom = 1.0;
      translateX = 0;
      translateY = 0;
      updateTransform();
    };
  }

  // Fullscreen / Modal Toggle
  const fullscreenBtn = document.getElementById('arch-fullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const container = viewport.closest('.bp-architecture-container') || viewport;
      container.classList.toggle('is-fullscreen');
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      }
    };
  }

  // Copy Syntax Button
  const copyBtn = document.getElementById('arch-copy-code');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(rawSyntax);
        } else {
          // Fallback for environments without clipboard API
          const ta = document.getElementById('raw-mermaid-syntax');
          if (ta) {
            ta.style.display = 'block';
            ta.select();
            document.execCommand('copy');
            ta.style.display = 'none';
          }
        }
        const label = document.getElementById('copy-syntax-label');
        if (label) {
          const original = label.textContent;
          label.textContent = 'Copied!';
          setTimeout(() => { label.textContent = original; }, 2000);
        }
      } catch (err) {
        console.warn('Clipboard copy failed:', err);
      }
    };
  }

  // Panning via Mouse / Pointer drag
  viewport.onpointerdown = (e) => {
    // Ignore clicks on control buttons
    if (e.target.closest('.bp-ctrl-btn')) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    viewport.setPointerCapture?.(e.pointerId);
    viewport.style.cursor = 'grabbing';
  };

  viewport.onpointermove = (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  };

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.releasePointerCapture?.(e.pointerId);
    viewport.style.cursor = 'grab';
  };

  viewport.onpointerup = endDrag;
  viewport.onpointercancel = endDrag;

  // Zoom via Mouse Wheel
  viewport.onwheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    zoom = Math.min(3.0, Math.max(0.4, zoom + delta));
    updateTransform();
  };
}

/**
 * Mounts Architecture Diagram tab and renders Mermaid SVG asynchronously.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @param {HTMLElement} [container] - Target DOM container
 */
export async function renderArchitecture(blueprint, container) {
  const target = container || (typeof document !== 'undefined' ? document.getElementById('panel-architecture') : null);
  if (!target) return;

  target.innerHTML = renderArchitectureHTML(blueprint);

  const rawSyntax = generateMermaidSyntax(blueprint);
  const viewport = document.getElementById('arch-viewport');
  const canvas = document.getElementById('arch-canvas');

  attachPanZoomControls(viewport, canvas, rawSyntax);

  // Execute Mermaid Render
  if (typeof window !== 'undefined' && window.mermaid) {
    try {
      initMermaid();
      const renderId = `mermaid-svg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const { svg } = await window.mermaid.render(renderId, rawSyntax);
      if (canvas) {
        canvas.innerHTML = svg;
        const svgEl = canvas.querySelector('svg');
        if (svgEl) {
          svgEl.style.maxWidth = '100%';
          svgEl.style.height = 'auto';
          svgEl.style.display = 'block';
          svgEl.style.margin = '0 auto';
        }
      }
    } catch (renderError) {
      console.warn('Mermaid rendering failed; displaying fallback code block:', renderError);
      if (canvas) {
        canvas.innerHTML = `
          <div class="mermaid-fallback-box">
            <div class="fallback-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warn-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Mermaid Architecture Flowchart Syntax</span>
            </div>
            <pre class="mermaid-code mono">${escapeHTML(rawSyntax)}</pre>
          </div>
        `;
      }
    }
  } else {
    // If Mermaid is not loaded (e.g. offline fallback without CDN), render clean structured diagram preview
    if (canvas) {
      canvas.innerHTML = `
        <div class="mermaid-fallback-box">
          <div class="fallback-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="warn-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Mermaid Architecture Diagram Syntax</span>
          </div>
          <pre class="mermaid-code mono">${escapeHTML(rawSyntax)}</pre>
        </div>
      `;
    }
  }
}

// ==============================================================================
// TAB 4: ROADMAP TAB RENDERER
// ==============================================================================

/**
 * Generates HTML string for the Roadmap tab panel.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Rendered HTML string
 */
export function renderRoadmapHTML(blueprint) {
  if (!blueprint || !blueprint.roadmap) {
    return '<div class="bp-empty"><p>No roadmap milestones defined for this blueprint.</p></div>';
  }

  const { roadmap } = blueprint;
  const phases = roadmap.phases || [];

  if (phases.length === 0) {
    return '<div class="bp-empty"><p>No execution phases generated.</p></div>';
  }

  return `
    <div class="bp-roadmap-container">
      <div class="roadmap-top-bar">
        <span class="duration-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-inline">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Estimated Timeline: ${escapeHTML(roadmap.totalDuration || 'Flexible Schedule')}
        </span>
        <span class="phase-count-badge">${phases.length} Execution ${phases.length === 1 ? 'Phase' : 'Phases'}</span>
      </div>

      <div class="roadmap-phases-list">
        ${phases.map((phase, pIdx) => {
          const phaseNumber = phase.phaseNumber || phase.phase || (pIdx + 1);
          const tasks = phase.tasks || [];
          const risks = phase.risks || [];

          return `
            <div class="bp-card phase-card" data-phase-index="${pIdx}">
              <div class="phase-card-header">
                <div class="phase-title-row">
                  <span class="phase-pill">Phase ${escapeHTML(phaseNumber)}</span>
                  <h4 class="phase-name">${escapeHTML(phase.name)}</h4>
                  ${phase.duration ? `<span class="phase-duration-badge mono">${escapeHTML(phase.duration)}</span>` : ''}
                </div>
                ${phase.focus ? `<p class="phase-focus">${escapeHTML(phase.focus)}</p>` : ''}
              </div>

              ${tasks.length > 0 ? `
                <div class="phase-tasks-section">
                  <div class="tasks-header-row">
                    <span class="tasks-title">Milestone Deliverables & Action Items</span>
                    <span class="tasks-progress-badge" id="phase-${pIdx}-progress">0/${tasks.length} Completed</span>
                  </div>
                  <ul class="tasks-checklist">
                    ${tasks.map((task, tIdx) => {
                      const taskId = `task-chk-${pIdx}-${tIdx}`;
                      return `
                        <li class="task-checklist-item">
                          <label class="task-checkbox-label" for="${taskId}">
                            <input 
                              type="checkbox" 
                              id="${taskId}" 
                              class="bp-task-checkbox" 
                              data-phase="${pIdx}" 
                              data-task="${tIdx}" 
                            />
                            <span class="task-custom-checkbox"></span>
                            <span class="task-label-text">${escapeHTML(task)}</span>
                          </label>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              ` : ''}

              ${risks.length > 0 ? `
                <div class="phase-risks-section">
                  <span class="risks-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="risk-icon">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Key Risks & Architecture Mitigations:
                  </span>
                  <ul class="risks-list">
                    ${risks.map(risk => `
                      <li class="risk-item">
                        <span>${escapeHTML(risk)}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Attaches interactive change listeners to task checklist checkboxes.
 * 
 * @param {HTMLElement} container - Roadmap container
 */
function attachRoadmapChecklistListeners(container) {
  if (!container) return;

  const checkboxes = container.querySelectorAll('.bp-task-checkbox');
  checkboxes.forEach(chk => {
    chk.addEventListener('change', () => {
      const label = chk.closest('.task-checkbox-label');
      if (label) {
        label.classList.toggle('task-done', chk.checked);
      }

      // Update phase completed count badge
      const phaseIndex = chk.dataset.phase;
      const phaseCard = container.querySelector(`[data-phase-index="${phaseIndex}"]`);
      if (phaseCard) {
        const phaseCheckboxes = phaseCard.querySelectorAll('.bp-task-checkbox');
        const checkedCount = Array.from(phaseCheckboxes).filter(c => c.checked).length;
        const badge = phaseCard.querySelector(`#phase-${phaseIndex}-progress`);
        if (badge) {
          badge.textContent = `${checkedCount}/${phaseCheckboxes.length} Completed`;
          badge.classList.toggle('all-done', checkedCount === phaseCheckboxes.length && checkedCount > 0);
        }
      }
    });
  });
}

/**
 * Mounts Roadmap tab content into DOM container.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @param {HTMLElement} [container] - Target DOM container
 */
export function renderRoadmap(blueprint, container) {
  const target = container || (typeof document !== 'undefined' ? document.getElementById('panel-roadmap') : null);
  if (!target) return;
  target.innerHTML = renderRoadmapHTML(blueprint);
  attachRoadmapChecklistListeners(target);
}

// ==============================================================================
// MULTI-TAB CONTROLLER & ARIA ACCESSIBILITY
// ==============================================================================

export const TAB_DEFS = [
  { id: 'overview', label: 'Overview', icon: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>' },
  { id: 'schema', label: 'Schema & ERD', icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>' },
  { id: 'architecture', label: 'Architecture', icon: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/><path d="M3 9h6m6 0h6M9 15H3m12 0h6"/>' },
  { id: 'roadmap', label: 'Roadmap', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
];

/**
 * Switches the active tab with full WAI-ARIA attribute updates.
 * 
 * @param {string} tabId - Target tab ID ('overview' | 'schema' | 'architecture' | 'roadmap')
 * @param {HTMLElement} [rootContainer] - Blueprint root element
 * @param {object} [blueprint] - Current blueprint object
 */
export function switchTab(tabId, rootContainer, blueprint) {
  const root = rootContainer || (typeof document !== 'undefined' ? document.querySelector('.blueprint') || document.body : null);
  if (!root) return;

  const tabButtons = root.querySelectorAll('.bp-tab');
  const panels = root.querySelectorAll('.bp-panel');

  tabButtons.forEach(btn => {
    const isMatch = btn.id === `tab-${tabId}` || btn.dataset.tab === tabId;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    btn.setAttribute('tabindex', isMatch ? '0' : '-1');
    if (isMatch) {
      btn.focus();
    }
  });

  panels.forEach(panel => {
    const isMatch = panel.id === `panel-${tabId}` || panel.dataset.panel === tabId;
    panel.classList.toggle('active', isMatch);
    if (isMatch) {
      panel.removeAttribute('hidden');
      panel.setAttribute('tabindex', '0');
    } else {
      panel.setAttribute('hidden', '');
    }
  });

  // If switching to architecture tab, trigger Mermaid render if SVG is not yet populated
  if (tabId === 'architecture' && blueprint) {
    const canvas = root.querySelector('#arch-canvas');
    if (canvas && (!canvas.querySelector('svg') || canvas.querySelector('.arch-loading'))) {
      renderArchitecture(blueprint, root.querySelector('#panel-architecture'));
    }
  }
}

/**
 * Wires click and keyboard navigation (ArrowLeft, ArrowRight, Home, End) on tab buttons.
 * 
 * @param {HTMLElement} navContainer - Tablist element
 * @param {HTMLElement} panelsContainer - Panels container
 * @param {object} blueprint - Blueprint object
 */
export function initTabs(navContainer, panelsContainer, blueprint) {
  if (!navContainer) return;

  const tabButtons = Array.from(navContainer.querySelectorAll('.bp-tab'));
  if (tabButtons.length === 0) return;

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = btn.dataset.tab || btn.id.replace('tab-', '');
      switchTab(tabId, navContainer.closest('.bp-visualizer-root') || document.body, blueprint);
    });

    btn.addEventListener('keydown', (e) => {
      let targetIndex = -1;

      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabButtons.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabButtons.length - 1;
      }

      if (targetIndex !== -1) {
        e.preventDefault();
        const targetBtn = tabButtons[targetIndex];
        const tabId = targetBtn.dataset.tab || targetBtn.id.replace('tab-', '');
        switchTab(tabId, navContainer.closest('.bp-visualizer-root') || document.body, blueprint);
      }
    });
  });
}

// ==============================================================================
// MAIN BLUEPRINT ENTRY POINT
// ==============================================================================

/**
 * Generates the full HTML shell for the 4-tab blueprint visualizer.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @returns {string} Complete HTML string
 */
export function renderBlueprintHTML(blueprint) {
  if (!blueprint) {
    return `
      <div class="bp-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <p>Your blueprint will materialize here as you answer.</p>
      </div>
    `;
  }

  return `
    <div class="bp-visualizer-root">
      <!-- NAVIGATION TABLIST & ACTION BAR -->
      <div class="bp-nav-container">
        <div class="bp-tabs" role="tablist" aria-label="Blueprint Views">
          ${TAB_DEFS.map((tab, idx) => `
            <button 
              class="bp-tab ${idx === 0 ? 'active' : ''}" 
              role="tab" 
              id="tab-${tab.id}" 
              data-tab="${tab.id}"
              aria-selected="${idx === 0 ? 'true' : 'false'}" 
              aria-controls="panel-${tab.id}" 
              tabindex="${idx === 0 ? '0' : '-1'}"
            >
              <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${tab.icon}
              </svg>
              <span>${escapeHTML(tab.label)}</span>
            </button>
          `).join('')}
        </div>

        <div class="bp-actions" role="toolbar" aria-label="Blueprint Actions">
          <button class="bp-action-btn" id="btn-export-md" title="Export Markdown (.md)" aria-label="Export Markdown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>MD</span>
          </button>
          <button class="bp-action-btn" id="btn-export-json" title="Export JSON (.json)" aria-label="Export JSON">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M10 12h4m-4 4h4"></path>
            </svg>
            <span>JSON</span>
          </button>
          <button class="bp-action-btn" id="btn-print-pdf" title="Print or Save PDF" aria-label="Print PDF">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect width="12" height="8" x="6" y="14"></rect>
            </svg>
            <span>PDF</span>
          </button>
        </div>
      </div>

      <!-- 4 TAB PANELS -->
      <div class="bp-panels" id="bp-panels">
        <div class="bp-panel active" id="panel-overview" data-panel="overview" role="tabpanel" aria-labelledby="tab-overview" tabindex="0">
          ${renderOverviewHTML(blueprint)}
        </div>
        <div class="bp-panel" id="panel-schema" data-panel="schema" role="tabpanel" aria-labelledby="tab-schema" tabindex="0" hidden>
          ${renderSchemaHTML(blueprint)}
        </div>
        <div class="bp-panel" id="panel-architecture" data-panel="architecture" role="tabpanel" aria-labelledby="tab-architecture" tabindex="0" hidden>
          ${renderArchitectureHTML(blueprint)}
        </div>
        <div class="bp-panel" id="panel-roadmap" data-panel="roadmap" role="tabpanel" aria-labelledby="tab-roadmap" tabindex="0" hidden>
          ${renderRoadmapHTML(blueprint)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders and mounts the complete Multi-Tab Blueprint Visualizer into targetContainer.
 * 
 * @param {object} blueprint - Unified Blueprint JSON object
 * @param {HTMLElement} [targetContainer] - Target DOM element (defaults to #blueprint or .blueprint)
 */
export function renderBlueprint(blueprint, targetContainer) {
  let target = targetContainer;
  if (!target && typeof document !== 'undefined') {
    target = document.getElementById('blueprint') || document.querySelector('.blueprint');
  }
  if (!target) return;

  target.innerHTML = renderBlueprintHTML(blueprint);

  if (!blueprint) return;

  const navContainer = target.querySelector('.bp-tabs');
  const panelsContainer = target.querySelector('#bp-panels');

  initTabs(navContainer, panelsContainer, blueprint);

  // Attach roadmap checklist listeners
  const roadmapPanel = target.querySelector('#panel-roadmap');
  if (roadmapPanel) {
    attachRoadmapChecklistListeners(roadmapPanel);
  }

  // Pre-initialize Architecture Pan & Zoom controls
  const archViewport = target.querySelector('#arch-viewport');
  const archCanvas = target.querySelector('#arch-canvas');
  if (archViewport && archCanvas) {
    const rawSyntax = generateMermaidSyntax(blueprint);
    attachPanZoomControls(archViewport, archCanvas, rawSyntax);
  }
}
