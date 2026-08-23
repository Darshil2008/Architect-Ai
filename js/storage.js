/**
 * Architect AI — LocalStorage & Session History Manager Module
 * 
 * Provides robust LocalStorage CRUD operations for Gemini API keys,
 * user preferences, and synthesized architecture blueprints with
 * quota guard, FIFO pruning (max 20 items), and safe in-memory fallback.
 * 
 * @module storage
 */

import { STORAGE_KEYS, MAX_HISTORY_ITEMS, GEMINI_MODELS, ENGINE_MODES } from './config.js';

// ============================================================
// IN-MEMORY SAFE FALLBACK STORE
// ============================================================

const memoryStorage = new Map();

/**
 * Checks if the Web Storage API is available and functional in the current environment.
 * @returns {boolean} True if localStorage is accessible and writable.
 */
function isStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__architect_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

/**
 * Low-level safe storage getItem wrapper.
 * @param {string} key - Storage key
 * @returns {string|null} Stored value or null
 */
function getItem(key) {
  try {
    if (storageAvailable) {
      return window.localStorage.getItem(key);
    }
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  } catch (e) {
    console.warn(`[storage] Failed to read key "${key}":`, e);
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  }
}

/**
 * Low-level safe storage setItem wrapper with quota handling.
 * @param {string} key - Storage key
 * @param {string} value - String value to store
 * @returns {boolean} True if write succeeded
 */
function setItem(key, value) {
  try {
    if (storageAvailable) {
      window.localStorage.setItem(key, value);
    }
    memoryStorage.set(key, value);
    return true;
  } catch (e) {
    console.warn(`[storage] Storage setItem failed for "${key}":`, e);
    memoryStorage.set(key, value);
    return false;
  }
}

/**
 * Low-level safe storage removeItem wrapper.
 * @param {string} key - Storage key
 */
function removeItem(key) {
  try {
    if (storageAvailable) {
      window.localStorage.removeItem(key);
    }
    memoryStorage.delete(key);
  } catch (e) {
    console.warn(`[storage] Storage removeItem failed for "${key}":`, e);
    memoryStorage.delete(key);
  }
}

// ============================================================
// API KEY MANAGEMENT
// ============================================================

/**
 * Retrieves the stored Gemini API key, checking primary and legacy keys.
 * @returns {string|null} The stored API key or null if not found.
 */
export function getApiKey() {
  const primary = getItem(STORAGE_KEYS.API_KEY);
  if (primary && primary.trim().length > 0) {
    return primary.trim();
  }
  const legacy = getItem(STORAGE_KEYS.LEGACY_KEY);
  if (legacy && legacy.trim().length > 0) {
    return legacy.trim();
  }
  return null;
}

/**
 * Saves the Gemini API key to persistent storage (writing to both primary and legacy keys).
 * @param {string} key - The raw API key string
 */
export function setApiKey(key) {
  if (typeof key !== 'string' || key.trim().length === 0) {
    clearApiKey();
    return;
  }
  const trimmed = key.trim();
  setItem(STORAGE_KEYS.API_KEY, trimmed);
  setItem(STORAGE_KEYS.LEGACY_KEY, trimmed);
}

/**
 * Clears stored API keys from both primary and legacy storage slots.
 */
export function clearApiKey() {
  removeItem(STORAGE_KEYS.API_KEY);
  removeItem(STORAGE_KEYS.LEGACY_KEY);
}

/**
 * Checks whether a valid Gemini API key is currently saved.
 * @returns {boolean} True if a non-empty API key is present.
 */
export function hasApiKey() {
  const key = getApiKey();
  return typeof key === 'string' && key.length > 5;
}

/**
 * Returns a masked representation of the API key for safe UI display (e.g. "AIzaSy...Ab9X").
 * @param {string} [key] - Optional key to mask; if omitted, retrieves currently stored key.
 * @returns {string} The masked key string or empty string if no key.
 */
