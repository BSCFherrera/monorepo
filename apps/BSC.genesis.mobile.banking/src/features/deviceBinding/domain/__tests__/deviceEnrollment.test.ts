import NativeDeviceKey from '../../../../specs/NativeDeviceKey';
import { SecureStorage } from '../../../../core/security/secureStorage';
import { DeviceBindingState } from '../../../../core/security/signingOutcome';
import type { ResultadoDeDispositivo } from '../../data/deviceContracts';
import type { DeviceRepository } from '../../data/deviceRepository';
import { DeviceBindingService } from '../deviceBindingService';
import {
  DESCRIPCION_GENERICA,
  generarDeviceId,
  nombreLegible,
  sistemaLegible,
} from '../deviceDescription';

/**
 * El enrolamiento del dispositivo.
 *
 * Es la pieza sin la cual la firma en StrongBox de la oleada 0 no sirve de
 * nada en un teléfono real: sin llave registrada, toda operación cae al código
 * de verificación. Lo que se prueba aquí no es que las llamadas ocurran, sino
 * **en qué orden ocurren y qué queda escrito cuando algo falla a mitad** —que
 * es donde esta clase de código deja al cliente encerrado.
 */

const NATIVA = NativeDeviceKey as unknown as {
  isSupported: jest.Mock;
  hasKey: jest.Mock;
  createKey: jest.Mock;
  deleteKey: jest.Mock;
  describeKey: jest.Mock;
};

const ok = (mensaje = 'Listo'): ResultadoDeDispositivo => ({
  exito: true,
  codigoDeError: null,
  mensaje,
  autorizacionId: null,
});

const falla = (
  mensaje: string,
  codigoDeError: string | null = null,
): ResultadoDeDispositivo => ({
  exito: false,
  codigoDeError,
  mensaje,
  autorizacionId: null,
});

/** Un repositorio que apunta el orden de las llamadas. */
function repositorio(
  respuestas: {
    registrar?: ResultadoDeDispositivo;
    verificar?: ResultadoDeDispositivo;
    registrarLlave?: ResultadoDeDispositivo;
    revocar?: ResultadoDeDispositivo;
  } = {},
): DeviceRepository & { pasos: string[]; ultimoRegistro: unknown } {
  const pasos: string[] = [];
  let ultimoRegistro: unknown = null;

  return {
    pasos,
    get ultimoRegistro() {
      return ultimoRegistro;
    },
    registrar: jest.fn(async (descripcion: unknown) => {
      pasos.push('registrar');
      ultimoRegistro = descripcion;
      return respuestas.registrar ?? ok();
    }),
    verificar: jest.fn(async () => {
      pasos.push('verificar');
      return respuestas.verificar ?? ok();
    }),
    registrarLlave: jest.fn(async () => {
      pasos.push('registrarLlave');
      return respuestas.registrarLlave ?? ok();
    }),
    listar: jest.fn(async () => []),
    revocar: jest.fn(async () => {
      pasos.push('revocar');
      return respuestas.revocar ?? ok();
    }),
    pedirReto: jest.fn(async () => null),
    verificarFirma: jest.fn(async () => ({
      exito: false,
      mensaje: '',
      autorizacionId: null,
    })),
  } as unknown as DeviceRepository & {
    pasos: string[];
    ultimoRegistro: unknown;
  };
}

function servicio(repo: DeviceRepository): {
  binding: DeviceBindingService;
  almacenamiento: SecureStorage;
} {
  const almacenamiento = new SecureStorage();
  return {
    binding: new DeviceBindingService(repo, almacenamiento),
    almacenamiento,
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  NATIVA.isSupported.mockResolvedValue(true);
  NATIVA.hasKey.mockResolvedValue(false);
  NATIVA.deleteKey.mockResolvedValue(true);
  NATIVA.describeKey.mockResolvedValue({ present: false });
  NATIVA.createKey.mockResolvedValue({
    publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE',
    algorithm: 'EC-P256',
    security: {
      present: true,
      backing: 'strongbox',
      userAuthenticationRequired: true,
      invalidatedByBiometricEnrollment: true,
    },
  });

  // El almacén de las pruebas es un mapa compartido entre casos.
  await new SecureStorage().wipeEverything();
});

