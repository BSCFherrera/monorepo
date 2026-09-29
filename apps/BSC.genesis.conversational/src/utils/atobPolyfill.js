/**
 * Polyfill de `atob`: Hermes (motor JS de React Native) no lo expone globalmente y
 * `jwt-decode` lo necesita para decodificar el payload del JWT (ver AuthService).
 * Debe importarse antes que cualquier módulo que decodifique JWTs (ver `index.js`).
 */
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function atobPolyfill(base64) {
  const clean = base64.replace(/[=]+$/, '');
  let bits = '';

  for (const char of clean) {
    const index = BASE64_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error("'atob' failed: the string to be decoded is not correctly encoded.");
    }
    bits += index.toString(2).padStart(6, '0');
  }

  let output = '';
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    output += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  }

  return output;
}

if (typeof global.atob === 'undefined') {
  global.atob = atobPolyfill;
}
