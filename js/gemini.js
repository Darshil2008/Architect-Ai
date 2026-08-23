/**
 * Architect AI — Direct Browser REST Client for Gemini API
 * 
 * Manages client-side communication with Google Generative Language API (v1beta),
 * multi-turn conversation formatting, system instruction injection, structured JSON mode,
 * exponential backoff retry logic, and fault-tolerant JSON extraction.
 * 
 * @module gemini
 */

import { GEMINI_CONFIG, GEMINI_MODELS, SYSTEM_PROMPTS } from './config.js';
import { getApiKey, getModelPreference } from './storage.js';

// ============================================================
// JSON CLEANING & SCHEMA RECOVERY UTILITIES
// ============================================================

/**
 * Strips markdown code fences and recovers valid JSON from raw LLM responses.
 * Handles markdown wrappers (```json ... ```), outermost object boundaries,
 * and trailing commas.
 * 
 * @param {string|object} raw - Raw text output from Gemini API or parsed object
 * @returns {object} Cleaned and parsed JavaScript object
 * @throws {Error} If JSON parsing fails completely after all recovery attempts
 */
export function extractAndParseJSON(raw) {
  if (typeof raw === 'object' && raw !== null) {
    return raw;
  }

  if (typeof raw !== 'string') {
    throw new Error(`Invalid input type for JSON extraction: expected string, got ${typeof raw}`);
  }

  let cleaned = raw.trim();

  // 1. Strip markdown code fence blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  // 2. Direct parse attempt
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // 3. Fallback: locate outermost JSON object braces { ... } or array brackets [ ... ]
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    let candidate = cleaned;
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace &&
        (firstBracket === -1 || firstBrace < firstBracket)) {
      candidate = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      candidate = cleaned.substring(firstBracket, lastBracket + 1);
    }

    try {
      return JSON.parse(candidate);
    } catch (e2) {
      // 4. Fallback: repair trailing commas in objects and arrays
      try {
        const trailingCommaCleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(trailingCommaCleaned);
      } catch (e3) {
        // 5. Final fallback: repair unescaped newlines within strings
        try {
          const newlineCleaned = candidate
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ' ');
          return JSON.parse(newlineCleaned);
        } catch (e4) {
          throw new Error(`Failed to parse AI response into valid JSON: ${e1.message}. Raw: ${raw.slice(0, 150)}...`);
        }
      }
    }
  }
}

// ============================================================
// EXPONENTIAL BACKOFF & REST CALL EXECUTION
// ============================================================

/**
 * Safe asynchronous sleep helper.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  if (typeof setTimeout !== 'undefined') {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  return Promise.resolve();
}

/**
 * Executes a POST request to the Gemini REST API with exponential backoff and jitter.
 * 
 * @param {string} endpointUrl - The complete endpoint URL including query parameters
 * @param {object} payload - The JSON request body payload
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @returns {Promise<object>} The parsed API response object
 */
async function callGeminiApiWithRetry(endpointUrl, payload, maxRetries = GEMINI_CONFIG.MAX_RETRIES) {
  let attempt = 0;
  let delay = GEMINI_CONFIG.INITIAL_RETRY_DELAY_MS;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Handle rate limit (429) or transient server errors (500, 503)
      if (response.status === 429 || response.status === 500 || response.status === 503) {
        attempt++;
        if (attempt > maxRetries) {
          const errData = await response.json().catch(() => ({}));
          const msg = errData.error?.message || `HTTP ${response.status} (Rate limit / server unavailable)`;
          throw new Error(`Gemini API rate limit or server error: ${msg}`);
        }
        const jitter = Math.random() * 400;
        await sleep(delay + jitter);
        delay *= 2;
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const responseJson = await response.json();
      return responseJson;
    } catch (err) {
      if (err.status && err.status !== 429 && err.status < 500) {
        // Client errors (400, 401, 403, 404) should not be retried blindly
        throw err;
      }
      if (attempt >= maxRetries) {
        throw err;
      }
      attempt++;
      const jitter = Math.random() * 300;
      await sleep(delay + jitter);
      delay *= 2;
    }
  }

  throw new Error('Gemini API call failed: Max retries exceeded.');
}

/**
 * Builds the full Gemini API endpoint URL for a given model and API key.
 * @param {string} model - Gemini model identifier (e.g. 'gemini-2.5-flash')
 * @param {string} apiKey - Gemini API key
 * @returns {string} Fully qualified URL
 */
function buildEndpointUrl(model, apiKey) {
  const cleanKey = encodeURIComponent(apiKey.trim());
  return `${GEMINI_CONFIG.BASE_URL}/${model}:generateContent?key=${cleanKey}`;
}

