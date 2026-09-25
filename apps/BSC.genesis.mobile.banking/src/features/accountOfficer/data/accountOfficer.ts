import {
  tieneOficial,
  type PerfilDeCliente,
} from '../../customer/data/customerContracts';

/**
 * El oficial de cuenta asignado al cliente.
 *
 * Portado de `account_officer.dart` y `account_officer_repository.dart`. El
 * oficial **no es un recurso aparte**: `get-customer-profile` ya trae
 * `OfficialAccountName`, `OfficialAccountEmail`, `OfficialAccountPhone` y
 * `BranchName`. El original tuvo una fuente de datos propia que llamaba al
 * mismo endpoint por segunda vez, y su repositorio explica por qué se quitó:
 * la app lo consultaba dos veces y había dos sitios que mantener en sincronía.
 *
 * Por eso esto es una **función pura sobre el perfil**, no un repositorio con
 * su propia petición. Así se puede probar entera sin red.
 */

export interface OficialDeCuenta {
  nombre: string;
  email: string | undefined;
  telefono: string | undefined;
  /**
   * Siempre indefinido hoy.
   *
   * El core manda **un solo número** de oficial. El original lo deja explícito
   * y no lo repite bajo dos etiquetas, porque enseñar «Oficina» y «No. Móvil»
   * con el mismo número le promete al cliente dos líneas que no existen. El
   * campo se conserva porque la pantalla dibuja la fila si algún día llega.
   */
  celular: string | undefined;
  sucursal: string | undefined;
}

/** El cargo es fijo: el core no manda ninguno. */
export const CARGO_DEL_OFICIAL = 'Oficial de Cuenta';

/** Mensaje del original cuando el cliente no tiene oficial asignado. */
export const SIN_OFICIAL_ASIGNADO =
  'Aún no tienes un oficial de cuenta asignado.';

/**
 * Deriva el oficial del perfil del titular.
 *
 * Devuelve `null` cuando no hay ninguno asignado: la pantalla lo distingue de
 * un fallo de red, porque no son lo mismo y el original tampoco los confunde
 * —uno ofrece reintentar y el otro no tendría sentido reintentarlo—.
 */
export function oficialDelPerfil(
  perfil: PerfilDeCliente,
): OficialDeCuenta | null {
  if (!tieneOficial(perfil)) return null;

  return {
    nombre: (perfil.oficialNombre ?? '').trim(),
    email: perfil.oficialEmail,
    telefono: perfil.oficialTelefono,
    celular: undefined,
    sucursal: perfil.sucursal,
  };
}

/** Si hay algún dato con el que contactarlo. */
export function tieneContacto(oficial: OficialDeCuenta): boolean {
  return (
    oficial.email !== undefined ||
    oficial.telefono !== undefined ||
    oficial.celular !== undefined
  );
}

/**
 * Deja el número en algo que el marcador del teléfono pueda usar.
 *
 * Portado de `_launchPhone`: el core devuelve los números con paréntesis y
 * guiones —«(809) 555-0000»— y el esquema `tel:` no los admite. Se conserva el
 * `+` inicial porque un número internacional sin él marca mal.
 */
export function numeroParaMarcar(telefono: string): string {
  return telefono.replace(/[^\d+]/g, '');
}
