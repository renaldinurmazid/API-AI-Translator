'use strict';

const { createGeminiProvider } = require('./gemini');

function createProvider(cfg) {
  switch (cfg.name) {
    case 'gemini':
      return createGeminiProvider(cfg);
    default:
      throw new Error(`Provider AI tidak dikenal: ${cfg.name}`);
  }
}

module.exports = { createProvider };