// ============================================================
// CONNECTION TEST PROBE
// ============================================================

/**
 * Tests connection to Google Gemini API using the provided API key.
 * 
 * @param {string} apiKey - The Gemini API key to validate
 * @param {string} [model] - Optional model identifier (defaults to stored or primary model)
 * @returns {Promise<{ valid: boolean, model?: string, error?: string }>} Validation result object
 */
export async function testConnection(apiKey, model) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return { valid: false, error: 'API key is missing or too short.' };
  }

  const primaryModel = model || getModelPreference() || GEMINI_MODELS.PRIMARY;
  const probePayload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'ping' }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 5,
      temperature: 0.1
    }
  };

  // Attempt connection with primary model
  try {
    const url = buildEndpointUrl(primaryModel, apiKey);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(probePayload)
    });

    if (response.ok) {
      return { valid: true, model: primaryModel };
    }

    // Check if 404 (model not found), then try fallback model
    if (response.status === 404 && primaryModel !== GEMINI_MODELS.FALLBACK) {
      const fallbackUrl = buildEndpointUrl(GEMINI_MODELS.FALLBACK, apiKey);
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(probePayload)
      });
      if (fallbackRes.ok) {
        return { valid: true, model: GEMINI_MODELS.FALLBACK };
      }
    }

    const errData = await response.json().catch(() => ({}));
    return {
      valid: false,
      error: errData.error?.message || `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (netErr) {
    return {
      valid: false,
      error: netErr.message || 'Network error: Unable to reach Google Gemini API endpoints.'
    };
  }
}

// ============================================================
// CONVERSATION PAYLOAD FORMATTERS
// ============================================================

/**
 * Formats transcript turns into Gemini API multi-turn contents schema.
 * @param {Array<{ sender: string, text: string }>} transcript - Array of transcript messages
 * @returns {Array<{ role: string, parts: Array<{ text: string }> }>} Formatted contents array
 */
export function formatContentsFromTranscript(transcript) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return [
      {
        role: 'user',
        parts: [{ text: 'Hello, let us start the architecture interview.' }]
      }
    ];
  }

  const contents = [];
  for (const item of transcript) {
    const role = item.sender === 'user' ? 'user' : 'model';
    const text = typeof item.text === 'string' ? item.text : JSON.stringify(item.text);
    if (text && text.trim().length > 0) {
      contents.push({
        role,
        parts: [{ text: text.trim() }]
      });
    }
  }

  // Ensure first message is user role (Gemini requirement)
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({
      role: 'user',
      parts: [{ text: 'I would like to architect a new software system.' }]
    });
  }

  return contents;
}

// ============================================================
// DYNAMIC QUESTION GENERATION
// ============================================================

/**
 * Calls Gemini API to generate the next dynamic interview question and suggestion chips.
 * 
 * @param {Array<{ sender: string, text: string }>} transcript - Complete conversation transcript so far
 * @param {string} [apiKey] - Gemini API key (defaults to stored key)
 * @param {string} [model] - Gemini model identifier
 * @returns {Promise<{ question: string, options: string[], stageName?: string, currentSummary?: string, isLast?: boolean }>}
 */
export async function generateQuestion(transcript, apiKey, model) {
  const activeKey = apiKey || getApiKey();
  if (!activeKey) {
    throw new Error('Missing Gemini API key: Provide a valid key or switch to Offline Mock mode.');
  }

  const activeModel = model || getModelPreference() || GEMINI_MODELS.PRIMARY;
  const contents = formatContentsFromTranscript(transcript);

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPTS.INTERVIEW_SYSTEM_PROMPT }]
    },
    contents,
    generationConfig: {
      temperature: GEMINI_CONFIG.DEFAULT_TEMPERATURE,
      topP: GEMINI_CONFIG.DEFAULT_TOP_P,
      maxOutputTokens: GEMINI_CONFIG.QUESTION_MAX_TOKENS,
      responseMimeType: 'application/json'
    }
  };

  let responseData;
  try {
    const url = buildEndpointUrl(activeModel, activeKey);
    responseData = await callGeminiApiWithRetry(url, payload);
  } catch (err) {
    // If primary model returned 404, retry once with fallback model
    if (err.status === 404 && activeModel !== GEMINI_MODELS.FALLBACK) {
      console.warn(`[gemini] Model ${activeModel} not found. Retrying with ${GEMINI_MODELS.FALLBACK}...`);
      const fallbackUrl = buildEndpointUrl(GEMINI_MODELS.FALLBACK, activeKey);
      responseData = await callGeminiApiWithRetry(fallbackUrl, payload);
    } else {
      throw err;
    }
  }

  // Extract raw text from candidates
  const candidate = responseData.candidates?.[0];
  const rawText = candidate?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty candidate response.');
  }

  const parsed = extractAndParseJSON(rawText);

  // Normalize and guarantee required fields
  return {
    question: parsed.question || "What are the core technical constraints and requirements for your project?",
    options: Array.isArray(parsed.options) && parsed.options.length > 0
      ? parsed.options.slice(0, 4)
      : ["High scale & low latency", "Rapid MVP development", "Strict data security", "Minimal cloud costs"],
    stageName: parsed.stageName || "Architecture Discovery",
    currentSummary: parsed.currentSummary || "Gathering technical requirements",
    isLast: Boolean(parsed.isLast)
  };
}

// ============================================================
// BLUEPRINT SYNTHESIS
// ============================================================

/**
 * Synthesizes a complete architectural blueprint JSON object from the interview transcript.
 * 
 * @param {Array<{ sender: string, text: string }>} interviewTranscript - Full transcript of the interview
 * @param {string} [apiKey] - Gemini API key (defaults to stored key)
 * @param {string} [model] - Gemini model identifier
 * @returns {Promise<object>} Synthesized Blueprint object strictly conforming to schema
 */
export async function synthesizeBlueprint(interviewTranscript, apiKey, model) {
  const activeKey = apiKey || getApiKey();
  if (!activeKey) {
    throw new Error('Missing Gemini API key: Provide a valid key or switch to Offline Mock mode.');
  }

  const activeModel = model || getModelPreference() || GEMINI_MODELS.PRIMARY;

  // Format transcript into a clear readable summary for synthesis
  const formattedTranscriptText = interviewTranscript
    .map(turn => `${turn.sender === 'user' ? 'User' : 'Architect'}: ${turn.text}`)
    .join('\n');

  const userPrompt = `Generate a comprehensive, production-ready system architecture blueprint for this completed interview session:

TRANSCRIPT:
${formattedTranscriptText}

Follow all instructions in the system prompt. Produce the full JSON blueprint matching the required schema with all sections (summary, stack, schema, architecture, roadmap, resumeImpact). Output raw JSON only.`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPTS.SYNTHESIS_SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: GEMINI_CONFIG.SYNTHESIS_TEMPERATURE,
      topP: GEMINI_CONFIG.DEFAULT_TOP_P,
      maxOutputTokens: GEMINI_CONFIG.SYNTHESIS_MAX_TOKENS,
      responseMimeType: 'application/json'
    }
  };

  let responseData;
  try {
    const url = buildEndpointUrl(activeModel, activeKey);
    responseData = await callGeminiApiWithRetry(url, payload);
  } catch (err) {
    if (err.status === 404 && activeModel !== GEMINI_MODELS.FALLBACK) {
      console.warn(`[gemini] Model ${activeModel} not found. Retrying synthesis with ${GEMINI_MODELS.FALLBACK}...`);
      const fallbackUrl = buildEndpointUrl(GEMINI_MODELS.FALLBACK, activeKey);
      responseData = await callGeminiApiWithRetry(fallbackUrl, payload);
    } else {
      throw err;
    }
  }

  const candidate = responseData.candidates?.[0];
  const rawText = candidate?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty candidate response during blueprint synthesis.');
  }

  const blueprint = extractAndParseJSON(rawText);

  // Validate and sanitize blueprint structure
  if (!blueprint.id) {
    blueprint.id = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  if (!blueprint.timestamp) {
    blueprint.timestamp = new Date().toISOString();
  }

  // Ensure mandatory top-level sections exist
  if (!blueprint.summary) {
    blueprint.summary = {
      title: "System Architecture Blueprint",
      tagline: "High-Performance Cloud Architecture",
      domain: "saas",
      targetScale: "Production Scale",
      estimatedMonthlyCost: "$100 - $300 / mo",
      description: "Custom system architecture engineered by Architect AI."
    };
  }

  if (!blueprint.stack) blueprint.stack = {};
  if (!blueprint.schema) blueprint.schema = { databaseType: "PostgreSQL", tables: [] };
  if (!blueprint.architecture) blueprint.architecture = { mermaid: "flowchart TD\n  Client --> API --> DB[(Database)]", components: [] };
  if (!blueprint.roadmap) blueprint.roadmap = { totalDuration: "6 - 8 Weeks", phases: [] };
  if (!blueprint.resumeImpact) {
    blueprint.resumeImpact = {
      headline: "Full-Stack System Architect",
      bulletPoints: ["Architected scalable web application system."],
      skillsDemonstrated: ["System Architecture", "Cloud Computing"]
    };
  }

  return blueprint;
}
