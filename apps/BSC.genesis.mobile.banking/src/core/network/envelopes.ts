/**
 * Los dos sobres con los que responde el backend.
 *
 * No es un capricho de este archivo: el backend tiene **dos** envoltorios y los
 * usa mezclados, a veces en el mismo controlador.
 *
 *  - `ApiResponse<T>` → `{ Success, Data, Message, Errors }`. Lo usan los
 *    endpoints escritos a mano: la lista de beneficiarios, los catálogos, el
 *    alta y la confirmación.
 *  - `Result<T>` → `{ Value, IsSuccess, Error }`. Lo devuelven los que pasan
 *    por MediatR: el detalle de producto, los movimientos, el PDF del estado de
 *    cuenta y **la validación de cuenta**.
 *
 * Confundirlos no produce un error: produce datos en blanco. Ya pasó dos veces
 * en esta migración —el detalle de producto salía entero en cero porque se leía
 * el sobre en vez de su contenido— y una tercera en la propia app Flutter, cuyo
 * repositorio de beneficiarios lee `Data` sobre una respuesta que trae `Value`,
 * de modo que la validación de cuenta **nunca puede dar por válida una cuenta**.
 *
 * Por eso los dos lectores viven aquí, con nombre propio, en vez de repetirse
 * dentro de cada repositorio: así se elige cuál se usa, y se elige a la vista.
 */

/** Convierte a objeto lo que llegó, aceptando la respuesta ya serializada. */
export function comoObjeto(cuerpo: unknown): Record<string, unknown> {
  const dato = typeof cuerpo === 'string' ? seguroJson(cuerpo) : cuerpo;
  return typeof dato === 'object' && dato !== null
    ? (dato as Record<string, unknown>)
    : {};
}

function seguroJson(texto: string): unknown {
  if (texto.trim() === '') return null;
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return null;
  }
}

// ─── ApiResponse<T> ─────────────────────────────────────────────────────────

export interface SobreApi {
  exito: boolean;
  /** El contenido de `Data`, tal cual llegó. */
  datos: unknown;
  mensaje: string | undefined;
  errores: string[];
}

export function leerSobreApi(cuerpo: unknown): SobreApi {
  const sobre = comoObjeto(cuerpo);

  const errores = sobre.Errors ?? sobre.errors;

  return {
    exito: esVerdadero(sobre.Success ?? sobre.success),
    datos: sobre.Data ?? sobre.data,
    mensaje: cadena(sobre.Message ?? sobre.message),
    errores: Array.isArray(errores)
      ? errores.filter((e): e is string => typeof e === 'string')
      : [],
  };
}

// ─── Result<T> ──────────────────────────────────────────────────────────────

/**
 * Contenido de `Result<T>`.
 *
 * Si no hay `Value` devuelve el propio cuerpo: algunos ambientes entregan el
 * objeto sin envolver, y tratar eso como «vino vacío» borraría datos buenos.
 */
export function leerResult(cuerpo: unknown): unknown {
  const sobre = comoObjeto(cuerpo);
  const contenido = sobre.Value ?? sobre.value;
  return contenido === undefined || contenido === null ? sobre : contenido;
}

// ─── Lecturas tolerantes ────────────────────────────────────────────────────

/** Primera cadena no vacía entre varios nombres de campo. */
export function texto(
  fuente: Record<string, unknown>,
  ...nombres: string[]
): string {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (typeof valor === 'string' && valor.trim() !== '') return valor.trim();
    if (typeof valor === 'number') return String(valor);
  }
  return '';
}

/** Igual que `texto`, pero indefinido en vez de cadena vacía. */
export function textoOpcional(
  fuente: Record<string, unknown>,
  ...nombres: string[]
): string | undefined {
  const valor = texto(fuente, ...nombres);
  return valor === '' ? undefined : valor;
}

/** Un valor suelto como cadena, indefinido si no hay nada legible. */
export function cadena(valor: unknown): string | undefined {
  if (typeof valor === 'string' && valor.trim() !== '') return valor.trim();
  if (typeof valor === 'number') return String(valor);
  return undefined;
}

export function entero(
  fuente: Record<string, unknown>,
  ...nombres: string[]
): number | undefined {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return Math.trunc(valor);
    }
    if (typeof valor === 'string' && valor.trim() !== '') {
      const leido = Number.parseInt(valor, 10);
      if (!Number.isNaN(leido)) return leido;
    }
  }
  return undefined;
}

export function decimal(
  fuente: Record<string, unknown>,
  ...nombres: string[]
): number | undefined {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
    if (typeof valor === 'string' && valor.trim() !== '') {
      const leido = Number.parseFloat(valor.replace(/,/g, ''));
      if (!Number.isNaN(leido)) return leido;
    }
  }
  return undefined;
}

export function esVerdadero(valor: unknown): boolean {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') return valor.trim().toLowerCase() === 'true';
  return false;
}

/** Lista de objetos, o vacía si lo que llegó no es una lista. */
export function comoLista(valor: unknown): Record<string, unknown>[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(
    (e): e is Record<string, unknown> => typeof e === 'object' && e !== null,
  );
}

/**
 * Mensaje que el backend puso en la respuesta de error.
 *
 * Mira en `Data`, en el sobre y en `ProblemDetails`, por ese orden. El backend
 * responde 400 con el motivo —y con los intentos que quedan, en el segundo
 * factor—, y ese texto le sirve al cliente mucho más que uno genérico.
 */
export function mensajeDeRespuesta(cuerpo: unknown, respaldo: string): string {
  const sobre = comoObjeto(cuerpo);
  const interno = comoObjeto(sobre.Data ?? sobre.data);

  for (const fuente of [interno, sobre]) {
    const mensaje = textoOpcional(
      fuente,
      'Message',
      'message',
      'Detail',
      'detail',
    );
    if (mensaje !== undefined) return mensaje;
  }

  const errores = sobre.Errors ?? sobre.errors;
  if (Array.isArray(errores)) {
    const primero = errores.find(e => typeof e === 'string' && e.trim() !== '');
    if (typeof primero === 'string') return primero.trim();
  }

  return respaldo;
}

/** Igual, sobre el error de Axios. */
export function mensajeDeError(causa: unknown, respaldo: string): string {
  const error = causa as { response?: { data?: unknown } } | undefined;
  return mensajeDeRespuesta(error?.response?.data, respaldo);
}
