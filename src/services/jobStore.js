'use strict';

const ACTIVE = new Set(['queued', 'transcribing', 'translating', 'suggesting']);

/**
 * Penyimpanan job sementara di memori dengan TTL. Hanya teks (transkrip,
 * terjemahan, saran) yang disimpan; audio tidak pernah masuk ke store ini.
 * Interface ini sengaja kecil agar mudah diganti dengan PostgreSQL.
 */
function createJobStore({ ttlMs, now = Date.now }) {
  const jobs = new Map();
  const idempotency = new Map(); // `${deviceId}:${key}` -> jobId
  const preferences = new Map(); // deviceId -> prefs
  const controllers = new Map(); // jobId -> AbortController

  const purge = () => {
    const t = now();
    for (const [id, job] of jobs) {
      if (job.expiresAt <= t && !ACTIVE.has(job.status)) remove(id);
    }
  };

  function remove(id) {
    const job = jobs.get(id);
    if (!job) return false;
    controllers.get(id)?.abort();
    controllers.delete(id);
    jobs.delete(id);
    if (job.idempotencyKey) idempotency.delete(`${job.deviceId}:${job.idempotencyKey}`);
    return true;
  }

  return {
    create(job) {
      const record = { ...job, createdAt: now(), updatedAt: now(), expiresAt: now() + ttlMs };
      jobs.set(record.id, record);
      if (record.idempotencyKey) idempotency.set(`${record.deviceId}:${record.idempotencyKey}`, record.id);
      return record;
    },
    get(id, deviceId) {
      purge();
      const job = jobs.get(id);
      return job && job.deviceId === deviceId ? job : null;
    },
    findByIdempotencyKey(deviceId, key) {
      const id = idempotency.get(`${deviceId}:${key}`);
      return id ? this.get(id, deviceId) : null;
    },
    update(id, patch) {
      const job = jobs.get(id);
      if (!job) return null;
      Object.assign(job, patch, { updatedAt: now() });
      return job;
    },
    list(deviceId) {
      purge();
      return [...jobs.values()].filter((j) => j.deviceId === deviceId).sort((a, b) => b.createdAt - a.createdAt);
    },
    countActive(deviceId) {
      return [...jobs.values()].filter((j) => j.deviceId === deviceId && ACTIVE.has(j.status)).length;
    },
    remove(id, deviceId) {
      const job = jobs.get(id);
      return job && job.deviceId === deviceId ? remove(id) : false;
    },
    removeAll(deviceId) {
      let n = 0;
      for (const job of [...jobs.values()]) if (job.deviceId === deviceId && remove(job.id)) n += 1;
      preferences.delete(deviceId);
      return n;
    },
    setController: (id, controller) => controllers.set(id, controller),
    getController: (id) => controllers.get(id),
    clearController: (id) => controllers.delete(id),
    getPreferences: (deviceId) => preferences.get(deviceId),
    setPreferences: (deviceId, prefs) => preferences.set(deviceId, prefs),
    sweep: purge,
  };
}

module.exports = { createJobStore, ACTIVE };
