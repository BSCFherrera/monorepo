import {
  ApiResponse,
  ChangePasswordResponse,
  ChangePasswordRequest,
  ClientInformationRequest,
  ClientInformationResponse,
  VerifyClientDocumentApiResponse,
  GetUserIdByInternalIdResponse,
} from '@/types/index';
import {SERVICE_ERRORS} from '@constants/serviceErrors';

// Documentos de prueba: numeroDocumento -> escenario simulado
export const MOCK_DOCUMENTOS = {
  EXITOSO: '11111111111',
  CLIENTE_NO_VALIDADO: '11111111112',
  TIMEOUT: '11111111113',
  LIMITE_INTENTOS_EXCEDIDO: '11111111114',
  CLIENTE_SIN_DATOS: '11111111115',
} as const;

// Correos de prueba: email -> escenario simulado para el registro de usuario
export const MOCK_EMAILS = {
  EMAIL_ALREADY_EXISTS: 'usuario.existente@bancosantacruz.com.do',
} as const;

const MOCK_DELAY_MS = 1200;
// Debe ser mayor a APP_CONFIG.API_TIMEOUT para que el servicio dispare su propio timeout
const MOCK_TIMEOUT_DELAY_MS = 8000;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// onboarding.service.ts consume la respuesta cruda de `fetch` (chequea `.ok`/`.status` y
// parsea `.json()`), por lo que el mock simula únicamente esa forma en lugar de un envoltorio BscResponse
const buildMockResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

// El endpoint "core" siempre responde HTTP 200: éxito/error se distingue por `isSucceded` y `code`
const buildVerifyClientDocumentBody = (
  isSucceded: boolean,
  code: string,
  message: string,
  data: VerifyClientDocumentApiResponse['data'],
): VerifyClientDocumentApiResponse => ({isSucceded, code, message, data});

export const MOCK_CLIENTE: ClientInformationResponse = {
  aceptaPublicidadDigital: 'S',
  aceptaPublicidadTelefonica: 'S',
  actividad: 'Empleados (asalariados)',
  apellidoCasada: null,
  codigoPersona: '607749',
  dobleNacionalidad: 'N',
  emailPrincipal: 'desarrollo@test11.com',
  emails: [
    {
      codigoEmail: '3',
      codigoPersona: '607749',
      codigoTipoEmail: 'P',
      email: 'DESARROLLO@TEST11.com',
      emailPorDefecto: 'N',
      tipoEmail: 'Personal',
    },
  ],
  emailSecundario: null,
  esResidente: 'S',
  estadoCivil: 'S',
  estadoPersona: 'A',
  fechaNacimiento: '21/04/1992',
  fechaVencimientoId: '21/04/2030',
  firmoContrato: 'N',
  generaDivisas: 'NP',
  nacionalidad: 'Dominicana',
  nivelEstudios: 'UNIVERSITARIO',
  nivelRiesgo: 'MEDIO',
  nombreCompleto: 'FRANCISCO JAVIER HERRERA MANCERO',
  nombreOficial: 'FRANCISCO JAVIER HERRERA MANCERO',
  numeroIdentificacion: '402-2008968-0',
  personaDesactualizada: 'N',
  primerApellido: 'HERRERA',
  primerNombre: 'FRANCISCO',
  profesion: 'Desarrolladores de software',
  relacionBanco: 'CLIENTE',
  scoring: null,
  sectorEconomico: 'Servicio',
  segundoApellido: 'MANCERO',
  segundoNombre: 'JAVIER',
  sexo: 'M',
  telefonos: [
    {
      codigoArea: '829',
      codigoPersona: '607749',
      codigoTelefono: null,
      codigoTipoTelefono: 'C',
      codigoUbicacionTelefono: 'O',
      extension: null,
      numeroTelefono: '5343803',
      telefonoPorDefecto: 'S',
      tipoTelefono: 'Celular',
      ubicacionTelefono: 'Otro',
    },
    {
      codigoArea: '829',
      codigoPersona: '607749',
      codigoTelefono: null,
      codigoTipoTelefono: 'D',
      codigoUbicacionTelefono: 'O',
      extension: null,
      numeroTelefono: '7058003',
      telefonoPorDefecto: 'N',
      tipoTelefono: 'Línea Directa',
      ubicacionTelefono: 'Otro',
    },
  ],
  tipoCliente: 'Asalariado Privado',
  tipoPersona: 'F',
  isSecureDevice: true,
  isDeviceRegistered: true,
};

