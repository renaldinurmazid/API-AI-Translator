'use strict';

const int = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

function loadConfig(env = process.env) {
  return {
    port: int(env.PORT, 3000),
    host: env.HOST || '0.0.0.0',
    provider: {
      name: env.AI_PROVIDER || 'gemini',
      apiKey: env.GEMINI_API_TOKEN || env.GEMINI_API_KEY || '',
      model: env.GEMINI_MODEL || 'gemini-2.5-flash',
      baseUrl: env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
      timeoutMs: int(env.PROVIDER_TIMEOUT_MS, 60_000),
      maxRetries: Math.min(int(env.PROVIDER_MAX_RETRIES, 1), 2),
      maxRateLimitWaitMs: int(env.PROVIDER_MAX_RATE_LIMIT_WAIT_MS, 45_000),
      maxOutputTokens: int(env.PROVIDER_MAX_OUTPUT_TOKENS, 4096),
    },
    audio: {
      maxBytes: int(env.MAX_AUDIO_BYTES, 10 * 1024 * 1024),
      maxSeconds: int(env.MAX_AUDIO_SECONDS, 180),
    },
    quota: {
      jobsPerDay: int(env.QUOTA_JOBS_PER_DAY, 30),
      audioSecondsPerDay: int(env.QUOTA_AUDIO_SECONDS_PER_DAY, 1800),
      replySuggestionsPerDay: int(env.QUOTA_REPLIES_PER_DAY, 100),
    },
    rateLimit: {
      windowMs: int(env.RATE_LIMIT_WINDOW_MS, 60_000),
      max: int(env.RATE_LIMIT_MAX, 30),
    },
    retention: {
      // Hasil (teks) disimpan sementara; audio tidak pernah disimpan.
      jobTtlMs: int(env.JOB_TTL_MINUTES, 24 * 60) * 60_000,
    },
  };
}

module.exports = { loadConfig };
