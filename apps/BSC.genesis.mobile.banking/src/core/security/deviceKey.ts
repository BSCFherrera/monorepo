import NativeDeviceKey from '../../specs/NativeDeviceKey';

import { buildSigningPayload } from './signingPayload';

/**
 * Llave de firma del dispositivo.
 *
 * Envoltura tipada sobre el módulo nativo. Su trabajo es traducir: el módulo
 * habla en códigos de error de plataforma, y el resto de la app necesita
 * conceptos de negocio.
 *
 * Portado de `lib/core/security/device_key.dart`.
 */

/** Dónde vive la llave privada y con qué protecciones. */
export interface DeviceKeySecurity {
  present: boolean;

  /** `strongbox`, `tee`, `hardware`, `software` o `unknown`. */
  backing?: string;

  /**
   * True cuando el sistema operativo exige verificación del usuario para usar
   * la llave. Si fuera false, la biometría sería decorativa.
   */
  userAuthenticationRequired?: boolean;

  /** True cuando agregar una biometría nueva invalida la llave. */
  invalidatedByBiometricEnrollment?: boolean;
}

export interface DeviceKeyPair {
  publicKey: string | null;
  algorithm: string;
  security: DeviceKeySecurity;
}

/** La llave está en hardware, no en software. */
export function isHardwareBacked(security: DeviceKeySecurity): boolean {
  return (
    security.backing === 'strongbox' ||
    security.backing === 'tee' ||
    security.backing === 'hardware'
  );
}

/** El nivel más alto: elemento seguro dedicado. */
export function isStrongBox(security: DeviceKeySecurity): boolean {
  return security.backing === 'strongbox';
}

/**
 * Lo que el banco necesita para conceder autorización sin código.
 *
 * Las tres condiciones son necesarias juntas. Una llave en hardware que no
 * exigiera verificación del usuario firmaría sola; y una que no se invalidara
 * al inscribir una biometría nueva permitiría que quien agregue su rostro al
 * teléfono de la víctima firmara en su nombre.
 */
export function meetsBankingBar(security: DeviceKeySecurity): boolean {
  return (
    isHardwareBacked(security) &&
    security.userAuthenticationRequired === true &&
    security.invalidatedByBiometricEnrollment === true
  );
}

export class DeviceKeyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DeviceKeyError';
    this.code = code;
  }
}

/**
 * Los rechazos del puente nativo llegan como objetos sueltos. Esto los
 * convierte en un error con código, que es lo que `signingOutcome` necesita
 * para decidir si ofrecer el código de verificación.
 */
function comoDeviceKeyError(causa: unknown): DeviceKeyError {
  if (causa instanceof DeviceKeyError) return causa;

  const posible = causa as { code?: unknown; message?: unknown } | null;
  const code =
    typeof posible?.code === 'string' ? posible.code : 'device_key_error';
  const message =
    typeof posible?.message === 'string' && posible.message.length > 0
      ? posible.message
      : 'Fallo del módulo de llaves del dispositivo';

  return new DeviceKeyError(code, message);
}

async function protegido<T>(operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (causa) {
    throw comoDeviceKeyError(causa);
  }
}

export const DeviceKey = {
  isSupported: (): Promise<boolean> =>
    protegido(() => NativeDeviceKey.isSupported()),

  hasKey: (): Promise<boolean> => protegido(() => NativeDeviceKey.hasKey()),

  createKey: async (): Promise<DeviceKeyPair> =>
    protegido(async () => (await NativeDeviceKey.createKey()) as DeviceKeyPair),

  getPublicKey: (): Promise<string | null> =>
    protegido(() => NativeDeviceKey.getPublicKey()),

  deleteKey: (): Promise<boolean> =>
    protegido(() => NativeDeviceKey.deleteKey()),

  describeKey: async (): Promise<DeviceKeySecurity> =>
    protegido(
      async () => (await NativeDeviceKey.describeKey()) as DeviceKeySecurity,
    ),

  /**
   * Firma el reto del servidor junto con la huella de la operación.
   *
   * Dispara el diálogo biométrico del sistema. El contenido a firmar se compone
   * aquí y no en el lado nativo para que la composición —que es contrato con el
   * backend— se pueda probar sin un teléfono.
   */
  signChallenge: (
    nonceBase64: string,
    operationHashHex: string,
  ): Promise<string> =>
    protegido(async () => {
      const payload = buildSigningPayload(nonceBase64, operationHashHex);
      const firma = await NativeDeviceKey.sign(payload);

      if (!firma) {
        throw new DeviceKeyError(
          'device_key_error',
          'El dispositivo no devolvió la firma',
        );
      }

      return firma;
    }),
};