describe('el identificador de la instalación', () => {
  it('se crea una vez y no cambia', async () => {
    /*
      Si cambiara en cada arranque, el cliente acumularía dispositivos fantasma
      y agotaría el límite de cinco que impone el banco: se quedaría sin poder
      registrar el teléfono que sí usa.
    */
    const { binding } = servicio(repositorio());

    const primero = await binding.asegurarDeviceId();
    const segundo = await binding.asegurarDeviceId();

    expect(primero).toBe(segundo);
    expect(primero).toMatch(/^bsc-[0-9a-f]+-[0-9a-f]+$/u);
  });

  it('firmar no crea uno: eso es tarea del enrolamiento', async () => {
    // Crear el identificador al firmar inventaría un dispositivo que el banco
    // no conoce, y el reto fallaría con un error que no dice qué hacer.
    const { binding } = servicio(repositorio());

    expect(await binding.deviceId()).toBeNull();
  });

  it('dos instalaciones distintas no comparten identificador', () => {
    expect(generarDeviceId('Pixel 10a-Android 16', 1_758_000_000_000)).not.toBe(
      generarDeviceId('Pixel 10a-Android 16', 1_758_000_000_001),
    );
  });
});

describe('cómo se describe el teléfono ante el banco', () => {
  it('compone un nombre que el cliente reconozca en el correo de aviso', () => {
    // Es con este texto con lo que decide si el registro fue suyo.
    expect(nombreLegible('Google', 'Pixel 10a')).toBe('Google Pixel 10a');
    expect(nombreLegible('samsung', 'SM-S928B')).toBe('samsung SM-S928B');
  });

  it('no repite el fabricante cuando el modelo ya lo lleva', () => {
    expect(nombreLegible('Xiaomi', 'Xiaomi 14')).toBe('Xiaomi 14');
  });

  it('sin datos del dispositivo usa el genérico en vez de quedarse vacío', () => {
    expect(nombreLegible(undefined, undefined)).toBe(
      DESCRIPCION_GENERICA.nombre,
    );
    expect(nombreLegible('', '  ')).toBe(DESCRIPCION_GENERICA.nombre);
  });

  it('nombra el sistema operativo con su versión', () => {
    expect(sistemaLegible('android', '16')).toBe('Android 16');
    expect(sistemaLegible('ios', '26.0')).toBe('iOS 26.0');
    expect(sistemaLegible('android', undefined)).toBe('Android');
  });
});

