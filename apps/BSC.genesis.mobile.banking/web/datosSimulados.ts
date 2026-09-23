import type { AxiosInstance } from 'axios';

import { BeneficiaryRepository } from '../src/features/beneficiaries/data/beneficiaryRepository';
import { CustomerRepository } from '../src/features/customer/data/customerRepository';
import { PaymentRepository } from '../src/features/payments/data/paymentRepository';
import { TransferRepository } from '../src/features/transfers/data/transferRepository';
import { TwoFactorRepository } from '../src/features/twoFactor/data/twoFactorRepository';
import { ProductDetailRepository } from '../src/features/productDetail/data/productDetailRepository';

/**
 * Respuestas simuladas del core para la vista previa.
 *
 * **Todos los datos son sintéticos.** No hay aquí ningún número de cuenta,
 * nombre, monto ni referencia de un cliente real, y este archivo no debe
 * llenarse copiando una respuesta del ambiente de prueba: el core devuelve el
 * nombre del titular y movimientos que son datos de una persona.
 *
 * Las respuestas imitan **la forma cruda del core**, con sus nombres de campo
 * en español y mayúsculas y su envoltorio `Value`, en vez de devolver objetos
 * ya digeridos. Así la vista previa ejercita también `transactionContracts`,
 * que es donde han aparecido casi todos los defectos de esta feature.
 */

interface Opciones {
  /** Responder como un período sin movimientos. */
  vacia?: boolean;
  /** Añadir un retardo para poder ver el estado de carga. */
  lenta?: boolean;
  /** Devolver la cuenta con sobregiro y línea de tránsito. */
  conSobregiro?: boolean;
  /** Qué detalle de producto devolver. */
  producto?: 'cuenta' | 'prestamo' | 'certificado' | 'tarjeta';
  /**
   * Tarjeta cobrada de contado: el core manda el pago mínimo en cero y lo que
   * hay que pagar es el total del ciclo. Sirve para ver que el aviso cambia de
   * «Pago mínimo» a «Pago de contado» en vez de anunciar RD$ 0.00.
   */
  tarjetaDeContado?: boolean;
}

const MOVIMIENTOS_DE_CUENTA = [
  {
    TransactionDate: '2026-05-27',
    Description: 'TRANSFERENCIA RECIBIDA',
    TransactionTypeName: 'Transferencia',
    Amount: 12_500,
    Operation: 'C',
    Balance: 128_450.12,
    Reference: '000000451201',
  },
  {
    TransactionDate: '2026-05-27',
    Description: 'COMPRA POS - SUPERMERCADO NACIONAL',
    TransactionTypeName: 'Compra',
    Amount: 3_284.75,
    Operation: 'D',
    Balance: 115_950.12,
    Reference: '000000451198',
  },
  {
    TransactionDate: '2026-05-26',
    Description: 'PAGO DE SERVICIOS - EDESUR',
    TransactionTypeName: 'Pago de servicios',
    Amount: 2_140.0,
    Operation: 'D',
    Balance: 119_234.87,
    Reference: '000000450977',
  },
  {
    TransactionDate: '2026-05-24',
    Description: 'DEPOSITO EN EFECTIVO',
    TransactionTypeName: 'Depósito',
    Amount: 45_000,
    Operation: 'C',
    Balance: 121_374.87,
    Reference: '000000450612',
  },
  {
    TransactionDate: '2026-05-21',
    Description: 'RETIRO ATM SUCURSAL NACO',
    TransactionTypeName: 'Retiro',
    Amount: 8_000,
    Operation: 'D',
    Balance: 76_374.87,
    Reference: '000000450108',
  },
  {
    TransactionDate: '2026-04-30',
    Description: 'PRESTAMO A 120 D¿AS - CUOTA',
    TransactionTypeName: 'Pago de préstamo',
    Amount: 15_320.44,
    Operation: 'D',
    Balance: 84_374.87,
    Reference: '000000448001',
  },
];

const MOVIMIENTOS_DE_TARJETA = [
  {
    TransactionDate: '2026-05-26',
    Description: 'COMPRA INTERNACIONAL',
    MerchantName: 'AEROLINEA EJEMPLO',
    TransactionTypeName: 'Viajes',
    Amount: 24_150.9,
    isDebit: 'S',
    Reference: 'TC00099812',
    ApprovalNumber: '004512',
  },
  {
    TransactionDate: '2026-05-24',
    Description: 'COMPRA POS',
    MerchantName: 'SUPERMERCADO EJEMPLO',
    TransactionTypeName: 'Supermercados',
    Amount: 6_420.75,
    isDebit: 'S',
    Reference: 'TC00099770',
  },
  {
    TransactionDate: '2026-05-20',
    Description: 'AVANCE DE EFECTIVO',
    TransactionTypeName: 'Avances',
    Amount: 5_000,
    isDebit: 'S',
    Reference: 'TC00099702',
  },
  {
    TransactionDate: '2026-05-22',
    Description: 'PAGO RECIBIDO - GRACIAS',
    Amount: 30_000,
    isDebit: 'N',
    Reference: 'TC00099640',
  },
  {
    TransactionDate: '2026-05-18',
    Description: 'COMPRA POS',
    MerchantName: 'FARMACIA EJEMPLO',
    TransactionTypeName: 'Salud',
    Amount: 1_875.25,
    isDebit: 'S',
    Reference: 'TC00099411',
  },
];

