/**
 * El PDF del estado de cuenta, tal como lo entrega el backend.
 *
 * Portado de `_extractBase64Pdf` en `product_detail_remote_datasource.dart`. El
 * archivo llega **codificado en base64 dentro del sobre `Result<T>`**, y el
 * original conoce cuatro sitios distintos donde puede estar según cómo lo haya
 * serializado el bus. Las cuatro formas se conservan: quitar una supondría
 * apostar a cuál manda el ambiente, y el ambiente ya ha cambiado de opinión.
 *
 * Aquí hay dos diferencias deliberadas con el original, las dos explicadas
 * abajo: qué se devuelve cuando no hay PDF, y qué se escribe en el nombre del
 * archivo.
 */

function comoTexto(valor: unknown): string | undefined {
  if (typeof valor !== 'string') return undefined;
  return valor;
}

function objeto(valor: unknown): Record<string, unknown> | undefined {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
    ? (valor as Record<string, unknown>)
    : undefined;
}

/**
 * Deja el base64 limpio, o nada si no hay contenido válido.
 *
 * El bus a veces antepone el prefijo de URI de datos, y algunos servicios
 * parten la cadena en líneas de setenta y seis caracteres. Las dos cosas
 * romperían la decodificación en el módulo nativo.
 *
 * Además se comprueba que lo que queda **sea base64**. Cuando un intermediario
 * de la red corporativa responde con una página de error, el cuerpo es HTML y
 * el original lo guardaría igual: el cliente acabaría con un archivo `.pdf` que
 * ningún lector abre y sin ningún mensaje que explique por qué.
 */
const SOLO_BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function limpiar(base64: string | undefined): string | undefined {
  if (base64 === undefined) return undefined;

  const sinPrefijo = base64.replace(/^data:[^;]*;base64,/, '');
  const sinEspacios = sinPrefijo.replace(/\s/g, '');

  if (sinEspacios === '' || !SOLO_BASE64.test(sinEspacios)) return undefined;

  return sinEspacios;
}

export function extraerPdfEnBase64(cuerpo: unknown): string | undefined {
  let dato: unknown = cuerpo;

  if (typeof dato === 'string') {
    // Puede venir como el base64 pelado o como el JSON del sobre sin parsear.
    const recortado = dato.trim();
    if (recortado.startsWith('{') || recortado.startsWith('[')) {
      try {
        dato = JSON.parse(recortado) as unknown;
      } catch {
        return undefined;
      }
    } else {
      return limpiar(recortado);
    }
  }

  const sobre = objeto(dato);
  if (sobre === undefined) return undefined;

  const contenido = sobre.Value ?? sobre.value;

  const directo = comoTexto(contenido);
  if (directo !== undefined) return limpiar(directo);

  const interno = objeto(contenido);
  if (interno === undefined) return undefined;

  const anidado = objeto(
    interno.AccountStatementPdf ?? interno.accountStatementPdf,
  );
  if (anidado !== undefined) {
    return limpiar(comoTexto(anidado.StatementPdf ?? anidado.statementPdf));
  }

  return limpiar(
    comoTexto(interno.StatementPdf ?? interno.statementPdf ?? interno.pdf),
  );
}

/**
 * Cómo se llama el archivo que se le entrega al cliente.
 *
 * **Divergencia deliberada con el original.** La app Flutter escribe el número
 * completo del producto en el nombre —`EstadoTarjeta_4023111122220668_7_2026`—
 * y ese nombre viaja a la hoja de compartir del sistema, al almacenamiento del
 * teléfono y a cualquier aplicación a la que el cliente lo mande. Un número de
 * tarjeta completo en un nombre de archivo es un dato de tarjeta fuera del
 * ámbito de la aplicación, así que aquí se escriben **solo los últimos cuatro
 * dígitos**, que es lo que la propia app enseña en pantalla y basta para
 * distinguir un estado de otro.
 *
 * El mes va con cero a la izquierda, que el original tampoco hace: sin él los
 * archivos de un mismo año no se ordenan bien en el gestor de archivos.
 */
export function nombreDelArchivoDeEstado(opciones: {
  tipo: 'cuenta' | 'tarjeta';
  numeroDeProducto: string;
  mes: number;
  anio: number;
}): string {
  const raiz = opciones.tipo === 'cuenta' ? 'EstadoCuenta' : 'EstadoTarjeta';

  // Solo lo que sirve en un nombre de archivo en Android y en iOS.
  const limpio = opciones.numeroDeProducto.replace(/[^A-Za-z0-9]/g, '');
  const identificador = limpio.length > 4 ? limpio.slice(-4) : limpio;

  const mes = String(opciones.mes).padStart(2, '0');

  return `${raiz}_${identificador}_${mes}_${opciones.anio}.pdf`;
}
