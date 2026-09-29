import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {DOCUMENT_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {DOCUMENT_SIGNATURE_OTP_MOCK} from '../mocks/onboarding/document-signature-otp.mock';
import {
  BscResponse,
  OtpErrorCode,
  OTPResendRequest,
  OTPSendRequest,
  OTPValidateRequest,
  ValidateOTPResponse,
} from '@/types/index';

export class DocumentSignatureOtpApiError extends Error {
  code: OtpErrorCode;

  constructor(code: OtpErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de OTP para la firma de documentos. Es independiente del OTP de
 * verificación de contacto (otp.service.ts): mantiene su propio contador de
 * reenvíos, endpoints y mock, ya que pertenece a un paso distinto del flujo
 * de onboarding.
 */
class DocumentSignatureOtpServiceImpl {
  private resendAttempts = 0;
  private readonly maxResendAttempts = APP_CONFIG.OTP_MAX_RESEND_ATTEMPTS;
  private readonly sendOtpUrl = `${APP_CONFIG.API_BASE_URL}${DOCUMENT_ENDPOINTS.SEND_SIGNATURE_OTP}`;
  private readonly validateOtpUrl = `${APP_CONFIG.API_BASE_URL}${DOCUMENT_ENDPOINTS.VERIFY_SIGNATURE_OTP}`;

  private withTimeout = <T>(requestPromise: Promise<BscResponse<T>>): Promise<BscResponse<T>> => {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(
          new DocumentSignatureOtpApiError(
            'TIMEOUT',
            'Tiempo de espera agotado al procesar el código.',
          ),
        );
      }, APP_CONFIG.API_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  };

  private executeSendOtpRequest = async (payload: OTPSendRequest): Promise<BscResponse> => {
    const response = await fetch(this.sendOtpUrl, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  };

  private executeValidateOtpRequest = async (
    payload: OTPValidateRequest,
  ): Promise<BscResponse<ValidateOTPResponse>> => {
    const response = await fetch(this.validateOtpUrl, {
      method: HTTP_METHODS.POST,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return response.json();
  };

  public requestOTP = async (payload: OTPSendRequest): Promise<void> => {
    const requestPromise = MOCK_CONFIG.DOCUMENT_SIGNATURE_OTP.REQUEST_OTP
      ? DOCUMENT_SIGNATURE_OTP_MOCK.requestOTP(payload)
      : this.executeSendOtpRequest(payload);
    const {bscResponse} = await this.withTimeout(requestPromise);

    if (bscResponse.headers.statusCode !== 200) {
      throw new DocumentSignatureOtpApiError('UNKNOWN_ERROR', bscResponse.headers.reasonPhrase);
    }
  };

  /**
   * Reenvía el código, respetando el máximo de intentos configurado en APP_CONFIG.
   * Reutiliza el endpoint de envío ya que la firma de documentos no expone uno de reenvío dedicado.
   */
  public requestResendOTP = async (payload: OTPResendRequest): Promise<void> => {
    if (this.resendAttempts >= this.maxResendAttempts) {
      throw new DocumentSignatureOtpApiError(
        'MAX_ATTEMPTS_EXCEEDED',
        'Se ha excedido el límite de reenvíos permitidos.',
      );
    }

    this.resendAttempts += 1;

    const requestPromise = MOCK_CONFIG.DOCUMENT_SIGNATURE_OTP.REQUEST_RESEND_OTP
      ? DOCUMENT_SIGNATURE_OTP_MOCK.requestResendOTP(payload)
      : this.executeSendOtpRequest(payload);
    const {bscResponse} = await this.withTimeout(requestPromise);

    if (bscResponse.headers.statusCode !== 200) {
      throw new DocumentSignatureOtpApiError('UNKNOWN_ERROR', bscResponse.headers.reasonPhrase);
    }
  };

  /**
   * Verifica el código ingresado por el usuario. Retorna `true`/`false` según sea válido
   */
  public validateOTP = async (payload: OTPValidateRequest): Promise<boolean> => {
    const requestPromise = MOCK_CONFIG.DOCUMENT_SIGNATURE_OTP.VALIDATE_OTP
      ? DOCUMENT_SIGNATURE_OTP_MOCK.validateOTP(payload)
      : this.executeValidateOtpRequest(payload);
    const {bscResponse} = await this.withTimeout(requestPromise);

    if (bscResponse.headers.statusCode !== 200) {
      throw new DocumentSignatureOtpApiError('UNKNOWN_ERROR', bscResponse.headers.reasonPhrase);
    }

    return true;
  };
}

export const DocumentSignatureOtpService = new DocumentSignatureOtpServiceImpl();
