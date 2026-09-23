import NativeSecureStorage from '../../specs/NativeSecureStorage';

import type { TokenStore } from './tokenStore';

/**
 * Almacenamiento seguro de la sesión, sobre el cifrado del sistema operativo.
 *
 * Portado de `lib/core/security/secure_storage.dart`. **Las claves son las
 * mismas trece**, literalmente: si algún día hay que leer datos escritos por
 * otra versión, los nombres tienen que coincidir.
 */

export const SecureKeys = {
  accessToken: 'bsc_access_token',
  refreshToken: 'bsc_refresh_token',
  deviceSecret: 'bsc_device_secret',
  userPinHash: 'bsc_user_pin_hash',
  biometricEnabled: 'bsc_biometric_enabled',
  integrityVerdict: 'bsc_integrity_verdict',
  deviceInstallId: 'bsc_device_install_id',
  deviceEnrolled: 'bsc_device_enrolled',
  softTokenSecret: 'bsc_soft_token_secret',
  customerCode: 'bsc_customer_code',
  lastUserName: 'bsc_last_user_name',
  lastAccess: 'bsc_last_access',
  tokenExpiry: 'bsc_token_expiry',
  /**
   * El idioma que eligió el cliente. **No se borra al cerrar sesión**: es una
   * preferencia del teléfono, no de la sesión.
   */
  language: 'bsc_language',
} as const;

export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys];

/**
 * Lo que se borra al cerrar sesión.
 *
 * **No incluye** el identificador de instalación, el secreto del dispositivo,
 * el secreto del token suave ni el veredicto de integridad: todo eso pertenece
 * al *teléfono*, no a la *sesión*. Borrarlos obligaría al cliente a volver a
 * enrolar el dispositivo cada vez que cierra sesión, que es justo la fricción
 * que el enrolamiento existe para evitar.
 *
 * Tampoco incluye el nombre del último usuario, que es lo que permite saludar
 * por su nombre en la pantalla de acceso sin haber iniciado sesión.
 */
const CLAVES_DE_SESION: readonly string[] = [
  SecureKeys.accessToken,
  SecureKeys.refreshToken,
  SecureKeys.tokenExpiry,
  SecureKeys.customerCode,
];

/**
 * Lo que se borra al **bloquear** por inactividad, que es menos.
 *
 * **Conserva el token de refresco a propósito** (decidido por el banco el
 * 2026-09-18). Una inactividad no es un cierre de sesión: el cliente no pidió
 * salir, dejó el teléfono. La entrada por huella no obtiene credenciales
 * nuevas del banco —lo único que hace es reanudar con el token de refresco, al
 * que el backend da siete días—, así que borrarlo aquí deja el botón «Entrar
 * con tu huella» prometiendo algo que no puede cumplir. Eso es exactamente lo
 * que pasaba, y también en la app Flutter, cuyo `clearSession` borra los tres
 * tokens pese a que su comentario dice que sirve para conservar la
 * configuración de biometría.
 *
 * El código de cliente sí se va: es de la sesión, se vuelve a pedir al
 * reanudar, y dejarlo puesto haría que un cliente distinto que entrara con
 * credenciales en el mismo teléfono arrancara con el código del anterior.
 */
const CLAVES_DEL_BLOQUEO: readonly string[] = [
  SecureKeys.accessToken,
  SecureKeys.tokenExpiry,
  SecureKeys.customerCode,
];

export class SecureStorage implements TokenStore {
  // ─── Sesión ─────────────────────────────────────────────────────────────

