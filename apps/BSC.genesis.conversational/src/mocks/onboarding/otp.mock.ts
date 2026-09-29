import {OTPResendRequest, OTPSendRequest, OTPValidateRequest} from '@/types/index';

// Código OTP considerado válido en el ambiente de mocks
export const MOCK_OTP_CODE = '111111';

const MOCK_DELAY_MS = 1000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// otp.service.ts consume la respuesta cruda de `fetch` (chequea `.ok` y lee `.text()` en error),
// por lo que el mock simula únicamente esa forma en lugar del envoltorio BscResponse
const buildMockResponse = (ok: boolean, reasonPhrase: string): Response =>
  ({
    ok,
    text: async () => reasonPhrase,
  }) as Response;

export const OTP_MOCK = {
  /**
   * Simula el envío del código OTP al canal indicado (correo o teléfono)
   */
  requestOTP: async (_payload: OTPSendRequest): Promise<Response> => {
    await delay(MOCK_DELAY_MS);

    return buildMockResponse(true, 'Código enviado correctamente.');
  },

  /**
   * Simula el reenvío del código OTP
   */
  requestResendOTP: async (_payload: OTPResendRequest): Promise<Response> => {
    await delay(MOCK_DELAY_MS);

    return buildMockResponse(true, 'Código reenviado correctamente.');
  },

  /**
   * Simula la validación del código ingresado. El único código considerado válido es MOCK_OTP_CODE ('111111')
   */
  validateOTP: async (payload: OTPValidateRequest): Promise<Response> => {
    await delay(MOCK_DELAY_MS);

    const isValid = payload.otp === MOCK_OTP_CODE;

    return buildMockResponse(isValid, isValid ? 'OK' : 'El código ingresado es incorrecto.');
  },
};
