import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * D-18: el mecanismo de inyección de la URL del backend.
 *
 * La decisión se separó en dos, y esta prueba cubre solo la mitad que es
 * trabajo de ingeniería: **cómo** se pone la URL en una compilación. *Cuál* es
 * la de producción sigue siendo decisión del banco y no se escribe en ninguna
 * parte del repositorio.
 *
 * Lo que esto desbloquea es V-16: hasta ahora el APK de release no contenía
 * ninguna URL, así que no pasaba de la pantalla de acceso y **los fallos que R8
 * introduce —reflexión, minificación, serialización— no se podían probar en
 * ningún camino de dinero**.
 *
 * La prueba mira `build.gradle` y `config.ts` porque el mecanismo vive ahí y no
 * en código que Jest pueda ejecutar: el valor lo escribe Gradle en
 * `BuildConfig` durante la compilación.
 */

const RAIZ = join(__dirname, '..', '..', '..');

const leer = (...partes: string[]): string =>
  readFileSync(join(RAIZ, ...partes), 'utf8');

const gradle = leer('android', 'app', 'build.gradle');
const config = leer('src', 'app', 'config.ts');
const spec = leer('src', 'specs', 'NativeDeviceIntegrity.ts');
const kotlin = leer(
  'android',
  'app',
  'src',
  'main',
  'java',
  'com',
  'bsc',
  'mobile',
  'security',
  'DeviceIntegrityModule.kt',
);

describe('la URL del backend se inyecta en la compilación', () => {
  it('Gradle la escribe en BuildConfig', () => {
    expect(gradle).toContain('buildConfigField "String", "BSC_BASE_URL"');
  });

  it('y activa buildConfig, sin lo cual no genera nada', () => {
    // Desde AGP 8 `buildConfigField` no produce el campo sin esta bandera, y el
    // fallo aparece como «unresolved reference: BSC_BASE_URL» al compilar.
    expect(gradle).toContain('buildConfig true');
  });

  it('la toma de la línea de órdenes o del entorno', () => {
    expect(gradle).toContain('bscBaseUrl');
    expect(gradle).toContain('BSC_BASE_URL');
  });

  it('el módulo nativo la expone como constante síncrona', () => {
    // Síncrona a propósito: la URL hace falta para construir el cliente HTTP,
    // que se arma en el primer render.
    expect(kotlin).toContain('getTypedExportedConstants');
    expect(kotlin).toContain('BuildConfig.BSC_BASE_URL');
    expect(spec).toContain('getConstants()');
  });

  it('y la aplicación la lee de ahí en release', () => {
    expect(config).toContain('urlInyectada()');
    expect(config).toContain('NativeDeviceIntegrity.getConstants().baseUrl');
  });
});

describe('lo que NO debe pasar', () => {
  it('no hay ninguna URL de producción escrita en el código', () => {
    // Es el defecto que traía la app Flutter (T-10): con un respaldo escrito,
    // una compilación mal configurada apunta en silencio a donde no debe en vez
    // de fallar. Si esta prueba se pone en rojo hay que quitar la URL, no
    // cambiar la prueba.
    const urls = config.match(/https?:\/\/[^\s'"`]+/gu) ?? [];
    const soloLocal = urls.every(u => u.includes('localhost'));

    expect(soloLocal ? 'solo localhost' : urls.join(', ')).toBe(
      'solo localhost',
    );
  });

  it('un fallo al leer la constante no tumba el arranque', () => {
    // Un módulo que no cargó debe dar un error de red claro, no una excepción
    // en el primer render.
    expect(config).toContain('catch');
  });
});

describe('qué URL usa cada compilación', () => {
  /** Carga `config.ts` de nuevo, con `__DEV__` y la URL inyectada pedidos. */
  function configCon(dev: boolean, inyectada: string): { baseURL: string } {
    const global = globalThis as unknown as { __DEV__: boolean };
    const antes = global.__DEV__;
    let resultado: { baseURL: string } | undefined;
    global.__DEV__ = dev;
    try {
      jest.isolateModules(() => {
        jest.doMock('../../specs/NativeDeviceIntegrity', () => ({
          __esModule: true,
          default: { getConstants: () => ({ baseUrl: inyectada }) },
        }));
        resultado = require('../config').appConfig;
      });
    } finally {
      global.__DEV__ = antes;
    }
    return resultado!;
  }

  it('depuración sin URL inyectada usa el backend local', () => {
    expect(configCon(true, '').baseURL).toBe('http://localhost:5000');
  });

  it('depuración con URL inyectada usa esa (así se depura contra QA)', () => {
    expect(configCon(true, 'https://qa.bsc.invalid').baseURL).toBe('https://qa.bsc.invalid');
  });

  it('release sin URL inyectada no inventa ninguna', () => {
    // T-10: vacía, para que la app falle en vez de apuntar a donde no debe.
    expect(configCon(false, '').baseURL).toBe('');
  });

  it('release con URL inyectada usa esa', () => {
    expect(configCon(false, 'https://api.bsc.invalid').baseURL).toBe('https://api.bsc.invalid');
  });
});
