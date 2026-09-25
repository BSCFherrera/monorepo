import {
  parsePerfilDeCliente,
  nombreCompleto,
  nombreDeSaludo,
  iniciales,
  estaActivo,
  tieneOficial,
  type PerfilDeCliente,
} from '../customerContracts';

const PERFIL_CORE = {
  CustomerProfileReference: {
    CustomerCode: '80191',
    FirstName: 'Ana',
    SecondName: 'María',
    LastName: 'Pérez',
    SecondLastName: 'De la Cruz',
    Email: 'ana@example.com',
    MobilePhone: '8090000000',
    PartyStatus: 'A',
    // El backend los declara así en `BusCompatibleCustomerProfile`, y la app
    // Flutter los lee así. Esta prueba fijaba `OfficerName`, que no existe.
    OfficialAccountName: 'Luis Gómez',
    OfficialAccountEmail: 'luis.gomez@example.com',
    OfficialAccountPhone: '8095550000',
    BranchName: 'Sucursal Naco',
  },
};

const perfilBase = (): PerfilDeCliente => parsePerfilDeCliente(PERFIL_CORE);

describe('parsePerfilDeCliente', () => {
  it('lee el perfil dentro de la referencia del core', () => {
    const perfil = perfilBase();

    expect(perfil.customerCode).toBe('80191');
    expect(perfil.primerNombre).toBe('Ana');
    expect(perfil.sucursal).toBe('Sucursal Naco');
  });

  it('también lo lee si llega plano', () => {
    // Algunos ambientes lo devuelven sin envolver.
    const perfil = parsePerfilDeCliente({
      CustomerCode: '80191',
      FirstName: 'Ana',
      LastName: 'Pérez',
    });

    expect(perfil.customerCode).toBe('80191');
  });

  it('acepta la respuesta como cadena JSON', () => {
    expect(parsePerfilDeCliente(JSON.stringify(PERFIL_CORE)).customerCode).toBe(
      '80191',
    );
  });

  it('los campos ausentes quedan indefinidos, no en cadena vacía', () => {
    // Un `undefined` permite decidir si mostrar la fila; una cadena vacía deja
    // una etiqueta con nada al lado.
    const perfil = parsePerfilDeCliente({ FirstName: 'Ana' });

    expect(perfil.telefono).toBeUndefined();
    expect(perfil.oficialNombre).toBeUndefined();
    expect(perfil.sucursal).toBeUndefined();
  });

  it('el código de cliente puede venir como número', () => {
    expect(parsePerfilDeCliente({ CustomerCode: 80191 }).customerCode).toBe(
      '80191',
    );
  });

  it('rechaza lo que no es un perfil', () => {
    expect(() => parsePerfilDeCliente(42)).toThrow();
    expect(() => parsePerfilDeCliente(null)).toThrow();
  });
});

describe('nombre del cliente', () => {
  it('compone el nombre completo con los cuatro campos', () => {
    expect(nombreCompleto(perfilBase())).toBe('Ana María Pérez De la Cruz');
  });

  it('no deja espacios dobles cuando faltan nombres', () => {
    const perfil = parsePerfilDeCliente({
      FirstName: 'Ana',
      LastName: 'Pérez',
    });
    expect(nombreCompleto(perfil)).toBe('Ana Pérez');
  });

  it('el saludo usa solo el primer nombre', () => {
    expect(nombreDeSaludo(perfilBase())).toBe('Ana');
  });

  it('sin primer nombre el saludo usa el apellido', () => {
    const perfil = parsePerfilDeCliente({ LastName: 'Pérez' });
    expect(nombreDeSaludo(perfil)).toBe('Pérez');
  });

  it('sin ningún nombre el saludo dice «cliente», no queda vacío', () => {
    // «Hola,» a secas se ve peor que un saludo genérico.
    expect(nombreDeSaludo(parsePerfilDeCliente({}))).toBe('cliente');
  });
});

describe('iniciales', () => {
  it('toma la primera letra del nombre y del apellido', () => {
    expect(iniciales(perfilBase())).toBe('AP');
  });

  it('con un solo nombre devuelve una letra', () => {
    expect(iniciales(parsePerfilDeCliente({ FirstName: 'Ana' }))).toBe('A');
  });

  it('sin datos cae a las del banco, nunca queda vacío', () => {
    expect(iniciales(parsePerfilDeCliente({}))).toBe('BS');
  });
});

describe('estado del cliente', () => {
  it('el core marca activo con «A»', () => {
    expect(estaActivo(perfilBase())).toBe(true);
  });

  it('tolera minúsculas y espacios', () => {
    expect(estaActivo(parsePerfilDeCliente({ PartyStatus: ' a ' }))).toBe(true);
  });

  it('cualquier otro estado no es activo', () => {
    expect(estaActivo(parsePerfilDeCliente({ PartyStatus: 'I' }))).toBe(false);
    expect(estaActivo(parsePerfilDeCliente({}))).toBe(false);
  });
});

describe('oficial de cuenta', () => {
  it('lee el oficial con los nombres que manda el backend', () => {
    // Regresión: el porte leía `OfficerName`, que el backend no envía nunca, y
    // el bloque del oficial no se habría dibujado jamás en ninguna pantalla.
    const perfil = perfilBase();

    expect(perfil.oficialNombre).toBe('Luis Gómez');
    expect(perfil.oficialEmail).toBe('luis.gomez@example.com');
    expect(perfil.oficialTelefono).toBe('8095550000');
  });

  it('acepta el teléfono de oficina como alias del teléfono del oficial', () => {
    const perfil = parsePerfilDeCliente({
      OfficialAccountName: 'Luis Gómez',
      OfficialAccountOfficePhone: '8095551111',
    });

    expect(perfil.oficialTelefono).toBe('8095551111');
  });

  it('conserva los nombres cortos por si algún ambiente los usa', () => {
    const perfil = parsePerfilDeCliente({ OfficerName: 'Luis Gómez' });
    expect(perfil.oficialNombre).toBe('Luis Gómez');
  });

  it('sin nombre de oficial, el cliente no tiene oficial', () => {
    expect(tieneOficial(perfilBase())).toBe(true);
    expect(tieneOficial(parsePerfilDeCliente({}))).toBe(false);
    expect(
      tieneOficial(parsePerfilDeCliente({ OfficialAccountName: '   ' })),
    ).toBe(false);
  });
});
