import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';
import type { SecureStorage } from '../../../core/security/secureStorage';

import {
  parseCurrentUser,
  parseLoginResponse,
  type LoginResult,
  type Usuario,
} from './authContracts';

/**
 * Acceso a la API de autenticación.
 *
 * Portado de `auth_remote_datasource.dart` y `auth_repository_impl.dart`, que
 * en Flutter están separados. Aquí van juntos: la separación en dos capas solo
 * aportaba una indirección, porque el repositorio no hacía nada más que
 * delegar y guardar los tokens.
 */
export class AuthRepository {
  constructor(
    private readonly http: AxiosInstance,
    private readonly storage: SecureStorage,
  ) {}

  /**
   * Inicia sesión y guarda las credenciales.
   *
   * El canal viaja en el cuerpo además de en las cabeceras porque el backend lo
   * espera en ambos sitios; quitarlo de uno de los dos cambia cómo queda
   * registrada la operación.
   */
  async login(username: string, password: string): Promise<LoginResult> {
    const respuesta = await this.http.post(Endpoints.login, {
      username,
      password,
      channel: '2',
    });

    const resultado = parseLoginResponse(respuesta.data);

    await this.storage.saveAccessToken(resultado.accessToken);
    if (resultado.refreshToken !== '') {
      await this.storage.saveRefreshToken(resultado.refreshToken);
    }
    if (resultado.expiresAt !== undefined) {
      await this.storage.saveTokenExpiry(resultado.expiresAt);
    }

    // Permite saludar por su nombre la próxima vez, antes de iniciar sesión.
    if (resultado.user.fullName !== '') {
      await this.storage.saveLastUserName(resultado.user.fullName);
    }

    return resultado;
  }

  /**
   * Relee el usuario desde el servidor.
   *
   * Se usa al reanudar una sesión, para que un usuario cacheado y desactualizado
   * no se quede en pantalla.
   */
  async getCurrentUser(): Promise<Usuario> {
    const respuesta = await this.http.get(Endpoints.me);
    return parseCurrentUser(respuesta.data);
  }

  /**
   * Cierra la sesión.
   *
   * **El estado local se limpia pase lo que pase con el servidor.** Si la
   * llamada falla —sin red, token ya vencido— y por eso se conservaran las
   * credenciales, el cliente creería haber salido sin haber salido. El servidor
   * invalidará el token por su cuenta al vencer.
   */
  async logout(): Promise<void> {
    try {
      await this.http.post(Endpoints.logout);
    } catch {
      // Intencionalmente ignorado: ver arriba.
    } finally {
      await this.storage.clearSession();
    }
  }

  /** Cierra la sesión en todos los dispositivos del cliente. */
  async logoutAll(): Promise<void> {
    try {
      await this.http.post(Endpoints.logoutAll);
    } catch {
      // Igual que en `logout`.
    } finally {
      await this.storage.clearSession();
    }
  }

  /** Si el dispositivo recuerda a alguien, para saludarlo en el acceso. */
  getRememberedUserName(): Promise<string | null> {
    return this.storage.getLastUserName();
  }
}
