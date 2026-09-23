/**
 * Formato de montos, fechas y números de cuenta.
 *
 * Portado de `lib/shared/utils/formatters.dart`. Es lógica pura, así que vive
 * en el paquete compartido: el portal necesita exactamente los mismos formatos,
 * y hoy los tiene escritos aparte.
 *
 * Los nombres de mes y el «a. m.»/«p. m.» salen de `@bsc/i18n/calendario`, en
 * el idioma que tenga la app; los números no cambian con el idioma (el español
 * dominicano y el inglés agrupan igual: `1,234.56`).
 */

import { meridiano, nombreCortoDelMes } from '@bsc/i18n/calendario';

/** Códigos de moneda del core: 214 es el peso dominicano, 840 el dólar. */
export const CURRENCY = {
  DOP: 214,
  USD: 840,
} as const;

/**
 * Agrupa con comas de millar y deja siempre dos decimales.
 *
 * Escrito a mano en vez de usar `Intl.NumberFormat` porque Hermes, el motor de
 * JavaScript de React Native, **no incluye los datos de internacionalización
 * por defecto**: `toLocaleString` existe pero ignora la configuración regional
 * y devuelve el formato de inglés. Un monto mal agrupado en una pantalla de
 * saldos es de las cosas que un cliente nota de inmediato.
 */
export function formatAmount(amount: number): string {
  const negativo = amount < 0;
  const centavos = Math.round(Math.abs(amount) * 100 * (1 + Number.EPSILON));

  const entero = Math.floor(centavos / 100);
  const decimales = String(centavos % 100).padStart(2, '0');

  const conComas = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${negativo ? '-' : ''}${conComas}.${decimales}`;
}

/**
 * Cantidad entera agrupada con comas de millar: `1,240`.
 *
 * Es lo que el original llama `CurrencyFormatter.format(valor, decimals: 0)`, y
 * se usa para lo que se cuenta en unidades y no en dinero: los puntos de la
 * tarjeta. Va aquí y **no con `Intl.NumberFormat`** por la misma razón que el
 * resto de este archivo: Hermes no trae los datos de internacionalización, así
 * que `Intl` existe pero agrupa con el formato de inglés o no agrupa en
 * absoluto, según la compilación.
 */
export function formatInteger(amount: number): string {
  const negativo = amount < 0;
  const entero = Math.round(Math.abs(amount));
  const conComas = String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${negativo ? '-' : ''}${conComas}`;
}

/**
 * Monto en pesos dominicanos: `RD$ 1,234.56`.
 *
 * El espacio después del símbolo no es un descuido: la app Flutter compone
 * todos sus montos como símbolo, espacio y número, y sin él los saldos se ven
 * pegados al símbolo en todas las pantallas a la vez.
 */
export function formatDOP(amount: number): string {
  return `RD$ ${formatAmount(amount)}`;
}

/**
 * Monto en dólares: `US$ 1,234.56`.
 *
 * Lleva las dos letras y no el signo de dólar a secas porque en República
 * Dominicana el peso también se escribe con ese signo, y un monto marcado solo
 * con él es ambiguo justo donde más caro sale confundirse.
 */
export function formatUSD(amount: number): string {
  return `US$ ${formatAmount(amount)}`;
}

/** Monto según el código de moneda del core. */
export function formatCurrency(amount: number, currencyCode: number): string {
  return currencyCode === CURRENCY.DOP ? formatDOP(amount) : formatUSD(amount);
}

/** Símbolo de la moneda, para cuando el monto se compone por partes. */
export function currencySymbol(currencyCode: number): string {
  return currencyCode === CURRENCY.DOP ? 'RD$' : 'US$';
}

/** Enmascara una cuenta dejando los últimos cuatro dígitos: `****7921`. */
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

/** Enmascara una tarjeta en grupos: `**** **** **** 0668`. */
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length <= 4) return cardNumber;
  return `**** **** **** ${cardNumber.slice(-4)}`;
}

/**
 * Interpreta las formas de fecha que emite el core.
 *
 * Llegan en ISO (`2026-05-27`) o con el día primero (`27-05-2026`,
 * `27/05/2026`). Devuelve `null` si no reconoce ninguna, para que quien llame
 * decida qué mostrar en vez de inventar una fecha.
 */
