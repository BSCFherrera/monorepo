import {
  comoLista,
  comoObjeto,
  entero,
  esVerdadero,
  leerResult,
  leerSobreApi,
  texto,
  textoOpcional,
} from '../../../core/network/envelopes';

/**
 * Contratos de `/beneficiaries/*`.
 *
 * Portado de `beneficiary_repository.dart` y `beneficiary_catalogs.dart`, con
 * dos correcciones que se explican abajo y que son defectos reales del
 * original, no decisiones de estilo.
 *
 * El backend serializa los enumerados **como palabras** —`Type: "InternalBank"`,
 * `IdentificationType: "NationalId"`, `Status: "Active"`— porque `Program.cs`
 * registra `JsonStringEnumConverter`. Los contratos anteriores usaban números,
 * así que aquí se aceptan las dos formas.
 */

// ─── Tipo de beneficiario ───────────────────────────────────────────────────

export const TipoDeBeneficiario = {
  BancoInterno: 1,
  InterbancarioLocal: 2,
  Internacional: 3,
  ServicioOComercio: 4,
  Prepago: 5,
} as const;

export type CodigoDeTipo =
  (typeof TipoDeBeneficiario)[keyof typeof TipoDeBeneficiario];

const TIPOS_POR_PALABRA: Readonly<Record<string, number>> = {
  INTERNALBANK: TipoDeBeneficiario.BancoInterno,
  LOCALINTERBANK: TipoDeBeneficiario.InterbancarioLocal,
  INTERNATIONAL: TipoDeBeneficiario.Internacional,
  SERVICECOMMERCE: TipoDeBeneficiario.ServicioOComercio,
  PREPAID: TipoDeBeneficiario.Prepago,
};

/** Traduce el tipo, venga como palabra o como número. */
export function codigoDeTipo(valor: unknown): number {
  if (typeof valor === 'number') return Math.trunc(valor);

  const palabra = String(valor ?? '')
    .toUpperCase()
    .replace(/\s/g, '');

  const conocido = TIPOS_POR_PALABRA[palabra];
  if (conocido !== undefined) return conocido;

  const numero = Number.parseInt(palabra, 10);
  return Number.isNaN(numero) ? TipoDeBeneficiario.BancoInterno : numero;
}

// ─── Tipo de documento ──────────────────────────────────────────────────────

/**
 * Códigos del enumerado `IdentificationType` del backend.
 *
 * ⚠️ **La app Flutter los tiene cambiados.** Su `_documentCode` mapea
 * `PASSPORT → 2` y `RNC → 3`, y el enumerado del backend dice `RNC = 2` y
 * `Passport = 3`. Un beneficiario dado de alta con pasaporte se guardaría —y se
 * mostraría— como RNC, y al revés. No falla nada visible: simplemente el dato
 * queda cambiado. Su propio `ValidatedClient.identificationTypeCode`, en el
 * módulo de transferencias, sí usa el orden correcto.
 */
export const TipoDeDocumento = {
  Cedula: 1,
  RNC: 2,
  Pasaporte: 3,
  CedulaExtranjera: 4,
  PasaporteExtranjero: 5,
} as const;

const DOCUMENTOS_POR_PALABRA: Readonly<Record<string, number>> = {
  NATIONALID: TipoDeDocumento.Cedula,
  CEDULA: TipoDeDocumento.Cedula,
  RNC: TipoDeDocumento.RNC,
  PASSPORT: TipoDeDocumento.Pasaporte,
  PASAPORTE: TipoDeDocumento.Pasaporte,
  FOREIGNID: TipoDeDocumento.CedulaExtranjera,
  FOREIGNPASSPORT: TipoDeDocumento.PasaporteExtranjero,
};

export function codigoDeDocumento(valor: unknown): number | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (typeof valor === 'number') return Math.trunc(valor);

  const palabra = String(valor).toUpperCase().replace(/\s/g, '');
  if (palabra === '') return undefined;

  const conocido = DOCUMENTOS_POR_PALABRA[palabra];
  if (conocido !== undefined) return conocido;

  const numero = Number.parseInt(palabra, 10);
  return Number.isNaN(numero) ? undefined : numero;
}

// ─── Beneficiario ───────────────────────────────────────────────────────────