const MOVIMIENTOS_DE_PRESTAMO = [
  {
    TransactionDate: '2026-05-05',
    Description: 'CUOTA MENSUAL',
    TransactionTypeName: 'Cuota',
    Amount: 18_450.0,
    Operation: 'D',
    Reference: 'PR00012204',
  },
  {
    TransactionDate: '2026-04-05',
    Description: 'CUOTA MENSUAL',
    TransactionTypeName: 'Cuota',
    Amount: 18_450.0,
    Operation: 'D',
    Reference: 'PR00012101',
  },
];

/** Préstamo a mitad de vida, con cuotas ya pagadas. */
const DETALLE_DE_PRESTAMO = {
  NO_PRESTAMO: '0000293276',
  TITULAR: 'Titular De Prueba',
  DESC_TIPO_CREDITO: 'Préstamo de Consumo',
  SALDO_ACTUAL: 312_450.18,
  MONTO_DESEMBOLSADO: 450_000,
  MONTO_PAGADO: 137_549.82,
  TASA: 15.5,
  TAE: 16.8,
  PLAZO: 60,
  PROX_NUM_CUOTA: 19,
  FEC_PROX_CUOTA: '2026-06-05',
  ULT_PAGO_PRINCIPAL: 12_180.44,
  ULT_PAG_INTERESES: 6_269.56,
  FEC_DIA_PAGO_CUO_ANT: '2026-05-05',
  SALDO_CANCELACION: 318_220.5,
  INTERESES_PENDIENTES: 5_770.32,
  FEC_DESEMBOLSO: '2024-11-05',
  FEC_VENCIMIENTO: '2029-11-05',
  ESTADO: 'A',
};

/** Certificado vigente, a mitad de plazo, con el plazo ya redactado. */
const DETALLE_DE_CERTIFICADO = {
  NUMERO_CPD: '900123',
  NOMBRE_CPD: 'Certificado Financiero',
  BALANCE_ACTUAL: 512_400,
  MONTO_INICIAL: 500_000,
  TASA: 9.75,
  TAE: 10.1,
  // El core lo manda redactado, y a veces con los acentos estropeados.
  PLAZO: '360 d¿as',
  INTERESES_GANADOS: 12_400,
  INTERESES_PAGADOS: 8_000,
  FEC_INICIO: '2025-12-01',
  FEC_VENCIMIENTO: '2026-11-26',
  FEC_ULT_RENOV: '2025-12-01',
  FORMA_PAGO: 'MENSUAL',
  NUM_CUENTA: '11042010013953',
  ESTADO: 'A',
};

function paraRuta(ruta: string): unknown[] {
  if (ruta.includes('credit-card')) return MOVIMIENTOS_DE_TARJETA;
  if (ruta.includes('loan-management')) return MOVIMIENTOS_DE_PRESTAMO;
  return MOVIMIENTOS_DE_CUENTA;
}

/**
 * Detalle de una tarjeta, con **los dos juegos de importes** que manda el core.
 *
 * Es lo que hace distinta a esta pantalla: la misma tarjeta lleva un ciclo en
 * pesos y otro en dólares, con su propio límite, su propio pago mínimo y su
 * propia fecha. El selector de la cabecera elige cuál se está mirando.
 *
 * El uso del límite en pesos queda sobre el 75 % a propósito, para ver el
 * anillo en naranja; el de dólares se queda holgado y se ve en verde.
 */
const DETALLE_DE_TARJETA = {
  NUM_TARJETA: '4539********0668',
  NOMBRE_PRODUCTO: 'Visa Platinum',
  ESTADO: 'A',

  SALDO_ACTUAL_RD: 118_775.3,
  LIMITE_CREDITO_RD: 150_000,
  DISP_COMPRAS_RD: 31_224.7,
  DISP_RETIROS_RD: 15_000,
  PAGO_MINIMO_RD: 5_938.77,
  PAGO_TOTAL_RD: 118_775.3,
  PAGO_VENCIDO_RD: 0,
  SALDO_CORTE_RD: 96_420.15,
  PAGO_MAXIMO_RD: 118_775.3,
  DEB_DESP_CORTE_RD: 24_150.9,
  CRE_DESP_CORTE_RD: 30_000,
  TRA_TRANSITO_RD: 1_875.25,

  SALDO_ACTUAL_US: 640.5,
  LIMITE_CREDITO_US: 3_000,
  DISP_COMPRAS_US: 2_359.5,
  DISP_RETIROS_US: 500,
  PAGO_MINIMO_US: 32.03,
  PAGO_TOTAL_US: 640.5,
  PAGO_VENCIDO_US: 0,
  SALDO_CORTE_US: 512.4,
  PAGO_MAXIMO_US: 640.5,
  DEB_DESP_CORTE_US: 128.1,
  CRE_DESP_CORTE_US: 0,
  TRA_TRANSITO_US: 0,

  PTOS_BALANCE_ACT: 12_480,
  PTOS_BALANCE_ANT: 11_998,
  PTOS_GAN_MES_ACT: 1_682,
  PTOS_USA_MES_ACT: 1_200,
  PTOS_EXP_MES_ACT: 0,

  FECHA_CORTE: '2026-05-25',
  FECHA_PAGO: '2026-06-14',
  FINANCINGINTERESTRATE_RD: 2.95,
  TAE_RD: 41.7,
};

