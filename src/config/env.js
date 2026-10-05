const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

try {
  process.loadEnvFile(path.join(ROOT_DIR, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function optional(name, fallback = null) {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

module.exports = {
  ROOT_DIR,
  get token() {
    return required('TOKEN');
  },
  get clientId() {
    return required('CLIENT_ID');
  },
  guildId: optional('GUILD_ID'),
  databasePath: path.resolve(ROOT_DIR, optional('DATABASE_PATH', 'storage/spacebet.db')),
  logLevel: optional('LOG_LEVEL', 'info'),
};
