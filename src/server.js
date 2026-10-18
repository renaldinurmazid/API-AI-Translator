'use strict';

const path = require('node:path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  // .env opsional; variabel bisa datang dari environment
}

const { loadConfig } = require('./config');
const { createProvider } = require('./providers');
const { createApp } = require('./app');

const config = loadConfig();
if (!config.provider.apiKey) {
  console.warn('PERINGATAN: GEMINI_API_TOKEN belum diatur; pemrosesan AI akan gagal.');
}

const { app, store } = createApp({ config, provider: createProvider(config.provider) });
setInterval(() => store.sweep(), 60_000).unref();

const server = app.listen(config.port, () => console.log(`API berjalan di http://0.0.0.0:${config.port}`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
