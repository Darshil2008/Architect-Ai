/**
 * Architect AI — Blueprint Export & Session History Persistence Module
 * 
 * Provides production-ready multi-format export engines for system architecture blueprints:
 * 1. Comprehensive GitHub-flavored Markdown generator & .md file downloader
 * 2. Structured JSON formatter & .json file downloader
 * 3. Browser Print-to-PDF layout initializer
 * 4. Asynchronous Clipboard utilities with legacy fallbacks for Markdown, JSON, and Mermaid syntax
 * 
 * @module export
 */

// ============================================================
// SAFE LOGGING HELPERS
// ============================================================

function logWarn(...args) {
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(...args);
  }
}

function logError(...args) {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(...args);
  }
}

// ============================================================
// FILENAME & SLUG UTILITIES
// ============================================================

/**
 * Converts a blueprint title into a URL and filesystem-safe filename slug.
 * Cleans punctuation, normalizes whitespace, and handles edge cases safely.
 * 
 * @param {string} [title] - Raw blueprint title string
 * @returns {string} Clean lowercase kebab-case slug (defaults to 'blueprint')
 */
export function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return 'blueprint';
  }
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'blueprint';
}

/**
 * Formats a standardized blueprint export filename.
 * 
 * @param {string} [title] - Blueprint title
 * @param {string} [ext='md'] - File extension ('md', 'json')
 * @param {string} [prefix='architect-ai'] - Optional filename prefix
 * @returns {string} Standardized filename (e.g. "architect-ai-my-project.md")
 */
export function generateFilename(title, ext = 'md', prefix = 'architect-ai') {
  const slug = generateSlug(title);
  const cleanExt = (ext || 'md').replace(/^\./, '');
  return `${prefix}-${slug}.${cleanExt}`;
}

// ============================================================
// MERMAID SYNTAX HELPERS & FALLBACK GENERATOR
// ============================================================

/**
 * Strips code fences and sanitizes Mermaid flowchart syntax.
 * 
 * @param {string} raw - Raw Mermaid syntax string
 * @returns {string} Sanitized Mermaid syntax
 */
