/**
 * Dónde viven las credenciales de sesión.
 *
 * Es una interfaz y no una clase concreta por una razón concreta: el
 * interceptor de autenticación es la pieza más delicada de la capa de red y
 * tiene que poder probarse por completo sin almacenamiento seguro real, que
 * depende de la plataforma. En producción la implementa el Keystore de Android
 * o el Llavero de iOS; en las pruebas, un mapa en memoria.
 *
 * Las claves son las mismas 13 que define `secure_storage.dart` en la app
 * Flutter, para que la migración de un dispositivo ya enrolado sea posible.
 */
export interface TokenStore {
  getAccessToken(): Promise<string | null>;
  saveAccessToken(token: string): Promise<void>;

  getRefreshToken(): Promise<string | null>;
  saveRefreshToken(token: string): Promise<void>;

  /** Marca de vencimiento del token de acceso, en ISO 8601. */
  getTokenExpiry(): Promise<string | null>;
  saveTokenExpiry(expiry: string): Promise<void>;

  /** Borra todo lo que identifica la sesión. No toca la llave del dispositivo. */
  clearSession(): Promise<void>;
  /** Bloquea sin cerrar: conserva el token de refresco. Ver `finDeSesion.ts`. */
  lockSession(): Promise<void>;
}

/**
 * Implementación en memoria, para pruebas.
 *
 * No se usa en producción: nada de esto sobrevive a cerrar la app, que es
 * exactamente lo que se quiere de un doble de prueba.
 */
export class InMemoryTokenStore implements TokenStore {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: string | null = null;

  async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  async saveAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  async saveRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
  }

  async getTokenExpiry(): Promise<string | null> {
    return this.tokenExpiry;
  }

  async saveTokenExpiry(expiry: string): Promise<void> {
    this.tokenExpiry = expiry;
  }

  async clearSession(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /** Conserva el token de refresco, como el almacén de verdad. */
  async lockSession(): Promise<void> {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}