export const ACCESS_RECOVERY_MOCK = {
  verifyClientDocument: async (request: ClientInformationRequest): Promise<Response> => {
    const {numeroDocumento, categoria} = request;

    console.log('[ACCESS_RECOVERY_MOCK] verifyClientDocument request', {
      categoria,
      numeroDocumento,
    });

    await delay(
      numeroDocumento === MOCK_DOCUMENTOS.TIMEOUT ? MOCK_TIMEOUT_DELAY_MS : MOCK_DELAY_MS,
    );

    if (numeroDocumento === MOCK_DOCUMENTOS.CLIENTE_NO_VALIDADO) {
      console.log('[ACCESS_RECOVERY_MOCK] verifyClientDocument resultado: CLIENTE_NO_VALIDADO');
      const {code, message} =
        SERVICE_ERRORS.ACCESS_RECOVERY.VERIFY_CLIENT_DOCUMENT.CLIENT_NOT_VALIDATED;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    if (numeroDocumento === MOCK_DOCUMENTOS.LIMITE_INTENTOS_EXCEDIDO) {
      console.log(
        '[ACCESS_RECOVERY_MOCK] verifyClientDocument resultado: LIMITE_INTENTOS_EXCEDIDO',
      );
      const {code, message} =
        SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.MAX_ATTEMPTS_EXCEEDED;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    if (numeroDocumento === MOCK_DOCUMENTOS.CLIENTE_SIN_DATOS) {
      console.log('[ACCESS_RECOVERY_MOCK] verifyClientDocument resultado: CLIENTE_SIN_DATOS');
      const {code, message} = SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.CLIENT_WITHOUT_DATA;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    console.log('[ACCESS_RECOVERY_MOCK] verifyClientDocument resultado: EXITOSO');
    const {code: successCode, message: successMessage} =
      SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.SUCCESS;
    return buildMockResponse(
      200,
      buildVerifyClientDocumentBody(true, successCode, successMessage, {
        ...MOCK_CLIENTE,
        numeroIdentificacion: numeroDocumento,
      }),
    );
  },

  changePassword: async (userId: string, request: ChangePasswordRequest): Promise<Response> => {
    console.log('[ACCESS_RECOVERY_MOCK] changePassword request', {
      ...request,
      userId,
    });
    await delay(MOCK_DELAY_MS);
    console.log('[ACCESS_RECOVERY_MOCK] changePassword resultado: EXITOSO');
    const {code, message} = SERVICE_ERRORS.ACCESS_RECOVERY.CHANGE_PASSWORD.SUCCESS;
    const body: ApiResponse<ChangePasswordResponse> = {
      isSucceded: true,
      code,
      message,
      data: {
        id: 'a7e2d689-f1eb-423f-ab4f-00248f097d67',
        updatedAt: '2026-09-11T18:32:07.123Z',
        auditLogged: true,
        revokedTokens: 2,
      },
    };
    return buildMockResponse(200, body);
  },

  getUserIdByInternalId: async (internalId: string): Promise<Response> => {
    console.log('[ACCESS_RECOVERY_MOCK] getUserIdByInternalId param', {
      internalId,
    });
    await delay(MOCK_DELAY_MS);
    console.log('[ACCESS_RECOVERY_MOCK] changePassword resultado: EXITOSO');
    const {code, message} = SERVICE_ERRORS.ACCESS_RECOVERY.CHANGE_PASSWORD.SUCCESS;
    const body: ApiResponse<GetUserIdByInternalIdResponse> = {
      isSucceded: true,
      code,
      message,
      data: {
        id: 'd896f4c3-1fe6-4de7-9195-d5afcac63a64',
        internalId: '607749',
        isActive: true,
        createdAt: '2026-09-16T14:58:49.8570394Z',
        updatedAt: '2026-09-18T12:20:11.8898131Z',
      },
    };
    return buildMockResponse(200, body);
  },
};
