#!/usr/bin/env node
/**
 * Calcula la huella SPKI de un certificado, que es lo que Android pide para el
 * *certificate pinning* (T-03).
 *
 *     node scripts/calcular-pin-spki.mjs <certificado.pem|.cer|.crt>
 *
 * **Qué es una huella SPKI y por qué esa y no otra.** Se calcula sobre la
 * *clave pública* del certificado —`SubjectPublicKeyInfo`—, no sobre el
 * certificado entero. La diferencia importa: el banco puede renovar el
 * certificado conservando la misma clave, y entonces **la huella no cambia y la
 * aplicación sigue funcionando**. Si se fijara el certificado completo, cada
 * renovación dejaría a todos los clientes fuera hasta que publicaran una
 * versión nueva de la app, que en una tienda tarda días.
 *
 * **Por qué hacen falta dos.** Android acepta varias huellas y valida si
 * cualquiera coincide. La segunda es la de la clave de respaldo, que el banco
 * guarda sin usar: el día que haya que rotar por una emergencia, la app ya
 * confía en la nueva y la rotación no exige publicar una versión. **Fijar una
 * sola huella es el error clásico**, y su consecuencia es que nadie entra.
 *
 * Se escribe a mano y sin dependencias: `node:crypto` sabe leer un certificado
 * X.509 y exportar su clave pública en DER.
 */
import { readFileSync } from 'node:fs';
import { X509Certificate, createHash } from 'node:crypto';
import process from 'node:process';

const [, , ruta] = process.argv;

if (ruta === undefined) {
  console.error(
    '\n  uso: node scripts/calcular-pin-spki.mjs <certificado.pem|.cer|.crt>\n',
  );
  process.exit(2);
}

let certificado;
try {
  certificado = new X509Certificate(readFileSync(ruta));
} catch (causa) {
  console.error(`\n  No se pudo leer el certificado: ${String(causa)}\n`);
  process.exit(1);
}

/**
 * Un campo del certificado, en una sola línea.
 *
 * `subject` e `issuer` pueden venir indefinidos —un certificado con el sujeto
 * vacío es raro pero válido— y sin este envoltorio la herramienta se caía con
 * un error de tipos en vez de decir qué certificado le dieron.
 */
function enUnaLinea(campo) {
  if (typeof campo !== 'string' || campo.trim() === '') return '(vacío)';

  return campo
    .split(String.fromCharCode(10))
    .map(parte => parte.trim())
    .filter(parte => parte !== '')
    .join(' · ');
}

// La clave pública en DER, que es exactamente el `SubjectPublicKeyInfo`.
const spki = certificado.publicKey.export({ type: 'spki', format: 'der' });
const huella = createHash('sha256').update(spki).digest('base64');

console.log(`
  Certificado
    sujeto     ${enUnaLinea(certificado.subject)}
    emisor     ${enUnaLinea(certificado.issuer)}
    válido de  ${certificado.validFrom}
    válido a   ${certificado.validTo}

  Huella SPKI (SHA-256, base64)

    ${huella}

  Para el archivo de configuración de red:

    <pin digest="SHA-256">${huella}</pin>
`);

// Un certificado vencido o a punto de vencer no sirve para fijar: avisa.
const vence = new Date(certificado.validTo);
const diasRestantes = Math.floor((vence.getTime() - Date.now()) / 86_400_000);

if (diasRestantes < 0) {
  console.log('  ⚠️  Este certificado ya venció.\n');
} else if (diasRestantes < 90) {
  console.log(
    `  ⚠️  Vence en ${diasRestantes} días. Antes de fijarlo conviene tener ya la\n` +
      '     huella del que lo sustituirá, o la rotación dejará a los clientes fuera.\n',
  );
}
