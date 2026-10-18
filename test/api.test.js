'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, fakeProvider, makeWav } = require('./helpers');
const { ProviderError } = require('../src/providers/errors');

test('health tidak memerlukan device id', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('GET', '/health', { device: null });
  assert.equal(res.status, 200);
  assert.equal(res.json.status, 'ok');
});

test('endpoint tanpa X-Device-Id ditolak', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const res = await s.call('GET', '/history', { device: null });
  assert.equal(res.status, 400);
  assert.equal(res.json.error.code, 'DEVICE_ID_REQUIRED');
});

test('upload → STT → terjemahan → hasil (FR-04/06/07)', async (t) => {
  const provider = fakeProvider();
  const s = await startServer({ provider });
  t.after(s.close);

  const created = await s.upload();
  assert.equal(created.status, 202);
  assert.match(created.json.job_id, /^tr_/);
  assert.equal(created.json.status, 'queued');

  const job = await s.waitFor(created.json.job_id);
  assert.equal(job.status, 'completed');
  assert.equal(job.source_language, 'en');
  assert.equal(job.target_language, 'id');
  assert.match(job.transcript, /document/);
  assert.match(job.translation, /dokumennya/);
  assert.equal(job.duration_seconds, 1);
  assert.equal(provider.calls.suggestReplies, 0);
});

