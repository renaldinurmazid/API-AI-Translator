'use strict';

const { loadConfig } = require('../src/config');
const { createApp } = require('../src/app');

const silentLogger = { info() {}, warn() {}, error() {} };

/** WAV PCM 16-bit mono 8kHz berisi keheningan. */
function makeWav(seconds = 1) {
  const sampleRate = 8000;
  const dataLen = sampleRate * 2 * seconds;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLen, 40);
  return buf;
}

function fakeProvider(overrides = {}) {
  const calls = { transcribe: 0, translate: 0, suggestReplies: 0 };
  const provider = {
    name: 'fake',
    calls,
    async transcribe() {
      calls.transcribe += 1;
      return { language: 'en', transcript: 'Could you send me the document before tomorrow morning?', intelligible: true, confidence: 'high' };
    },
    async translate() {
      calls.translate += 1;
      return { translation: 'Bisakah kamu mengirimkan dokumennya sebelum besok pagi?' };
    },
    async suggestReplies({ count, includeExplanation }) {
      calls.suggestReplies += 1;
      return [
        { id: 'reply_1', intent: 'accept', text: "Sure, I'll send it.", ...(includeExplanation && { localized_text: 'Tentu, akan aku kirim.' }) },
        { id: 'reply_2', intent: 'clarify', text: 'Which format?', ...(includeExplanation && { localized_text: 'Format apa?' }) },
        { id: 'reply_3', intent: 'ask_for_time', text: 'Let me check.', ...(includeExplanation && { localized_text: 'Biar kucek dulu.' }) },
      ].slice(0, count);
    },
    ...overrides,
  };
  return provider;
}

async function startServer({ provider = fakeProvider(), configure } = {}) {
  const config = loadConfig({});
  config.rateLimit.max = 1000;
  configure?.(config);
  const built = createApp({ config, provider, logger: silentLogger });
  const server = await new Promise((resolve) => {
    const s = built.app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}/api/v1`;
  const device = 'test-device-0123456789';

  const call = async (method, path, { body, headers = {}, device: d = device } = {}) => {
    const init = { method, headers: { ...(d && { 'x-device-id': d }), ...headers } };
    if (body instanceof FormData) init.body = body;
    else if (body !== undefined) {
      init.body = JSON.stringify(body);
      init.headers['content-type'] = 'application/json';
    }
    const res = await fetch(base + path, init);
    const text = await res.text();
    return { status: res.status, headers: res.headers, json: text ? JSON.parse(text) : null };
  };

  const upload = (fields = {}, file = makeWav(1), headers = {}) => {
    const form = new FormData();
    if (file) form.append('audio', new Blob([file], { type: 'application/octet-stream' }), 'voice.bin');
    for (const [k, val] of Object.entries({ target_language: 'id', ...fields })) if (val !== undefined) form.append(k, val);
    return call('POST', '/translations', { body: form, headers });
  };

  const waitFor = async (jobId, pred = (j) => ['completed', 'failed', 'cancelled'].includes(j.status)) => {
    for (let i = 0; i < 100; i += 1) {
      const { json } = await call('GET', `/translations/${jobId}`);
      if (pred(json)) return json;
      await new Promise((r) => setTimeout(r, 10));
    }
    throw new Error('timeout waiting for job');
  };

  return { ...built, server, call, upload, waitFor, close: () => new Promise((r) => server.close(r)), base, device };
}

module.exports = { startServer, fakeProvider, makeWav };