export function sanitizeMermaid(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```mermaid')) cleaned = cleaned.slice(10);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

/**
 * Generates a valid, beautifully structured Mermaid flowchart from stack metadata
 * when no pre-compiled diagram syntax is present on the blueprint object.
 * 
 * @param {object} blueprint - Blueprint object
 * @returns {string} Valid flowchart TD Mermaid syntax
 */
export function generateFallbackMermaid(blueprint) {
  const stack = blueprint?.stack || {};
  const frontend = stack.frontend?.name || 'Web / Mobile Client';
  const backend = stack.backend?.name || 'API Backend Gateway';
  const database = stack.database?.name || 'Primary Database';
  const cache = stack.caching?.name || 'Redis Cache';
  const hosting = stack.hosting?.name || 'Edge CDN / Cloud Hosting';
  const observability = stack.observability?.name || 'OpenTelemetry & Sentry';

  return `flowchart TD
  subgraph Client_Layer ["Client & Edge Ingress Layer"]
    Client["💻 Client Application<br/><b>${escapeMermaidLabel(frontend)}</b>"]
    Edge["⚡ Edge CDN / DNS<br/><b>${escapeMermaidLabel(hosting)}</b>"]
  end

  subgraph Service_Layer ["Application & Compute Services"]
    Gateway["🛡️ API Gateway & Auth<br/><b>Reverse Proxy</b>"]
    API["⚙️ Core API Backend<br/><b>${escapeMermaidLabel(backend)}</b>"]
  end

  subgraph Storage_Layer ["State & Persistence Layer"]
    DB[("🗄️ Primary Storage<br/><b>${escapeMermaidLabel(database)}</b>")]
    Cache[("⚡ Fast Cache / State<br/><b>${escapeMermaidLabel(cache)}</b>")]
  end

  subgraph Telemetry_Layer ["Observability & Metrics"]
    Obs["📊 Telemetry & Monitoring<br/><b>${escapeMermaidLabel(observability)}</b>"]
  end

  Client -->|HTTPS / WSS| Edge
  Edge --> Gateway
  Gateway --> API
  API -->|Query / Mutate| DB
  API -->|Get / Set| Cache
  API -.->|Metrics| Obs`.trim();
}

/**
 * Escapes characters that break Mermaid flowchart node labels.
 * 
 * @param {string} str - Raw string
 * @returns {string} Escaped string safe for Mermaid labels
 */
function escapeMermaidLabel(str) {
  return String(str || '')
    .replace(/[\[\]\(\)\{\}\<\>\"\'\|\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================
// MARKDOWN EXPORT BUILDER
// ============================================================

/**
 * Compiles a comprehensive, GitHub-flavored Markdown document from a Blueprint object.
 * Formats Title, Header, Executive Summary, 7-Layer Stack Table, Database Schema
 * Entity Tables, Mermaid Flowchart Code Fence, Phased Sprint Checklist, and Recruiter-Grade Resume Impact.
 * 
 * @param {object} blueprint - Complete Blueprint JSON object
 * @returns {string} Fully formatted Markdown string
 */
export function buildMarkdown(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    return '# System Architecture Blueprint\n\n> No blueprint data available.\n';
  }

  const summary = blueprint.summary || {};
  const stack = blueprint.stack || {};
  const schema = blueprint.schema || {};
  const architecture = blueprint.architecture || {};
  const roadmap = blueprint.roadmap || {};
  const resume = blueprint.resumeImpact || {};

  let dateStr = new Date().toUTCString();
  if (blueprint.timestamp) {
    try {
      dateStr = new Date(blueprint.timestamp).toUTCString();
    } catch {
      dateStr = String(blueprint.timestamp);
    }
  }

  const title = summary.title || 'System Architecture';
  const scale = summary.targetScale || 'Scalable Production System';
  const cost = summary.estimatedMonthlyCost || 'Cost-Optimized';
  const domain = summary.domain ? ` | **Domain:** ${String(summary.domain).toUpperCase()}` : '';

  const lines = [];

  // Document Title & Metadata Blockquote
  lines.push(`# System Architecture Blueprint: ${title}\n`);
  lines.push(`> **Generated by Architect AI** on ${dateStr}`);
  lines.push(`> **Target Scale:** ${scale} | **Estimated Cloud Cost:** ${cost}${domain}\n`);

  // Section 1: Executive Summary
  lines.push('## 1. Executive Summary\n');
  if (summary.tagline) {
    lines.push(`**${summary.tagline}**\n`);
  }
  if (summary.description) {
    lines.push(`${summary.description}\n`);
  }

  // Section 2: Tech Stack & Architecture Tradeoffs
  lines.push('## 2. Tech Stack & Architecture Tradeoffs\n');
  lines.push('| Layer | Technology | Rationale | Key Tradeoff |');
  lines.push('| :--- | :--- | :--- | :--- |');

  const stackEntries = Object.entries(stack);
  if (stackEntries.length > 0) {
    for (const [key, item] of stackEntries) {
      const layerName = key.replace(/_/g, ' ').toUpperCase();
      const techName = item?.name || '-';
      const reason = item?.reason || '-';
      const tradeoffs = item?.tradeoffs || '-';
      lines.push(`| **${layerName}** | ${techName} | ${reason} | ${tradeoffs} |`);
    }
  } else {
    lines.push('| **CORE** | Modern Zero-Build Web Stack | Modular vanilla ES6+ architecture | Standard client-side resource limits |');
  }
  lines.push('');

  // Section 3: Database Schema & Data Models
  lines.push('## 3. Database Schema & Data Models\n');
  lines.push(`**Database Engine:** ${schema.databaseType || 'Relational Database'}\n`);

  if (schema.tables && Array.isArray(schema.tables) && schema.tables.length > 0) {
    for (const table of schema.tables) {
      const tableName = table.name || 'entity';
      lines.push(`### Table: \`${tableName}\``);
      if (table.purpose || table.description) {
        lines.push(`${table.purpose || table.description}\n`);
      } else {
        lines.push('');
      }

      lines.push('| Column | Type | Constraints |');
      lines.push('| :--- | :--- | :--- |');

      if (table.columns && Array.isArray(table.columns) && table.columns.length > 0) {
        for (const col of table.columns) {
          const colName = col.name || 'col';
          const colType = col.type || 'VARCHAR';
          let constraints = '-';
          if (Array.isArray(col.constraints)) {
            constraints = col.constraints.join(', ');
          } else if (col.constraints && typeof col.constraints === 'string') {
            constraints = col.constraints;
          } else if (col.constraints && typeof col.constraints === 'object') {
            constraints = JSON.stringify(col.constraints);
          }
          lines.push(`| \`${colName}\` | \`${colType}\` | ${constraints} |`);
        }
      } else {
        lines.push('| `id` | `UUID` | PRIMARY KEY |');
      }
      lines.push('');

      if (table.indexes && Array.isArray(table.indexes) && table.indexes.length > 0) {
        lines.push(`**Indexes:** ${table.indexes.map(idx => `\`${idx}\``).join(', ')}\n`);
      }

      if (table.relationships && Array.isArray(table.relationships) && table.relationships.length > 0) {
        lines.push('**Relationships:**');
        for (const rel of table.relationships) {
          if (typeof rel === 'string') {
            lines.push(`- ${rel}`);
          } else if (rel && typeof rel === 'object') {
            const relType = rel.type || '1:N';
            const target = rel.targetTable || rel.target || 'target';
            const fk = rel.foreignKey || rel.fk || 'id';
            lines.push(`- ${relType} &rarr; \`${target}\` via \`${fk}\``);
          }
        }
        lines.push('');
      }
    }
  } else {
    lines.push('*No structured database tables defined in this blueprint specification.*\n');
  }

  // Section 4: System Architecture Diagram
  lines.push('## 4. System Architecture Diagram\n');
  lines.push('```mermaid');
  if (architecture.mermaid && typeof architecture.mermaid === 'string' && architecture.mermaid.trim().length > 0) {
    lines.push(sanitizeMermaid(architecture.mermaid));
  } else {
    lines.push(generateFallbackMermaid(blueprint));
  }
  lines.push('```\n');

  // Section 5: Phased Sprint Roadmap & Milestones
  lines.push('## 5. Implementation Roadmap & Milestones\n');
  lines.push(`**Total Duration:** ${roadmap.totalDuration || '6 - 8 Weeks'}\n`);

  if (roadmap.phases && Array.isArray(roadmap.phases) && roadmap.phases.length > 0) {
    for (let i = 0; i < roadmap.phases.length; i++) {
      const phase = roadmap.phases[i];
      const pNum = phase.phaseNumber || phase.phase || (i + 1);
      const pName = phase.name || `Phase ${pNum}`;
      const pDuration = phase.duration ? ` (${phase.duration})` : '';

      lines.push(`### Phase ${pNum}: ${pName}${pDuration}`);
      if (phase.focus) {
        lines.push(`*Focus:* ${phase.focus}\n`);
      } else {
        lines.push('');
      }

      if (phase.tasks && Array.isArray(phase.tasks) && phase.tasks.length > 0) {
        for (const task of phase.tasks) {
          lines.push(`- [ ] ${task}`);
        }
        lines.push('');
      }

      if (phase.risks && Array.isArray(phase.risks) && phase.risks.length > 0) {
        lines.push('**Risks & Mitigations:**');
        for (const risk of phase.risks) {
          lines.push(`- ⚠️ ${risk}`);
        }
        lines.push('');
      }
    }
  } else {
    lines.push('*No phased execution roadmap defined.*\n');
  }

  // Section 6: Recruiter-Grade Resume Impact
  lines.push('## 6. Recruiter-Grade Resume Impact\n');
  if (resume.headline) {
    lines.push(`**Headline:** ${resume.headline}\n`);
  }

  if (resume.bulletPoints && Array.isArray(resume.bulletPoints) && resume.bulletPoints.length > 0) {
    for (const bullet of resume.bulletPoints) {
      lines.push(`- ${bullet}`);
    }
    lines.push('');
  }

  if (resume.skillsDemonstrated && Array.isArray(resume.skillsDemonstrated) && resume.skillsDemonstrated.length > 0) {
    lines.push(`**Demonstrated Skills:** ${resume.skillsDemonstrated.join(' • ')}\n`);
  }

  return lines.join('\n');
}