test('bahasa sumber manual diteruskan dan menggantikan deteksi', async (t) => {
  let seen;
  const provider = fakeProvider({
    async transcribe(args) {
      seen = args.sourceLanguage;
      return { language: 'xx', transcript: 'halo', intelligible: true, confidence: 'medium' };
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload({ source_language: 'en' });
  const job = await s.waitFor(json.job_id);
  assert.equal(seen, 'en');
  assert.equal(job.source_language, 'en');
});

test('bahasa tidak terdeteksi meminta pilihan manual', async (t) => {
  const provider = fakeProvider({
    async transcribe() {
      return { language: 'und', transcript: 'mmm', intelligible: true, confidence: 'low' };
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const job = await s.waitFor(json.job_id);
  assert.equal(job.status, 'failed');
  assert.equal(job.error.code, 'LANGUAGE_NOT_DETECTED');
  assert.equal(provider.calls.translate, 0);
});

test('transkrip tidak jelas gagal dan tidak diterjemahkan', async (t) => {
  const provider = fakeProvider({
    async transcribe() {
      return { language: 'en', transcript: '', intelligible: false, confidence: 'low' };
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const job = await s.waitFor(json.job_id);
  assert.equal(job.status, 'failed');
  assert.equal(job.error.code, 'TRANSCRIPT_EMPTY');
  assert.equal(provider.calls.translate, 0);
  // saran balasan tidak boleh dibuat dari job gagal
  const r = await s.call('POST', `/translations/${json.job_id}/reply-suggestions`, { body: {} });
  assert.equal(r.status, 422);
});

test('bahasa sumber = tujuan tidak memanggil terjemahan', async (t) => {
  const provider = fakeProvider({
    async transcribe() {
      return { language: 'id', transcript: 'Halo apa kabar', intelligible: true, confidence: 'high' };
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const job = await s.waitFor(json.job_id);
  assert.equal(job.translation, 'Halo apa kabar');
  assert.equal(provider.calls.translate, 0);
});

test('kegagalan provider dipetakan ke error aman dan kuota dikembalikan', async (t) => {
  const provider = fakeProvider({
    async transcribe() {
      throw new ProviderError('PROVIDER_TIMEOUT', 'Layanan AI terlalu lama merespons. Coba lagi.', { retryable: true });
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const job = await s.waitFor(json.job_id);
  assert.equal(job.status, 'failed');
  assert.equal(job.error.code, 'PROVIDER_TIMEOUT');
  assert.equal(job.error.retryable, true);
  const usage = await s.call('GET', '/usage');
  assert.equal(usage.json.jobs.used, 0);
});

test('error internal tidak membocorkan isi', async (t) => {
  const provider = fakeProvider({
    async transcribe() {
      throw new Error('rahasia: isi percakapan');
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const job = await s.waitFor(json.job_id);
  assert.equal(job.error.code, 'INTERNAL_ERROR');
  assert.ok(!JSON.stringify(job).includes('rahasia'));
});

test('validasi file (FR-03)', async (t) => {
  const s = await startServer({ configure: (c) => { c.audio.maxBytes = 200_000; c.audio.maxSeconds = 5; } });
  t.after(s.close);

  assert.equal((await s.upload({}, null)).json.error.code, 'AUDIO_REQUIRED');
  assert.equal((await s.upload({}, Buffer.alloc(0))).json.error.code, 'AUDIO_EMPTY');
  assert.equal((await s.upload({}, Buffer.from('ini bukan audio sama sekali'))).json.error.code, 'UNSUPPORTED_AUDIO_FORMAT');
  assert.equal((await s.upload({}, makeWav(15))).json.error.code, 'AUDIO_TOO_LARGE');
  assert.equal((await s.upload({}, makeWav(6))).json.error.code, 'AUDIO_TOO_LONG');
  assert.equal((await s.upload({ target_language: undefined })).json.error.code, 'INVALID_LANGUAGE');
  assert.equal((await s.upload({ target_language: 'xx' })).json.error.code, 'INVALID_LANGUAGE');
  assert.equal((await s.upload({ source_language: 'zz' })).json.error.code, 'INVALID_LANGUAGE');
  assert.equal((await s.upload({})).status, 202);
});

test('Idempotency-Key tidak membuat pekerjaan ganda', async (t) => {
  const provider = fakeProvider();
  const s = await startServer({ provider });
  t.after(s.close);
  const a = await s.upload({}, makeWav(1), { 'idempotency-key': 'abc-123' });
  const b = await s.upload({}, makeWav(1), { 'idempotency-key': 'abc-123' });
  assert.equal(a.status, 202);
  assert.equal(b.status, 200);
  assert.equal(a.json.job_id, b.json.job_id);
  await s.waitFor(a.json.job_id);
  assert.equal(provider.calls.transcribe, 1);
});

test('kuota harian per perangkat (FR-18)', async (t) => {
  const s = await startServer({ configure: (c) => { c.quota.jobsPerDay = 2; } });
  t.after(s.close);
  for (let i = 0; i < 2; i += 1) {
    const r = await s.upload();
    assert.equal(r.status, 202);
    await s.waitFor(r.json.job_id);
  }
  const over = await s.upload();
  assert.equal(over.status, 429);
  assert.equal(over.json.error.code, 'QUOTA_EXCEEDED');
  assert.ok(over.json.error.retry_after_seconds > 0);
  assert.ok(over.headers.get('retry-after'));
});

test('kuota durasi audio harian', async (t) => {
  const s = await startServer({ configure: (c) => { c.quota.audioSecondsPerDay = 3; } });
  t.after(s.close);
  const first = await s.upload({}, makeWav(2));
  assert.equal(first.status, 202);
  const second = await s.upload({}, makeWav(2));
  assert.equal(second.status, 429);
});

test('rate limit per menit', async (t) => {
  const s = await startServer({ configure: (c) => { c.rateLimit.max = 3; } });
  t.after(s.close);
  const statuses = [];
  for (let i = 0; i < 5; i += 1) statuses.push((await s.call('GET', '/history')).status);
  assert.deepEqual(statuses, [200, 200, 200, 429, 429]);
});

test('batas pekerjaan aktif bersamaan', async (t) => {
  const provider = fakeProvider({ transcribe: () => new Promise(() => {}) });
  const s = await startServer({ provider });
  t.after(s.close);
  for (let i = 0; i < 3; i += 1) assert.equal((await s.upload()).status, 202);
  assert.equal((await s.upload()).status, 429);
});

test('pembatalan menghentikan pekerjaan', async (t) => {
  const provider = fakeProvider({
    transcribe: ({ signal }) =>
      new Promise((_, reject) => signal.addEventListener('abort', () => reject(new ProviderError('CANCELLED', 'dibatalkan')))),
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  const cancel = await s.call('POST', `/translations/${json.job_id}/cancel`);
  assert.equal(cancel.json.status, 'cancelled');
  const job = await s.waitFor(json.job_id);
  assert.equal(job.status, 'cancelled');
  assert.equal((await s.call('GET', '/usage')).json.jobs.used, 0);
});

test('saran balasan tanpa mengulang STT (FR-08/09)', async (t) => {
  const provider = fakeProvider();
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  await s.waitFor(json.job_id);

  const res = await s.call('POST', `/translations/${json.job_id}/reply-suggestions`, {
    body: { tone: 'polite', count: 3, reply_language: 'en', include_localized_explanation: true },
  });
  assert.equal(res.status, 200);
  assert.equal(res.json.suggestions.length, 3);
  assert.ok(res.json.suggestions.every((x) => x.text && x.localized_text && x.intent));
  assert.equal(provider.calls.transcribe, 1);

  const two = await s.call('POST', `/translations/${json.job_id}/reply-suggestions`, { body: { count: 2, include_localized_explanation: false } });
  assert.equal(two.json.suggestions.length, 2);
  assert.equal(two.json.suggestions[0].localized_text, undefined);

  // hasil terakhir ikut muncul di GET job
  const job = await s.waitFor(json.job_id);
  assert.equal(job.reply_suggestions.suggestions.length, 2);
});

test('parameter saran balasan divalidasi', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const { json } = await s.upload();
  await s.waitFor(json.job_id);
  const path = `/translations/${json.job_id}/reply-suggestions`;
  assert.equal((await s.call('POST', path, { body: { tone: 'galak' } })).json.error.code, 'INVALID_TONE');
  assert.equal((await s.call('POST', path, { body: { count: 4 } })).json.error.code, 'INVALID_COUNT');
  assert.equal((await s.call('POST', path, { body: { reply_language: 'xx' } })).json.error.code, 'INVALID_LANGUAGE');
});

test('generate_reply_suggestions membuat saran otomatis; kegagalannya tidak menggagalkan job', async (t) => {
  const s1 = await startServer();
  t.after(s1.close);
  const a = await s1.upload({ generate_reply_suggestions: 'true' });
  const jobA = await s1.waitFor(a.json.job_id);
  assert.equal(jobA.status, 'completed');
  assert.equal(jobA.reply_suggestions.suggestions.length, 3);

  const s2 = await startServer({
    provider: fakeProvider({
      async suggestReplies() {
        throw new ProviderError('INVALID_OUTPUT', 'x', { retryable: true });
      },
    }),
  });
  t.after(s2.close);
  const b = await s2.upload({ generate_reply_suggestions: 'true' });
  const jobB = await s2.waitFor(b.json.job_id);
  assert.equal(jobB.status, 'completed');
  assert.equal(jobB.reply_suggestions, undefined);
});

test('kegagalan provider pada saran balasan → error aman + retry (FR-16)', async (t) => {
  let fail = true;
  const provider = fakeProvider({
    async suggestReplies(args) {
      if (fail) throw new ProviderError('PROVIDER_UNAVAILABLE', 'Layanan AI sedang bermasalah. Coba lagi.', { retryable: true });
      return fakeProvider().suggestReplies(args);
    },
  });
  const s = await startServer({ provider });
  t.after(s.close);
  const { json } = await s.upload();
  await s.waitFor(json.job_id);
  const path = `/translations/${json.job_id}/reply-suggestions`;
  const bad = await s.call('POST', path, { body: {} });
  assert.equal(bad.status, 503);
  assert.equal(bad.json.error.retryable, true);
  fail = false;
  assert.equal((await s.call('POST', path, { body: {} })).status, 200);
  // kuota saran dikembalikan saat gagal: hanya 1 yang terpakai
  assert.equal((await s.call('GET', '/usage')).json.reply_suggestions.used, 1);
});

test('job milik perangkat lain tidak dapat diakses', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const { json } = await s.upload();
  const other = await s.call('GET', `/translations/${json.job_id}`, { device: 'another-device-0123456789' });
  assert.equal(other.status, 404);
});

test('riwayat, hapus item, dan hapus semua data (FR-15/17)', async (t) => {
  const s = await startServer();
  t.after(s.close);
  const ids = [];
  for (let i = 0; i < 2; i += 1) {
    const { json } = await s.upload();
    await s.waitFor(json.job_id);
    ids.push(json.job_id);
  }
  assert.equal((await s.call('GET', '/history')).json.items.length, 2);

  assert.equal((await s.call('DELETE', `/history/${ids[0]}`)).status, 204);
  assert.equal((await s.call('GET', `/translations/${ids[0]}`)).status, 404);
  assert.equal((await s.call('DELETE', `/history/${ids[0]}`)).status, 404);

  await s.call('PATCH', '/preferences', { body: { target_language: 'en' } });
  const del = await s.call('DELETE', '/user-data');
  assert.equal(del.json.deleted_jobs, 1);
  assert.equal((await s.call('GET', '/history')).json.items.length, 0);
  assert.equal((await s.call('GET', '/preferences')).json.target_language, 'id');
});

test('job kedaluwarsa dihapus sesuai retensi', async (t) => {
  let clock = 1_000_000;
  const { createApp } = require('../src/app');
  const { loadConfig } = require('../src/config');
  const config = loadConfig({ JOB_TTL_MINUTES: '1' });
  const { store } = createApp({ config, provider: fakeProvider(), logger: { info() {}, warn() {}, error() {} }, now: () => clock });
  store.create({ id: 'tr_x', deviceId: 'd', status: 'completed' });
  assert.ok(store.get('tr_x', 'd'));
  clock += 61_000;
  assert.equal(store.get('tr_x', 'd'), null);
});

test('preferences GET/PATCH', async (t) => {
  const s = await startServer();
  t.after(s.close);
  assert.equal((await s.call('GET', '/preferences')).json.target_language, 'id');
  const patched = await s.call('PATCH', '/preferences', { body: { target_language: 'en', default_tone: 'polite', source_language: 'id' } });
  assert.deepEqual(patched.json, { target_language: 'en', source_language: 'id', default_tone: 'polite' });
  assert.equal((await s.call('PATCH', '/preferences', { body: { default_tone: 'x' } })).status, 400);
  assert.equal((await s.call('GET', '/languages')).json.languages.length > 1, true);
});

test('route tidak dikenal dan JSON rusak', async (t) => {
  const s = await startServer();
  t.after(s.close);
  assert.equal((await s.call('GET', '/nope')).status, 404);
  const res = await fetch(`${s.base}/preferences`, { method: 'PATCH', headers: { 'x-device-id': s.device, 'content-type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
});
