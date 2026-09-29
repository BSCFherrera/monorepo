import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {OTP_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {OTP_MOCK} from '../mocks/onboarding/otp.mock';
import {OTPSendRequest, OTPResendRequest, OTPValidateRequest} from '@/types/index';

import {OtpApiError} from '@/types/otpError';

class OTPService {
  private resendAttempts: number;
  private readonly maxResendAttempts: number;
  private readonly requestOtpUrl: string;
  private readonly validateOtpUrl: string;

  constructor() {
    this.resendAttempts = 0;
    this.maxResendAttempts = APP_CONFIG.OTP_MAX_RESEND_ATTEMPTS;
    this.requestOtpUrl = `${APP_CONFIG.API_BASE_URL}${OTP_ENDPOINTS.SEND_OTP}`;
    this.validateOtpUrl = `${APP_CONFIG.API_BASE_URL}${OTP_ENDPOINTS.VALIDATE_OTP}`;
  }

  private withTimeout = <T>(requestPromise: Promise<T>): Promise<T> => {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new OtpApiError('TIMEOUT', 'Tiempo de espera agotado al procesar el código.'));
      }, 10000);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  };

  private executeSendOtpRequest = (payload: OTPSendRequest): Promise<Response> => {
    return fetch(this.requestOtpUrl, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
  };

  private executeValidateOtpRequest = (payload: OTPValidateRequest): Promise<Response> => {
    return fetch(this.validateOtpUrl, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
  };

  private executeReSendOtpRequest = (payload: OTPResendRequest): Promise<Response> => {
    return fetch(this.requestOtpUrl, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
  };

  public requestOTP = async (payload: OTPSendRequest): Promise<void> => {
    const requestPromise = MOCK_CONFIG.OTP.REQUEST_OTP
      ? OTP_MOCK.requestOTP(payload)
      : this.executeSendOtpRequest(payload);
    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new OtpApiError('UNKNOWN_ERROR', errorText || 'No se pudo enviar el código OTP.');
    }
  };

  /**
   * Reenvía el código, respetando el máximo de intentos configurado en APP_CONFIG
   */
  public requestResendOTP = async (payload: OTPResendRequest): Promise<void> => {
    if (this.resendAttempts >= this.maxResendAttempts) {
      throw new OtpApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        'Se ha excedido el límite de reenvíos permitidos.',
      );
    }

    this.resendAttempts += 1;

    const requestPromise = MOCK_CONFIG.OTP.REQUEST_RESEND_OTP
      ? OTP_MOCK.requestResendOTP(payload)
      : this.executeReSendOtpRequest(payload);
    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new OtpApiError('UNKNOWN_ERROR', errorText || 'No se pudo reenviar el código OTP.');
    }
  };

  /**
   * Verifica el código ingresado por el usuario. Retorna `true`/`false` según sea válido
   */
  public validateOTP = async (payload: OTPValidateRequest): Promise<boolean> => {
    const requestPromise = MOCK_CONFIG.OTP.VALIDATE_OTP
      ? OTP_MOCK.validateOTP(payload)
      : this.executeValidateOtpRequest(payload);
    const response = await this.withTimeout(requestPromise);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new OtpApiError('UNKNOWN_ERROR', errorText || 'No se pudo validar el código OTP.');
    }

    return true;
  };
}

export default new OTPService();
