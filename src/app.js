'use strict';

const express = require('express');
const { ApiError } = require('./errors');
const { ProviderError } = require('./providers/errors');
const { requireDevice } = require('./middleware/device');
const { rateLimit } = require('./middleware/rateLimit');
const { createJobStore } = require('./services/jobStore');
const { createQuota } = require('./services/quota');
const { createTranslationService } = require('./services/translationService');
const { translationsRouter } = require('./routes/translations');
const { miscRouter } = require('./routes/misc');

const PROVIDER_STATUS = {
  PROVIDER_RATE_LIMITED: 503,
  PROVIDER_UNAVAILABLE: 503,
  PROVIDER_NETWORK: 503,
  PROVIDER_TIMEOUT: 504,
  CONTENT_BLOCKED: 422,
};

function createApp({ config, provider, logger = console, now }) {
  const store = createJobStore({ ttlMs: config.retention.jobTtlMs, now });
  const quota = createQuota(config.quota, { now });
  const service = createTranslationService({ provider, store, quota, logger });
  const deps = { config, provider, store, quota, service };

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '32kb' }));

  // Log hanya metadata; tidak pernah isi body, audio, header otorisasi, atau device id penuh.
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => logger.info?.(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`));
    next();
  });

  app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', provider: provider.name }));

  const api = express.Router();
  api.use(requireDevice);
  api.use(rateLimit(config.rateLimit));
  api.use('/translations', translationsRouter(deps));
  api.use('/', miscRouter(deps));
  app.use('/api/v1', api);

  app.use((_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
      if (err.extra.retry_after_seconds) res.set('Retry-After', String(err.extra.retry_after_seconds));
      return res.status(err.status).json({ error: { code: err.code, message: err.message, ...err.extra } });
    }
    if (err instanceof ProviderError) {
      return res.status(PROVIDER_STATUS[err.code] || 502).json({ error: { code: err.code, message: err.message, retryable: err.retryable } });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Body JSON tidak valid.' } });
    }
    logger.error?.(`unhandled error: ${err.code || err.name}`);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server.' } });
  });

  return { app, store, quota, service };
}

module.exports = { createApp };
