import {
  codigoDeDocumento,
  codigoDeTipo,
  cuentaEnmascarada,
  esTarjetaDeCredito,
  nombreVisible,
  parseBancos,
  parseBeneficiarioPendiente,
  parseBeneficiarios,
  parseConfirmacion,
  parseDocumentos,
  parseTiposDeCuenta,
  parseValidacionDeCuenta,
  simboloDeMoneda,
  TipoDeBeneficiario,
  TipoDeDocumento,
  normalizarDocumento,
  validarDocumento,
  type Beneficiario,
} from '../beneficiaryContracts';

/**
 * Respuesta real de `GET /beneficiaries`.
 *
 * El backend registra `JsonStringEnumConverter`, así que los enumerados viajan
 * **como palabras**. Los datos son sintéticos.
 */
const LISTA = {
  Success: true,
  Message: 'Beneficiarios obtenidos exitosamente',
  Errors: [],
  Data: [
    {
      Id: 'b-001',
      Type: 'InternalBank',
      Alias: 'Mamá',
      BeneficiaryName: 'ROSA MARIA GUZMAN',
      AccountNumber: '11042010077431',
      AccountType: 'Savings',
      CurrencyCode: '214',
      IdentificationType: 'NationalId',
      IdentificationNumber: '00100000001',
      Status: 'Active',
    },
    {
      Id: 'b-002',
      Type: 'LocalInterbank',
      Alias: '',
      BeneficiaryName: 'STARLIN PRUEBA',
      AccountNumber: '4023600012345678',
      AccountType: 'CreditCard',
      CurrencyCode: '840',
      BankName: 'Banco Múltiple BHD',
      IdentificationType: 'Passport',
      IdentificationNumber: 'P1234567',
      Status: 'Active',
    },
  ],
};

describe('parseBeneficiarios', () => {
  it('lee la lista del sobre ApiResponse', () => {
    const lista = parseBeneficiarios(LISTA);

    expect(lista).toHaveLength(2);
    expect(lista[0]?.id).toBe('b-001');
    expect(lista[0]?.tipo).toBe(TipoDeBeneficiario.BancoInterno);
    expect(lista[1]?.tipo).toBe(TipoDeBeneficiario.InterbancarioLocal);
    expect(lista[1]?.banco).toBe('Banco Múltiple BHD');
  });

  it('acepta la respuesta como cadena JSON', () => {
    expect(parseBeneficiarios(JSON.stringify(LISTA))).toHaveLength(2);
  });

  it('un beneficiario sin identificador se descarta', () => {
    // Sin `Id` no se puede ni confirmar ni transferir: la fila solo confundiría.
    const lista = parseBeneficiarios({
      Success: true,
      Data: [{ BeneficiaryName: 'SIN ID', AccountNumber: '123' }],
    });

    expect(lista).toHaveLength(0);
  });

  it('sin moneda asume pesos, que es lo que hace el original', () => {
    const lista = parseBeneficiarios({
      Success: true,
      Data: [{ Id: 'x', BeneficiaryName: 'N', AccountNumber: '1' }],
    });

    expect(lista[0]?.codigoMoneda).toBe('214');
  });

  it('una respuesta que no es una lista no revienta', () => {
    expect(parseBeneficiarios({ Success: false, Data: null })).toEqual([]);
    expect(parseBeneficiarios(null)).toEqual([]);
    expect(parseBeneficiarios('no es json')).toEqual([]);
  });
});

describe('tipo de beneficiario', () => {
  it('traduce la palabra que manda el backend', () => {
    expect(codigoDeTipo('InternalBank')).toBe(1);
    expect(codigoDeTipo('LocalInterbank')).toBe(2);
    expect(codigoDeTipo('International')).toBe(3);
  });

  it('acepta también el número del contrato viejo', () => {
    expect(codigoDeTipo(2)).toBe(2);
    expect(codigoDeTipo('2')).toBe(2);
  });

  it('lo desconocido cae a cuenta del banco, no desaparece', () => {
    expect(codigoDeTipo('AlgoNuevo')).toBe(TipoDeBeneficiario.BancoInterno);
  });
});

