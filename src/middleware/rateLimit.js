'use strict';

const { errors } = require('../errors');

/** Fixed-window rate limit per perangkat (atau IP bila belum teridentifikasi). */
function rateLimit({ windowMs, max, now = Date.now }) {
  const hits = new Map();
  const timer = setInterval(() => {
    const t = now();
    for (const [key, v] of hits) if (v.resetAt <= t) hits.delete(key);
  }, windowMs);
  timer.unref();

  return function limiter(req, res, next) {
    const key = req.deviceId || req.ip;
    const t = now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      entry = { count: 0, resetAt: t + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    const retryAfter = Math.ceil((entry.resetAt - t) / 1000);
    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.set('Retry-After', String(retryAfter));
      throw errors.quota('Terlalu banyak permintaan. Coba lagi sebentar lagi.', retryAfter);
    }
    next();
  };
}

module.exports = { rateLimit };