describe('iniciarEnrolamiento', () => {
  it('registra el dispositivo con su veredicto de integridad', async () => {
    const repo = repositorio();
    const { binding } = servicio(repo);

    const resultado = await binding.iniciarEnrolamiento();

    expect(resultado.exito).toBe(true);
    expect(repo.pasos).toEqual(['registrar']);
    expect(repo.ultimoRegistro).toMatchObject({
      veredictoDeIntegridad: 'ok',
      reEnrolar: false,
    });
  });

  it('un teléfono que no puede sostener la llave no llega a registrarse', async () => {
    /*
      Se le dice ahora y no después de haberle mandado un código: un cliente que
      recibe el código y luego descubre que su teléfono no sirve ha gastado un
      paso y una confianza para nada.
    */
    NATIVA.isSupported.mockResolvedValue(false);
    const repo = repositorio();
    const { binding } = servicio(repo);

    const resultado = await binding.iniciarEnrolamiento();

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoDeError).toBe('UNSUPPORTED');
    expect(repo.pasos).toEqual([]);
    // El mensaje le ofrece la salida que sí tiene.
    expect(resultado.mensaje).toContain('código de verificación');
  });

  it('un módulo de llaves que no responde se trata como no soportado', async () => {
    // No se asume que sí: asumirlo dejaría al cliente en un enrolamiento que no
    // puede completar.
    NATIVA.isSupported.mockRejectedValue(new Error('sin puente nativo'));
    const { binding } = servicio(repositorio());

    expect((await binding.iniciarEnrolamiento()).codigoDeError).toBe(
      'UNSUPPORTED',
    );
  });

  it('pide re-enrolar cuando el banco lo tiene activo y la llave se perdió', async () => {
    /*
      Es el caso de reinstalar la app o de cambiar la biometría del teléfono.
      Sin esta bandera el banco respondería que el dispositivo ya está activo y
      el cliente quedaría encerrado: su teléfono cree que no puede firmar y el
      banco cree que sí.
    */
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    await binding.asegurarDeviceId();
    await almacenamiento.setDeviceEnrolled(true);
    NATIVA.hasKey.mockResolvedValue(false);

    expect(await binding.estado()).toBe(DeviceBindingState.KeyLost);

    await binding.iniciarEnrolamiento();

    expect(repo.ultimoRegistro).toMatchObject({ reEnrolar: true });
  });
});

