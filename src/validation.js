'use strict';

const { errors } = require('./errors');

const LANGUAGES = {
  en: 'English',
  id: 'Indonesian',
  ms: 'Malay',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  th: 'Thai',
  vi: 'Vietnamese',
  pt: 'Portuguese',
  ru: 'Russian',
  hi: 'Hindi',
  tr: 'Turkish',
};

const TONES = ['casual', 'polite', 'professional'];
const MAX_SUGGESTIONS = 3;

function languageName(code) {
  return LANGUAGES[code] || code;
}

function parseLanguage(value, { field, required }) {
  if (value === undefined || value === null || value === '' || value === 'auto') {
    if (required) throw errors.badRequest('INVALID_LANGUAGE', `${field} wajib diisi.`);
    return null;
  }
  const code = String(value).trim().toLowerCase().split(/[-_]/)[0];
  if (!LANGUAGES[code]) {
    throw errors.badRequest('INVALID_LANGUAGE', `Bahasa "${value}" pada ${field} belum didukung.`, {
      supported: Object.keys(LANGUAGES),
    });
  }
  return code;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
}

function parseTone(value) {
  const tone = value === undefined ? 'casual' : String(value).toLowerCase();
  if (!TONES.includes(tone)) {
    throw errors.badRequest('INVALID_TONE', `Gaya balasan harus salah satu dari: ${TONES.join(', ')}.`);
  }
  return tone;
}

function parseCount(value) {
  if (value === undefined) return MAX_SUGGESTIONS;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SUGGESTIONS) {
    throw errors.badRequest('INVALID_COUNT', `count harus bilangan bulat 1-${MAX_SUGGESTIONS}.`);
  }
  return n;
}

module.exports = {
  LANGUAGES,
  TONES,
  MAX_SUGGESTIONS,
  languageName,
  parseLanguage,
  parseBoolean,
  parseTone,
  parseCount,
};