describe('tipo de documento', () => {
  it('RNC es 2 y pasaporte es 3, como dice el enumerado del backend', () => {
    // Regresión del defecto de la app Flutter, que los tiene cambiados: su
    // `_documentCode` mapea PASSPORT→2 y RNC→3, así que un beneficiario dado
    // de alta con pasaporte quedaba guardado como RNC.
    expect(codigoDeDocumento('RNC')).toBe(TipoDeDocumento.RNC);
    expect(codigoDeDocumento('Passport')).toBe(TipoDeDocumento.Pasaporte);
    expect(codigoDeDocumento('RNC')).toBe(2);
    expect(codigoDeDocumento('Passport')).toBe(3);
  });

  it('cédula es 1, con el nombre del backend y con el de siempre', () => {
    expect(codigoDeDocumento('NationalId')).toBe(1);
    expect(codigoDeDocumento('Cedula')).toBe(1);
  });

  it('sin documento devuelve indefinido, no cero', () => {
    // Cero sería un tipo de documento que no existe.
    expect(codigoDeDocumento(null)).toBeUndefined();
    expect(codigoDeDocumento('')).toBeUndefined();
    expect(codigoDeDocumento('QUIENSABE')).toBeUndefined();
  });
});

describe('presentación del beneficiario', () => {
  const base: Beneficiario = {
    id: 'b',
    tipo: 1,
    alias: '',
    nombre: 'ROSA MARIA GUZMAN',
    numeroDeCuenta: '11042010077431',
    tipoDeCuenta: 'Savings',
    codigoMoneda: '214',
    banco: undefined,
    documentoTipo: 1,
    documentoNumero: '001',
  };

  it('enmascara la cuenta con los últimos cuatro', () => {
    expect(cuentaEnmascarada(base)).toBe('****7431');
  });

  it('una cuenta muy corta se muestra entera, sin inventar asteriscos', () => {
    expect(cuentaEnmascarada({ ...base, numeroDeCuenta: '431' })).toBe('431');
  });

  it('el alias manda sobre el nombre', () => {
    expect(nombreVisible(base)).toBe('ROSA MARIA GUZMAN');
    expect(nombreVisible({ ...base, alias: 'Mamá' })).toBe('Mamá');
  });

  it('el símbolo distingue pesos de dólares, por código y por letras', () => {
    expect(simboloDeMoneda(base)).toBe('RD$');
    expect(simboloDeMoneda({ ...base, codigoMoneda: '840' })).toBe('US$');
    expect(simboloDeMoneda({ ...base, codigoMoneda: 'USD' })).toBe('US$');
  });
});

describe('catálogos', () => {
  it('lee los bancos y descarta los que no traen nombre', () => {
    const bancos = parseBancos({
      Success: true,
      Data: [
        { Id: '1', Code: 'BHD', Name: 'Banco BHD', SwiftCode: 'BRRDDOSD' },
        { Id: '2', Code: 'XXX', Name: '' },
      ],
    });

    expect(bancos).toHaveLength(1);
    expect(bancos[0]?.swift).toBe('BRRDDOSD');
  });

  it('lee los tipos de cuenta y reconoce la tarjeta de crédito', () => {
    const tipos = parseTiposDeCuenta({
      Success: true,
      Data: [
        { Id: 1, Code: 'SAVINGS', Name: 'Ahorros' },
        { Id: 3, Code: 'CREDITCARD', Name: 'Tarjeta de Crédito' },
      ],
    });

    expect(tipos).toHaveLength(2);
    expect(esTarjetaDeCredito(tipos[0]!)).toBe(false);
    expect(esTarjetaDeCredito(tipos[1]!)).toBe(true);
  });

  it('un catálogo vacío es una lista vacía, no un fallo', () => {
    // En este ambiente el catálogo de documentos no tiene datos sembrados.
    expect(parseDocumentos({ Success: true, Data: [] })).toEqual([]);
    expect(parseDocumentos({ Success: false, Message: 'Error' })).toEqual([]);
  });
});

