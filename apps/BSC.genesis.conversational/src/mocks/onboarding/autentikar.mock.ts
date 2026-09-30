import {AutentikarStartApiResponse, AutentikarStartRequest} from '@/types/index';

const MOCK_DELAY_MS = 1200;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// autentikar.service.ts consume la respuesta cruda de `fetch` (chequea `.ok` y parsea `.json()`),
// por lo que el mock simula únicamente esa forma en lugar de un envoltorio BscResponse
const buildMockResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

export const AUTENTIKAR_MOCK = {
  // Nota: el `link` simulado NO es válido para el SDK nativo real de Autentikar (no hay mock
  // nativo). Sirve para probar la UI del flujo (éxito/reintento/omitir) sin depender del backend;
  // el módulo nativo sí se invoca de verdad y resolverá según lo que ese link (inválido) le
  // permita hacer al SDK.
  async start(_request: AutentikarStartRequest): Promise<Response> {
    await delay(MOCK_DELAY_MS);

    const body: AutentikarStartApiResponse = {
      isSucceded: true,
      code: 'EGEN000',
      message: 'Flujo de verificacion biometrica iniciado',
      data: {
        instanceId: '01a068ec-5b6b-7f45-9006-b27e4b1a0846',
        link: 'mock-link',
        expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
        qr: '/qr/mock-link',
        path: '/0/c/mock-link',
        host: 'https://bancosantacruz.sandbox.autentikar.app',
      },
    };

    return buildMockResponse(200, body);
  },
};
