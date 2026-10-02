import {
  AcceptTermsAndConditionsApiResponse,
  AcceptTermsAndConditionsRequest,
  BscResponse,
  ClientInformationRequest,
  ClientInformationResponse,
  RegisterUserApiResponse,
  RegisterUserRequest,
  RegistrationSessionApiResponse,
  RegistrationSessionCompleteApiResponse,
  RegistrationSessionRequest,
  RegistrationSessionUserLinkApiResponse,
  RegistrationSessionUserLinkRequest,
  TermsAndConditionsApiResponse,
  VerifyClientDocumentApiResponse,
} from '@/types/index';
import onboardingEs from '@i18n/locales/es/onboarding.json';
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
  nombreCompleto: 'VICTOR ANDRES PONCE OTTAMENDI',
  nombreOficial: 'VICTOR ANDRES PONCE OTTAMENDI',
  numeroIdentificacion: '402-2008968-0',
  personaDesactualizada: 'N',
  primerApellido: 'PONCE',
  primerNombre: 'VICTOR',
  profesion: 'Desarrolladores de software',
  relacionBanco: 'CLIENTE',
  scoring: null,
  sectorEconomico: 'Servicio',
  segundoApellido: 'OTTAMENDI',
  segundoNombre: 'ANDRES',
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
  redirectToLogin: true,
};

