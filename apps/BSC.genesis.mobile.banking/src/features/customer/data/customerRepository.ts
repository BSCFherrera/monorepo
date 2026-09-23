import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';

import {
  parsePerfilDeCliente,
  type PerfilDeCliente,
} from './customerContracts';

/**
 * Perfil del titular, con una sola fuente de verdad.
 *
 * Portado de `customer_repository.dart`. Lo importante de aquel archivo no es
 * la petición —es de una línea— sino **la caché**: el saludo del dashboard, la
 * pantalla de perfil y la del oficial de cuenta leen todas el mismo objeto en
 * vez de disparar cada una su consulta. La app Flutter llegó a tener una fuente
 * de datos propia para el oficial que golpeaba este mismo endpoint por segunda
 * vez, y su repositorio lo dice expresamente al explicar por qué se quitó.
 *
 * La caché es **por código de cliente y por sesión**: vive en memoria, no toca
 * disco y se pierde al cerrar la aplicación. El perfil trae el nombre, el
 * correo y el teléfono del titular; dejarlo escrito en el almacenamiento del
 * teléfono sería guardar datos personales que nadie pidió conservar.
 */
export class CustomerRepository {
  private perfil: PerfilDeCliente | null = null;
  private perfilDe: string | null = null;

  constructor(private readonly http: AxiosInstance) {}

  /** El último perfil leído, sin pedirlo de nuevo. Nulo si aún no hay ninguno. */
  get enMemoria(): PerfilDeCliente | null {
    return this.perfil;
  }

  async obtenerPerfil(
    customerCode: string,
    opciones: { forzar?: boolean } = {},
  ): Promise<PerfilDeCliente> {
    const guardado = this.perfil;
    if (
      opciones.forzar !== true &&
      guardado !== null &&
      this.perfilDe === customerCode
    ) {
      return guardado;
    }

    const respuesta = await this.http.post(Endpoints.customerProfile, {
      customerCode,
    });

    const perfil = parsePerfilDeCliente(respuesta.data);

    this.perfil = perfil;
    this.perfilDe = customerCode;
    return perfil;
  }

  /**
   * Olvida el perfil.
   *
   * Hay que llamarlo al cerrar sesión. Sin esto, el siguiente cliente que
   * entrara en el mismo teléfono vería el nombre y el correo del anterior
   * mientras su propio perfil termina de cargar.
   */
  limpiar(): void {
    this.perfil = null;
    this.perfilDe = null;
  }
}
