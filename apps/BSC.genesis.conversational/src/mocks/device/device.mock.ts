import {SERVICE_ERRORS} from '@constants/serviceErrors';
import {UpdateDeviceTrustStatusApiResponse, UpdateDeviceTrustStatusRequest} from '@/types/index';

const MOCK_DELAY_MS = 1000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// device.service.ts consume la respuesta cruda de `fetch` (chequea `.ok`/`.status` y parsea
// `.json()`), por lo que el mock simula únicamente esa forma en lugar de un envoltorio BscResponse
const buildMockResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

export const DEVICE_MOCK = {
  updateTrustStatus: async (
    deviceId: string,
    request: UpdateDeviceTrustStatusRequest,
  ): Promise<Response> => {
    console.log('[DEVICE_MOCK] updateTrustStatus request', {deviceId, ...request});

    await delay(MOCK_DELAY_MS);

    console.log('[DEVICE_MOCK] updateTrustStatus resultado: EXITOSO');
    const {code, message} = SERVICE_ERRORS.DEVICE.UPDATE_TRUST_STATUS.SUCCESS;
    const body: UpdateDeviceTrustStatusApiResponse = {
      isSucceded: true,
      code,
      message,
      data: null,
    };

    return buildMockResponse(200, body);
  },
};