export const ONBOARDING_MOCK = {
  verifyClientDocument: async (request: ClientInformationRequest): Promise<Response> => {
    const {numeroDocumento, categoria} = request;

    console.log('[ONBOARDING_MOCK] verifyClientDocument request', {
      categoria,
      numeroDocumento,
    });

    await delay(numeroDocumento === MOCK_DOCUMENTOS.TIMEOUT ? MOCK_TIMEOUT_DELAY_MS : MOCK_DELAY_MS);

    if (numeroDocumento === MOCK_DOCUMENTOS.CLIENTE_NO_VALIDADO) {
      console.log('[ONBOARDING_MOCK] verifyClientDocument resultado: CLIENTE_NO_VALIDADO');
      const {code, message} = SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.CLIENT_NOT_VALIDATED;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    if (numeroDocumento === MOCK_DOCUMENTOS.LIMITE_INTENTOS_EXCEDIDO) {
      console.log('[ONBOARDING_MOCK] verifyClientDocument resultado: LIMITE_INTENTOS_EXCEDIDO');
      const {code, message} = SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.MAX_ATTEMPTS_EXCEEDED;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    if (numeroDocumento === MOCK_DOCUMENTOS.CLIENTE_SIN_DATOS) {
      console.log('[ONBOARDING_MOCK] verifyClientDocument resultado: CLIENTE_SIN_DATOS');
      const {code, message} = SERVICE_ERRORS.ONBOARDING.VERIFY_CLIENT_DOCUMENT.CLIENT_WITHOUT_DATA;
      return buildMockResponse(200, buildVerifyClientDocumentBody(false, code, message, {}));
    }

    console.log('[ONBOARDING_MOCK] verifyClientDocument resultado: EXITOSO');
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

  getTermsAndConditions: async (): Promise<Response> => {
    await delay(MOCK_DELAY_MS);

    console.log('[ONBOARDING_MOCK] getTermsAndConditions resultado: EXITOSO');
    const {code, message} = SERVICE_ERRORS.ONBOARDING.TERMS_AND_CONDITIONS.SUCCESS;
    const body: TermsAndConditionsApiResponse = {
      isSucceded: true,
      code,
      message,
      data: {
        id: 1,
        title: 'Terminos y condiciones Banca Conversacional',
        content: onboardingEs.termsAndConditionsModal.content,
        version: '1.0.0',
      },
    };
    return buildMockResponse(200, body);
  },

  acceptTermsAndConditions: async (
    request: AcceptTermsAndConditionsRequest,
  ): Promise<Response> => {
    console.log('[ONBOARDING_MOCK] acceptTermsAndConditions request', request);
    await delay(MOCK_DELAY_MS);

    console.log('[ONBOARDING_MOCK] acceptTermsAndConditions resultado: EXITOSO');
    const {code, message} = SERVICE_ERRORS.ONBOARDING.ACCEPT_TERMS_AND_CONDITIONS.SUCCESS;
    const body: AcceptTermsAndConditionsApiResponse = {
      isSucceded: true,
      code,
      message,
      data: null,
    };
    return buildMockResponse(200, body);
  },

  getPersonalDataPolicy: async (): Promise<BscResponse<string>> => {
    await delay(MOCK_DELAY_MS);

    return {
      bscResponse: {
        headers: {
          statusCode: 200,
          reasonPhrase: 'OK',
        },
        content: {
          data: onboardingEs.personalDataPolicyModal.content,
        },
      },
    };
  },

  registerUser: async (request: RegisterUserRequest): Promise<Response> => {
    const {email, internalId, documentNumber, documentType} = request;

    console.log('[ONBOARDING_MOCK] registerUser request', {
      email,
      internalId,
      documentNumber,
      documentType,
    });

    await delay(MOCK_DELAY_MS);

    if (email.toLowerCase() === MOCK_EMAILS.EMAIL_ALREADY_EXISTS) {
      console.log('[ONBOARDING_MOCK] registerUser resultado: EMAIL_ALREADY_EXISTS');
      const {code, message} = SERVICE_ERRORS.ONBOARDING.REGISTER_USER.EMAIL_ALREADY_EXISTS;
      const body: RegisterUserApiResponse = {isSucceded: false, code, message, data: null};
      return buildMockResponse(200, body);
    }

    console.log('[ONBOARDING_MOCK] registerUser resultado: EXITOSO');
    const {code: successCode, message: successMessage} = SERVICE_ERRORS.ONBOARDING.REGISTER_USER.SUCCESS;
    const body: RegisterUserApiResponse = {
      isSucceded: true,
      code: successCode,
      message: successMessage,
      data: {
        id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        internalId,
        createdAt: new Date().toISOString(),
        deviceId: `mock-device-${Math.random().toString(36).substring(2, 18)}`,
      },
    };
    return buildMockResponse(200, body);
  },

  createRegistrationSession: async (
    documentHash: string,
    request: RegistrationSessionRequest,
  ): Promise<Response> => {
    console.log('[ONBOARDING_MOCK] createRegistrationSession request', {documentHash, ...request});

    await delay(MOCK_DELAY_MS);

    console.log('[ONBOARDING_MOCK] createRegistrationSession resultado: EXITOSO');
    const body: RegistrationSessionApiResponse = {
      isSucceded: true,
      code: 'SESSION_CREATED',
      message: 'Registration session created successfully.',
      data: {
        sessionId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        sessionToken: `mock-token-${Math.random().toString(36).substring(2, 18)}`,
        deviceId: `mock-device-${Math.random().toString(36).substring(2, 18)}`,
        documentNumberHash: documentHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    };

    return buildMockResponse(200, body);
  },

  completeRegistrationSession: async (documentHash: string): Promise<Response> => {
    console.log('[ONBOARDING_MOCK] completeRegistrationSession request', {documentHash});

    await delay(MOCK_DELAY_MS);

    console.log('[ONBOARDING_MOCK] completeRegistrationSession resultado: EXITOSO');
    const body: RegistrationSessionCompleteApiResponse = {
      isSucceded: true,
      code: 'SESSION_COMPLETED',
      message: 'Registration session completed successfully.',
      data: {
        accessToken: `mock-access-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        refreshToken: `mock-refresh-${Math.random().toString(36).substring(2, 18)}`,
        tokenType: 'Bearer',
      },
    };

    return buildMockResponse(200, body);
  },

  linkUserToRegistrationSession: async (
    documentHash: string,
    request: RegistrationSessionUserLinkRequest,
  ): Promise<Response> => {
    console.log('[ONBOARDING_MOCK] linkUserToRegistrationSession request', {documentHash, ...request});

    await delay(MOCK_DELAY_MS);

    console.log('[ONBOARDING_MOCK] linkUserToRegistrationSession resultado: EXITOSO');
    const body: RegistrationSessionUserLinkApiResponse = {
      isSucceded: true,
      code: 'USER_LINKED',
      message: 'User linked to session successfully.',
      data: {
        userId: request.userId,
        email: MOCK_CLIENTE.emails[0].email,
        internalId: MOCK_CLIENTE.codigoPersona,
      },
    };

    return buildMockResponse(200, body);
  },
};
