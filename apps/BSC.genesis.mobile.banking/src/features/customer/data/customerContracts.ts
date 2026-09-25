/**
 * Perfil del titular de la cuenta.
 *
 * **No es lo mismo que el usuario de la aplicación.** La respuesta del login
 * describe a quien inició sesión; esto describe al *cliente del banco*, con su
 * sucursal y su oficial asignado. El comentario de `api_endpoints.dart` lo dice
 * expresamente, y confundirlos es fácil porque ambos tienen nombre y apellido.
 *
 * Portado de `customer_profile_model.dart` y `customer_profile.dart`.
 */

/** Lee una cadena probando varios nombres. */
function texto(fuente: Record<string, unknown>, ...nombres: string[]): string {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (typeof valor === 'string' && valor.trim() !== '') return valor.trim();
    if (typeof valor === 'number') return String(valor);
  }
  return '';
}

export interface PerfilDeCliente {
  customerCode: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  email: string;
  telefono: string | undefined;
  celular: string | undefined;
  estado: string;

  oficialNombre: string | undefined;
  oficialEmail: string | undefined;
  oficialTelefono: string | undefined;
  sucursal: string | undefined;
}

/** Nombre completo, sin espacios dobles por los nombres que faltan. */
export function nombreCompleto(perfil: PerfilDeCliente): string {
  return [
    perfil.primerNombre,
    perfil.segundoNombre,
    perfil.primerApellido,
    perfil.segundoApellido,
  ]
    .map(parte => parte.trim())
    .filter(parte => parte !== '')
    .join(' ');
}

/**
 * Nombre para saludar: solo el primero.
 *
 * Si no hay primer nombre usa el apellido, y si tampoco hay, «cliente». Un
 * saludo vacío —«Hola,»— se ve peor que uno genérico.
 */
export function nombreDeSaludo(perfil: PerfilDeCliente): string {
  const primero = perfil.primerNombre.trim();
  if (primero !== '') return primero;

  const apellido = perfil.primerApellido.trim();
  return apellido !== '' ? apellido : 'cliente';
}

/** Iniciales para el avatar. Nunca vacías: cae a «BS» por Banco Santa Cruz. */
export function iniciales(perfil: PerfilDeCliente): string {
  const a = perfil.primerNombre.trim().charAt(0);
  const b = perfil.primerApellido.trim().charAt(0);
  const resultado = `${a}${b}`.toUpperCase();
  return resultado === '' ? 'BS' : resultado;
}

/** El core marca los clientes activos con «A». */
export function estaActivo(perfil: PerfilDeCliente): boolean {
  return perfil.estado.trim().toUpperCase() === 'A';
}

/**
 * Si el cliente tiene un oficial asignado.
 *
 * El perfil y la pantalla del oficial deciden con esto si dibujan el bloque.
 * Portado de `hasOfficer` en `customer_profile.dart`.
 */
export function tieneOficial(perfil: PerfilDeCliente): boolean {
  return (perfil.oficialNombre ?? '').trim() !== '';
}

export function parsePerfilDeCliente(cuerpo: unknown): PerfilDeCliente {
  const dato =
    typeof cuerpo === 'string' ? (JSON.parse(cuerpo) as unknown) : cuerpo;

  if (typeof dato !== 'object' || dato === null) {
    throw new Error('La respuesta del perfil no es un objeto');
  }

  const raiz = dato as Record<string, unknown>;

  // El core envuelve el perfil en una referencia. Si no está, se lee la raíz:
  // algunos ambientes lo devuelven plano.
  const referencia = (raiz.CustomerProfileReference ??
    raiz.customerProfileReference ??
    raiz) as Record<string, unknown>;

  const fuente =
    typeof referencia === 'object' && referencia !== null ? referencia : raiz;

  const opcional = (valor: string): string | undefined =>
    valor === '' ? undefined : valor;

  return {
    customerCode: texto(
      fuente,
      'CustomerCode',
      'customerCode',
      'PartyId',
      'partyId',
    ),
    primerNombre: texto(fuente, 'FirstName', 'firstName'),
    segundoNombre: texto(
      fuente,
      'SecondName',
      'secondName',
      'MiddleName',
      'middleName',
    ),
    primerApellido: texto(fuente, 'LastName', 'lastName'),
    segundoApellido: texto(fuente, 'SecondLastName', 'secondLastName'),
    email: texto(fuente, 'Email', 'email', 'EmailAddress', 'emailAddress'),
    telefono: opcional(
      texto(fuente, 'Phone', 'phone', 'HomePhone', 'homePhone'),
    ),
    celular: opcional(
      texto(fuente, 'MobilePhone', 'mobilePhone', 'CellPhone', 'cellPhone'),
    ),
    estado: texto(fuente, 'PartyStatus', 'partyStatus', 'Status', 'status'),

    /*
      El oficial llega como `OfficialAccountName`, no como `OfficerName`.

      Es el nombre que declara `BusCompatibleCustomerProfile` en el backend y el
      que lee `customer_profile_model.dart`. Este porte leía `OfficerName`, que
      **el backend no envía nunca**: el bloque «Mi oficial de cuenta» del perfil
      no se habría dibujado jamás y la pantalla del oficial habría respondido
      siempre «aún no tienes un oficial asignado», sin un solo error. Los
      nombres cortos se conservan detrás por si algún ambiente los usa.
    */
    oficialNombre: opcional(
      texto(
        fuente,
        'OfficialAccountName',
        'officialAccountName',
        'OfficerName',
        'officerName',
      ),
    ),
    oficialEmail: opcional(
      texto(
        fuente,
        'OfficialAccountEmail',
        'officialAccountEmail',
        'OfficerEmail',
        'officerEmail',
      ),
    ),
    oficialTelefono: opcional(
      texto(
        fuente,
        'OfficialAccountPhone',
        'officialAccountPhone',
        'OfficialAccountOfficePhone',
        'officialAccountOfficePhone',
        'OfficerPhone',
        'officerPhone',
      ),
    ),
    sucursal: opcional(
      texto(fuente, 'BranchName', 'branchName', 'Branch', 'branch'),
    ),
  };
}
