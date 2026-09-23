import {
  estaActivo,
  estaPendiente,
  etiquetaDeEstado,
  exigeVerificacionPresencial,
  falloDeIntegridad,
  parseDispositivo,
  parseDispositivos,
  parseResultadoDeDispositivo,
} from '../deviceContracts';

/**
 * El contrato de `/devices/*`.
 *
 * Se prueba contra las dos serializaciones —el gateway responde en PascalCase y
 * TokenBSC en camelCase— porque confundirlas no produce ningún error: produce
 * una pantalla en blanco. Ya pasó cuatro veces en esta migración.
 */

describe('parseDispositivo', () => {
  it('lee la respuesta del gateway en PascalCase', () => {
    const dispositivo = parseDispositivo({
      DeviceId: 'bsc-1a2b3c4d-18f0',
      DeviceName: 'Google Pixel 10a',
      DeviceOS: 'Android 16',
      Status: 'Active',
      IsVerified: true,
      LastUsedAt: '2026-09-15T14:32:00Z',
      RegisteredAt: '2026-08-01T09:00:00Z',
    });

    expect(dispositivo.deviceId).toBe('bsc-1a2b3c4d-18f0');
    expect(dispositivo.nombre).toBe('Google Pixel 10a');
    expect(dispositivo.sistemaOperativo).toBe('Android 16');
    expect(estaActivo(dispositivo)).toBe(true);
    expect(dispositivo.ultimoUso?.toISOString()).toBe(
      '2026-09-15T14:32:00.000Z',
    );
    expect(dispositivo.registradoEn?.toISOString()).toBe(
      '2026-08-01T09:00:00.000Z',
    );
  });

  it('lee la respuesta de TokenBSC en camelCase', () => {
    const dispositivo = parseDispositivo({
      deviceId: 'bsc-otro',
      deviceName: 'iPhone 17',
      deviceOS: 'iOS 26',
      status: 'PendingVerification',
      isVerified: false,
    });

    expect(dispositivo.deviceId).toBe('bsc-otro');
    expect(estaPendiente(dispositivo)).toBe(true);
    expect(estaActivo(dispositivo)).toBe(false);
  });

  it('la fecha de registro se lee de RegisteredAt, no de CreatedAt', () => {
    /*
      Regresión del defecto del original: leía `CreatedAt` y el backend manda
      `RegisteredAt`, así que la fecha llegaba siempre nula. Como la fila
      «Registrado» solo se dibuja cuando el dato existe, el fallo no se veía
      como un error sino como una tarjeta más corta — y por eso sobrevivió.
    */
    const dispositivo = parseDispositivo({
      DeviceId: 'x',
      RegisteredAt: '2026-08-01T09:00:00Z',
    });

    expect(dispositivo.registradoEn).not.toBeNull();
  });

  it('una fecha ilegible queda nula en vez de producir una fecha inválida', () => {
    // Una `Date` inválida se formatea como «Invalid Date» y eso llegaría a la
    // pantalla del cliente.
    const dispositivo = parseDispositivo({
      DeviceId: 'x',
      LastUsedAt: 'no es una fecha',
    });

    expect(dispositivo.ultimoUso).toBeNull();
  });

  it('un dispositivo sin nombre no se queda sin etiqueta', () => {
    expect(parseDispositivo({}).nombre).toBe('Dispositivo móvil');
    expect(parseDispositivo({}).estado).toBe('Unknown');
  });
});

describe('etiquetaDeEstado', () => {
  const con = (estado: string, verificado = true): string =>
    etiquetaDeEstado(
      parseDispositivo({ Status: estado, IsVerified: verificado }),
    );

  it('traduce cada estado del backend', () => {
    expect(con('Active')).toBe('Activo');
    expect(con('PendingVerification')).toBe('Pendiente de verificación');
    expect(con('Suspended')).toBe('Suspendido');
    expect(con('Revoked')).toBe('Revocado');
  });

  it('un activo sin verificar no se anuncia como activo', () => {
    // Es la distinción que importa: el cliente creería que puede firmar.
    expect(con('Active', false)).toBe('Sin verificar');
  });

  it('un estado desconocido se muestra tal cual en vez de desaparecer', () => {
    // La lección del catálogo de productos: un valor que el porte no conoce no
    // debe hacer que la fila se esfume.
    expect(con('AlgoNuevo')).toBe('AlgoNuevo');
  });
});

describe('parseDispositivos', () => {
  it('lee la lista con cualquiera de las dos claves', () => {
    expect(parseDispositivos({ Devices: [{ DeviceId: 'a' }] })).toHaveLength(1);
    expect(parseDispositivos({ devices: [{ deviceId: 'b' }] })).toHaveLength(1);
  });

  it('una respuesta sin lista da el arreglo vacío y no lanza', () => {
    expect(parseDispositivos({ Success: true })).toEqual([]);
    expect(parseDispositivos(null)).toEqual([]);
    expect(parseDispositivos('vaya')).toEqual([]);
  });
});

describe('parseResultadoDeDispositivo', () => {
  it('conserva el mensaje del servidor', () => {
    // Cada rechazo pide una acción distinta del cliente, así que sustituirlo
    // por un genérico le quita la única pista que tiene.
    const resultado = parseResultadoDeDispositivo({
      Success: false,
      ErrorCode: 'DEVICE_003',
      Message: 'Alcanzaste el límite de cinco dispositivos.',
    });

    expect(resultado.exito).toBe(false);
    expect(resultado.mensaje).toBe(
      'Alcanzaste el límite de cinco dispositivos.',
    );
  });

  it('reconoce el dispositivo que necesita verificación presencial', () => {
    // No es un error del cliente y la hoja no debe presentarlo como tal.
    const resultado = parseResultadoDeDispositivo({
      Success: false,
      ErrorCode: 'DEVICE_009',
      Message: 'Acércate a una sucursal para verificar tu identidad.',
    });

    expect(exigeVerificacionPresencial(resultado)).toBe(true);
    expect(falloDeIntegridad(resultado)).toBe(false);
  });

  it('reconoce el fallo de integridad', () => {
    expect(
      falloDeIntegridad(
        parseResultadoDeDispositivo({
          Success: false,
          ErrorCode: 'DEVICE_005',
        }),
      ),
    ).toBe(true);
  });

  it('recoge la autorización cuando la verificación de firma la emite', () => {
    const resultado = parseResultadoDeDispositivo({
      Success: true,
      AuthorizationId: '0f9c2a11-4d2e-4d0a-9f3b-1c6a5d8e7b40',
    });

    expect(resultado.autorizacionId).toBe(
      '0f9c2a11-4d2e-4d0a-9f3b-1c6a5d8e7b40',
    );
  });

  it('una respuesta vacía no se lee como éxito', () => {
    // Un `Success` ausente tiene que ser «no», nunca «sí»: lo contrario
    // marcaría el dispositivo como enrolado sin que el banco lo sepa.
    expect(parseResultadoDeDispositivo({}).exito).toBe(false);
    expect(parseResultadoDeDispositivo(null).exito).toBe(false);
  });
});
