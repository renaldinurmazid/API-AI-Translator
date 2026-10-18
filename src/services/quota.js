'use strict';

const { errors } = require('../errors');

const DAY_MS = 24 * 60 * 60 * 1000;

/** Kuota harian per perangkat (jendela UTC). In-memory; ganti dengan DB untuk multi-instance. */
function createQuota(limits, { now = Date.now } = {}) {
  const usage = new Map(); // deviceId -> { day, jobs, audioSeconds, replies }

  const dayOf = () => Math.floor(now() / DAY_MS);
  const secondsUntilReset = () => Math.ceil(((dayOf() + 1) * DAY_MS - now()) / 1000);

  function entry(deviceId) {
    let u = usage.get(deviceId);
    if (!u || u.day !== dayOf()) {
      u = { day: dayOf(), jobs: 0, audioSeconds: 0, replies: 0 };
      usage.set(deviceId, u);
    }
    return u;
  }

  return {
    consumeJob(deviceId, audioSeconds) {
      const u = entry(deviceId);
      if (u.jobs + 1 > limits.jobsPerDay) {
        throw errors.quota(`Batas ${limits.jobsPerDay} terjemahan per hari tercapai.`, secondsUntilReset());
      }
      if (u.audioSeconds + audioSeconds > limits.audioSecondsPerDay) {
        throw errors.quota('Batas durasi audio harian tercapai.', secondsUntilReset());
      }
      u.jobs += 1;
      u.audioSeconds += audioSeconds;
    },
    refundJob(deviceId, audioSeconds) {
      const u = entry(deviceId);
      u.jobs = Math.max(0, u.jobs - 1);
      u.audioSeconds = Math.max(0, u.audioSeconds - audioSeconds);
    },
    consumeReply(deviceId) {
      const u = entry(deviceId);
      if (u.replies + 1 > limits.replySuggestionsPerDay) {
        throw errors.quota('Batas saran balasan harian tercapai.', secondsUntilReset());
      }
      u.replies += 1;
    },
    refundReply(deviceId) {
      const u = entry(deviceId);
      u.replies = Math.max(0, u.replies - 1);
    },
    snapshot(deviceId) {
      const u = entry(deviceId);
      return {
        jobs: { used: u.jobs, limit: limits.jobsPerDay },
        audio_seconds: { used: u.audioSeconds, limit: limits.audioSecondsPerDay },
        reply_suggestions: { used: u.replies, limit: limits.replySuggestionsPerDay },
        resets_in_seconds: secondsUntilReset(),
      };
    },
  };
}

module.exports = { createQuota };
