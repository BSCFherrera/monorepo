import CryptoJS from 'crypto-js';

/**
 * Genera un hash SHA256 (hexadecimal) a partir de un string. Usado, por ejemplo,
 * para enviar el número de documento del cliente hasheado en URLs/headers, sin exponer el valor real.
 */
export const sha256 = (value: string): string => CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