export function parseCoreDate(raw: string): Date | null {
  const valor = raw.trim();
  if (valor === '') return null;

  // ISO solo con fecha: `2026-05-27`.
  //
  // ⚠️ **No se puede usar `new Date('2026-05-27')` aquí.** JavaScript
  // interpreta esa forma como medianoche **UTC**, y al leerla con `getDate()`
  // en hora local —República Dominicana está en UTC-4— devuelve el día
  // anterior. El resultado sería que **todos los movimientos aparecerían
  // fechados un día antes**, que es de los errores más difíciles de notar y más
  // graves de explicar en un estado de cuenta.
  //
  // Construyendo la fecha por componentes queda en hora local, que es lo que el
  // core quiere decir cuando manda un día sin hora.
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (soloFecha !== null) {
    return new Date(
      Number(soloFecha[1]),
      Number(soloFecha[2]) - 1,
      Number(soloFecha[3]),
    );
  }

  // ISO con hora **y zona explícita** (`Z` o `+04:00`): ahí el desplazamiento
  // es intencional y hay que respetarlo.
  if (/^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:?\d{2})$/.test(valor)) {
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  // ISO con hora pero **sin zona**, separada por `T` o por un espacio:
  // `2026-01-08T00:00:00` y `2026-01-08 00:00:00`. El core manda las dos formas
  // según el endpoint, y la del espacio no es ISO válido: los motores la
  // aceptan por cortesía y sin garantías. Se interpreta por componentes y en
  // hora local, que es lo que el core quiere decir.
  const conHora =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(valor);
  if (conHora !== null) {
    return new Date(
      Number(conHora[1]),
      Number(conHora[2]) - 1,
      Number(conHora[3]),
      Number(conHora[4]),
      Number(conHora[5]),
      Number(conHora[6] ?? 0),
    );
  }

  const partes = valor.split(/[-/]/);
  if (partes.length === 3) {
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);

    if (
      Number.isInteger(dia) &&
      Number.isInteger(mes) &&
      Number.isInteger(anio) &&
      dia >= 1 &&
      dia <= 31 &&
      mes >= 1 &&
      mes <= 12 &&
      anio > 1900
    ) {
      return new Date(anio, mes - 1, dia);
    }
  }

  return null;
}

/**
 * Fecha legible: `27 may 2026`.
 *
 * Si no logra interpretarla devuelve la cadena original, para que un formato
 * inesperado no deje una fila en blanco — el cliente prefiere ver algo raro a
 * ver un hueco.
 */
export function formatDate(raw: string): string {
  const fecha = parseCoreDate(raw);
  if (fecha === null) return raw;

  return `${fecha.getDate()} ${nombreCortoDelMes(fecha.getMonth())} ${fecha.getFullYear()}`;
}