export interface Beneficiario {
  id: string;
  tipo: number;
  alias: string;
  nombre: string;
  numeroDeCuenta: string;
  tipoDeCuenta: string;
  codigoMoneda: string;
  banco: string | undefined;
  documentoTipo: number | undefined;
  documentoNumero: string | undefined;
}

export function esEnDolares(beneficiario: Beneficiario): boolean {
  const moneda = beneficiario.codigoMoneda.toUpperCase();
  return moneda === '840' || moneda === 'USD';
}

export function simboloDeMoneda(beneficiario: Beneficiario): string {
  return esEnDolares(beneficiario) ? 'US$' : 'RD$';
}

/** Cuatro últimos dígitos, como los escribe el original. */
export function cuentaEnmascarada(beneficiario: Beneficiario): string {
  const cuenta = beneficiario.numeroDeCuenta;
  return cuenta.length <= 4 ? cuenta : `****${cuenta.slice(-4)}`;
}

/** El alias manda sobre el nombre: es como el cliente lo llama. */
export function nombreVisible(beneficiario: Beneficiario): string {
  return beneficiario.alias !== '' ? beneficiario.alias : beneficiario.nombre;
}

function unBeneficiario(crudo: Record<string, unknown>): Beneficiario {
  return {
    id: texto(crudo, 'Id', 'id'),
    tipo: codigoDeTipo(crudo.Type ?? crudo.type),
    alias: texto(crudo, 'Alias', 'alias'),
    nombre: texto(crudo, 'BeneficiaryName', 'beneficiaryName'),
    numeroDeCuenta: texto(crudo, 'AccountNumber', 'accountNumber'),
    tipoDeCuenta: texto(crudo, 'AccountType', 'accountType'),
    // El core habla en códigos ISO numéricos; 214 es el peso dominicano.
    codigoMoneda: texto(crudo, 'CurrencyCode', 'currencyCode') || '214',
    banco: textoOpcional(crudo, 'BankName', 'bankName'),
    documentoTipo: codigoDeDocumento(
      crudo.IdentificationType ?? crudo.identificationType,
    ),
    documentoNumero: textoOpcional(
      crudo,
      'IdentificationNumber',
      'identificationNumber',
    ),
  };
}

export function parseBeneficiarios(cuerpo: unknown): Beneficiario[] {
  const sobre = leerSobreApi(cuerpo);

  // Algunos ambientes devuelven la lista en `Value` en vez de en `Data`.
  const lista =
    comoLista(sobre.datos).length > 0
      ? comoLista(sobre.datos)
      : comoLista(leerResult(cuerpo));

  return lista.map(unBeneficiario).filter(b => b.id !== '');
}

// ─── Catálogos ──────────────────────────────────────────────────────────────

export interface OpcionDeBanco {
  id: string;
  codigo: string;
  nombre: string;
  swift: string | undefined;
  pais: string | undefined;
}

export interface OpcionDeTipoDeCuenta {
  id: number;
  codigo: string;
  nombre: string;
}

export interface OpcionDeDocumento {
  id: number;
  codigo: string;
  nombre: string;
  expresion: string | undefined;
  largoMinimo: number | undefined;
  largoMaximo: number | undefined;
}

export interface CatalogosDeBeneficiario {
  bancos: OpcionDeBanco[];
  tiposDeCuenta: OpcionDeTipoDeCuenta[];
  documentos: OpcionDeDocumento[];
}

export const CATALOGOS_VACIOS: CatalogosDeBeneficiario = {
  bancos: [],
  tiposDeCuenta: [],
  documentos: [],
};

export function parseBancos(cuerpo: unknown): OpcionDeBanco[] {
  return comoLista(leerSobreApi(cuerpo).datos)
    .map(crudo => ({
      id: texto(crudo, 'Id', 'id'),
      codigo: texto(crudo, 'Code', 'code'),
      nombre: texto(crudo, 'Name', 'name'),
      swift: textoOpcional(crudo, 'SwiftCode', 'swiftCode'),
      pais: textoOpcional(crudo, 'CountryCode', 'countryCode'),
    }))
    .filter(banco => banco.nombre !== '');
}

export function parseTiposDeCuenta(cuerpo: unknown): OpcionDeTipoDeCuenta[] {
  return comoLista(leerSobreApi(cuerpo).datos)
    .map(crudo => ({
      id: entero(crudo, 'Id', 'id') ?? 0,
      codigo: texto(crudo, 'Code', 'code'),
      nombre: texto(crudo, 'Name', 'name'),
    }))
    .filter(tipo => tipo.nombre !== '');
}

