import RNBlobUtil from 'react-native-blob-util';

import {APP_CONFIG, HTTP_METHODS} from '@constants/config';
import {DOCUMENT_ENDPOINTS} from '@constants/endpoints';
import {buildHeaders} from '@constants/headers';
import {MOCK_CONFIG} from '@constants/mockConfig';
import {useAuthStore} from '@store/auth.store';
import {useOnboardingStore} from '@store/onboarding.store';
import {DOCUMENT_MOCK} from '../mocks/onboarding/document.mock';
import {
  DocumentErrorCode,
  SignatureDocumentApiResponse,
  SignatureDocumentRequest,
  SignatureDocumentResponseData,
} from '@/types/index';

// Nombre fijo del PDF cacheado localmente: cada firma sobrescribe el anterior, no hace falta conservar versiones previas
const SIGNATURE_DOCUMENT_FILE_NAME = 'convenio_unico.pdf';
// Timeout propio de este endpoint: el documento pesa ~5MB en base64, muy por encima del resto
// de llamadas del API, así que se usa un valor local en vez de tocar APP_CONFIG.API_TIMEOUT
// (compartido con todos los demás servicios)
const SIGNATURE_DOCUMENT_TIMEOUT = 120000;

export class DocumentApiError extends Error {
  code: DocumentErrorCode;

  constructor(code: DocumentErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Servicio de Onboarding: obtención del documento de firma (convenio único) prefilleado con
 * los datos del cliente verificado
 */
class DocumentService {
  /**
   * Obtiene el documento de firma prefilleado con los datos del cliente y lo devuelve cacheado
   * localmente, listo para react-native-pdf
   */
  async getSignatureDocument(): Promise<SignatureDocumentResponseData> {
    const requestPromise = MOCK_CONFIG.DOCUMENT.GET_SIGNATURE_DOCUMENT
      ? this.fetchMock()
      : this.fetchReal();

    return this.withTimeout(requestPromise);
  }

  /**
   * Adapta la respuesta del mock (formato `BscResponse`) al mismo contrato que `fetchReal`
   */
  private async fetchMock(): Promise<SignatureDocumentResponseData> {
    const {bscResponse} = await DOCUMENT_MOCK.getSignatureDocument();
    const data = bscResponse.content?.data;

    if (bscResponse.headers.statusCode === 200 && data) {
      return data;
    }

    console.error('[DocumentService] El mock de documento de firma respondió sin éxito:', bscResponse.headers);
    throw new DocumentApiError(
      'UNKNOWN_ERROR',
      bscResponse.headers.reasonPhrase || 'Ocurrió un error inesperado.',
    );
  }

  /**
   * Aplica un timeout propio a la petición, ya sea mock o real
   */
  private withTimeout<T>(requestPromise: Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new DocumentApiError('TIMEOUT', 'Tiempo de espera agotado al obtener el documento.'));
      }, SIGNATURE_DOCUMENT_TIMEOUT);
    });

    return Promise.race([requestPromise, timeoutPromise]);
  }

  /**
   * Arma los datos del cliente para el prefill del convenio único a partir del cliente
   * verificado en el store de onboarding. El correo es el ya confirmado por OTP
   * (`verifiedEmail`), no el que esté seleccionado en el Select antes de validarlo.
   */
  private buildSignatureDocumentRequest(): SignatureDocumentRequest {
    const {verifiedClient, verifiedEmail} = useOnboardingStore.getState();

    if (!verifiedClient) {
      throw new DocumentApiError(
        'UNKNOWN_ERROR',
        'No existe un cliente verificado para generar el documento de firma.',
      );
    }

    return {
      customer: {
        nombresYApellidos: verifiedClient.nombreCompleto,
        nacionalidad: verifiedClient.nacionalidad,
        rncCedulaPasaporte: verifiedClient.numeroIdentificacion,
        estadoCivil: null,
        profesion: null,
        domicilio: null,
        registroMercantil: null,
        representantes: null,
        telefonos: null,
        direccion: null,
        email: verifiedEmail,
        fecha: new Date().toISOString(),
      },
    };
  }

  /**
   * Llamada real al endpoint de prefill (se activa al poner
   * MOCK_CONFIG.DOCUMENT.GET_SIGNATURE_DOCUMENT en `false`). El backend entrega el documento en
   * `contentBase64`; se decodifica y cachea en disco con react-native-blob-util para que
   * react-native-pdf pueda leerlo desde una ruta local (file://).
   */
  private async fetchReal(): Promise<SignatureDocumentResponseData> {
    const request = this.buildSignatureDocumentRequest();
    const {deviceInfo} = useAuthStore.getState();

    const response = await fetch(
      `${APP_CONFIG.API_BASE_URL}${DOCUMENT_ENDPOINTS.GET_SIGNATURE_DOCUMENT}`,
      {
        method: HTTP_METHODS.POST,
        headers: buildHeaders({'x-device-data': JSON.stringify(deviceInfo)}),
        body: JSON.stringify(request),
      },
    ).catch(err => {
      console.error('[DocumentService] Error de red al obtener el documento de firma:', err);
      throw new DocumentApiError(
        'UNKNOWN_ERROR',
        err?.message || 'Error de red al obtener el documento.',
      );
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      console.error('[DocumentService] Respuesta HTTP no exitosa al obtener el documento de firma:', {
        status: response.status,
        errorBody,
      });
      throw new DocumentApiError(
        'UNKNOWN_ERROR',
        errorBody?.message || response.statusText || 'Ocurrió un error inesperado.',
      );
    }

    const {isSucceded, code, message, data} = (await response.json().catch(err => {
      console.error('[DocumentService] Respuesta JSON inválida al obtener el documento de firma:', err);
      throw new DocumentApiError('UNKNOWN_ERROR', 'Respuesta JSON inválida del servicio de documento.');
    })) as SignatureDocumentApiResponse;

    if (!isSucceded || !data) {
      console.error('[DocumentService] El servicio de documento respondió sin éxito:', {code, message});
      throw new DocumentApiError('UNKNOWN_ERROR', message || 'Ocurrió un error inesperado.');
    }

    const destinationPath = `${RNBlobUtil.fs.dirs.CacheDir}/${SIGNATURE_DOCUMENT_FILE_NAME}`;
    await RNBlobUtil.fs.writeFile(destinationPath, data.contentBase64, 'base64');

    return {
      localUri: `file://${destinationPath}`,
      fileName: SIGNATURE_DOCUMENT_FILE_NAME,
    };
  }
}

export default new DocumentService();
