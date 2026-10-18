'use strict';

const express = require('express');
const { serializeJob } = require('../services/translationService');
const { errors } = require('../errors');
const v = require('../validation');

function miscRouter({ store, quota }) {
  const router = express.Router();

  router.get('/languages', (_req, res) => {
    res.json({ languages: Object.entries(v.LANGUAGES).map(([code, name]) => ({ code, name })), tones: v.TONES });
  });

  router.get('/preferences', (req, res) => {
    res.json(store.getPreferences(req.deviceId) || { target_language: 'id', source_language: null, default_tone: 'casual' });
  });

  router.patch('/preferences', (req, res) => {
    const body = req.body || {};
    const current = store.getPreferences(req.deviceId) || { target_language: 'id', source_language: null, default_tone: 'casual' };
    const next = { ...current };
    if (body.target_language !== undefined) next.target_language = v.parseLanguage(body.target_language, { field: 'target_language', required: true });
    if (body.source_language !== undefined) next.source_language = v.parseLanguage(body.source_language, { field: 'source_language', required: false });
    if (body.default_tone !== undefined) next.default_tone = v.parseTone(body.default_tone);
    store.setPreferences(req.deviceId, next);
    res.json(next);
  });

  router.get('/history', (req, res) => {
    res.json({ items: store.list(req.deviceId).map((j) => serializeJob(j)) });
  });

  router.delete('/history/:id', (req, res) => {
    if (!store.remove(req.params.id, req.deviceId)) throw errors.notFound('Item riwayat tidak ditemukan.');
    res.status(204).end();
  });

  router.delete('/user-data', (req, res) => {
    const deleted = store.removeAll(req.deviceId);
    res.json({ deleted_jobs: deleted, note: 'Audio tidak pernah disimpan. Teks dan preferensi perangkat ini telah dihapus dari server.' });
  });

  router.get('/usage', (req, res) => res.json(quota.snapshot(req.deviceId)));

  return router;
}

module.exports = { miscRouter };