describe('completarEnrolamiento', () => {
  it('verifica el código ANTES de crear la llave', async () => {
    /*
      El orden es la decisión de seguridad de esta pantalla. Si la llave se
      creara primero, un enrolamiento abandonado dejaría una llave huérfana en
      el teléfono que el banco no conoce: `estado()` respondería «listo» y cada
      operación gastaría un diálogo biométrico para terminar rechazada.
    */
    const repo = repositorio();
    const { binding } = servicio(repo);

    await binding.completarEnrolamiento('123456');

    expect(repo.pasos).toEqual(['verificar', 'registrarLlave']);
    expect(NATIVA.createKey).toHaveBeenCalledTimes(1);
  });

  it('un código rechazado no crea ninguna llave', async () => {
    const repo = repositorio({
      verificar: falla('El código no es válido. Te quedan 2 intentos.'),
    });
    const { binding, almacenamiento } = servicio(repo);

    const resultado = await binding.completarEnrolamiento('000000');

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toContain('2 intentos');
    expect(NATIVA.createKey).not.toHaveBeenCalled();
    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('si el banco no acepta la llave, la del teléfono se borra', async () => {
    /*
      Dejarla haría creer a la app que puede firmar con una llave que el
      servidor no reconoce. El cliente vería el diálogo de huella y un rechazo
      después, sin saber por qué.
    */
    const repo = repositorio({
      registrarLlave: falla('La llave no cumple los requisitos.'),
    });
    const { binding, almacenamiento } = servicio(repo);

    const resultado = await binding.completarEnrolamiento('123456');

    expect(resultado.exito).toBe(false);
    expect(NATIVA.deleteKey).toHaveBeenCalled();
    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('si el hardware no puede crear la llave, no queda residuo', async () => {
    NATIVA.createKey.mockRejectedValue(new Error('strongbox no disponible'));
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    const resultado = await binding.completarEnrolamiento('123456');

    expect(resultado.exito).toBe(false);
    // El código lleva el prefijo `KEY_` para distinguir un fallo del hardware
    // del teléfono de un rechazo del banco: son dos conversaciones distintas
    // con el cliente y con soporte.
    expect(resultado.codigoDeError).toMatch(/^KEY_/u);
    expect(repo.pasos).toEqual(['verificar']);
    expect(NATIVA.deleteKey).toHaveBeenCalled();
    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('una llave sin parte pública se descarta en vez de enviarse vacía', async () => {
    // El backend aceptaría una cadena vacía y guardaría una llave inútil: el
    // cliente quedaría enrolado y sin poder firmar nunca.
    NATIVA.createKey.mockResolvedValue({
      publicKey: null,
      algorithm: 'EC-P256',
      security: { present: true },
    });
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    const resultado = await binding.completarEnrolamiento('123456');

    expect(resultado.exito).toBe(false);
    expect(repo.pasos).toEqual(['verificar']);
    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('con todo en orden el teléfono queda enrolado y puede firmar', async () => {
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    const resultado = await binding.completarEnrolamiento('123456');
    NATIVA.hasKey.mockResolvedValue(true);

    expect(resultado.exito).toBe(true);
    expect(await almacenamiento.isDeviceEnrolled()).toBe(true);
    expect(await binding.estado()).toBe(DeviceBindingState.Ready);
    expect(await binding.puedeFirmar()).toBe(true);
  });

  it('avisa cuando el teléfono protege peor de lo que el banco pide', async () => {
    /*
      Se registra igual —negarlo dejaría fuera a teléfonos legítimos— pero se le
      dice al cliente que algunas operaciones seguirán pidiendo código, para que
      no lo viva como un fallo cuando ocurra.
    */
    NATIVA.createKey.mockResolvedValue({
      publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE',
      algorithm: 'EC-P256',
      security: {
        present: true,
        backing: 'software',
        userAuthenticationRequired: true,
        invalidatedByBiometricEnrollment: false,
      },
    });
    const { binding } = servicio(repositorio());

    const resultado = await binding.completarEnrolamiento('123456');

    expect(resultado.exito).toBe(true);
    expect(resultado.mensaje).toContain('protección menor');
  });
});

describe('revocación', () => {
  it('revocar este teléfono borra la llave y lo marca como no enrolado', async () => {
    /*
      Las dos cosas, siempre. Revocar en el banco y dejar la llave haría que la
      app creyera que puede firmar cuando el servidor ya no la acepta.
    */
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    await binding.completarEnrolamiento('123456');
    expect(await almacenamiento.isDeviceEnrolled()).toBe(true);

    const resultado = await binding.revocarEsteDispositivo();

    expect(resultado.exito).toBe(true);
    expect(repo.pasos).toContain('revocar');
    expect(NATIVA.deleteKey).toHaveBeenCalled();
    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('revocar desde la lista el teléfono que se está usando también lo limpia', async () => {
    // El cliente no tiene por qué saber cuál de los cinco de la lista es el
    // suyo, y si acierta sin querer la app no puede quedarse creyendo que firma.
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    await binding.completarEnrolamiento('123456');
    const id = await binding.asegurarDeviceId();

    await binding.revocarDispositivo(id);

    expect(await almacenamiento.isDeviceEnrolled()).toBe(false);
  });

  it('revocar otro teléfono no toca la llave de este', async () => {
    const repo = repositorio();
    const { binding, almacenamiento } = servicio(repo);

    await binding.completarEnrolamiento('123456');
    jest.clearAllMocks();

    await binding.revocarDispositivo('bsc-el-de-otro-telefono');

    expect(NATIVA.deleteKey).not.toHaveBeenCalled();
    expect(await almacenamiento.isDeviceEnrolled()).toBe(true);
  });

  it('un teléfono que nunca se enroló se limpia sin llamar al banco', async () => {
    // No hay nada que revocar, pero sí puede quedar una llave de un
    // enrolamiento abandonado.
    const repo = repositorio();
    const { binding } = servicio(repo);

    const resultado = await binding.revocarEsteDispositivo();

    expect(resultado.exito).toBe(true);
    expect(repo.pasos).toEqual([]);
    expect(NATIVA.deleteKey).toHaveBeenCalled();
  });

  it('un fallo al borrar la llave no tapa el resultado de la revocación', async () => {
    NATIVA.deleteKey.mockRejectedValue(new Error('el almacén no respondió'));
    const repo = repositorio({ revocar: ok('Dispositivo revocado.') });
    const { binding } = servicio(repo);

    await binding.asegurarDeviceId();

    await expect(binding.revocarEsteDispositivo()).resolves.toMatchObject({
      exito: true,
    });
  });
});