/** La misma tarjeta, cobrada de contado: el mínimo llega en cero. */
const TARJETA_DE_CONTADO = {
  ...DETALLE_DE_TARJETA,
  NOMBRE_PRODUCTO: 'Visa Signature',
  PAGO_MINIMO_RD: 0,
  PAGO_MINIMO_US: 0,
};

/**
 * Un PDF de una página, en base64. Es el archivo válido más corto que existe,
 * y basta para recorrer el camino de la descarga sin inventar un documento.
 */
const PDF_DE_EJEMPLO =
  'JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBv' +
  'Ymo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlw' +
  'ZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0+PmVuZG9iagp0cmFpbGVy' +
  'PDwvUm9vdCAxIDAgUj4+';

/** Un ciclo cerrado, como lo devuelve `credit-card-management/statement`. */
const ESTADO_DE_TARJETA = {
  Number: '4539********0668',
  ProductName: 'Visa Platinum',
  Currency: 'DOP',
  CycleDate: '2026-04-25',
  DueDate: '2026-05-14',
  Start: '2026-03-26',
  End: '2026-04-25',
  CurrentBalance: 96_420.15,
  AvailableBalance: 53_579.85,
  CreditLimit: 150_000,
  PreviousBalance: 82_310.4,
  NewBalance: 96_420.15,
  DuePayment: 96_420.15,
  MinimumPayment: 4_821.01,
  OverduePayment: 0,
  QtyDelinquentPayments: 0,
  OverLimit: 0,
  LastPaymentAmount: 30_000,
  QtyPurchases: 18,
  PurchasesAmount: 44_109.75,
  QtyCashAdvance: 1,
  CashAdvanceAmount: 5_000,
  MonthDailyAverageBalance: 88_240.6,
  InterestRateFinanceCharge: 2.95,
  FinanceBalance: 66_310.2,
  AccumulatedPointMonth: 1_682,
  ExpiredPointMonth: 0,
  RedeemedPointMonth: 1_200,
  EliminatedPointMonth: 0,
  TaxReceiptNumber: 'B0100000000',
  Movements: MOVIMIENTOS_DE_TARJETA,
};

/**
 * Detalle de una cuenta, con los nombres en español y mayúsculas del core.
 *
 * Sin sobregiro ni línea de tránsito, que es el caso de casi todas las cuentas
 * de ahorros: así se ve que la tarjeta de «Sobregiro y tránsito» **desaparece**
 * en vez de imprimir seis ceros. La variante con sobregiro está más abajo.
 */
const DETALLE_DE_CUENTA = {
  TITULARES: 'Titular De Prueba',
  SAL_DISPONIBLE: 128_450.12,
  SAL_TOTAL: 130_000.0,
  SAL_CONGELADO: 1_549.88,
  SAL_EMBARGADO: 0,
  SAL_TRANSITO: 0,
  ESTADO: 'A',
  SUCURSAL: 'Sucursal Ejemplo',
  FEC_APERTURA: '2021-03-15 00:00:00',
  FEC_ULT_MOVIMTO: '2026-05-27',
  TAE: 1.25,
  NUM_CUENTA_NACIONAL: '11042010013953',
  COD_MONEDA: '1',
};

/** Cuenta corriente con sobregiro y línea de tránsito, para ver esa tarjeta. */
const DETALLE_CON_SOBREGIRO = {
  ...DETALLE_DE_CUENTA,
  TITULARES: 'Titular De Prueba',
  SAL_DISPONIBLE: 84_320.55,
  SAL_TOTAL: 84_320.55,
  SAL_CONGELADO: 0,
  SAL_EMBARGADO: 12_000,
  SAL_TRANSITO: 7_500,
  LIMITE_SOBREGIRO: 250_000,
  MON_SOBGRO_DISP: 180_000,
  INT_USO_SOB_NO_PAC: 318.42,
  LIM_LIN_TRANSITO: 100_000,
  LIN_TRANSITO_DISP: 92_500,
  SOBREG_TOTAL_TRANSITO: 272_500,
};

/**
 * Error tal como lo devuelve el backend cuando el período no tiene nada.
 *
 * Es un 400 con «No se encontraron registros», y el repositorio lo traduce a
 * lista vacía en vez de a pantalla de error. Reproducirlo aquí permite ver ese
 * camino sin esperar a encontrar una cuenta quieta.
 */
function errorSinRegistros(): unknown {
  return {
    isAxiosError: true,
    response: {
      status: 400,
      data: { Detail: 'No se encontraron registros para la cuenta' },
    },
  };
}

