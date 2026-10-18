'use strict';

const { ProviderError } = require('./errors');

const INTENTS = ['accept', 'decline', 'clarify', 'ask_for_time', 'acknowledge', 'other'];
const CONFIDENCE = ['high', 'medium', 'low'];

// Schema untuk responseSchema Gemini (subset OpenAPI).
const transcriptionSchema = {
  type: 'OBJECT',
  properties: {
    language: { type: 'STRING' },
    transcript: { type: 'STRING' },
    intelligible: { type: 'BOOLEAN' },
    confidence: { type: 'STRING', enum: CONFIDENCE },
  },
  required: ['language', 'transcript', 'intelligible', 'confidence'],
};

const translationSchema = {
  type: 'OBJECT',
  properties: { translation: { type: 'STRING' } },
  required: ['translation'],
};

const replySchema = {
  type: 'OBJECT',
  properties: {
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          intent: { type: 'STRING', enum: INTENTS },
          text: { type: 'STRING' },
          localized_text: { type: 'STRING' },
        },
        required: ['intent', 'text', 'localized_text'],
      },
    },
  },
  required: ['suggestions'],
};

const invalid = (what) => new ProviderError('INVALID_OUTPUT', `Output AI untuk ${what} tidak valid.`, { retryable: true });

function validateTranscription(data) {
  if (!data || typeof data !== 'object' || typeof data.transcript !== 'string') throw invalid('transkripsi');
  const language = typeof data.language === 'string' ? data.language.trim().toLowerCase().split(/[-_]/)[0] : 'und';
  const transcript = data.transcript.trim();
  const intelligible = data.intelligible !== false && transcript.length > 0;
  const confidence = CONFIDENCE.includes(data.confidence) ? data.confidence : 'medium';
  return { language, transcript, intelligible, confidence };
}

function validateTranslation(data) {
  if (!data || typeof data.translation !== 'string' || !data.translation.trim()) throw invalid('terjemahan');
  return { translation: data.translation.trim() };
}

function validateReplies(data, { count, includeExplanation }) {
  if (!data || !Array.isArray(data.suggestions)) throw invalid('saran balasan');
  const suggestions = [];
  for (const item of data.suggestions) {
    if (!item || typeof item.text !== 'string' || !item.text.trim()) continue;
    const s = {
      id: `reply_${suggestions.length + 1}`,
      intent: INTENTS.includes(item.intent) ? item.intent : 'other',
      text: item.text.trim(),
    };
    if (includeExplanation && typeof item.localized_text === 'string' && item.localized_text.trim()) {
      s.localized_text = item.localized_text.trim();
    }
    suggestions.push(s);
    if (suggestions.length === count) break;
  }
  if (suggestions.length === 0) throw invalid('saran balasan');
  return suggestions;
}

module.exports = {
  transcriptionSchema,
  translationSchema,
  replySchema,
  validateTranscription,
  validateTranslation,
  validateReplies,
};