describe('normalizarDocumento', () => {
  /*
    **Nace de un alta que se quedaba clavada en el Pixel.** Al validar la
    cuenta, el core devuelve el documento del titular **con guiones**
    —`001-0000000-0`—, el porte lo escribía tal cual en el campo y su propia
    validación lo rechazaba después con «No puede exceder 11 caracteres»: la
    aplicación rellenaba un valor que ella misma no aceptaba, y el cliente no
    tenía forma de saber que debía borrar los guiones.

    La app Flutter no prellena este campo —solo el nombre y la moneda—, así que
    nunca se topó con esto. El porte conserva la comodidad del prellenado, que
    es una mejora real, pero normaliza lo que recibe: el catálogo cuenta
    caracteres y el core espera los once dígitos.
  */
  it('quita los separadores con los que el core devuelve la cédula', () => {
    expect(normalizarDocumento('001-0000000-0')).toBe('00100000000');
  });

  it('deja intacto lo que ya viene limpio', () => {
    expect(normalizarDocumento('00112345678')).toBe('00112345678');
  });

  it('conserva las letras de un RNC o un pasaporte', () => {
    expect(normalizarDocumento('AB-123.456 ')).toBe('AB123456');
  });

  it('lo que normaliza pasa la validación que antes lo rechazaba', () => {
    const cedula = {
      id: 1,
      codigo: 'CEDULA',
      nombre: 'Cédula',
      expresion: '^\\d{11}$',
      largoMinimo: 11,
      largoMaximo: 11,
    };

    expect(validarDocumento(cedula, '001-0000000-0')).toBe(
      'No puede exceder 11 caracteres',
    );
    expect(
      validarDocumento(cedula, normalizarDocumento('001-0000000-0')),
    ).toBeUndefined();
  });
});

describe('validarDocumento', () => {
  const cedula = {
    id: 1,
    codigo: 'CEDULA',
    nombre: 'Cédula',
    expresion: '^\\d{11}$',
    largoMinimo: 11,
    largoMaximo: 11,
  };

  it('acepta una cédula bien formada', () => {
    expect(validarDocumento(cedula, '00112345678')).toBeUndefined();
  });

  it('exige el número', () => {
    expect(validarDocumento(cedula, '   ')).toBe(
      'Ingresa el número de documento',
    );
  });

  it('avisa del largo antes de que lo haga el core', () => {
    expect(validarDocumento(cedula, '001')).toBe(
      'Debe tener al menos 11 caracteres',
    );
    expect(validarDocumento(cedula, '001123456789')).toBe(
      'No puede exceder 11 caracteres',
    );
  });

  it('aplica la expresión del catálogo', () => {
    expect(
      validarDocumento(
        { ...cedula, largoMinimo: undefined, largoMaximo: undefined },
        'ABCDEFGHIJK',
      ),
    ).toBe('Cédula inválido');
  });

  it('una expresión mal formada en el catálogo no bloquea al cliente', () => {
    // El catálogo lo escribe el banco; un paréntesis suelto no puede impedir
    // que alguien registre a su madre.
    expect(
      validarDocumento(
        {
          ...cedula,
          expresion: '([',
          largoMinimo: undefined,
          largoMaximo: undefined,
        },
        'lo que sea',
      ),
    ).toBeUndefined();
  });

  it('sin catálogo solo se exige que haya algo escrito', () => {
    expect(validarDocumento(null, '')).toBe('Ingresa el número de documento');
    expect(validarDocumento(null, '001')).toBeUndefined();
  });
});