export function maskApiKey(key) {
  const targetKey = key !== undefined ? key : getApiKey();
  if (!targetKey || typeof targetKey !== 'string') {
    return '';
  }
  const trimmed = targetKey.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  if (trimmed.length <= 14) {
    return `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
  }
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

// ============================================================
// MODEL & ENGINE MODE PREFERENCES
// ============================================================

/**
 * Retrieves the user's preferred Gemini model identifier.
 * @returns {string} Model identifier (defaults to 'gemini-2.5-flash')
 */
export function getModelPreference() {
  const stored = getItem(STORAGE_KEYS.MODEL);
  return stored && stored.trim().length > 0 ? stored.trim() : GEMINI_MODELS.DEFAULT;
}

/**
 * Saves the user's Gemini model preference.
 * @param {string} model - Model identifier (e.g. 'gemini-2.5-flash', 'gemini-1.5-flash')
 */
export function setModelPreference(model) {
  if (typeof model === 'string' && model.trim().length > 0) {
    setItem(STORAGE_KEYS.MODEL, model.trim());
  }
}

/**
 * Retrieves the active engine execution mode ('auto', 'api', 'mock').
 * @returns {string} Engine mode (defaults to 'auto')
 */
export function getEngineMode() {
  const stored = getItem(STORAGE_KEYS.MODE);
  if (stored === ENGINE_MODES.API || stored === ENGINE_MODES.MOCK) {
    return stored;
  }
  return ENGINE_MODES.AUTO;
}

/**
 * Saves the engine execution mode preference.
 * @param {string} mode - 'auto' | 'api' | 'mock'
 */
export function setEngineMode(mode) {
  if (mode === ENGINE_MODES.AUTO || mode === ENGINE_MODES.API || mode === ENGINE_MODES.MOCK) {
    setItem(STORAGE_KEYS.MODE, mode);
  }
}

// ============================================================
// SESSION HISTORY CRUD & FIFO PRUNING
// ============================================================

/**
 * Retrieves the full list of saved architecture blueprints.
 * Validates array structure and handles corrupt data gracefully.
 * @returns {Array<object>} Array of Blueprint objects sorted newest-first.
 */
export function getHistory() {
  const raw = getItem(STORAGE_KEYS.HISTORY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[storage] History data in storage was not an array. Resetting.');
      return [];
    }
    // Filter out invalid items
    return parsed.filter(item => item && typeof item === 'object' && item.id);
  } catch (e) {
    console.error('[storage] Corrupt JSON in history storage:', e);
    return [];
  }
}

/**
 * Retrieves a single blueprint from history by its unique ID.
 * @param {string} id - Blueprint unique identifier
 * @returns {object|null} The Blueprint object or null if not found.
 */
export function getBlueprintById(id) {
  if (!id) return null;
  const history = getHistory();
  return history.find(bp => bp.id === id) || null;
}

/**
 * Saves a blueprint to LocalStorage session history with FIFO pruning (max 20 items)
 * and automatic storage quota protection.
 * 
 * @param {object} blueprint - The complete Blueprint object to persist
 * @returns {boolean} True if successfully saved
 */
export function saveBlueprint(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    throw new Error('Invalid blueprint: Must provide a valid object.');
  }

  // Ensure mandatory fields exist
  const itemToSave = { ...blueprint };
  if (!itemToSave.id) {
    itemToSave.id = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  if (!itemToSave.timestamp) {
    itemToSave.timestamp = new Date().toISOString();
  }

  let history = getHistory();

  // If item already exists, update it in place; otherwise add to front
  const existingIndex = history.findIndex(bp => bp.id === itemToSave.id);
  if (existingIndex >= 0) {
    history[existingIndex] = itemToSave;
  } else {
    history.unshift(itemToSave);
  }

  // Enforce max history quota (FIFO pruning)
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }

  // Persist with quota-exceeded retry loop
  let success = false;
  while (history.length > 0) {
    try {
      const serialized = JSON.stringify(history);
      if (storageAvailable) {
        window.localStorage.setItem(STORAGE_KEYS.HISTORY, serialized);
      }
      memoryStorage.set(STORAGE_KEYS.HISTORY, serialized);
      success = true;
      break;
    } catch (e) {
      // Storage quota exceeded — prune oldest item and retry
      console.warn('[storage] Storage quota exceeded while saving history. Pruning oldest session...');
      if (history.length > 1) {
        history.pop();
      } else {
        // Even single item fails — fallback to memory storage only
        memoryStorage.set(STORAGE_KEYS.HISTORY, JSON.stringify([itemToSave]));
        break;
      }
    }
  }

  return success;
}

/**
 * Deletes a specific blueprint from session history by ID.
 * @param {string} id - Blueprint ID to delete
 * @returns {boolean} True if item was found and deleted
 */
export function deleteBlueprint(id) {
  if (!id) return false;
  const history = getHistory();
  const initialLength = history.length;
  const updated = history.filter(bp => bp.id !== id);
  if (updated.length !== initialLength) {
    const serialized = JSON.stringify(updated);
    setItem(STORAGE_KEYS.HISTORY, serialized);
    return true;
  }
  return false;
}

/**
 * Clears all blueprint session history from storage.
 */
export function clearHistory() {
  removeItem(STORAGE_KEYS.HISTORY);
}

/**
 * Exports all storage history as formatted JSON string.
 * @returns {string} JSON string of history array
 */
export function exportHistoryAsJSON() {
  const history = getHistory();
  return JSON.stringify(history, null, 2);
}
