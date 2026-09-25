

import NativeSecureStorage from '../../../specs/NativeSecureStorage';
import { SecureStorage, SecureKeys } from '../secureStorage';

const almacen = (
  NativeSecureStorage as unknown as { __almacen: Map<string, string> }
).__almacen;

describe('SecureStorage — sesión', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    almacen.clear();
    storage = new SecureStorage();
  });

  it('guarda y recupera el par de tokens', async () => {
    await storage.saveAccessToken('acceso-1');
    await storage.saveRefreshToken('refresco-1');
    await storage.saveTokenExpiry('2099-01-01T00:00:00Z');

    expect(await storage.getAccessToken()).toBe('acceso-1');
    expect(await storage.getRefreshToken()).toBe('refresco-1');
    expect(await storage.getTokenExpiry()).toBe('2099-01-01T00:00:00Z');
  });

  it('devuelve null cuando no hay nada guardado', async () => {
    expect(await storage.getAccessToken()).toBeNull();
    expect(await storage.getRefreshToken()).toBeNull();
  });

  it('cerrar sesión borra las credenciales', async () => {
    await storage.saveAccessToken('acceso-1');
    await storage.saveRefreshToken('refresco-1');
    await storage.saveTokenExpiry('2099-01-01T00:00:00Z');

    await storage.clearSession();

    expect(await storage.getAccessToken()).toBeNull();
    expect(await storage.getRefreshToken()).toBeNull();
    expect(await storage.getTokenExpiry()).toBeNull();
  });

  it('cerrar sesión NO borra lo que pertenece al teléfono', async () => {
    // Es la regla que evita que el cliente tenga que re-enrolar el dispositivo
    // cada vez que cierra sesión.
    await storage.saveDeviceInstallId('bsc-abc123');
    await storage.setDeviceEnrolled(true);
    await storage.saveIntegrityVerdict('ok');
    almacen.set(SecureKeys.softTokenSecret, 'secreto-totp');
    await storage.saveAccessToken('acceso-1');

    await storage.clearSession();

    expect(await storage.getDeviceInstallId()).toBe('bsc-abc123');
    expect(await storage.isDeviceEnrolled()).toBe(true);
    expect(await storage.getIntegrityVerdict()).toBe('ok');
    expect(almacen.get(SecureKeys.softTokenSecret)).toBe('secreto-totp');
    expect(await storage.getAccessToken()).toBeNull();
  });

  it('cerrar sesión tampoco borra el nombre del último usuario', async () => {
    // Permite saludar por su nombre en la pantalla de acceso sin sesión activa.
    await storage.saveLastUserName('R. Ceballos');
    await storage.clearSession();

    expect(await storage.getLastUserName()).toBe('R. Ceballos');
  });

  it('borra en una sola transacción, no clave por clave', async () => {
    // Si se borrara una a una y la app muriera a mitad, quedaría un estado
    // imposible: token de renovación sin token de acceso.
    await storage.saveAccessToken('acceso-1');
    (NativeSecureStorage.removeItems as jest.Mock).mockClear();
    (NativeSecureStorage.removeItem as jest.Mock).mockClear();

    await storage.clearSession();

    expect(NativeSecureStorage.removeItems).toHaveBeenCalledTimes(1);
    expect(NativeSecureStorage.removeItem).not.toHaveBeenCalled();
  });
});

describe('SecureStorage — banderas', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    almacen.clear();
    storage = new SecureStorage();
  });

  it('las banderas ausentes son falsas, no indefinidas', async () => {
    // Un `undefined` aquí encendería una pantalla de biometría a quien nunca la
    // habilitó.
    expect(await storage.isBiometricEnabled()).toBe(false);
    expect(await storage.isDeviceEnrolled()).toBe(false);
  });

  it('las banderas se guardan como cadena y vuelven como booleano', async () => {
    await storage.setBiometricEnabled(true);
    expect(await storage.isBiometricEnabled()).toBe(true);

    await storage.setBiometricEnabled(false);
    expect(await storage.isBiometricEnabled()).toBe(false);
  });

  it('cualquier valor que no sea «true» es falso', async () => {
    almacen.set(SecureKeys.deviceEnrolled, 'si');
    expect(await storage.isDeviceEnrolled()).toBe(false);
  });
});

describe('SecureStorage — borrado total', () => {
  it('wipeEverything borra también lo del dispositivo', async () => {
    const storage = new SecureStorage();
    await storage.saveDeviceInstallId('bsc-abc123');
    await storage.saveAccessToken('acceso-1');
    almacen.set(SecureKeys.softTokenSecret, 'secreto-totp');

    await storage.wipeEverything();

    expect(almacen.size).toBe(0);
  });
});
