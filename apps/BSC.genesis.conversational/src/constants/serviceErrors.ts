/**
 * Biblioteca de errores de negocio, discriminada por servicio y por llamada.
 * Cada entrada asocia el código que retorna el backend (o el mock) con el
 * código interno de error de la app (los `*ErrorCode` de `@/types/index`) y
 * el mensaje por defecto a mostrar si el backend no envía uno propio.
 *
 * Al agregar un error de negocio nuevo para una llamada, se agrega su entrada
 * aquí en vez de hardcodear el código de backend dentro del servicio.
 */
export const SERVICE_ERRORS = {
  ONBOARDING: {
    VERIFY_CLIENT_DOCUMENT: {
      SUCCESS: {
        code: 'EGEN000',
        message: 'Cliente verificado exitosamente.',
      },
      CLIENT_NOT_VALIDATED: {
        code: 'EGEN001',
        message: 'El cliente existe pero no está habilitado para continuar el registro.',
      },
      CLIENT_WITHOUT_DATA: {
        code: 'EGEN002',
        message: 'El cliente debe actualizar su información de contacto',
      },
      MAX_ATTEMPTS_EXCEEDED: {
        code: 'EGEN003',
        message: 'Se ha excedido el límite de intentos permitidos.',
      },
    },
    TERMS_AND_CONDITIONS: {
      SUCCESS: {
        code: 'EGEN000',
        message: 'Términos y condiciones consultados exitosamente',
      },
    },
    ACCEPT_TERMS_AND_CONDITIONS: {
      SUCCESS: {
        code: 'EGEN000',
        message: 'Aceptación de términos y condiciones registrada exitosamente',
      },
    },
    REGISTER_USER: {
      SUCCESS: {
        code: 'USER_REGISTERED',
        message: 'Usuario registrado exitosamente.',
      },
      EMAIL_ALREADY_EXISTS: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Este email ya esta en uso, intenta con otro.',
      },
    },
    // Código transversal: cualquier llamada de un paso de registro que dependa del
    // `sessionToken` (RegistrationStepService.updateStep y futuros pasos) puede recibirlo.
    SESSION: {
      EXPIRED: {
        code: 'SESSION_EXPIRED',
        message: 'La sesión de registro ha expirado.',
      },
    },
  },
  DEVICE: {
    UPDATE_TRUST_STATUS: {
      SUCCESS: {
        code: 'TRUST_STATUS_UPDATED',
        message: 'Device trust status updated successfully.',
      },
    },
  },
  ACCESS_RECOVERY: {
    VERIFY_CLIENT_DOCUMENT: {
      SUCCESS: {
        code: 'EGEN000',
        message: 'Cliente verificado exitosamente.',
      },
      CLIENT_NOT_VALIDATED: {
        code: 'EGEN001',
        message: 'El cliente existe pero no está habilitado para continuar el registro.',
      },
      CLIENT_WITHOUT_DATA: {
        code: 'EGEN002',
        message: 'El cliente debe actualizar su información de contacto',
      },
      MAX_ATTEMPTS_EXCEEDED: {
        code: 'EGEN003',
        message: 'Se ha excedido el límite de intentos permitidos.',
      },
    },
    CHANGE_PASSWORD: {
      SUCCESS: {
        code: 'PASSWORD_CHANGED',
        message: 'Password changed successfully.',
      },
      BAD_REQUEST: {
        code: 'EGEN021',
        message: "El campo 'newPassword' es obligatorio.",
      },
      USER_NOT_FOUND: {
        code: '50404',
        message: 'Users_UpdatePassword: el usuario no existe.',
      },
      SERVICE_UNAVAILABLE: {
        code: 'BUS-CIAM-502',
        message:
          'No fue posible ejecutar Users_UpdatePassword: error de conexión con la base de datos.',
      },
    },
  },
} as const;
