import { createApiClient, TIMEOUT_MS } from '../apiClient';
import { Endpoints, deviceRevoke } from '../endpoints';
import { InMemoryTokenStore } from '../../security/tokenStore';

describe('createApiClient', () => {
  const store = new InMemoryTokenStore();

  it('exige una URL base explícita', () => {
    // La app Flutter traía una dirección interna del banco como valor de
    // respaldo. Aquí una compilación mal configurada falla al arrancar, que es
    // preferible a una que apunte en silencio a un servidor equivocado.
    expect(() => createApiClient({ baseURL: '', store })).toThrow(/URL base/);
  });

  it('conserva las cabeceras que identifican el canal', () => {
    // El backend distingue el canal por estas cabeceras: cambiarlas cambia cómo
    // se registra y se autoriza la operación del otro lado.
    const cliente = createApiClient({ baseURL: 'http://test.local', store });

    expect(cliente.defaults.headers['X-Channel']).toBe('MobileBanking');
    expect(cliente.defaults.headers['X-Channel-Type']).toBe('2');
    expect(cliente.defaults.headers.Accept).toBe('application/json');
  });

  it('usa los mismos 30 segundos de espera que la app Flutter', () => {
    const cliente = createApiClient({ baseURL: 'http://test.local', store });

    expect(TIMEOUT_MS).toBe(30_000);
    expect(cliente.defaults.timeout).toBe(30_000);
  });
});

describe('catálogo de rutas', () => {
  it('todas las rutas cuelgan de /api/v1', () => {
    for (const [nombre, ruta] of Object.entries(Endpoints)) {
      expect({ nombre, empieza: ruta.startsWith('/api/v1/') }).toEqual({
        nombre,
        empieza: true,
      });
    }
  });

  it('conserva la errata «retrive» del backend', () => {
    // No es un error de transcripción: el servidor la escribe así, y
    // «corregirla» rompería la consulta de comprobantes fiscales.
    expect(Endpoints.ncfDetail).toContain('/retrive');
  });

  it('la revocación de dispositivo escapa el identificador', () => {
    expect(deviceRevoke('abc/../otro')).toBe('/api/v1/devices/abc%2F..%2Fotro');
  });
});
