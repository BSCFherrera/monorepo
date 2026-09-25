#!/usr/bin/env node
/**
 * Verifica, fuera del teléfono, una firma producida por la llave del hardware.
 *
 * Que la app diga «firmado» no prueba nada por sí solo: prueba que el módulo
 * nativo devolvió una cadena. Lo que hay que demostrar es que esa cadena es una
 * firma ECDSA P-256 válida sobre el contenido esperado, verificable con la llave
 * pública que el teléfono entregó — que es exactamente lo que hará
 * `TransactionAuthorizationGuard` en el backend .NET.
 *
 * Si esta comprobación pasa, la firma en hardware alcanza paridad con la app
 * Flutter y la oleada 0 puede cerrarse.
 *
 * Uso:
 *   node scripts/verify-device-signature.mjs <archivo-de-logcat>
 *
 * El archivo es un volcado de `adb logcat` que contenga las líneas
 * `BSC-VERIFY PUBKEY …`, `BSC-VERIFY PAYLOAD …` y `BSC-VERIFY SIGNATURE …`.
 */

import { createPublicKey, verify } from 'node:crypto';
import { readFileSync } from 'node:fs';
import process from 'node:process';

/** Debe coincidir con las constantes de `SecurityCheckScreen`. */
const NONCE_ESPERADO = 'YmFuY29zYW50YWNydXpub25jZTAx';
const HUELLA_ESPERADA =
  'a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea';

const archivo = process.argv[2];
if (!archivo) {
  console.error(
    'Uso: node scripts/verify-device-signature.mjs <archivo-de-logcat>',
  );
  process.exit(2);
}

const registro = readFileSync(archivo, 'utf8');

/** Toma el último valor, por si se ejecutó la verificación más de una vez. */
function extraer(etiqueta) {
  const patron = new RegExp(`BSC-VERIFY ${etiqueta} ([A-Za-z0-9+/=]+)`, 'g');
  const encontrados = [...registro.matchAll(patron)].map(m => m[1]);
  return encontrados.length > 0 ? encontrados[encontrados.length - 1] : null;
}

const publicKeyB64 = extraer('PUBKEY');
const payloadB64 = extraer('PAYLOAD');
const signatureB64 = extraer('SIGNATURE');

const faltantes = [
  ['PUBKEY', publicKeyB64],
  ['PAYLOAD', payloadB64],
  ['SIGNATURE', signatureB64],
]
  .filter(([, valor]) => valor === null)
  .map(([nombre]) => nombre);

if (faltantes.length > 0) {
  console.error(
    `\n  No se encontraron en el registro: ${faltantes.join(', ')}.\n` +
      '  ¿Se ejecutó la verificación en el teléfono y se completó la biometría?\n',
  );
  process.exit(1);
}

const hallazgos = [];
const comprobaciones = [];

function comprobar(nombre, ok, detalle) {
  (ok ? comprobaciones : hallazgos).push({ nombre, detalle });
}

// ─── 1. El contenido firmado es el que esperábamos ──────────────────────────
const payload = Buffer.from(payloadB64, 'base64');
const esperado = Buffer.concat([
  Buffer.from(NONCE_ESPERADO, 'base64'),
  Buffer.from(HUELLA_ESPERADA, 'hex'),
]);

comprobar(
  'El contenido firmado es el reto seguido de la huella',
  payload.equals(esperado),
  `${payload.length} bytes (${esperado.length} esperados)`,
);

// ─── 2. La llave pública es EC P-256 y se puede importar ────────────────────
let llave = null;
try {
  llave = createPublicKey({
    key: Buffer.from(publicKeyB64, 'base64'),
    format: 'der',
    type: 'spki',
  });

  const detalles = llave.asymmetricKeyDetails ?? {};
  comprobar(
    'La llave pública es EC P-256 en formato SPKI',
    llave.asymmetricKeyType === 'ec' && detalles.namedCurve === 'prime256v1',
    `tipo=${llave.asymmetricKeyType} curva=${
      detalles.namedCurve ?? 'desconocida'
    }`,
  );
} catch (causa) {
  comprobar(
    'La llave pública se puede importar',
    false,
    causa instanceof Error ? causa.message : String(causa),
  );
}

// ─── 3. La firma verifica — la comprobación que importa ─────────────────────
if (llave !== null) {
  const firma = Buffer.from(signatureB64, 'base64');

  // DER es lo que .NET verifica con Rfc3279DerSequence, y lo que produce
  // `SHA256withECDSA` en Android.
  comprobar(
    'La firma está en DER, no en formato plano',
    firma[0] === 0x30,
    `primer byte 0x${firma[0]?.toString(16).padStart(2, '0')} · ${
      firma.length
    } bytes`,
  );

  const valida = verify(
    'sha256',
    payload,
    { key: llave, dsaEncoding: 'der' },
    firma,
  );
  comprobar(
    'La firma es válida para esa llave y ese contenido',
    valida,
    valida ? 'ECDSA P-256 sobre SHA-256' : 'Verificación rechazada',
  );

  // Una firma que verifica sobre otro contenido sería inútil como autorización.
  const alterado = Buffer.from(payload);
  alterado[alterado.length - 1] ^= 0x01;
  comprobar(
    'La firma NO verifica si el contenido cambia',
    !verify('sha256', alterado, { key: llave, dsaEncoding: 'der' }, firma),
    'Un byte distinto en la huella invalida la autorización',
  );
}

// ─── Informe ────────────────────────────────────────────────────────────────
console.log('\n  Verificación de la firma del dispositivo\n');

for (const c of comprobaciones) {
  console.log(`    OK   ${c.nombre}`);
  console.log(`         ${c.detalle}`);
}

for (const h of hallazgos) {
  console.log(`    ✖    ${h.nombre}`);
  console.log(`         ${h.detalle}`);
}

console.log('');

if (hallazgos.length > 0) {
  console.log(`  ${hallazgos.length} comprobación(es) fallida(s).\n`);
  process.exit(1);
}

console.log('  La llave del hardware del teléfono firmó correctamente.');
console.log('  El backend .NET verificaría esta misma firma.\n');
process.exit(0);