export function repositorioSimulado({
  vacia = false,
  lenta = false,
  conSobregiro = false,
  producto = 'cuenta',
  tarjetaDeContado = false,
}: Opciones = {}): ProductDetailRepository {
  const detalle =
    producto === 'prestamo'
      ? DETALLE_DE_PRESTAMO
      : producto === 'certificado'
        ? DETALLE_DE_CERTIFICADO
        : producto === 'tarjeta'
          ? tarjetaDeContado
            ? TARJETA_DE_CONTADO
            : DETALLE_DE_TARJETA
          : conSobregiro
            ? DETALLE_CON_SOBREGIRO
            : DETALLE_DE_CUENTA;

  const get = async (ruta: string): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 1_200));

    // El detalle del producto no depende del período, así que ni se retrasa ni
    // se vacía: lo que se simula ahí es un período sin movimientos.
    if (ruta.includes('products/details')) {
      return { data: { Value: [detalle] } };
    }

    // El PDF va antes que el estado, porque su ruta contiene a la otra.
    if (ruta.includes('statement/pdf')) {
      // Un PDF mínimo pero válido. En el navegador no hay módulo nativo que lo
      // guarde, así que la hoja avisa de que la descarga es cosa del teléfono;
      // esto solo existe para que el camino de datos se recorra entero.
      return { data: { Value: PDF_DE_EJEMPLO } };
    }

    if (ruta.includes('credit-card-management/statement')) {
      return { data: { Value: ESTADO_DE_TARJETA } };
    }

    if (vacia) throw errorSinRegistros();
    return { data: { Value: paraRuta(ruta) } };
  };

  return new ProductDetailRepository({
    get,
    post: get,
  } as unknown as AxiosInstance);
}


/**
 * Perfil del titular, en la forma cruda del core.
 *
 * Los nombres de campo son los que declara `BusCompatibleCustomerProfile` en el
 * backend —`OfficialAccountName` y compañía—, no los cortos: leerlos mal es
 * justo el defecto que traía el porte, y la vista previa tiene que poder
 * enseñarlo.
 *
 * Datos sintéticos: ni el nombre, ni el correo, ni el teléfono, ni el código
 * corresponden a nadie.
 */
const PERFIL_DE_CLIENTE = {
  ResultCode: 0,
  ResultMessage: 'Success',
  CustomerProfileReference: {
    CustomerCode: '99001',
    FirstName: 'Mariela',
    SecondName: 'Andrea',
    LastName: 'Reyes',
    SecondLastName: 'Peralta',
    Email: 'mariela.reyes@example.com',
    Phone: '(809) 555-0143',
    MobilePhone: '(829) 555-0188',
    PartyStatus: 'A',
    OfficialAccountName: 'Joel Encarnación',
    OfficialAccountEmail: 'joel.encarnacion@example.com',
    OfficialAccountPhone: '(809) 555-0100',
    BranchName: 'Sucursal Piantini',
  },
};

export interface OpcionesDePerfil {
  /** Un cliente sin oficial asignado: el bloque no debe aparecer. */
  sinOficial?: boolean;
  /** El core no devuelve el perfil: la pantalla del oficial ofrece reintentar. */
  falla?: boolean;
  lenta?: boolean;
}

export function clienteSimulado({
  sinOficial = false,
  falla = false,
  lenta = false,
}: OpcionesDePerfil = {}): CustomerRepository {
  const post = async (): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 1_200));
    if (falla) throw new Error('perfil no disponible');

    if (!sinOficial) return { data: PERFIL_DE_CLIENTE };

    const resto: Record<string, unknown> = {
      ...PERFIL_DE_CLIENTE.CustomerProfileReference,
    };
    delete resto.OfficialAccountName;
    delete resto.OfficialAccountEmail;
    delete resto.OfficialAccountPhone;

    return { data: { ...PERFIL_DE_CLIENTE, CustomerProfileReference: resto } };
  };

  return new CustomerRepository({ post } as unknown as AxiosInstance);
}


// ─── Beneficiarios ──────────────────────────────────────────────────────────

/**
 * Respuestas de `/beneficiaries/*`, con la forma real del backend.
 *
 * Los enumerados viajan como palabras porque `Program.cs` registra
 * `JsonStringEnumConverter`, y **la validación de cuenta viene en `Result<T>`**
 * —con `Value`, no con `Data`—, que es el sobre que la app Flutter lee mal.
 * Todo es sintético: ni un nombre, ni una cuenta, ni un documento son de nadie.
 */
const BENEFICIARIOS = {
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
      Type: 'InternalBank',
      Alias: '',
      BeneficiaryName: 'JOSE ANTONIO PEÑA',
      AccountNumber: '11042010088220',
      AccountType: 'Checking',
      CurrencyCode: '840',
      IdentificationType: 'NationalId',
      IdentificationNumber: '00100000002',
      Status: 'Active',
    },
    {
      Id: 'b-003',
      Type: 'LocalInterbank',
      Alias: 'Tarjeta de Starlin',
      BeneficiaryName: 'STARLIN DE PRUEBA',
      AccountNumber: '4023600012345678',
      AccountType: 'CreditCard',
      CurrencyCode: '214',
      BankName: 'Banco Múltiple BHD',
      IdentificationType: 'Passport',
      IdentificationNumber: 'P1234567',
      Status: 'Active',
    },
  ],
};

