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

/** Normalise user input — strip spaces, uppercase, re-insert dash if missing */
export function normaliseJoinCode(raw: string): string {
  // Strip all spaces and dashes, uppercase
  const clean = raw.replace(/[-\s]/g, '').toUpperCase();
  // Re-insert the dash after position 3 to match stored format XXX-XXX
  if (clean.length === 6) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  // Already has dash or unexpected length — return as-is uppercased
  return raw.trim().toUpperCase();
}
