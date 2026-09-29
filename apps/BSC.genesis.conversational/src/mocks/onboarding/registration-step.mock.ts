import {RegistrationStepApiResponse, RegistrationStepRequest} from '@/types/index';

const MOCK_DELAY_MS = 600;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// registration-step.service.ts consume la respuesta cruda de `fetch` (chequea `.ok`/`.status`
// y parsea `.json()`), por lo que el mock simula únicamente esa forma
const buildMockResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

export const REGISTRATION_STEP_MOCK = {
  updateStep: async (documentHash: string, request: RegistrationStepRequest): Promise<Response> => {
    console.log('[REGISTRATION_STEP_MOCK] updateStep request', {documentHash, ...request});

    await delay(MOCK_DELAY_MS);

    const body: RegistrationStepApiResponse = {
      isSucceded: true,
      code: 'STEP_ADVANCED',
      message: 'Registration step recorded successfully.',
      data: {
        currentStep: 1,
        lastActivityAt: new Date().toISOString(),
      },
    };

    return buildMockResponse(200, body);
  },
};
