import axios, {
  AxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { createAuthInterceptor } from '../authInterceptor';
import { InMemoryTokenStore } from '../../security/tokenStore';

/**
 * Portadas de `BSC.MobileApp/test/core/auth_interceptor_test.dart`, con las
 * mismas ocho situaciones y algunas más.
 *
 * Existen porque la implementación de Flutter anterior a esas pruebas **no
 * podía funcionar**: llamaba a una ruta inexistente y leía un campo con otro
 * nombre. Portarlas primero, antes de escribir el interceptor, es lo que impide
 * repetir esa historia.
 */

/**
 * Responde desde una tabla guionada y registra lo que ve, para poder afirmar
 * qué hace el interceptor sin necesidad de un backend.
 */
class AdaptadorGuionado {
  readonly vistas: InternalAxiosRequestConfig[] = [];

  constructor(
    private readonly guion: Record<
      string,
      Array<[number, Record<string, unknown>]>
    >,
  ) {}

  get llamadasDeRenovacion(): number {
    return this.vistas.filter(r =>
      (r.url ?? '').includes('/auth/refresh-token'),
    ).length;
  }

  cabecerasDeAutorizacionPara(ruta: string): string[] {
    return this.vistas
      .filter(r => (r.url ?? '').includes(ruta))
      .map(r => String(r.headers?.Authorization ?? ''));
  }

  cabeceraDe(indice: number, nombre: string): string {
    return String(this.vistas[indice]?.headers?.[nombre] ?? '');
  }

  get adapter(): AxiosAdapter {
    return async (
      config: InternalAxiosRequestConfig,
    ): Promise<AxiosResponse> => {
      this.vistas.push(config);

      const url = config.url ?? '';
      const clave = Object.keys(this.guion).find(k => url.includes(k));
      const cola = clave === undefined ? [] : this.guion[clave]!;

      const [estado, cuerpo] =
        cola.length === 0
          ? [200, { ok: true }]
          : cola.length === 1
          ? cola[0]!
          : cola.shift()!;

      const respuesta: AxiosResponse = {
        data: cuerpo,
        status: estado,
        statusText: String(estado),
        headers: {},
        config,
      };

      // El adaptador es responsable de rechazar según `validateStatus`: si
      // resolviera siempre, el interceptor de error nunca correría y estas
      // pruebas pasarían sin probar nada.
      if (config.validateStatus && !config.validateStatus(estado)) {
        throw new AxiosError(
          `Request failed with status code ${estado}`,
          AxiosError.ERR_BAD_REQUEST,
          config,
          {},
          respuesta,
        );
      }

      return respuesta;
    };
  }
}

const TOKENS_NUEVOS = {
  AccessToken: 'token-nuevo',
  RefreshToken: 'refresh-nuevo',
  ExpiresAt: '2099-01-01T00:00:00Z',
};

function construirCliente(
  adaptador: AdaptadorGuionado,
  store: InMemoryTokenStore,
  extra: { onSessionExpired?: () => void } = {},
): AxiosInstance {
  const cliente = axios.create({
    baseURL: 'http://test.local',
    adapter: adaptador.adapter,
  });

  createAuthInterceptor({
    store,
    nonce: () => 'nonce-fijo',
    ...extra,
  }).attach(cliente);

  return cliente;
}

describe('interceptor de autenticación', () => {
  let store: InMemoryTokenStore;

  beforeEach(() => {
    store = new InMemoryTokenStore();
  });

  it('adjunta el token de acceso a cada petición', async () => {
    await store.saveAccessToken('token-vigente');
    const adaptador = new AdaptadorGuionado({
      '/products': [[200, { ok: true }]],
    });

    await construirCliente(adaptador, store).get('/api/v1/products');

    expect(adaptador.cabecerasDeAutorizacionPara('/products')).toEqual([
      'Bearer token-vigente',
    ]);
  });

  it('no manda Authorization al login', async () => {
    await store.saveAccessToken('token-vigente');
    const adaptador = new AdaptadorGuionado({
      '/auth/login': [[200, { Success: true }]],
    });

    await construirCliente(adaptador, store).post('/api/v1/auth/login', {});

    expect(adaptador.cabecerasDeAutorizacionPara('/auth/login')).toEqual(['']);
  });

  it('agrega las cabeceras anti-replay a toda petición', async () => {
    const adaptador = new AdaptadorGuionado({
      '/products': [[200, { ok: true }]],
    });

    await construirCliente(adaptador, store).get('/api/v1/products');

    expect(adaptador.cabeceraDe(0, 'X-Nonce')).toBe('nonce-fijo');
    expect(Number(adaptador.cabeceraDe(0, 'X-Timestamp'))).toBeGreaterThan(0);
  });

  it('renueva y reintenta cuando el backend responde 401', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      // La primera llamada falla; el reenvío funciona.
      '/products': [
        [401, { error: 'expired' }],
        [200, { ok: true }],
      ],
      '/auth/refresh-token': [[200, TOKENS_NUEVOS]],
    });

    const respuesta = await construirCliente(adaptador, store).get(
      '/api/v1/products',
    );

    expect(respuesta.status).toBe(200);
    expect(adaptador.llamadasDeRenovacion).toBe(1);

    // Los tokens rotados reemplazaron al par anterior.
    expect(await store.getAccessToken()).toBe('token-nuevo');
    expect(await store.getRefreshToken()).toBe('refresh-nuevo');

    // El reenvío llevó el token nuevo, no el vencido.
    const cabeceras = adaptador.cabecerasDeAutorizacionPara('/products');
    expect(cabeceras[cabeceras.length - 1]).toBe('Bearer token-nuevo');
  });

  it('hace una sola renovación para varios 401 concurrentes', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      '/products': [
        [401, { error: 'expired' }],
        [401, { error: 'expired' }],
        [401, { error: 'expired' }],
        [200, { ok: true }],
        [200, { ok: true }],
        [200, { ok: true }],
      ],
      '/auth/refresh-token': [[200, TOKENS_NUEVOS]],
    });

    const cliente = construirCliente(adaptador, store);

    await Promise.all([
      cliente.get('/api/v1/products'),
      cliente.get('/api/v1/products'),
      cliente.get('/api/v1/products'),
    ]);

    // Single-flight: tres fallos, una renovación — no tres. Sin esto, una
    // sesión vencida produce una tormenta de renovaciones contra el banco.
    expect(adaptador.llamadasDeRenovacion).toBe(1);
  });

  it('renueva de forma proactiva si al token le quedan segundos', async () => {
    await store.saveAccessToken('token-por-vencer');
    await store.saveRefreshToken('refresh-bueno');
    // Vence en 10 segundos: dentro del margen de 60.
    await store.saveTokenExpiry(new Date(Date.now() + 10_000).toISOString());

    const adaptador = new AdaptadorGuionado({
      '/products': [[200, { ok: true }]],
      '/auth/refresh-token': [
        [200, { ...TOKENS_NUEVOS, AccessToken: 'token-fresco' }],
      ],
    });

    await construirCliente(adaptador, store).get('/api/v1/products');

    // Se renovó antes de salir, así que nunca hizo falta un 401.
    expect(adaptador.llamadasDeRenovacion).toBe(1);
    expect(adaptador.cabecerasDeAutorizacionPara('/products')).toEqual([
      'Bearer token-fresco',
    ]);
  });

  it('no renueva si al token le queda tiempo', async () => {
    await store.saveAccessToken('token-vigente');
    await store.saveRefreshToken('refresh-bueno');
    await store.saveTokenExpiry(new Date(Date.now() + 600_000).toISOString());

    const adaptador = new AdaptadorGuionado({
      '/products': [[200, { ok: true }]],
    });

    await construirCliente(adaptador, store).get('/api/v1/products');

    expect(adaptador.llamadasDeRenovacion).toBe(0);
  });

  it('avisa la expiración y limpia la sesión si la renovación falla', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-vencido');

    let avisado = false;
    const adaptador = new AdaptadorGuionado({
      '/products': [[401, { error: 'expired' }]],
      '/auth/refresh-token': [[401, { error: 'invalid' }]],
    });

    const cliente = construirCliente(adaptador, store, {
      onSessionExpired: () => {
        avisado = true;
      },
    });

    await expect(cliente.get('/api/v1/products')).rejects.toThrow();

    expect(avisado).toBe(true);
    expect(await store.getAccessToken()).toBeNull();
    expect(await store.getRefreshToken()).toBeNull();
  });

  it('un 401 en el propio login no dispara renovación', async () => {
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      '/auth/login': [[401, { error: 'bad credentials' }]],
    });

    const cliente = construirCliente(adaptador, store);

    await expect(cliente.post('/api/v1/auth/login', {})).rejects.toThrow();
    expect(adaptador.llamadasDeRenovacion).toBe(0);
  });

  it('sin token de renovación no intenta renovar y cierra la sesión', async () => {
    await store.saveAccessToken('token-viejo');

    let avisado = false;
    const adaptador = new AdaptadorGuionado({
      '/products': [[401, { error: 'expired' }]],
    });

    const cliente = construirCliente(adaptador, store, {
      onSessionExpired: () => {
        avisado = true;
      },
    });

    await expect(cliente.get('/api/v1/products')).rejects.toThrow();

    expect(adaptador.llamadasDeRenovacion).toBe(0);
    expect(avisado).toBe(true);
  });

  it('una renovación sin AccessToken en la respuesta se trata como fallo', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      '/products': [[401, { error: 'expired' }]],
      // Respuesta 200 pero sin el campo: es exactamente el defecto que tenía la
      // app Flutter al leer `accessToken` de una respuesta que dice `AccessToken`.
      '/auth/refresh-token': [[200, { mensaje: 'ok' }]],
    });

    await expect(
      construirCliente(adaptador, store).get('/api/v1/products'),
    ).rejects.toThrow();

    expect(await store.getAccessToken()).toBeNull();
  });

  it('acepta los nombres de campo en camelCase', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      '/products': [
        [401, { error: 'expired' }],
        [200, { ok: true }],
      ],
      '/auth/refresh-token': [
        [200, { accessToken: 'camel-nuevo', refreshToken: 'camel-refresh' }],
      ],
    });

    await construirCliente(adaptador, store).get('/api/v1/products');

    expect(await store.getAccessToken()).toBe('camel-nuevo');
    expect(await store.getRefreshToken()).toBe('camel-refresh');
  });

  it('un 401 que persiste tras renovar no reintenta indefinidamente', async () => {
    await store.saveAccessToken('token-viejo');
    await store.saveRefreshToken('refresh-bueno');

    const adaptador = new AdaptadorGuionado({
      // Siempre 401, incluso con el token nuevo.
      '/products': [[401, { error: 'expired' }]],
      '/auth/refresh-token': [[200, TOKENS_NUEVOS]],
    });

    await expect(
      construirCliente(adaptador, store).get('/api/v1/products'),
    ).rejects.toThrow();

    // Dos intentos: el original y un único reenvío.
    expect(adaptador.cabecerasDeAutorizacionPara('/products')).toHaveLength(2);
    expect(adaptador.llamadasDeRenovacion).toBe(1);
  });
});
