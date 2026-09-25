/**
 * Preparación común de las pruebas.
 *
 * Los módulos nativos se resuelven con `TurboModuleRegistry.getEnforcing`, que
 * falla **al importar** si el binario nativo no los registra. En un teléfono eso
 * es lo correcto —vale más un error claro al arrancar que una llamada que
 * devuelve `undefined` a mitad de una transferencia—, pero en Jest no hay
 * binario nativo, así que cualquier archivo que importe la llave del
 * dispositivo no se podría ni cargar.
 *
 * Estos dobles solo permiten que el árbol de módulos se cargue. **No simulan la
 * criptografía**: rechazan si alguien intenta firmar desde una prueba, para que
 * nadie confunda un mock con una verificación real. La firma solo se verifica en
 * un dispositivo con hardware seguro — ver `SecurityCheckScreen`.
 */

jest.mock('./src/specs/NativeDeviceKey', () => ({
  __esModule: true,
  default: {
    isSupported: jest.fn(async () => false),
    hasKey: jest.fn(async () => false),
    getPublicKey: jest.fn(async () => null),
    deleteKey: jest.fn(async () => false),
    describeKey: jest.fn(async () => ({ present: false })),
    createKey: jest.fn(async () => {
      throw new Error(
        'La generación de llaves no se simula: requiere hardware seguro real',
      );
    }),
    sign: jest.fn(async () => {
      throw new Error(
        'La firma no se simula: requiere hardware seguro real. ' +
          'Verifícala en un dispositivo con SecurityCheckScreen.',
      );
    }),
  },
}));

jest.mock('./src/specs/NativeSecureScreen', () => ({
  __esModule: true,
  default: {
    setSecure: jest.fn(async () => undefined),
  },
}));

/**
 * La verificación biométrica se simula como **no disponible** por defecto.
 *
 * Es la elección conservadora: una prueba que asuma biometría disponible pasaría
 * por un camino que muchos teléfonos reales no tienen. Las pruebas que
 * necesiten el otro caso lo declaran ellas mismas.
 */
jest.mock('./src/specs/NativeBiometric', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn(async () => false),
    hasFaceUnlock: jest.fn(async () => false),
    authenticate: jest.fn(async () => false),
  },
}));

/**
 * El almacenamiento seguro sí se simula con un mapa en memoria, a diferencia de
 * la firma: aquí lo que se prueba es **qué claves se leen y se borran**, no el
 * cifrado —que lo hace el sistema operativo y no tiene sentido reimplementar
 * para una prueba—. El comportamiento que importa es que cerrar sesión borre
 * las credenciales y deje intacto lo que pertenece al teléfono.
 */
jest.mock('./src/specs/NativeSecureStorage', () => {
  const almacen = new Map();

  return {
    __esModule: true,
    default: {
      __almacen: almacen,
      getItem: jest.fn(async (key) => (almacen.has(key) ? almacen.get(key) : null)),
      setItem: jest.fn(async (key, value) => {
        almacen.set(key, value);
      }),
      removeItem: jest.fn(async (key) => {
        almacen.delete(key);
      }),
      removeItems: jest.fn(async (keys) => {
        for (const key of keys) almacen.delete(key);
      }),
    },
  };
});

/**
 * La integridad del dispositivo se simula como **limpia**.
 *
 * `evaluarIntegridad()` devuelve `ok` en desarrollo sin llegar a llamar al
 * módulo, así que este doble existe para que el árbol cargue y para que las
 * pruebas que quieran el otro camino puedan declararlo. Igual que con la firma,
 * no simula ninguna comprobación real: las sondas de root solo se pueden
 * verificar en un teléfono.
 */
jest.mock('./src/specs/NativeDeviceIntegrity', () => ({
  __esModule: true,
  default: {
    isDeviceCompromised: jest.fn(async () => false),
    isDebuggerAttached: jest.fn(async () => false),
    getPackageName: jest.fn(async () => 'com.bsc.mobile'),
    getAppVersion: jest.fn(async () => '0.1.0'),
    getAppBuild: jest.fn(async () => '100'),
  },
}));

/*
  Las traducciones, en español como en la app. Van al final: cargan el almacén
  de idioma, que usa `NativeSecureStorage`, y ese módulo tiene que estar ya
  sustituido por su doble.
*/
require('./src/i18n');
