const SUFFIXES = { k: 1e3, m: 1e6, b: 1e9 };

/**
 * Parses an amount typed by a user against the balance it draws from.
 * Accepts plain numbers ("1500", "1,500"), suffixes ("2.5k", "1m"),
 * and keywords ("all"/"todo", "max", "half"/"mitad").
 * Returns a positive integer, or null when the input is invalid.
 */
function parseAmount(input, available) {
  const value = String(input)
    .trim()
    .toLowerCase()
    .replace(/[,_\s]/g, '');

  if (value === 'all' || value === 'max' || value === 'todo' || value === 'máx') {
    return available > 0 ? available : null;
  }
  if (value === 'half' || value === 'mitad') {
    const half = Math.floor(available / 2);
    return half > 0 ? half : null;
  }

  const match = value.match(/^(\d+(?:\.\d+)?)([kmb])?$/);
  if (!match) return null;

  const amount = Math.floor(Number(match[1]) * (SUFFIXES[match[2]] ?? 1));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

const DURATION_UNITS = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

/**
 * Parses durations such as "90", "45s", "15m", "1h30m" or "2d 12h" into
 * seconds. A bare number is read as seconds. Returns null when invalid.
 */
function parseDuration(input) {
  const value = String(input).trim().toLowerCase().replace(/\s+/g, '');
  if (/^\d+$/.test(value)) return Number(value);
  if (!/^(\d+[smhdw])+$/.test(value)) return null;

  let total = 0;
  for (const [, amount, unit] of value.matchAll(/(\d+)([smhdw])/g)) {
    total += Number(amount) * DURATION_UNITS[unit];
  }
  return total;
}

module.exports = { parseAmount, parseDuration };
