'use strict';

/** Error dari provider AI, sudah dipetakan ke kode dan pesan yang aman. */
class ProviderError extends Error {
  constructor(code, message, { retryable = false, status, retryAfterMs = null } = {}) {
    super(message);
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

module.exports = { ProviderError };