const BANCOS = {
  Success: true,
  Data: [
    {
      Id: '1',
      Code: '021',
      Name: 'Banco Popular Dominicano',
      SwiftCode: 'BPDODOSD',
      CountryCode: 'DO',
    },
    {
      Id: '2',
      Code: '036',
      Name: 'Banco Múltiple BHD',
      SwiftCode: 'BRRDDOSD',
      CountryCode: 'DO',
    },
    {
      Id: '3',
      Code: '058',
      Name: 'Banreservas',
      SwiftCode: 'BRRSDOSD',
      CountryCode: 'DO',
    },
  ],
};

const TIPOS_DE_CUENTA = {
  Success: true,
  Data: [
    { Id: 1, Code: 'SAVINGS', Name: 'Ahorros', IsActive: true },
    { Id: 2, Code: 'CHECKING', Name: 'Corriente', IsActive: true },
    { Id: 3, Code: 'CREDITCARD', Name: 'Tarjeta de Crédito', IsActive: true },
    { Id: 4, Code: 'LOAN', Name: 'Préstamo', IsActive: true },
  ],
};

/**
 * Tipos de documento.
 *
 * ⚠️ En el ambiente de prueba **este catálogo está vacío**: sale de una tabla
 * que nadie sembró, así que el selector no aparece y el alta manda siempre
 * cédula. Aquí se simula con datos para poder ver el formulario completo; la
 * variante vacía reproduce lo que el cliente ve hoy.
 */
const DOCUMENTOS = {
  Success: true,
  Data: [
    {
      Id: 1,
      Code: 'CEDULA',
      Name: 'Cédula',
      ValidationRegex: '^\\d{11}$',
      MinLength: 11,
      MaxLength: 11,
      IsActive: true,
    },
    {
      Id: 2,
      Code: 'RNC',
      Name: 'RNC',
      ValidationRegex: '^\\d{9}$',
      MinLength: 9,
      MaxLength: 9,
      IsActive: true,
    },
    {
      Id: 3,
      Code: 'PASSPORT',
      Name: 'Pasaporte',
      MinLength: 6,
      MaxLength: 20,
      IsActive: true,
    },
  ],
};

const VALIDACION_DE_CUENTA = {
  IsSuccess: true,
  Value: {
    Client: [
      {
        IdentificationType: 'NationalId',
        IdentificationNumber: '00100000003',
        CustomerFullName: 'CARMEN ALTAGRACIA SOSA',
        CustomerShortName: 'C. SOSA',
        FirstName: 'CARMEN',
        LastName: 'SOSA',
        Email: 'carmen.sosa@example.com',
        Relationship: 'TITULAR',
      },
    ],
    Products: [
      {
        Number: '11042010013953',
        Type: 'CA',
        Status: 'A',
        Currency: '214',
        CurrencyDescription: 'PESOS DOMINICANOS',
        HasTwoBalances: 'N',
      },
    ],
  },
};

export interface OpcionesDeBeneficiarios {
  /** Ningún beneficiario registrado todavía. */
  vacia?: boolean;
  /** La lista no carga: la pantalla ofrece reintentar. */
  falla?: boolean;
  /** El catálogo de documentos sin sembrar, como está el ambiente real. */
  sinCatalogoDeDocumentos?: boolean;
  lenta?: boolean;
}

export function beneficiariosSimulados({
  vacia = false,
  falla = false,
  sinCatalogoDeDocumentos = false,
  lenta = false,
}: OpcionesDeBeneficiarios = {}): BeneficiaryRepository {
  const get = async (ruta: string): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 1_200));

    if (ruta.includes('catalogs/banks')) return { data: BANCOS };
    if (ruta.includes('catalogs/account-types')) return { data: TIPOS_DE_CUENTA };
    if (ruta.includes('catalogs/document-types')) {
      return {
        data: sinCatalogoDeDocumentos ? { Success: true, Data: [] } : DOCUMENTOS,
      };
    }

    if (falla) throw new Error('beneficiarios no disponibles');
    return { data: vacia ? { Success: true, Data: [] } : BENEFICIARIOS };
  };

  const post = async (ruta: string): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 900));

    if (ruta.includes('validate-account')) return { data: VALIDACION_DE_CUENTA };

    if (ruta.includes('add-internal-bank') || ruta.includes('add-local-interbank')) {
      return {
        data: {
          Success: true,
          Message: 'Beneficiario creado. Pendiente de verificación con token 2FA.',
          Data: {
            Success: true,
            BeneficiaryId: 'b-nuevo',
            Status: 'PendingVerification',
            Message: 'Beneficiario creado. Pendiente de verificación con token 2FA.',
          },
        },
      };
    }

    // `confirm`: en la vista previa cualquier código de seis dígitos se acepta.
    return {
      data: {
        Success: true,
        Data: { Success: true, Message: 'Beneficiario confirmado.' },
      },
    };
  };

  return new BeneficiaryRepository({ get, post } as unknown as AxiosInstance);
}

