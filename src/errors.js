'use strict';

/** Error yang aman ditampilkan ke klien (tanpa isi percakapan). */
class ApiError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const errors = {
  badRequest: (code, message, extra) => new ApiError(400, code, message, extra),
  notFound: (message = 'Data tidak ditemukan.') => new ApiError(404, 'NOT_FOUND', message),
  unprocessable: (code, message, extra) => new ApiError(422, code, message, extra),
  quota: (message, retryAfterSeconds) =>
    new ApiError(429, 'QUOTA_EXCEEDED', message, { retry_after_seconds: retryAfterSeconds }),
};

module.exports = { ApiError, errors };
