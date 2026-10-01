export const APP_CONFIG = {
  APP_NAME: 'Banco Santa Cruz',
  APP_VERSION: '1.0.0',
  // APPLICATION_ID: 'com.bsc.conversational',
  APPLICATION_ID: 'com.do.bsc.conversational',
  // Configuración del WebSocket
  // En Android, el servicio transforma https -> wss automáticamente.
  WEBSOCKET_URL: 'https://api-genesis.dev.bsc.com.do/ws',
  WEBSOCKET_RECONNECT_INTERVAL: 5000,
  WEBSOCKET_MAX_RECONNECT_ATTEMPTS: 5,

  // Configuración de API (si se usa REST además de WebSocket)
  // API_BASE_URL: 'https://apigateway-gen.dev.bsc.com.do/api',
  API_BASE_URL: 'https://apigateway-gen.dev.bsc.com.do/api', //QA
  API_TIMEOUT: 30000,

  // Dominio (sin esquema) usado en el App Link del AndroidManifest para la verificación de Passkeys
  FIDO_APPLINK_HOST: 'bsc.com.do',
  // FIDO_APPLINK_HOST: 'apigateway-gen.dev.bsc.com.do',

  // Máximo de reenvíos permitidos para los flujos de OTP
  OTP_MAX_RESEND_ATTEMPTS: 3,

  // Switch global de mocks: cambiar a `false` cuando el backend real esté disponible
  USE_MOCKS: false,
  CHAT_API_URL:
    'http://20.127.25.24:8000/chat/front?x-api-key=genesis-rag-temp-c04f313048e160f088601c96',
  CHAT_API_TOP_K: 3,

  // Configuración de mensajes
  MAX_MESSAGE_LENGTH: 500,
  TYPING_INDICATOR_DELAY: 1000,

  // Configuración de cache
  CACHE_EXPIRATION_TIME: 3600000, // 1 hora en ms

  // Tiempo máximo que la app puede permanecer en segundo plano con una sesión activa antes de
  // forzar el cierre de sesión por inactividad (ver useSessionInactivityWatcher)
  SESSION_INACTIVITY_TIMEOUT: 500000, // 5 minutos en ms

  // Activar o desactivar TTS hasta validar requerimimento completo
  TTS_ENABLED: false,

  // Activar o desactivar tercera opcion de restauracion de accesos
  // Permite ver el card y valida si desde UsernameRecoveryScreen muestra el boton de recuperar contrasena o no
  BOTH_RECOVERY: false,
};

// Claves bajo las que se guardan los tokens de sesión en el Keychain del dispositivo
export const KEYCHAIN_CONFIG = {
  SERVICE: 'com.bsc.conversational.auth_tokens',
  USERNAME: 'bsc_session',
  // Entrada separada y protegida con accessControl biométrico: solo puede leerse tras un gesto
  // biométrico exitoso verificado por el propio sistema operativo (ver AuthService biometría).
  BIOMETRIC_SERVICE: 'com.bsc.conversational.biometric_session',
} as const;

// Métodos HTTP usados por los servicios REST
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Textos de la aplicación
export const TEXTS = {
  // Pantalla de chat
  CHAT: {
    TITLE: 'Asistente Virtual',
    PLACEHOLDER: 'Escribe tu mensaje...',
    SEND_BUTTON: 'Enviar',
    WELCOME_MESSAGE:
      '¡Hola! Soy tu asistente virtual del Banco Santa Cruz. ¿En qué puedo ayudarte hoy?',
    ERROR_MESSAGE: 'Lo siento, ocurrió un error. Por favor, intenta nuevamente.',
    CONNECTING: 'Conectando...',
    CONNECTED: 'Conectado',
    DISCONNECTED: 'Desconectado',
  },

  // Pantalla de transacciones
  TRANSACTIONS: {
    TITLE: 'Transacciones',
    EMPTY_STATE: 'No hay transacciones disponibles',
    FILTER: 'Filtrar',
    SORT: 'Ordenar',
  },

  // Pantalla de productos
  PRODUCTS: {
    TITLE: 'Productos',
    EMPTY_STATE: 'No tienes productos activos',
    REQUEST_PRODUCT: 'Solicitar producto',
  },

  // Pantalla de perfil
  PROFILE: {
    TITLE: 'Perfil',
    EDIT: 'Editar',
    LOGOUT: 'Cerrar sesión',
    SETTINGS: 'Configuración',
  },

  // Errores comunes
  ERRORS: {
    NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
    UNAUTHORIZED: 'Sesión expirada. Inicia sesión nuevamente.',
    VALIDATION_ERROR: 'Datos inválidos. Revisa los campos.',
  },
};

// Tipos de acciones para el WebSocket
export const WS_ACTIONS = {
  // Transacciones
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  GET_BALANCE: 'get_balance',
  GET_TRANSACTIONS: 'get_transactions',

  // Productos
  REQUEST_PRODUCT: 'request_product',
  GET_PRODUCTS: 'get_products',
  GET_PRODUCT_DETAILS: 'get_product_details',

  // Consultas
  QUERY_ACCOUNT: 'query_account',
  QUERY_STATUS: 'query_status',

  // Mensajes
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
};
