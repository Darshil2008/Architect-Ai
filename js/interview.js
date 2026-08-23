/**
 * Architect AI — Dynamic Adaptive Interview State Machine
 * 
 * Orchestrates the 4-6 turn architecture discovery interview, managing
 * stage transitions, dynamic chip suggestions, typing animations,
 * seamless Gemini API <-> Offline Mock Engine fallback, and blueprint synthesis.
 * 
 * @module interview
 */

import { INTERVIEW_STAGES, TOTAL_INTERVIEW_STAGES, ENGINE_MODES } from './config.js';
import { getApiKey, getModelPreference, getEngineMode, saveBlueprint } from './storage.js';
import { generateQuestion as geminiGenerateQuestion, synthesizeBlueprint as geminiSynthesizeBlueprint } from './gemini.js';
import { classifyDomain, getMockQuestion, generateMockBlueprint } from './mockEngine.js';

export class InterviewEngine {
  /**
   * Initializes a new InterviewEngine instance.
   * @param {object} [options] - Configuration options
   * @param {string} [options.mode] - 'auto' | 'api' | 'mock'
   * @param {string} [options.model] - Gemini model name
   */
  constructor(options = {}) {
    this.mode = options.mode || getEngineMode() || ENGINE_MODES.AUTO;
    this.model = options.model || getModelPreference();
    this.eventListeners = new Map();
    this.reset();
  }

  // ============================================================
  // EVENT EMITTER SUBSCRIPTION SYSTEM
  // ============================================================

  /**
   * Subscribes a listener callback to an engine event.
   * Supported events: 'stageChange', 'message', 'typingStart', 'typingEnd', 'chipsUpdate', 'blueprintReady', 'error', 'reset'
   * 
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (typeof callback !== 'function') return;
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Unsubscribes a listener callback from an engine event.
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Emits an event to all registered listeners.
   * @param {string} event - Event name
   * @param {*} data - Event payload
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      for (const listener of this.eventListeners.get(event)) {
        try {
          listener(data);
        } catch (err) {
          console.error(`[interview] Error in event listener for "${event}":`, err);
        }
      }
    }
  }

  // ============================================================
  // STATE MANAGEMENT & RESET
  // ============================================================

  /**
   * Resets the interview state machine to initial empty state.
   */
  reset() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.stageIndex = 0;
    this.totalStages = TOTAL_INTERVIEW_STAGES; // 5 question stages
    this.status = 'idle'; // 'idle' | 'in_progress' | 'synthesizing' | 'completed' | 'error'
    this.isComplete = false;
    this.transcript = [];
    this.collectedAnswers = {
      idea: '',
      scale: '',
      techStack: '',
      storage: '',
      constraints: '',
      domain: ''
    };
    this.currentQuestion = null;
    this.currentOptions = [];
    this.currentSummary = 'Awaiting project idea';
    this.activeBlueprint = null;