const METODOS_DE_SEGUNDO_FACTOR = {
  Success: true,
  Data: [
    {
      Id: 'm-sms',
      MethodType: 'SMS',
      MethodName: 'Mensaje de texto',
      IsEnabled: true,
      IsPrimary: true,
      MaskedContact: '***-***-0188',
    },
  ],
};

export function segundoFactorSimulado(): TwoFactorRepository {
  const get = async (): Promise<{ data: unknown }> => ({
    data: METODOS_DE_SEGUNDO_FACTOR,
  });

  const post = async (): Promise<{ data: unknown }> => ({
    data: {
      Success: true,
      Data: {
        Success: true,
        Message: 'Código enviado.',
        MethodType: 'SMS',
        MaskedContact: '***-***-0188',
      },
    },
  });

  return new TwoFactorRepository({ get, post } as unknown as AxiosInstance);
}


// ─── Transferencias ─────────────────────────────────────────────────────────

/**
 * Cuentas del cliente para el asistente de transferencias.
 *
 * Sintéticas, y en las dos monedas para poder ver la conversión.
 */
export const CUENTAS_DE_TRANSFERENCIA = [
  {
    productCategory: 'CA',
    productIdentification: '11042010013953',
    currencyCode: 214,
    productStatus: 'A',
    currentBalance: 128_450.12,
    availableBalance: 128_450.12,
  },
  {
    productCategory: 'CC',
    productIdentification: '11042010055512',
    currencyCode: 214,
    productStatus: 'A',
    currentBalance: 84_320.55,
    availableBalance: 84_320.55,
  },
  {
    productCategory: 'CA',
    productIdentification: '11042010099887',
    currencyCode: 840,
    productStatus: 'A',
    currentBalance: 3_120.45,
    availableBalance: 3_120.45,
  },
];

const VALIDACION_DE_DESTINO = {
  IsSuccess: true,
  Value: {
    Client: [
      {
        IdentificationType: 'NationalId',
        IdentificationNumber: '00100000003',
        CustomerFullName: 'CARMEN ALTAGRACIA SOSA',
        CustomerShortName: 'C. SOSA',
        FirstName: 'CARMEN',
        LastName: 'SOSA',
        Email: 'carmen.sosa@example.com',
        Relationship: 'TITULAR',
      },
    ],
    Products: [
      {
        Number: '11042010055512',
        Type: 'CC',
        Status: 'A',
        Currency: '214',
        CurrencyDescription: 'PESOS DOMINICANOS',
        HasTwoBalances: 'N',
      },
    ],
  },
};

export interface OpcionesDeTransferencia {
  /** El core rechaza la transferencia al ejecutarla. */
  rechaza?: boolean;
  /** El core la deja pendiente de aprobación: estado «1». */
  pendiente?: boolean;
  lenta?: boolean;
}

export function transferenciasSimuladas({
  rechaza = false,
  pendiente = false,
  lenta = false,
}: OpcionesDeTransferencia = {}): TransferRepository {
  const get = async (ruta: string): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 900));

    if (ruta.includes('transfer-fees-summary')) {
      return { data: { Value: { commissionAmount: 25, taxAmount: 2.25 } } };
    }

    if (ruta.includes('rate-quote')) {
      return {
        data: { Value: { amountConverted: 59_500, exchangeRate: '59.5000' } },
      };
    }

    // La lista de beneficiarios del tipo pedido.
    return { data: BENEFICIARIOS };
  };

  const post = async (ruta: string): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 900));

    if (ruta.includes('validate-account')) return { data: VALIDACION_DE_DESTINO };

    if (rechaza) {
      return {
        data: {
          isFailure: true,
          error: 'Balance insuficiente en la cuenta de origen.',
        },
      };
    }

    return {
      data: {
        isSuccess: true,
        value: {
          backendTransactionId: 'TX-99120',
          backendStatusId: pendiente ? '1' : '0',
          backendStatusDescription: pendiente ? 'Pendiente' : 'Aplicada',
          backendMessage: pendiente
            ? 'Transferencia recibida, pendiente de aprobación.'
            : 'Transferencia realizada satisfactoriamente.',
          backendTransactionCommission: 25,
          backendTransactionRate: 0,
        },
      },
    };
  };

  return new TransferRepository({ get, post } as unknown as AxiosInstance);
}

/**
 * Un vínculo de dispositivo que **no puede firmar**.
 *
 * Es lo correcto para el navegador: no hay StrongBox ni biometría, así que
 * toda operación cae al código, que es exactamente el camino que un teléfono
 * sin enrolar recorre.
 */
export function vinculoSimulado(): {
  puedeFirmar: () => Promise<boolean>;
  firmarOperacion: () => Promise<{
    authorizationId: string | null;
    failureMessage: string | null;
    shouldFallbackToOtp: boolean;
  }>;
} {
  return {
    puedeFirmar: async () => false,
    firmarOperacion: async () => ({
      authorizationId: null,
      failureMessage: 'Este teléfono no soporta la firma en el dispositivo.',
      shouldFallbackToOtp: true,
    }),
  };
}


