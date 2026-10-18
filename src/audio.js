'use strict';

const { errors } = require('./errors');

/**
 * Mengenali format audio dari byte awal file. Content-Type dari klien tidak
 * dipercaya (mis. application/octet-stream atau .opus dari WhatsApp).
 */
function sniffAudio(buf) {
  if (buf.length < 12) return null;
  const ascii = (start, end) => buf.toString('latin1', start, end);

  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE') return { mime: 'audio/wav', ext: 'wav' };
  if (ascii(0, 4) === 'OggS') return { mime: 'audio/ogg', ext: 'ogg' };
  if (ascii(0, 4) === 'fLaC') return { mime: 'audio/flac', ext: 'flac' };
  if (ascii(0, 4) === 'FORM' && ascii(8, 12).startsWith('AIF')) return { mime: 'audio/aiff', ext: 'aiff' };
  if (ascii(4, 8) === 'ftyp') return { mime: 'audio/mp4', ext: 'm4a' };
  if (ascii(0, 3) === 'ID3') return { mime: 'audio/mpeg', ext: 'mp3' };
  if (buf[0] === 0xff && (buf[1] & 0xf6) === 0xf0) return { mime: 'audio/aac', ext: 'aac' };
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return { mime: 'audio/mpeg', ext: 'mp3' };
  return null;
}

const SUPPORTED_FORMATS = 'MP3, WAV, OGG/OPUS, M4A/MP4, AAC, FLAC, AIFF';

// Perkiraan kasar (16 KB/detik) bila durasi tidak bisa dibaca dari metadata.
const FALLBACK_BYTES_PER_SECOND = 16_000;

async function readDurationSeconds(buf, mime) {
  try {
    const { parseBuffer } = await import('music-metadata');
    const meta = await parseBuffer(buf, { mimeType: mime }, { duration: true });
    const d = meta.format.duration;
    if (Number.isFinite(d) && d > 0) return d;
  } catch {
    // diabaikan: file rusak ditangani pemanggil lewat estimasi/validasi lain
  }
  return null;
}

async function inspectAudio(file, limits) {
  if (!file) throw errors.badRequest('AUDIO_REQUIRED', 'File audio wajib dikirim pada field "audio".');
  const buf = file.buffer;
  if (!buf || buf.length === 0) throw errors.badRequest('AUDIO_EMPTY', 'File audio kosong.');

  const format = sniffAudio(buf);
  if (!format) {
    throw errors.badRequest(
      'UNSUPPORTED_AUDIO_FORMAT',
      `Format audio tidak didukung. Gunakan salah satu: ${SUPPORTED_FORMATS}.`,
    );
  }

  const measured = await readDurationSeconds(buf, format.mime);
  const duration = measured ?? Math.max(1, Math.ceil(buf.length / FALLBACK_BYTES_PER_SECOND));
  if (duration > limits.maxSeconds) {
    throw errors.badRequest(
      'AUDIO_TOO_LONG',
      `Audio terlalu panjang. Batas maksimal ${limits.maxSeconds} detik.`,
      { max_seconds: limits.maxSeconds },
    );
  }
  return { ...format, durationSeconds: Math.max(1, Math.round(duration)), durationEstimated: measured === null };
}

module.exports = { sniffAudio, inspectAudio, SUPPORTED_FORMATS };