/** Alias for buildMarkdown */
export const generateMarkdown = buildMarkdown;
/** Alias for buildMarkdown */
export const generateMarkdownBlueprint = buildMarkdown;

// ============================================================
// STRUCTURED JSON EXPORT BUILDER
// ============================================================

/**
 * Formats a Blueprint object into structured, indented JSON.
 * 
 * @param {object} blueprint - Complete Blueprint JSON object
 * @returns {string} Formatted JSON string with 2-space indentation
 */
export function buildJSON(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    return JSON.stringify({}, null, 2);
  }
  return JSON.stringify(blueprint, null, 2);
}

/** Alias for buildJSON */
export const generateJSON = buildJSON;

// ============================================================
// CLIENT-SIDE FILE DOWNLOAD UTILITIES
// ============================================================

/**
 * Triggers a client-side file download using a Blob and temporary anchor element.
 * Safe for modern browsers and gracefully handles headless environments.
 * 
 * @param {string} filename - Target download filename
 * @param {string} content - Text file content
 * @param {string} [mimeType='text/plain;charset=utf-8'] - MIME type
 * @returns {boolean} True if download was successfully initiated
 */
export function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof setTimeout === 'function') {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 400);
    } else if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
    return true;
  } catch (err) {
    logError('[export] File download failed:', err);
    return false;
  }
}