// ─── Pagos ──────────────────────────────────────────────────────────────────

/**
 * Tarjetas y préstamos del cliente para el asistente de pagos.
 *
 * La segunda tarjeta se cobra de contado: manda el pago mínimo en cero, y sirve
 * para ver que esa opción no se ofrece en vez de enseñar «RD$ 0.00».
 */
export const PRODUCTOS_A_PAGAR = [
  {
    productCategory: 'TC',
    productIdentification: '4539123456780668',
    maskedCardNumber: '4539********0668',
    currencyCode: 214,
    productStatus: 'A',
    domesticCurrencyBalance: 12_500,
    foreignCurrencyBalance: 300,
    domesticCurrencyAvailable: 37_500,
    foreignCurrencyAvailable: 700,
    minimumPaymentTcRd: 1_250,
    minimumPaymentTcUs: 30,
  },
  {
    productCategory: 'TC',
    productIdentification: '4539123456781234',
    maskedCardNumber: '4539********1234',
    currencyCode: 214,
    productStatus: 'A',
    domesticCurrencyBalance: 9_800,
    domesticCurrencyAvailable: 40_200,
    minimumPaymentTcRd: 0,
  },
  {
    productCategory: 'PR',
    productIdentification: '293276',
    currencyCode: 214,
    productStatus: 'A',
    pendingBalancePr: 450_000,
    minimumPaymentTcRd: 18_450,
  },
];

export interface OpcionesDePago {
  /** El core rechaza el pago. */
  rechaza?: boolean;
  lenta?: boolean;
}

export function pagosSimulados({
  rechaza = false,
  lenta = false,
}: OpcionesDePago = {}): PaymentRepository {
  const get = async (): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 900));
    return { data: { Value: { commissionAmount: 25, taxAmount: 2.25 } } };
  };

  const post = async (): Promise<{ data: unknown }> => {
    if (lenta) await new Promise((listo) => setTimeout(listo, 900));

    if (rechaza) {
      return {
        data: {
          isFailure: true,
          error: 'Balance insuficiente en la cuenta a debitar.',
        },
      };
    }

    return {
      data: {
        isSuccess: true,
        value: [
          {
            transactionId: 'PG-44210',
            statusId: '0',
            statusDescription: 'Aplicado',
            message: 'Pago realizado satisfactoriamente.',
          },
        ],
      },
    };
  };

  return new PaymentRepository({ get, post } as unknown as AxiosInstance);
}

// ─── Dispositivos y segundo factor (oleada 7) ───────────────────────────────

/**
 * Un vínculo de dispositivo completo para la vista previa.
 *
 * El navegador **no puede firmar ni crear llaves**, así que esto no simula
 * criptografía: simula los estados que la pantalla de Seguridad tiene que saber
 * dibujar. La verificación de que la firma funciona es del Pixel y de nadie
 * más.
 */
export function vinculoCompletoSimulado(opciones: {
  estado: 'unsupported' | 'notEnrolled' | 'ready' | 'keyLost';
  respaldo?: string;
  dispositivos?: Array<Record<string, unknown>>;
}): Record<string, unknown> {
  const listado = opciones.dispositivos ?? [];

  return {
    estado: async () => opciones.estado,
    puedeFirmar: async () => opciones.estado === 'ready',
    deviceId: async () => 'bsc-3f2a91c7-18f0a2b3c4d',
    asegurarDeviceId: async () => 'bsc-3f2a91c7-18f0a2b3c4d',
    seguridadDeLlave: async () =>
      opciones.estado === 'ready'
        ? {
            present: true,
            backing: opciones.respaldo ?? 'strongbox',
            userAuthenticationRequired: true,
            invalidatedByBiometricEnrollment: true,
          }
        : null,
    listarDispositivos: async () => listado,
    iniciarEnrolamiento: async () => ({
      exito: true,
      codigoDeError: null,
      mensaje: 'Te enviamos un código.',
      autorizacionId: null,
    }),
    completarEnrolamiento: async () => ({
      exito: true,
      codigoDeError: null,
      mensaje: 'Dispositivo registrado. Ya puedes autorizar con tu rostro o huella.',
      autorizacionId: null,
    }),
    revocarEsteDispositivo: async () => ({
      exito: true,
      codigoDeError: null,
      mensaje: 'Firma desactivada en este dispositivo.',
      autorizacionId: null,
    }),
    revocarDispositivo: async () => ({
      exito: true,
      codigoDeError: null,
      mensaje: 'Dispositivo revocado.',
      autorizacionId: null,
    }),
  };
}

/**
 * Dos dispositivos, ya digeridos por `parseDispositivo`.
 *
 * El primero es este teléfono —lleva la píldora «Este teléfono»— y el segundo
 * es uno que quedó pendiente de verificación, que es el estado que el cliente
 * más se encuentra y el que peor se entiende si no se nombra bien.
 */
