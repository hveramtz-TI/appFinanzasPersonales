/**
 * Generates a UUID v4 string.
 *
 * Expo Go (Hermes) does not provide the global `crypto` object, so
 * `crypto.randomUUID()` is unavailable at runtime. This util replaces it
 * for database primary keys (not security-sensitive identifiers).
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
