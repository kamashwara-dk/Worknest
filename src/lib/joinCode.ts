/**
 * Generates a human-readable workspace join code.
 * Format: XXX-XXX  (6 uppercase alphanumeric chars, split by a dash)
 * Example: "XK9-TZ2"
 *
 * Avoids visually ambiguous characters: 0, O, I, 1, L
 */
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateJoinCode(): string {
  const pick = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];
  return `${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}`;
}

/** Normalise user input — strip dashes, uppercase */
export function normaliseJoinCode(raw: string): string {
  return raw.replace(/[-\s]/g, '').toUpperCase();
}
