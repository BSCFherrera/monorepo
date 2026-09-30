import {
  BscResponse,
  OTPResendRequest,
  OTPSendRequest,
  OTPValidateRequest,
  ValidateOTPResponse,
} from '@/types/index';

// Código OTP considerado válido en el ambiente de mocks para la firma de documentos
export const DOCUMENT_SIGNATURE_MOCK_OTP_CODE = '111111';

const MOCK_DELAY_MS = 1000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const DOCUMENT_SIGNATURE_OTP_MOCK = {
  /**
   * Simula el envío del código OTP para la firma del documento
   */
  requestOTP: async (_payload: OTPSendRequest): Promise<BscResponse> => {
    await delay(MOCK_DELAY_MS);

    return {
      bscResponse: {
        headers: {
          statusCode: 200,
          reasonPhrase: 'Código enviado correctamente.',
        },
      },
    };
  },

  /**
   * Simula el reenvío del código OTP para la firma del documento
   */
  requestResendOTP: async (_payload: OTPResendRequest): Promise<BscResponse> => {
    await delay(MOCK_DELAY_MS);

    return {
      bscResponse: {
        headers: {
          statusCode: 200,
          reasonPhrase: 'Código reenviado correctamente.',
        },
      },
    };
  },

  /**
   * Simula la validación del código ingresado. El único código considerado válido es DOCUMENT_SIGNATURE_MOCK_OTP_CODE ('111111')
   */
  validateOTP: async (payload: OTPValidateRequest): Promise<BscResponse<ValidateOTPResponse>> => {
    await delay(MOCK_DELAY_MS);

    const {otp} = payload;

    if (otp !== DOCUMENT_SIGNATURE_MOCK_OTP_CODE) {
      return {
        bscResponse: {
          headers: {
            statusCode: 400,
            reasonPhrase: 'El código ingresado es incorrecto.',
          },
        },
      };
    }

    return {
      bscResponse: {
        headers: {
          statusCode: 200,
          reasonPhrase: 'OK',
        },
        content: {
          data: {valido: true},
        },
      },
    };
  },
};