export function parseDocumentos(cuerpo: unknown): OpcionDeDocumento[] {
  return comoLista(leerSobreApi(cuerpo).datos)
    .map(crudo => ({
      id: entero(crudo, 'Id', 'id') ?? 0,
      codigo: texto(crudo, 'Code', 'code'),
      nombre: texto(crudo, 'Name', 'name'),
      expresion: textoOpcional(crudo, 'ValidationRegex', 'validationRegex'),
      largoMinimo: entero(crudo, 'MinLength', 'minLength'),
      largoMaximo: entero(crudo, 'MaxLength', 'maxLength'),
    }))
    .filter(documento => documento.nombre !== '');
}

export function esTarjetaDeCredito(tipo: OpcionDeTipoDeCuenta): boolean {
  return tipo.codigo.toUpperCase() === 'CREDITCARD';
}

/**
 * Deja el documento como lo espera el catálogo: sin separadores.
 *
 * El core devuelve la cédula del titular **formateada** —`001-0000000-0`— y el
 * catálogo cuenta caracteres, así que prellenar el campo con lo que llega
 * hacía que la propia aplicación rechazara después su propio valor. Se
 * conservan letras y dígitos, porque un RNC o un pasaporte pueden llevarlas.
 */
export function normalizarDocumento(valor: string): string {
  return valor.replace(/[^0-9A-Za-z]/g, '');
}

/**
 * Valida el número de documento contra la regla que trae el catálogo.
 *
 * Portado de `DocumentTypeOption.validate`. Rechazar aquí lo que el core va a
 * rechazar evita un viaje de ida y vuelta y un mensaje del servidor que el
 * cliente no entiende. Una expresión mal formada en el catálogo **no puede
 * bloquear al cliente**: se ignora, igual que en el original.
 */
export function validarDocumento(
  tipo: OpcionDeDocumento | null,
  valor: string,
): string | undefined {
  const limpio = valor.trim();
  if (limpio === '') return 'Ingresa el número de documento';
  if (tipo === null) return undefined;

  if (tipo.largoMinimo !== undefined && limpio.length < tipo.largoMinimo) {
    return `Debe tener al menos ${String(tipo.largoMinimo)} caracteres`;
  }
  if (tipo.largoMaximo !== undefined && limpio.length > tipo.largoMaximo) {
    return `No puede exceder ${String(tipo.largoMaximo)} caracteres`;
  }

  if (tipo.expresion !== undefined && tipo.expresion !== '') {
    try {
      if (!new RegExp(tipo.expresion).test(limpio))
        return `${tipo.nombre} inválido`;
    } catch {
      // Expresión inválida en el catálogo: no es culpa del cliente.
    }
  }

  return undefined;
}

// ─── Validación de cuenta ───────────────────────────────────────────────────

export interface ValidacionDeCuenta {
  valida: boolean;
  mensaje: string;
  titular: string | undefined;
  documentoTipo: number | undefined;
  documentoNumero: string | undefined;
  email: string | undefined;
  /** Código de moneda del producto encontrado, si el core devolvió alguno. */
  codigoMoneda: string | undefined;
  tipoDeProducto: string | undefined;
  numeroDeProducto: string | undefined;
}

export const CUENTA_NO_VALIDADA: ValidacionDeCuenta = {
  valida: false,
  mensaje: 'No pudimos validar la cuenta.',
  titular: undefined,
  documentoTipo: undefined,
  documentoNumero: undefined,
  email: undefined,
  codigoMoneda: undefined,
  tipoDeProducto: undefined,
  numeroDeProducto: undefined,
};

/**
 * Lee `POST /beneficiaries/validate-account`.
 *
 * **Aquí está el defecto que bloqueaba el alta de beneficiarios en la app
 * Flutter.** Su repositorio lee la respuesta como `ApiResponse<T>` y busca
 * dentro `IsValid`, `AccountHolderName` y `CurrencyCode`. El endpoint no
 * devuelve nada de eso: devuelve `Result<AccountValidationDto>`, es decir
 * `{ Value: { Client: [...], Products: [...] } }`. Ninguno de los campos que
 * busca existe, así que `isValid` sale **siempre falso** y la hoja de alta se
 * queda clavada en el paso de la cuenta, enseñando «Cuenta validada.» como si
 * fuera un error. El propio módulo de transferencias de esa app lee la misma
 * respuesta correctamente, con `_unwrapResult`: son dos implementaciones de la
 * misma llamada y solo una funciona.
 *
 * Aquí se lee la forma real. Una cuenta es válida si el core devolvió al menos
 * un producto o un titular; si devolvió el sobre vacío, no lo es.
 */