export const DISPOSITIVOS_SIMULADOS = [
  {
    deviceId: 'bsc-3f2a91c7-18f0a2b3c4d',
    nombre: 'Google Pixel 10a',
    sistemaOperativo: 'Android 16',
    estado: 'Active',
    verificado: true,
    ultimoUso: new Date(2026, 4, 27, 9, 41),
    registradoEn: new Date(2026, 2, 14, 16, 5),
  },
  {
    deviceId: 'bsc-9d4e02ab-18e7c1f0d22',
    nombre: 'Samsung Galaxy A55',
    sistemaOperativo: 'Android 15',
    estado: 'PendingVerification',
    verificado: false,
    ultimoUso: null,
    registradoEn: new Date(2026, 4, 26, 11, 20),
  },
];

/**
 * El segundo factor para la pantalla del token.
 *
 * ⚠️ `provisionarTokenSuave` devuelve `null` **a propósito**: es lo que hace el
 * backend real, que no expone el secreto. La vista previa enseña el camino que
 * el cliente recorre de verdad, no uno que no existe.
 */
export function segundoFactorSinSecreto(): Record<string, unknown> {
  return {
    provisionarTokenSuave: async () => null,
    obtenerMetodos: async () => [],
    enviarCodigo: async () => ({ enviado: false, mensaje: '' }),
    verificarCodigo: async () => ({ valido: false, mensaje: '' }),
  };
}

/** Un secreto sintético, para ver el código dibujado si el banco lo expone. */
export function segundoFactorConSecreto(): Record<string, unknown> {
  return {
    ...segundoFactorSinSecreto(),
    // Sintético: no es el secreto de ningún cliente ni de ningún ambiente.
    provisionarTokenSuave: async () => 'JBSWY3DPEHPK3PXP',
  };
}

/** Almacenamiento seguro de mentira, en memoria, para la vista previa. */
export function almacenamientoSimulado(
  inicial: Record<string, string> = {},
): Record<string, unknown> {
  const mapa = new Map(Object.entries(inicial));

  return {
    getSoftTokenSecret: async () => mapa.get('soft') ?? null,
    saveSoftTokenSecret: async (valor: string) => {
      mapa.set('soft', valor);
    },
  };
}

// ─── Tasas y comprobantes fiscales (oleada 8) ───────────────────────────────

/**
 * Tasas de cambio sintéticas, con la forma cruda del sobre `Result<T>`.
 *
 * Los valores están en el orden de magnitud real del peso dominicano para que
 * la tabla se lea como en producción, pero no son las tasas de ningún día.
 */
export function tasasSimuladas(opciones: { falla?: boolean } = {}): Record<
  string,
  unknown
> {
  return {
    tasas: async () => {
      if (opciones.falla === true) throw new Error('sin red');
      return [
        { moneda: 840, compra: 59.15, venta: 60.25 },
        { moneda: 978, compra: 63.4, venta: 65.1 },
      ];
    },
  };
}

/** Comprobantes fiscales sintéticos. Ningún NCF ni cuenta son reales. */
export function comprobantesSimulados(
  opciones: { vacio?: boolean; falla?: boolean } = {},
): Record<string, unknown> {
  return {
    buscar: async () => {
      if (opciones.falla === true) throw new Error('sin red');
      if (opciones.vacio === true) return [];

      return [
        {
          ncf: 'B0200000001',
          cuenta: '11042010013953',
          fecha: '2026-04-15',
          moneda: '214',
          monto: 350.5,
          descripcion: 'Comisión por mantenimiento',
          operacion: 'DB',
        },
        {
          ncf: 'B0200000002',
          cuenta: '11042010013953',
          fecha: '2026-03-02',
          moneda: '214',
          monto: 120.25,
          descripcion: 'Comisión por transferencia',
          operacion: 'DB',
        },
        {
          ncf: 'B0200000003',
          cuenta: '11042010013953',
          fecha: '2026-01-20',
          moneda: '214',
          monto: 29.25,
          descripcion: 'Impuesto 0.15%',
          operacion: 'DB',
        },
      ];
    },
    detalle: async () => ({
      ncf: 'B0200000001',
      numero: '0000001',
      descripcion: 'Comisión por mantenimiento',
      cuenta: '11042010013953',
      tipoDeCuenta: 'Ahorros',
      moneda: '214',
      monto: 350.5,
      fechaFin: null,
    }),
    movimiento: async () => ({
      secuencia: '000001',
      operacion: 'DB',
      descripcion: 'Cargo por mantenimiento',
      fecha: '2026-04-15',
      tipo: 'Cargo automático',
      monto: 350.5,
      referencia: 'REF-000001',
      impuesto: null,
    }),
  };
}

/** Las cuentas que el selector de comprobantes ofrece. */
export const CUENTAS_DE_COMPROBANTES = [
  {
    categoria: 'CA',
    identificacion: '11042010013953',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 128_450.12,
    saldoDisponible: 128_450.12,
  },
  {
    categoria: 'CC',
    identificacion: '11042010099887',
    codigoMoneda: 214,
    estado: 'A',
    saldoActual: 42_300,
    saldoDisponible: 42_300,
  },
];