  getAccessToken(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.accessToken);
  }

  saveAccessToken(token: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.accessToken, token);
  }

  getRefreshToken(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.refreshToken);
  }

  saveRefreshToken(token: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.refreshToken, token);
  }

  getTokenExpiry(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.tokenExpiry);
  }

  saveTokenExpiry(expiry: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.tokenExpiry, expiry);
  }

  /**
   * Cierra la sesión en una sola transacción.
   *
   * Que sea atómico importa: borrando clave por clave, una app que muera a
   * mitad dejaría un estado imposible —token de renovación sin token de
   * acceso— que nadie sabría interpretar al volver a abrir.
   */
  clearSession(): Promise<void> {
    return NativeSecureStorage.removeItems([...CLAVES_DE_SESION]);
  }

  /**
   * Bloquea la sesión sin cerrarla: tira el token de acceso y **conserva el de
   * refresco**, para que la huella tenga algo que desbloquear.
   *
   * Ver `CLAVES_DEL_BLOQUEO` y `finDeSesion.ts`.
   */
  lockSession(): Promise<void> {
    return NativeSecureStorage.removeItems([...CLAVES_DEL_BLOQUEO]);
  }

  // ─── Dispositivo ────────────────────────────────────────────────────────
  // Sobrevive al cierre de sesión: pertenece al teléfono, no a la sesión.

  getDeviceInstallId(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.deviceInstallId);
  }

  saveDeviceInstallId(id: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.deviceInstallId, id);
  }

  async isDeviceEnrolled(): Promise<boolean> {
    return (
      (await NativeSecureStorage.getItem(SecureKeys.deviceEnrolled)) === 'true'
    );
  }

  setDeviceEnrolled(enrolled: boolean): Promise<void> {
    return NativeSecureStorage.setItem(
      SecureKeys.deviceEnrolled,
      enrolled ? 'true' : 'false',
    );
  }

  saveIntegrityVerdict(verdict: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.integrityVerdict, verdict);
  }

  getIntegrityVerdict(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.integrityVerdict);
  }

  /**
   * Secreto del token suave, en base32.
   *
   * El banco lo entrega **una sola vez** y desde entonces el código se calcula
   * en el teléfono sin red. Vive aquí y no en la sesión porque pertenece al
   * cliente: borrarlo al cerrar sesión obligaría a pedirlo otra vez, y el
   * backend responde `AlreadyProvisioned` sin volver a darlo.
   */
  getSoftTokenSecret(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.softTokenSecret);
  }

  saveSoftTokenSecret(secreto: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.softTokenSecret, secreto);
  }

  // ─── Preferencias de acceso ─────────────────────────────────────────────

  getLastUserName(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.lastUserName);
  }

  saveLastUserName(name: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.lastUserName, name);
  }

  /**
   * Cuándo entró el cliente por última vez, ya formateado.
   *
   * Se guarda el texto y no la fecha porque es lo que hace el original, y
   * porque el dato solo existe para enseñarlo: no se compara ni se ordena.
   */
  getLastAccess(): Promise<string | null> {
    return NativeSecureStorage.getItem(SecureKeys.lastAccess);
  }

  saveLastAccess(marca: string): Promise<void> {
    return NativeSecureStorage.setItem(SecureKeys.lastAccess, marca);
  }

  /**
   * Olvida al cliente recordado.
   *
   * Es lo que hace «Cambiar cuenta». Borra el nombre **y la marca de último
   * acceso**: dejar la marca enseñaría «Último acceso: hoy, 3:44 p.m.» junto a
   * un saludo genérico, que es una mezcla que no significa nada.
   */
  clearLastUser(): Promise<void> {
    return NativeSecureStorage.removeItems([
      SecureKeys.lastUserName,
      SecureKeys.lastAccess,
    ]);
  }

  async isBiometricEnabled(): Promise<boolean> {
    return (
      (await NativeSecureStorage.getItem(SecureKeys.biometricEnabled)) ===
      'true'
    );
  }

  setBiometricEnabled(enabled: boolean): Promise<void> {
    return NativeSecureStorage.setItem(
      SecureKeys.biometricEnabled,
      enabled ? 'true' : 'false',
    );
  }

  // ─── Borrado total ──────────────────────────────────────────────────────

  /**
   * Borra absolutamente todo, incluido lo del dispositivo.
   *
   * Solo para revocar el dispositivo o desinstalar lógicamente: después de
   * esto el cliente tiene que volver a enrolar el teléfono.
   */
  wipeEverything(): Promise<void> {
    return NativeSecureStorage.removeItems(Object.values(SecureKeys));
  }
}
