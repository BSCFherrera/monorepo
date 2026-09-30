
import { APP_CONFIG } from './config';
/**
 * Headers HTTP predeterminados que se envían en TODAS las peticiones reales de la app.
 * Agregar/modificar una entrada aquí propaga el cambio a todos los servicios sin tocarlos uno a uno.
 */
export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  consumerId: APP_CONFIG.APPLICATION_ID,
  channel: 'mobile',
};

/**
 * Combina los headers predeterminados globales con headers opcionales propios de un
 * endpoint puntual. Los headers opcionales ganan si hay colisión de claves.
 */
export const buildHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => ({
  ...DEFAULT_HEADERS,
  ...extraHeaders,
});
