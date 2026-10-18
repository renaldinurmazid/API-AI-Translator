'use strict';

const express = require('express');
const { inspectAudio } = require('../audio');
const { serializeJob } = require('../services/translationService');
const { errors } = require('../errors');
const v = require('../validation');
const { audioUpload } = require('../middleware/upload');

function translationsRouter({ config, service, store, quota }) {
  const router = express.Router();

  // 9.1 Membuat pekerjaan terjemahan
  router.post('/', audioUpload(config.audio.maxBytes), async (req, res) => {
    const targetLanguage = v.parseLanguage(req.body.target_language, { field: 'target_language', required: true });
    const sourceLanguage = v.parseLanguage(req.body.source_language, { field: 'source_language', required: false });
    const generateReplySuggestions = v.parseBoolean(req.body.generate_reply_suggestions, false);
    const audio = await inspectAudio(req.file, config.audio);

    const { job, reused } = service.create({
      deviceId: req.deviceId,
      idempotencyKey: req.get('idempotency-key')?.slice(0, 128),
      file: { buffer: req.file.buffer, mime: audio.mime, durationSeconds: audio.durationSeconds },
      sourceLanguage,
      targetLanguage,
      generateReplySuggestions,
    });
    // Referensi buffer di request dilepas; hanya pipeline yang masih memegangnya.
    req.file.buffer = null;
    res.status(reused ? 200 : 202).location(`/api/v1/translations/${job.id}`).json({ job_id: job.id, status: job.status });
  });

  const load = (req) => {
    const job = store.get(req.params.jobId, req.deviceId);
    if (!job) throw errors.notFound('Pekerjaan terjemahan tidak ditemukan atau sudah dihapus.');
    return job;
  };

  // 9.2 Status & hasil
  router.get('/:jobId', (req, res) => res.json(serializeJob(load(req))));

  router.post('/:jobId/cancel', (req, res) => res.json(serializeJob(service.cancel(load(req)))));

  // 9.3 Saran balasan
  router.post('/:jobId/reply-suggestions', async (req, res) => {
    const job = load(req);
    const body = req.body || {};
    const tone = v.parseTone(body.tone);
    const count = v.parseCount(body.count);
    const replyLanguage = v.parseLanguage(body.reply_language, { field: 'reply_language', required: false });
    const includeExplanation = v.parseBoolean(body.include_localized_explanation, true);
    const suggestions = await service.suggestReplies(job, { tone, count, replyLanguage, includeExplanation });
    res.json({ suggestions });
  });

  return router;
}

module.exports = { translationsRouter };