describe('parseValidacionDeCuenta', () => {
  /**
   * La respuesta **real** de `POST /beneficiaries/validate-account`:
   * `Result<AccountValidationDto>`, no `ApiResponse<T>`.
   */
  const RESPUESTA = {
    Value: {
      Client: [
        {
          IdentificationType: 'NationalId',
          IdentificationNumber: '00100000001',
          CustomerFullName: 'ROSA MARIA GUZMAN',
          CustomerShortName: 'R. GUZMAN',
          FirstName: 'ROSA',
          LastName: 'GUZMAN',
          Email: 'rosa@example.com',
          Relationship: 'TITULAR',
        },
      ],
      Products: [
        {
          Number: '11042010077431',
          Type: 'CA',
          Status: 'A',
          Currency: '214',
          CurrencyDescription: 'PESOS',
          HasTwoBalances: 'N',
        },
      ],
    },
    IsSuccess: true,
  };

  it('da la cuenta por válida y devuelve el titular', () => {
    // Regresión del defecto que bloqueaba el alta en la app Flutter: su
    // repositorio lee esta respuesta como `ApiResponse<T>` buscando `IsValid`
    // y `AccountHolderName`, que no existen, así que la cuenta salía siempre
    // inválida y la hoja no pasaba del paso del número.
    const validacion = parseValidacionDeCuenta(RESPUESTA);

    expect(validacion.valida).toBe(true);
    expect(validacion.titular).toBe('ROSA MARIA GUZMAN');
    expect(validacion.documentoTipo).toBe(TipoDeDocumento.Cedula);
    expect(validacion.documentoNumero).toBe('00100000001');
    expect(validacion.codigoMoneda).toBe('214');
    expect(validacion.numeroDeProducto).toBe('11042010077431');
  });

  it('una cuenta que el core no conoce no es válida', () => {
    expect(
      parseValidacionDeCuenta({ Value: { Client: [], Products: [] } }).valida,
    ).toBe(false);
    expect(parseValidacionDeCuenta({}).valida).toBe(false);
    expect(parseValidacionDeCuenta(null).valida).toBe(false);
  });

  it('con producto pero sin titular la cuenta sigue siendo válida', () => {
    // El nombre es una comodidad; lo que decide es que la cuenta exista.
    const validacion = parseValidacionDeCuenta({
      Value: { Products: [{ Number: '1104', Type: 'CA', Currency: '840' }] },
    });

    expect(validacion.valida).toBe(true);
    expect(validacion.titular).toBeUndefined();
    expect(validacion.codigoMoneda).toBe('840');
  });

  it('compone el nombre si el core solo manda nombre y apellido', () => {
    const validacion = parseValidacionDeCuenta({
      Value: { Client: [{ FirstName: 'ROSA', LastName: 'GUZMAN' }] },
    });

    expect(validacion.titular).toBe('ROSA GUZMAN');
  });
});

describe('alta y confirmación', () => {
  it('lee el identificador del beneficiario pendiente', () => {
    const pendiente = parseBeneficiarioPendiente({
      Success: true,
      Message: 'Beneficiario creado. Pendiente de verificación con token 2FA.',
      Data: {
        Success: true,
        BeneficiaryId: 'b-777',
        Status: 'PendingVerification',
        Message:
          'Beneficiario creado. Pendiente de verificación con token 2FA.',
      },
    });

    expect(pendiente.id).toBe('b-777');
    expect(pendiente.mensaje).toContain('Pendiente de verificación');
  });

  it('sin identificador el alta no sirve, y el mensaje explica por qué', () => {
    const pendiente = parseBeneficiarioPendiente({
      Success: false,
      Message: 'Ya tienes un beneficiario con esa cuenta.',
    });

    expect(pendiente.id).toBe('');
    expect(pendiente.mensaje).toBe('Ya tienes un beneficiario con esa cuenta.');
  });

  it('la confirmación exige que el sobre y el contenido estén de acuerdo', () => {
    // Dar por confirmado un beneficiario que no lo está lo dejaría invisible
    // en la lista, que solo pide los activos, y sin explicación.
    expect(
      parseConfirmacion({ Success: true, Data: { Success: true } }).exito,
    ).toBe(true);
    expect(
      parseConfirmacion({ Success: true, Data: { Success: false } }).exito,
    ).toBe(false);
    expect(parseConfirmacion({ Success: false }).exito).toBe(false);
  });

  it('el mensaje del backend llega tal cual al cliente', () => {
    // Lleva los intentos que quedan; uno genérico se los ocultaría.
    expect(
      parseConfirmacion({
        Success: false,
        Message: 'Código incorrecto. Te quedan 2 intentos.',
      }).mensaje,
    ).toBe('Código incorrecto. Te quedan 2 intentos.');
  });
});
