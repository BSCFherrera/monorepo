/**
 * Contratos de la API de autenticación.
 *
 * El backend responde en PascalCase, pero no siempre: algunos campos llegan en
 * camelCase y algunos vienen anidados bajo `user` y otros al nivel superior. El
 * código Dart lo resuelve probando cuatro nombres por campo, y eso mismo hay
 * que preservar — no porque sea elegante, sino porque es lo que el servidor
 * manda hoy.
 *
 * La diferencia respecto a Flutter es que aquí la forma se **valida**: si falta
 * un campo del que el resto de la app depende, falla con un mensaje claro en el
 * borde, en vez de producir un `undefined` tres pantallas más adelante.
 */

export interface Usuario {
  customerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
  fullName: string;
}

/**
 * Comprueba que el usuario quedó utilizable antes de dejarlo entrar.
 *
 * Se escribe a mano en vez de con una librería de esquemas. La razón no es
 * ideológica: los parsers de este archivo **ya validan** mientras interpretan,
 * porque tienen que probar hasta cuatro nombres por campo y decidir qué hacer
 * si ninguno aparece. Un esquema encima solo validaría un objeto que acabamos
 * de construir nosotros mismos, lo que no prueba nada del servidor.
 *
 * Lo que sí importa comprobar es que los campos **de los que depende el resto
 * de la app** vengan con algo: sin código de cliente no se puede pedir ningún
 * producto, y la pantalla siguiente fallaría sin explicar por qué.
 */
function validarUsuario(usuario: Usuario): Usuario {
  if (usuario.customerCode === '') {
    throw new Error(
      'El servidor no devolvió el código de cliente; sin él no se puede continuar',
    );
  }

  return usuario;
}

export interface LoginRequest {
  username: string;
  password: string;
  /** El backend distingue el canal; móvil es 2, igual que la cabecera. */
  channel: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | undefined;
  user: Usuario;
}

/** Lee una cadena probando varios nombres, en el objeto dado y en su padre. */
function leer(
  fuente: Record<string, unknown>,
  padre: Record<string, unknown>,
  ...nombres: string[]
): string {
  for (const contenedor of [fuente, padre]) {
    for (const nombre of nombres) {
      const valor = contenedor[nombre];
      if (typeof valor === 'string' && valor.trim() !== '') return valor.trim();
    }
  }
  return '';
}

/**
 * Interpreta la respuesta de `/auth/login`.
 *
 * Se escribe a mano en vez de con un esquema declarativo porque la tolerancia
 * de nombres es irregular —cada campo admite un conjunto distinto y puede estar
 * anidado o no—, y forzarlo en un esquema declarativo quedaría menos legible.
 */
export function parseLoginResponse(cuerpo: unknown): LoginResult {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    throw new Error('La respuesta de inicio de sesión no es un objeto');
  }

  const raiz = cuerpo as Record<string, unknown>;
  const usuarioCrudo = (raiz.user ?? raiz.User ?? {}) as Record<
    string,
    unknown
  >;

  const accessToken = leer(raiz, raiz, 'accessToken', 'AccessToken');
  const refreshToken = leer(raiz, raiz, 'refreshToken', 'RefreshToken');

  if (accessToken === '') {
    throw new Error('La respuesta de inicio de sesión no trae token de acceso');
  }

  const firstName = leer(usuarioCrudo, raiz, 'firstName', 'FirstName');
  const lastName = leer(usuarioCrudo, raiz, 'lastName', 'LastName');
  const fullNameCrudo = leer(usuarioCrudo, raiz, 'fullName', 'FullName');

  const usuario: Usuario = {
    customerCode: leer(usuarioCrudo, raiz, 'customerCode', 'CustomerCode'),
    firstName,
    lastName,
    email: leer(usuarioCrudo, raiz, 'email', 'Email'),
    fullName:
      fullNameCrudo !== ''
        ? fullNameCrudo
        : [firstName, lastName].filter(p => p !== '').join(' '),
  };

  const phone = leer(usuarioCrudo, raiz, 'phone', 'Phone');
  if (phone !== '') usuario.phone = phone;

  const username = leer(usuarioCrudo, raiz, 'username', 'UserName', 'Username');
  if (username !== '') usuario.username = username;

  const expiresAt = leer(raiz, raiz, 'expiresAt', 'ExpiresAt');

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt === '' ? undefined : expiresAt,
    user: validarUsuario(usuario),
  };
}

/**
 * Interpreta `/auth/me`.
 *
 * Nota del código Dart, verificada: **devuelve el usuario directamente**, no
 * envuelto en `{ success, data }` como sugieren los tipos del portal. Se
 * aceptan las dos formas por si acaso.
 */
export function parseCurrentUser(cuerpo: unknown): Usuario {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    throw new Error('La respuesta de usuario no es un objeto');
  }

  const raiz = cuerpo as Record<string, unknown>;
  const envuelto = (raiz.Data ?? raiz.data ?? raiz) as Record<string, unknown>;

  const firstName = leer(envuelto, raiz, 'firstName', 'FirstName');
  const lastName = leer(envuelto, raiz, 'lastName', 'LastName');

  const usuario: Usuario = {
    customerCode: leer(envuelto, raiz, 'customerCode', 'CustomerCode'),
    firstName,
    lastName,
    email: leer(envuelto, raiz, 'email', 'Email'),
    fullName: [firstName, lastName].filter(p => p !== '').join(' '),
  };

  const phone = leer(envuelto, raiz, 'phone', 'Phone');
  if (phone !== '') usuario.phone = phone;

  return validarUsuario(usuario);
}
