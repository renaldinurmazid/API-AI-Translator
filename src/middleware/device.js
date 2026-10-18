'use strict';

const { errors } = require('../errors');

const DEVICE_ID = /^[A-Za-z0-9_-]{16,64}$/;

/** MVP tanpa akun: perangkat diidentifikasi lewat X-Device-Id (UUID acak dari aplikasi). */
function requireDevice(req, _res, next) {
  const id = req.get('x-device-id');
  if (!id || !DEVICE_ID.test(id)) {
    throw errors.badRequest('DEVICE_ID_REQUIRED', 'Header X-Device-Id (16-64 karakter alfanumerik) wajib dikirim.');
  }
  req.deviceId = id;
  next();
}

module.exports = { requireDevice };
