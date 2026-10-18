'use strict';

const multer = require('multer');
const { errors } = require('../errors');

/** Upload audio ke memori saja (tidak pernah ditulis ke disk). */
function audioUpload(maxBytes) {
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1, fields: 10 } }).single('audio');
  return (req, res, next) =>
    upload(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(errors.badRequest('AUDIO_TOO_LARGE', `File audio terlalu besar. Batas maksimal ${Math.round(maxBytes / 1024 / 1024)} MB.`, { max_bytes: maxBytes }));
      }
      return next(errors.badRequest('INVALID_UPLOAD', 'Unggahan tidak valid. Kirim sebagai multipart/form-data dengan field "audio".'));
    });
}

module.exports = { audioUpload };
