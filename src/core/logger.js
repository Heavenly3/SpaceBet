const { logLevel } = require('../config/env');

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const COLORS = {
  debug: '\x1b[90m',
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';
const threshold = LEVELS[logLevel] ?? LEVELS.info;
const useColor = process.stdout.isTTY;

function write(level, scope, args) {
  if (LEVELS[level] < threshold) return;
  const time = new Date().toISOString().slice(11, 19);
  const tag = level.toUpperCase().padEnd(5);
  const prefix = useColor
    ? `${COLORS[level]}${time} ${tag}${RESET} [${scope}]`
    : `${time} ${tag} [${scope}]`;
  const out = level === 'error' || level === 'warn' ? console.error : console.log;
  out(prefix, ...args);
}

function createLogger(scope = 'app') {
  return {
    debug: (...args) => write('debug', scope, args),
    info: (...args) => write('info', scope, args),
    warn: (...args) => write('warn', scope, args),
    error: (...args) => write('error', scope, args),
    child: (name) => createLogger(`${scope}:${name}`),
  };
}

module.exports = createLogger();
