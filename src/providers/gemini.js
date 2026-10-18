'use strict';

const { ProviderError } = require('./errors');
const prompts = require('./prompts');
const schemas = require('./schemas');

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new ProviderError('CANCELLED', 'Pemrosesan dibatalkan.')); }, { once: true });
  });

// Google menyertakan RetryInfo.retryDelay (mis. "33s") pada respons 429.
function retryDelayMs(body) {
  const info = body?.error?.details?.find((d) => typeof d?.retryDelay === 'string');
  const seconds = info ? Number.parseFloat(info.retryDelay) : NaN;
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : null;
}

function mapHttpError(status, body) {
  if (status === 429) {
    return new ProviderError('PROVIDER_RATE_LIMITED', 'Layanan AI sedang sibuk. Coba lagi sebentar lagi.', { retryable: true, status, retryAfterMs: retryDelayMs(body) });
  }
  if (status === 401 || status === 403) return new ProviderError('PROVIDER_AUTH', 'Layanan AI belum dikonfigurasi dengan benar.', { status });
  if (status === 400) return new ProviderError('PROVIDER_REJECTED', 'Layanan AI menolak permintaan ini.', { status });
  if (status >= 500) return new ProviderError('PROVIDER_UNAVAILABLE', 'Layanan AI sedang bermasalah. Coba lagi.', { retryable: true, status });
  return new ProviderError('PROVIDER_ERROR', 'Terjadi kesalahan pada layanan AI.', { status });
}

/**
 * Adapter Gemini. Memenuhi interface provider:
 *   transcribe({ audio, mimeType, sourceLanguage, signal }) -> { language, transcript, intelligible, confidence }
 *   translate({ text, sourceLanguage, targetLanguage, signal }) -> { translation }
 *   suggestReplies({ ... , signal }) -> [{ id, intent, text, localized_text? }]
 */
function createGeminiProvider(cfg, { fetchImpl = fetch } = {}) {
  async function generateOnce({ system, parts, schema, temperature, signal }) {
    if (!cfg.apiKey) throw new ProviderError('PROVIDER_AUTH', 'Layanan AI belum dikonfigurasi.');
    const url = `${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:generateContent`;
    const timeout = AbortSignal.timeout(cfg.timeoutMs);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let res;
    try {
      res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature,
            maxOutputTokens: cfg.maxOutputTokens,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
        signal: combined,
      });
    } catch (err) {
      if (signal?.aborted) throw new ProviderError('CANCELLED', 'Pemrosesan dibatalkan.');
      if (timeout.aborted) throw new ProviderError('PROVIDER_TIMEOUT', 'Layanan AI terlalu lama merespons. Coba lagi.', { retryable: true });
      throw new ProviderError('PROVIDER_NETWORK', 'Tidak dapat terhubung ke layanan AI.', { retryable: true });
    }

    const body = await res.json().catch(() => null);
    if (!res.ok) throw mapHttpError(res.status, body);

    const candidate = body?.candidates?.[0];
    if (body?.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') {
      throw new ProviderError('CONTENT_BLOCKED', 'Konten tidak dapat diproses oleh layanan AI.');
    }
    const text = candidate?.content?.parts?.map((p) => p.text || '').join('');
    if (!text) throw new ProviderError('INVALID_OUTPUT', 'Layanan AI tidak mengembalikan hasil.', { retryable: true });
    try {
      return JSON.parse(text);
    } catch {
      throw new ProviderError('INVALID_OUTPUT', 'Output AI bukan JSON yang valid.', { retryable: true });
    }
  }

  // Retry terbatas hanya untuk kegagalan sementara; tidak pernah untuk 4xx permanen.
  async function generate(options, validate) {
    let attempt = 0;
    for (;;) {
      try {
        return validate(await generateOnce(options));
      } catch (err) {
        if (!(err instanceof ProviderError) || !err.retryable || attempt >= cfg.maxRetries || options.signal?.aborted) throw err;
        attempt += 1;
        // Bila Google meminta menunggu lebih lama dari batas, gagal cepat agar pengguna bisa mencoba lagi nanti.
        const wait = err.retryAfterMs != null ? err.retryAfterMs + 250 : 500 * attempt;
        if (wait > cfg.maxRateLimitWaitMs) throw err;
        await sleep(wait, options.signal);
      }
    }
  }

  return {
    name: 'gemini',

    transcribe({ audio, mimeType, sourceLanguage, signal }) {
      return generate(
        {
          system: prompts.TRANSCRIBE_SYSTEM,
          parts: [{ inlineData: { mimeType, data: audio.toString('base64') } }, { text: prompts.transcribeUser(sourceLanguage) }],
          schema: schemas.transcriptionSchema,
          temperature: 0,
          signal,
        },
        schemas.validateTranscription,
      );
    },

    translate({ text, sourceLanguage, targetLanguage, signal }) {
      return generate(
        {
          system: prompts.TRANSLATE_SYSTEM,
          parts: [{ text: prompts.translateUser({ text, sourceLanguage, targetLanguage }) }],
          schema: schemas.translationSchema,
          temperature: 0.1,
          signal,
        },
        schemas.validateTranslation,
      );
    },

    suggestReplies({ signal, ...input }) {
      return generate(
        {
          system: prompts.REPLY_SYSTEM,
          parts: [{ text: prompts.replyUser(input) }],
          schema: schemas.replySchema,
          temperature: 0.7,
          signal,
        },
        (data) => schemas.validateReplies(data, { count: input.count, includeExplanation: input.includeExplanation }),
      );
    },
  };
}

module.exports = { createGeminiProvider };
