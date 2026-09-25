import { parsePerfilDeCliente } from '../../../customer/data/customerContracts';
import {
  numeroParaMarcar,
  oficialDelPerfil,
  tieneContacto,
} from '../accountOfficer';

const perfilCon = (campos: Record<string, unknown>) =>
  parsePerfilDeCliente({
    CustomerCode: '80191',
    FirstName: 'Ana',
    LastName: 'Pérez',
    ...campos,
  });

describe('oficialDelPerfil', () => {
  it('lo deriva del perfil, sin una segunda consulta', () => {
    const oficial = oficialDelPerfil(
      perfilCon({
        OfficialAccountName: 'Luis Gómez',
        OfficialAccountEmail: 'luis.gomez@example.com',
        OfficialAccountPhone: '(809) 555-0000',
        BranchName: 'Sucursal Naco',
      }),
    );

    expect(oficial).toEqual({
      nombre: 'Luis Gómez',
      email: 'luis.gomez@example.com',
      telefono: '(809) 555-0000',
      celular: undefined,
      sucursal: 'Sucursal Naco',
    });
  });

  it('sin oficial asignado devuelve nulo, que no es lo mismo que un fallo', () => {
    expect(oficialDelPerfil(perfilCon({}))).toBeNull();
    expect(
      oficialDelPerfil(perfilCon({ OfficialAccountName: '  ' })),
    ).toBeNull();
  });

  it('nunca repite el teléfono del oficial como si fuera su móvil', () => {
    // El core manda un solo número. Enseñarlo bajo «Oficina» y «No. Móvil» le
    // prometería al cliente dos líneas que no existen.
    const oficial = oficialDelPerfil(
      perfilCon({
        OfficialAccountName: 'Luis Gómez',
        OfficialAccountPhone: '8095550000',
      }),
    );

    expect(oficial?.celular).toBeUndefined();
  });

  it('un oficial sin ningún dato de contacto se reconoce como tal', () => {
    const oficial = oficialDelPerfil(
      perfilCon({ OfficialAccountName: 'Luis Gómez' }),
    );

    expect(oficial).not.toBeNull();
    expect(tieneContacto(oficial!)).toBe(false);
  });

  it('con correo o con teléfono ya hay contacto', () => {
    const conCorreo = oficialDelPerfil(
      perfilCon({
        OfficialAccountName: 'Luis Gómez',
        OfficialAccountEmail: 'luis@example.com',
      }),
    );
    const conTelefono = oficialDelPerfil(
      perfilCon({
        OfficialAccountName: 'Luis Gómez',
        OfficialAccountPhone: '8095550000',
      }),
    );

    expect(tieneContacto(conCorreo!)).toBe(true);
    expect(tieneContacto(conTelefono!)).toBe(true);
  });
});

describe('numeroParaMarcar', () => {
  it('quita lo que el esquema tel: no admite', () => {
    expect(numeroParaMarcar('(809) 555-0000')).toBe('8095550000');
    expect(numeroParaMarcar('809 555 0000 ext. 12')).toBe('809555000012');
  });

  it('conserva el prefijo internacional', () => {
    // Sin el «+» un número internacional marca mal.
    expect(numeroParaMarcar('+1 (809) 555-0000')).toBe('+18095550000');
  });
});