/** Fecha corta: `27/05/2026`. */
export function formatDateShort(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

/**
 * Fecha tal como la espera el core: `27-05-2026`, con guiones.
 *
 * **No es lo mismo que `formatDateShort`, y confundirlas sale caro.** Aquella
 * es para mostrarle la fecha a una persona y usa barras; esta viaja por la API
 * hasta el bus y de ahí al core. La app Flutter compone las fechas de consulta
 * con `DateFormat('dd-MM-yyyy')` en `product_detail_bloc.dart`, y el backend no
 * las interpreta: las reenvía al core tal cual, sin validar ni reformatear.
 *
 * El porte usaba `formatDateShort` para esto, así que enviaba `27/05/2026`. Como
 * la respuesta «no se encontraron registros» se traduce a lista vacía, la
 * pantalla se quedaba en blanco sin ningún error a la vista.
 */
export function formatDateForCore(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}-${mes}-${fecha.getFullYear()}`;
}

/** Fecha y hora de un movimiento: `7 may, 8:10 a. m.`. */
export function formatTransactionDate(fecha: Date): string {
  const horas = fecha.getHours();
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const hora12 = horas % 12 === 0 ? 12 : horas % 12;

  return `${fecha.getDate()} ${nombreCortoDelMes(fecha.getMonth())}, ${hora12}:${minutos} ${meridiano(horas)}`;
}

const VOCALES_ACENTUADAS: Record<string, string> = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú',
};

const esLetra = (c: string): boolean => /[a-záéíóúñ]/i.test(c);

/**
 * Repara las vocales acentuadas que el core estropea al salir.
 *
 * Algunas descripciones llegan con el acento reemplazado por un signo de
 * interrogación invertido —`120 d¿as`, `informaci¿n`— porque el campo se
 * escribió en una codificación y se leyó en otra.
 *
 * Un `¿` suelto solo es legítimo al comienzo de una pregunta, nunca encajado
 * entre dos letras, así que reparar únicamente ese caso es seguro. La vocal se
 * infiere de las letras alrededor, que cubre todas las palabras que el core
 * manda en la práctica.
 */
export function repairEncoding(raw: string): string {
  if (!raw.includes('¿')) return raw;

  let salida = '';

  for (let i = 0; i < raw.length; i += 1) {
    const caracter = raw[i]!;

    if (caracter !== '¿' || i === 0 || i === raw.length - 1) {
      salida += caracter;
      continue;
    }

    const anterior = raw[i - 1]!;
    const siguiente = raw[i + 1]!;

    if (!esLetra(anterior) || !esLetra(siguiente)) {
      salida += caracter;
      continue;
    }

    salida += acentoPara(anterior.toLowerCase(), siguiente.toLowerCase());
  }

  return salida;
}

/**
 * Deduce qué vocal acentuada iba en el hueco.
 *
 * Las combinaciones cubren las palabras que el core emite de verdad:
 * `d¿as` → días, `informaci¿n` → información, `p¿blico` → público.
 */
function acentoPara(anterior: string, siguiente: string): string {
  if (anterior === 'd' && siguiente === 'a') return VOCALES_ACENTUADAS.i!;
  if (anterior === 'c' && siguiente === 'n') return VOCALES_ACENTUADAS.o!;
  if (anterior === 'p' && siguiente === 'b') return VOCALES_ACENTUADAS.u!;
  if (siguiente === 'n') return VOCALES_ACENTUADAS.o!;
  if (siguiente === 's') return VOCALES_ACENTUADAS.a!;
  return VOCALES_ACENTUADAS.a!;
}

/**
 * Suaviza las descripciones que el core manda en mayúsculas.
 *
 * Llegan gritando —`COMPRA POS - SUPERMERCADO`— y en una lista de movimientos
 * eso se lee mal. Se pasa a capitalización de palabra sin perder ninguna.
 */
export function softenDescription(raw: string): string {
  const limpia = raw.trim();
  if (limpia === '') return limpia;

  // Si no viene toda en mayúsculas, ya está escrita para leerse: no se toca.
  //
  // La comprobación va sobre el texto **original**, antes de reparar la
  // codificación: la reparación introduce vocales acentuadas en minúscula, y
  // preguntarlo después haría que `PRESTAMO A 120 D¿AS` pareciera texto normal
  // y se quedara gritando.
  const gritando = limpia === limpia.toUpperCase();
  const reparada = repairEncoding(limpia);
  if (!gritando) return reparada;

  return reparada
    .toLowerCase()
    .split(' ')
    .map(palabra =>
      palabra.length === 0
        ? palabra
        : palabra[0]!.toUpperCase() + palabra.slice(1),
    )
    .join(' ');
}

/**
 * La marca de «Último acceso» de la pantalla de entrada: `hoy, 3:44 p.m.`.
 *
 * ⚠️ **Siempre dice «hoy», aunque el acceso fuera de hace una semana.** No es
 * un descuido del porte: `_formatNow()` de `login_screen.dart` compone
 * literalmente `'hoy, $hour12:$minute $suffix'`, sin mirar la fecha. Se porta
 * tal cual porque es lo que el cliente ya conoce, y queda anotado como
 * divergencia con la realidad para que el banco decida si quiere la fecha de
 * verdad.
 *
 * Las doce de la noche y las doce del mediodía se escriben «12» y no «0», que
 * es el borde donde este tipo de formateo suele fallar.
 */
export function marcaDeUltimoAcceso(fecha: Date): string {
  const hora24 = fecha.getHours();
  const hora12 = hora24 % 12 === 0 ? 12 : hora24 % 12;
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  // Se guarda ya escrito, así que no sigue un cambio de idioma: para eso habría
  // que guardar la fecha y escribirla al mostrarla.
  const sufijo = hora24 < 12 ? 'a.m.' : 'p.m.';

  return `hoy, ${hora12}:${minutos} ${sufijo}`;
}
