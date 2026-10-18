'use strict';

const crypto = require('node:crypto');
const { errors } = require('../errors');
const { ProviderError } = require('../providers/errors');
const { LANGUAGES } = require('../validation');

const MAX_ACTIVE_PER_DEVICE = 3;

const newId = () => `tr_${crypto.randomBytes(8).toString('hex')}`;

function toError(err) {
  if (err instanceof ProviderError) return { code: err.code, message: err.message, retryable: err.retryable || ['PROVIDER_TIMEOUT', 'PROVIDER_NETWORK'].includes(err.code) };
  // Pesan error internal tidak diteruskan karena bisa memuat isi percakapan.
  return { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan saat memproses audio.', retryable: true };
}

function createTranslationService({ provider, store, quota, logger = console }) {
  async function runPipeline(job, audio, audioMime) {
    const controller = new AbortController();
    store.setController(job.id, controller);
    const { signal } = controller;
    const stage = (status) => store.update(job.id, { status });

    try {
      stage('transcribing');
      const stt = await provider.transcribe({ audio, mimeType: audioMime, sourceLanguage: job.requestedSourceLanguage, signal });

      if (!stt.intelligible) {
        throw new ProviderError('TRANSCRIPT_EMPTY', 'Audio belum dapat dipahami. Coba audio yang lebih jelas atau kurangi noise.');
      }
      const sourceLanguage = job.requestedSourceLanguage || (LANGUAGES[stt.language] ? stt.language : null);
      if (!sourceLanguage) {
        throw new ProviderError('LANGUAGE_NOT_DETECTED', 'Bahasa audio tidak terdeteksi. Pilih bahasa sumber secara manual.');
      }
      store.update(job.id, { transcript: stt.transcript, confidence: stt.confidence, sourceLanguage, detectedLanguage: stt.language });

      stage('translating');
      let translation = stt.transcript;
      if (sourceLanguage !== job.targetLanguage) {
        ({ translation } = await provider.translate({ text: stt.transcript, sourceLanguage, targetLanguage: job.targetLanguage, signal }));
      }
      store.update(job.id, { translation });

      if (job.generateReplySuggestions) {
        stage('suggesting');
        let consumed = false;
        try {
          quota.consumeReply(job.deviceId);
          consumed = true;
          const suggestions = await provider.suggestReplies({
            transcript: stt.transcript,
            confidence: stt.confidence,
            sourceLanguage,
            replyLanguage: sourceLanguage,
            explanationLanguage: job.targetLanguage,
            tone: 'casual',
            count: 3,
            includeExplanation: true,
            signal,
          });
          store.update(job.id, { replies: { tone: 'casual', reply_language: sourceLanguage, suggestions } });
        } catch (err) {
          // Terjemahan sudah berhasil; kegagalan saran tidak boleh menggagalkan job.
          if (consumed) quota.refundReply(job.deviceId);
          if (signal.aborted) throw err;
          logger.warn?.(`[${job.id}] reply suggestions failed: ${toError(err).code}`);
        }
      }

      store.update(job.id, { status: 'completed' });
    } catch (err) {
      if (signal.aborted || err?.code === 'CANCELLED') {
        store.update(job.id, { status: 'cancelled' });
      } else {
        const e = toError(err);
        logger.warn?.(`[${job.id}] failed: ${e.code}`);
        store.update(job.id, { status: 'failed', error: e });
      }
      // Pekerjaan yang tidak menghasilkan terjemahan tidak ditagihkan ke kuota.
      if (!store.get(job.id, job.deviceId)?.translation) quota.refundJob(job.deviceId, job.durationSeconds);
    } finally {
      store.clearController(job.id);
    }
  }

  return {
    create({ deviceId, idempotencyKey, file, sourceLanguage, targetLanguage, generateReplySuggestions }) {
      if (idempotencyKey) {
        const existing = store.findByIdempotencyKey(deviceId, idempotencyKey);
        if (existing) return { job: existing, reused: true };
      }
      if (store.countActive(deviceId) >= MAX_ACTIVE_PER_DEVICE) {
        throw errors.quota('Masih ada beberapa pemrosesan berjalan. Tunggu sampai selesai.', 10);
      }
      quota.consumeJob(deviceId, file.durationSeconds);

      const job = store.create({
        id: newId(),
        deviceId,
        idempotencyKey: idempotencyKey || null,
        status: 'queued',
        requestedSourceLanguage: sourceLanguage,
        sourceLanguage: sourceLanguage,
        targetLanguage,
        durationSeconds: file.durationSeconds,
        generateReplySuggestions,
        transcript: null,
        translation: null,
        confidence: null,
        replies: null,
        error: null,
      });

      // Berjalan di latar belakang; buffer audio hanya hidup selama closure ini.
      setImmediate(() => runPipeline(job, file.buffer, file.mime).catch((e) => logger.error?.(`[${job.id}] pipeline crashed: ${e.code || 'unknown'}`)));
      return { job, reused: false };
    },

    cancel(job) {
      const controller = store.getController(job.id);
      if (!controller) return job;
      controller.abort();
      return store.update(job.id, { status: 'cancelled' });
    },

    async suggestReplies(job, { tone, count, replyLanguage, includeExplanation }) {
      if (job.status !== 'completed') {
        throw errors.unprocessable('JOB_NOT_COMPLETED', 'Terjemahan belum selesai, saran balasan belum bisa dibuat.');
      }
      if (!job.transcript) {
        throw errors.unprocessable('TRANSCRIPT_EMPTY', 'Transkrip kosong, saran balasan tidak dapat dibuat.');
      }
      quota.consumeReply(job.deviceId);
      try {
        const suggestions = await provider.suggestReplies({
          transcript: job.transcript,
          confidence: job.confidence,
          sourceLanguage: job.sourceLanguage,
          replyLanguage: replyLanguage || job.sourceLanguage,
          explanationLanguage: job.targetLanguage,
          tone,
          count,
          includeExplanation,
        });
        store.update(job.id, { replies: { tone, reply_language: replyLanguage || job.sourceLanguage, suggestions } });
        return suggestions;
      } catch (err) {
        quota.refundReply(job.deviceId);
        throw err;
      }
    },
  };
}

function serializeJob(job, { includeReplies = true } = {}) {
  const out = {
    job_id: job.id,
    status: job.status,
    source_language: job.sourceLanguage,
    target_language: job.targetLanguage,
    duration_seconds: job.durationSeconds,
    created_at: new Date(job.createdAt).toISOString(),
  };
  if (job.transcript !== null) out.transcript = job.transcript;
  if (job.translation !== null) out.translation = job.translation;
  if (job.confidence) out.transcript_confidence = job.confidence;
  if (job.detectedLanguage && job.detectedLanguage !== job.sourceLanguage) out.detected_language = job.detectedLanguage;
  if (job.error) out.error = job.error;
  if (includeReplies && job.replies) out.reply_suggestions = job.replies;
  return out;
}

module.exports = { createTranslationService, serializeJob, toError };