export function parseValidacionDeCuenta(cuerpo: unknown): ValidacionDeCuenta {
  const contenido = comoObjeto(leerResult(cuerpo));

  const clientes = comoLista(contenido.Client ?? contenido.client);
  const productos = comoLista(contenido.Products ?? contenido.products);

  const cliente = clientes[0];
  const producto = productos[0];

  if (cliente === undefined && producto === undefined) {
    return {
      ...CUENTA_NO_VALIDADA,
      mensaje: 'No encontramos esa cuenta.',
    };
  }

  const nombre =
    cliente === undefined
      ? undefined
      : textoOpcional(cliente, 'CustomerFullName', 'customerFullName') ??
        textoOpcional(cliente, 'CustomerShortName', 'customerShortName') ??
        nombreCompuesto(cliente);

  return {
    valida: true,
    mensaje: 'Cuenta validada.',
    titular: nombre,
    documentoTipo:
      cliente === undefined
        ? undefined
        : codigoDeDocumento(
            cliente.IdentificationType ?? cliente.identificationType,
          ),
    documentoNumero:
      cliente === undefined
        ? undefined
        : textoOpcional(
            cliente,
            'IdentificationNumber',
            'identificationNumber',
          ),
    email:
      cliente === undefined
        ? undefined
        : textoOpcional(cliente, 'Email', 'email'),
    codigoMoneda:
      producto === undefined
        ? undefined
        : textoOpcional(
            producto,
            'Currency',
            'currency',
            'CurrencyCode',
            'currencyCode',
          ),
    tipoDeProducto:
      producto === undefined
        ? undefined
        : textoOpcional(producto, 'Type', 'type'),
    numeroDeProducto:
      producto === undefined
        ? undefined
        : textoOpcional(producto, 'Number', 'number'),
  };
}

/** Nombre y apellido sueltos, cuando el core no manda el compuesto. */
function nombreCompuesto(cliente: Record<string, unknown>): string | undefined {
  const partes = [
    texto(cliente, 'FirstName', 'firstName'),
    texto(cliente, 'LastName', 'lastName'),
  ].filter(parte => parte !== '');

  return partes.length === 0 ? undefined : partes.join(' ');
}

// ─── Alta y confirmación ────────────────────────────────────────────────────

export interface BeneficiarioPendiente {
  id: string;
  mensaje: string;
}

export function parseBeneficiarioPendiente(
  cuerpo: unknown,
): BeneficiarioPendiente {
  const sobre = leerSobreApi(cuerpo);
  const interno = comoObjeto(sobre.datos);
  const fuente = Object.keys(interno).length > 0 ? interno : comoObjeto(cuerpo);

  return {
    id: texto(fuente, 'BeneficiaryId', 'beneficiaryId', 'Id', 'id'),
    mensaje:
      textoOpcional(fuente, 'Message', 'message') ??
      sobre.mensaje ??
      'Beneficiario creado. Confirma con tu código.',
  };
}

export interface ResultadoDeConfirmacion {
  exito: boolean;
  mensaje: string;
}

export function parseConfirmacion(cuerpo: unknown): ResultadoDeConfirmacion {
  const sobre = leerSobreApi(cuerpo);
  const interno = comoObjeto(sobre.datos);

  /*
    El sobre puede decir que la llamada fue bien y el contenido que la
    confirmación no. Se exige que las dos cosas estén de acuerdo: dar por
    confirmado un beneficiario que no lo está lo dejaría invisible en la lista
    —que solo pide los activos— sin que nadie sepa por qué.
  */
  const interior = interno.Success ?? interno.success;
  const confirmado =
    sobre.exito && (interior === undefined || esVerdadero(interior));

  return {
    exito: confirmado,
    mensaje:
      textoOpcional(interno, 'Message', 'message') ??
      sobre.mensaje ??
      (confirmado
        ? 'Beneficiario confirmado.'
        : 'No pudimos confirmar el beneficiario.'),
  };
}
