import { parseLoginResponse, parseCurrentUser } from '../authContracts';

/**
 * El backend responde de forma irregular: PascalCase casi siempre, camelCase a
 * veces, y algunos campos anidados bajo `user` y otros al nivel superior. El
 * código Dart lo resuelve probando hasta cuatro nombres por campo, y eso hay
 * que preservarlo — no porque sea elegante, sino porque es lo que el servidor
 * manda hoy y **el backend no se modifica**.
 */

const RESPUESTA_PASCAL = {
  AccessToken: 'acceso-1',
  RefreshToken: 'refresco-1',
  ExpiresAt: '2026-09-16T12:00:00Z',
  User: {
    CustomerCode: '80191',
    FirstName: 'Ana',
    LastName: 'Pérez',
    Email: 'ana@example.com',
    Phone: '8090000000',
  },
};

describe('parseLoginResponse', () => {
  it('interpreta la respuesta en PascalCase con el usuario anidado', () => {
    const resultado = parseLoginResponse(RESPUESTA_PASCAL);

    expect(resultado.accessToken).toBe('acceso-1');
    expect(resultado.refreshToken).toBe('refresco-1');
    expect(resultado.expiresAt).toBe('2026-09-16T12:00:00Z');
    expect(resultado.user.customerCode).toBe('80191');
    expect(resultado.user.email).toBe('ana@example.com');
  });

  it('interpreta la misma respuesta en camelCase', () => {
    const resultado = parseLoginResponse({
      accessToken: 'acceso-1',
      refreshToken: 'refresco-1',
      user: {
        customerCode: '80191',
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'a@b.do',
      },
    });

    expect(resultado.user.customerCode).toBe('80191');
  });

  it('acepta los campos del usuario al nivel superior', () => {
    // El backend no siempre los anida.
    const resultado = parseLoginResponse({
      AccessToken: 'acceso-1',
      RefreshToken: 'refresco-1',
      CustomerCode: '80191',
      FirstName: 'Ana',
      LastName: 'Pérez',
      Email: 'a@b.do',
    });

    expect(resultado.user.customerCode).toBe('80191');
    expect(resultado.user.firstName).toBe('Ana');
  });

  it('compone el nombre completo cuando el backend no lo manda', () => {
    expect(parseLoginResponse(RESPUESTA_PASCAL).user.fullName).toBe(
      'Ana Pérez',
    );
  });

  it('respeta el nombre completo si el backend sí lo manda', () => {
    const resultado = parseLoginResponse({
      ...RESPUESTA_PASCAL,
      User: { ...RESPUESTA_PASCAL.User, FullName: 'Ana M. Pérez de la Cruz' },
    });

    expect(resultado.user.fullName).toBe('Ana M. Pérez de la Cruz');
  });

  it('quita los espacios al borde de los valores', () => {
    const resultado = parseLoginResponse({
      AccessToken: '  acceso-1  ',
      RefreshToken: 'refresco-1',
      User: {
        CustomerCode: ' 80191 ',
        FirstName: 'Ana',
        LastName: 'P',
        Email: 'a@b.do',
      },
    });

    expect(resultado.accessToken).toBe('acceso-1');
    expect(resultado.user.customerCode).toBe('80191');
  });

  it('el teléfono es opcional y se omite si viene vacío', () => {
    const resultado = parseLoginResponse({
      ...RESPUESTA_PASCAL,
      User: { ...RESPUESTA_PASCAL.User, Phone: '   ' },
    });

    expect(resultado.user.phone).toBeUndefined();
  });

  it('sin token de acceso falla con un mensaje claro', () => {
    // Es exactamente el defecto que tenía la app Flutter: leer un campo con
    // otro nombre y seguir como si nada.
    expect(() => parseLoginResponse({ RefreshToken: 'x' })).toThrow(
      /token de acceso/,
    );
  });

  it('rechaza una respuesta que no es un objeto', () => {
    expect(() => parseLoginResponse('error del servidor')).toThrow();
    expect(() => parseLoginResponse(null)).toThrow();
  });
});

describe('parseCurrentUser', () => {
  it('lee el usuario devuelto directamente, sin envoltura', () => {
    // Verificado en el código Dart: /auth/me NO envuelve en { success, data },
    // aunque los tipos del portal lo sugieran.
    const usuario = parseCurrentUser({
      CustomerCode: '80191',
      FirstName: 'Ana',
      LastName: 'Pérez',
      Email: 'a@b.do',
    });

    expect(usuario.customerCode).toBe('80191');
    expect(usuario.fullName).toBe('Ana Pérez');
  });

  it('también tolera la envoltura, por si el backend cambia', () => {
    const usuario = parseCurrentUser({
      Data: {
        CustomerCode: '80191',
        FirstName: 'Ana',
        LastName: 'P',
        Email: 'a@b.do',
      },
    });

    expect(usuario.customerCode).toBe('80191');
  });

  it('un usuario sin apellido no deja el nombre con espacio suelto', () => {
    const usuario = parseCurrentUser({
      CustomerCode: '1',
      FirstName: 'Ana',
      Email: 'a@b.do',
    });

    expect(usuario.fullName).toBe('Ana');
  });
});