    this.emit('reset', {});
  }

  /**
   * Returns a snapshot copy of the current interview state.
   * @returns {object} State snapshot
   */
  getCurrentState() {
    return {
      sessionId: this.sessionId,
      stageIndex: this.stageIndex,
      totalStages: this.totalStages,
      currentStage: INTERVIEW_STAGES[this.stageIndex] || INTERVIEW_STAGES[0],
      status: this.status,
      isComplete: this.isComplete,
      transcript: [...this.transcript],
      collectedAnswers: { ...this.collectedAnswers },
      currentQuestion: this.currentQuestion,
      currentOptions: [...this.currentOptions],
      currentSummary: this.currentSummary,
      activeBlueprint: this.activeBlueprint ? JSON.parse(JSON.stringify(this.activeBlueprint)) : null,
      mode: this.mode,
      model: this.model
    };
  }

  /**
   * Sets the active engine mode ('auto', 'api', 'mock').
   * @param {string} mode - Engine mode
   */
  setEngineMode(mode) {
    if (mode === ENGINE_MODES.AUTO || mode === ENGINE_MODES.API || mode === ENGINE_MODES.MOCK) {
      this.mode = mode;
    }
  }

  /**
   * Sets the preferred Gemini model name.
   * @param {string} model - Model identifier
   */
  setModel(model) {
    if (typeof model === 'string' && model.trim().length > 0) {
      this.model = model.trim();
    }
  }

  // ============================================================
  // INTERVIEW PROGRESSION & SUBMISSION
  // ============================================================

  /**
   * Starts the architecture interview, returning the initial discovery question.
   * 
   * @param {string} [initialIdea] - Optional pre-filled project idea
   * @returns {Promise<{ question: string, options: string[], stageName: string, isLast: boolean, currentSummary: string }>}
   */
  async startInterview(initialIdea) {
    this.reset();
    this.status = 'in_progress';

    const stage = INTERVIEW_STAGES[0];
    this.emit('stageChange', {
      stage: stage.id,
      stageIndex: 0,
      totalStages: this.totalStages,
      stageName: stage.name
    });

    const initialQ = getMockQuestion(0, {}, 'saas');
    this.currentQuestion = initialQ.question;
    this.currentOptions = initialQ.options;
    this.currentSummary = initialQ.currentSummary;

    // Record initial bot greeting message
    this.transcript.push({
      turn: 0,
      sender: 'bot',
      text: this.currentQuestion,
      timestamp: Date.now(),
      stage: stage.id
    });

    this.emit('message', {
      sender: 'bot',
      text: this.currentQuestion,
      isInitial: true
    });

    this.emit('chipsUpdate', { options: this.currentOptions });

    if (initialIdea && typeof initialIdea === 'string' && initialIdea.trim().length > 0) {
      return await this.submitAnswer(initialIdea.trim());
    }

    return {
      question: this.currentQuestion,
      options: this.currentOptions,
      stageName: stage.name,
      isLast: false,
      currentSummary: this.currentSummary
    };
  }

  /**
   * Submits a user answer for the current interview question and advances the state machine.
   * 
   * @param {string} answerText - The user's response or chosen chip text
   * @returns {Promise<{ isComplete: boolean, nextQuestion?: object, blueprint?: object, currentSummary?: string }>}
   */
  async submitAnswer(answerText) {
    if (!answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
      throw new Error('Answer text cannot be empty.');
    }

    const trimmedAnswer = answerText.trim();
    const currentStage = INTERVIEW_STAGES[this.stageIndex] || INTERVIEW_STAGES[0];

    // Store user response in transcript
    this.transcript.push({
      turn: this.stageIndex,
      sender: 'user',
      text: trimmedAnswer,
      timestamp: Date.now(),
      stage: currentStage.id
    });

    this.emit('message', {
      sender: 'user',
      text: trimmedAnswer
    });

    // Save answer into collected requirements store
    if (this.stageIndex === 0) {
      this.collectedAnswers.idea = trimmedAnswer;
      this.collectedAnswers.domain = classifyDomain(trimmedAnswer);
    } else if (this.stageIndex === 1) {
      this.collectedAnswers.scale = trimmedAnswer;
    } else if (this.stageIndex === 2) {
      this.collectedAnswers.techStack = trimmedAnswer;
    } else if (this.stageIndex === 3) {
      this.collectedAnswers.storage = trimmedAnswer;
    } else if (this.stageIndex === 4) {
      this.collectedAnswers.constraints = trimmedAnswer;
    }

    // Advance to next stage index
    this.stageIndex++;

    // Check if interview questions are complete (all 5 question stages probed)
    if (this.stageIndex >= this.totalStages) {
      return await this.synthesizeAndFinalizeBlueprint();
    }

    // Generate the next adaptive question
    const nextStage = INTERVIEW_STAGES[this.stageIndex];
    this.emit('stageChange', {
      stage: nextStage.id,
      stageIndex: this.stageIndex,
      totalStages: this.totalStages,
      stageName: nextStage.name
    });

    let nextQuestionData;
    let usedFallback = false;

    // Check if we should attempt Live Gemini API
    const hasKey = Boolean(getApiKey());
    const shouldTryLiveApi = (this.mode === ENGINE_MODES.API || this.mode === ENGINE_MODES.AUTO) && hasKey;

    if (shouldTryLiveApi) {
      try {
        nextQuestionData = await geminiGenerateQuestion(this.transcript, getApiKey(), this.model);
      } catch (apiErr) {
        console.warn('[interview] Live Gemini API question generation failed. Falling back to Mock Engine:', apiErr);
        usedFallback = true;
        this.emit('error', { error: apiErr, fallbackUsed: true });
        // Fallback to intelligent mock question generator
        nextQuestionData = getMockQuestion(this.stageIndex, this.collectedAnswers, this.collectedAnswers.domain);
      }
    } else {
      // Use intelligent offline mock question generator
      nextQuestionData = getMockQuestion(this.stageIndex, this.collectedAnswers, this.collectedAnswers.domain);
    }

    this.currentQuestion = nextQuestionData.question;
    this.currentOptions = nextQuestionData.options || [];
    this.currentSummary = nextQuestionData.currentSummary || `Stage: ${nextStage.name}`;

    // Record bot question in transcript
    this.transcript.push({
      turn: this.stageIndex,
      sender: 'bot',
      text: this.currentQuestion,
      timestamp: Date.now(),
      stage: nextStage.id
    });

    this.emit('message', {
      sender: 'bot',
      text: this.currentQuestion,
      usedFallback
    });

    this.emit('chipsUpdate', { options: this.currentOptions });

    return {
      isComplete: false,
      nextQuestion: {
        question: this.currentQuestion,
        options: this.currentOptions,
        stageName: nextStage.name,
        isLast: nextQuestionData.isLast || (this.stageIndex >= this.totalStages - 1),
        currentSummary: this.currentSummary
      },
      currentSummary: this.currentSummary
    };
  }

  // ============================================================
  // BLUEPRINT SYNTHESIS & FINALIZATION
  // ============================================================

  /**
   * Synthesizes and finalizes the complete architectural blueprint JSON.
   * @returns {Promise<{ isComplete: boolean, blueprint: object, currentSummary: string }>}
   */
  async synthesizeAndFinalizeBlueprint() {
    this.status = 'synthesizing';
    const synthesisStage = INTERVIEW_STAGES[5]; // SYNTHESIS stage

    this.emit('stageChange', {
      stage: synthesisStage.id,
      stageIndex: 5,
      totalStages: this.totalStages,
      stageName: synthesisStage.name
    });

    let blueprint;
    let usedFallback = false;

    const hasKey = Boolean(getApiKey());
    const shouldTryLiveApi = (this.mode === ENGINE_MODES.API || this.mode === ENGINE_MODES.AUTO) && hasKey;

    if (shouldTryLiveApi) {
      try {
        blueprint = await geminiSynthesizeBlueprint(this.transcript, getApiKey(), this.model);
      } catch (apiErr) {
        console.warn('[interview] Live Gemini API synthesis failed. Falling back to Mock Engine:', apiErr);
        usedFallback = true;
        this.emit('error', { error: apiErr, fallbackUsed: true });
        blueprint = generateMockBlueprint(this.collectedAnswers);
      }
    } else {
      blueprint = generateMockBlueprint(this.collectedAnswers);
    }

    // Persist synthesized blueprint into LocalStorage history
    try {
      saveBlueprint(blueprint);
    } catch (saveErr) {
      console.warn('[interview] Failed to save blueprint to session history:', saveErr);
    }

    this.activeBlueprint = blueprint;
    this.status = 'completed';
    this.isComplete = true;
    this.currentSummary = `Architecture Synthesized: ${blueprint.summary?.title || 'Complete'}`;

    this.emit('blueprintReady', {
      blueprint,
      usedFallback
    });

    return {
      isComplete: true,
      blueprint,
      currentSummary: this.currentSummary
    };
  }

  // ============================================================
  // TYPING ANIMATION HELPER
  // ============================================================

  /**
   * Simulates a smooth typewriter character streaming effect for AI chat responses.
   * 
   * @param {string} text - Full text string to stream
   * @param {Function} onProgress - Callback receiving partial string chunk: (partial: string) => void
   * @param {number} [speedMs=18] - Delay in milliseconds per character
   * @returns {Promise<void>} Resolves when typing simulation completes
   */
  simulateTyping(text, onProgress, speedMs = 18) {
    return new Promise(resolve => {
      if (typeof onProgress !== 'function' || !text) {
        if (typeof onProgress === 'function') onProgress(text);
        resolve();
        return;
      }

      this.emit('typingStart', { text });

      if (typeof setInterval === 'undefined') {
        onProgress(text);
        this.emit('typingEnd', { text });
        resolve();
        return;
      }

      let index = 0;
      const totalLen = text.length;

      const interval = setInterval(() => {
        index += 2; // Stream 2 chars per tick for smooth natural velocity
        if (index >= totalLen) {
          clearInterval(interval);
          onProgress(text);
          this.emit('typingEnd', { text });
          resolve();
        } else {
          onProgress(text.slice(0, index));
        }
      }, speedMs);
    });
  }
}