/**
 * Exports and triggers download of a Blueprint as a GitHub-flavored Markdown file.
 * 
 * @param {object} blueprint - Blueprint object
 * @param {string} [customFilename] - Optional custom filename override
 * @returns {boolean} True if download initiated
 */
export function exportMarkdown(blueprint, customFilename) {
  if (!blueprint) {
    logWarn('[export] exportMarkdown called without blueprint');
    return false;
  }
  const mdContent = buildMarkdown(blueprint);
  const slug = generateSlug(blueprint.summary?.title);
  const filename = customFilename || `${slug}-architect-blueprint.md`;
  return downloadFile(filename, mdContent, 'text/markdown;charset=utf-8');
}

/** Alias for exportMarkdown */
export const exportToMarkdown = exportMarkdown;
/** Alias for exportMarkdown */
export const downloadMarkdownBlueprint = exportMarkdown;

/**
 * Exports and triggers download of a Blueprint as a structured JSON file.
 * 
 * @param {object} blueprint - Blueprint object
 * @param {string} [customFilename] - Optional custom filename override
 * @returns {boolean} True if download initiated
 */
export function exportJSON(blueprint, customFilename) {
  if (!blueprint) {
    logWarn('[export] exportJSON called without blueprint');
    return false;
  }
  const jsonContent = buildJSON(blueprint);
  const slug = generateSlug(blueprint.summary?.title);
  const filename = customFilename || `${slug}-architect-blueprint.json`;
  return downloadFile(filename, jsonContent, 'application/json;charset=utf-8');
}

/** Alias for exportJSON */
export const exportToJSON = exportJSON;
/** Alias for exportJSON */
export const downloadJSONBlueprint = exportJSON;

// ============================================================
// PRINT-TO-PDF HELPER
// ============================================================

/**
 * Prepares the DOM for printing and invokes window.print().
 * Coordinates with @media print CSS rules to ensure all multi-tab blueprint panels
 * are rendered sequentially in high contrast.
 * 
 * @returns {boolean} True if print dialog was invoked
 */
export function exportPDF() {
  if (typeof window === 'undefined' || typeof window.print !== 'function') {
    logWarn('[export] window.print is unavailable in this environment');
    return false;
  }
  try {
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      const panels = document.querySelectorAll('.bp-panel');
      panels.forEach(panel => {
        if (panel && typeof panel.removeAttribute === 'function') {
          panel.removeAttribute('data-print-hidden');
        }
      });
    }

    window.print();
    return true;
  } catch (err) {
    logError('[export] Print invocation failed:', err);
    return false;
  }
}

/** Alias for exportPDF */
export const triggerPrint = exportPDF;

// ============================================================
// CLIPBOARD UTILITIES
// ============================================================

/**
 * Copies a string to the system clipboard.
 * Uses modern navigator.clipboard.writeText when available,
 * falling back to document.execCommand('copy') via a hidden textarea.
 * 
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Resolves to true if successfully copied
 */
export async function copyToClipboard(text) {
  const content = String(text ?? '');

  // 1. Try modern asynchronous Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (clipErr) {
      logWarn('[export] navigator.clipboard.writeText failed, trying fallback:', clipErr);
    }
  }

  // 2. Fallback to document.execCommand('copy')
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = content;
      if (typeof textarea.setAttribute === 'function') {
        textarea.setAttribute('readonly', '');
      }
      if (textarea.style) {
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
      }
      if (document.body && typeof document.body.appendChild === 'function') {
        document.body.appendChild(textarea);
        if (typeof textarea.select === 'function') textarea.select();
        const success = typeof document.execCommand === 'function' ? document.execCommand('copy') : false;
        document.body.removeChild(textarea);
        return Boolean(success);
      }
    } catch (fallbackErr) {
      logError('[export] execCommand copy failed:', fallbackErr);
      return false;
    }
  }

  return false;
}

/**
 * Compiles and copies the blueprint Markdown document to the clipboard.
 * 
 * @param {object} blueprint - Blueprint object
 * @returns {Promise<boolean>} True if copied
 */
export async function copyMarkdown(blueprint) {
  const md = buildMarkdown(blueprint);
  return await copyToClipboard(md);
}

/**
 * Formats and copies the blueprint structured JSON to the clipboard.
 * 
 * @param {object} blueprint - Blueprint object
 * @returns {Promise<boolean>} True if copied
 */
export async function copyJSON(blueprint) {
  const json = buildJSON(blueprint);
  return await copyToClipboard(json);
}

/**
 * Extracts and copies the Mermaid.js flowchart syntax to the clipboard.
 * 
 * @param {object} blueprint - Blueprint object
 * @returns {Promise<boolean>} True if copied
 */
export async function copyMermaid(blueprint) {
  let mermaidSyntax = blueprint?.architecture?.mermaid;
  if (!mermaidSyntax || typeof mermaidSyntax !== 'string' || mermaidSyntax.trim().length === 0) {
    mermaidSyntax = generateFallbackMermaid(blueprint);
  }
  const cleaned = sanitizeMermaid(mermaidSyntax);
  return await copyToClipboard(cleaned);
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  generateSlug,
  generateFilename,
  sanitizeMermaid,
  generateFallbackMermaid,
  buildMarkdown,
  generateMarkdown,
  generateMarkdownBlueprint,
  buildJSON,
  generateJSON,
  downloadFile,
  exportMarkdown,
  exportToMarkdown,
  downloadMarkdownBlueprint,
  exportJSON,
  exportToJSON,
  downloadJSONBlueprint,
  exportPDF,
  triggerPrint,
  copyToClipboard,
  copyMarkdown,
  copyJSON,
  copyMermaid
};
