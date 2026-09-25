import NativeStatementFile from '../../specs/NativeStatementFile';

/**
 * Entrega de un PDF al teléfono.
 *
 * Envuelve el módulo nativo `StatementFile` para que la pantalla no dependa de
 * él directamente: en la vista previa del navegador el registro de módulos
 * nativos devuelve un objeto vacío, y en iOS el módulo todavía no existe
 * (P-13). En los dos casos hay que decírselo al cliente en vez de caer con un
 * error de plataforma en medio de una descarga.
 */

export interface EntregaDePdf {
  /** Escribe el documento y abre la hoja de compartir del sistema. */
  guardarYCompartir(
    pdfEnBase64: string,
    nombreDeArchivo: string,
  ): Promise<void>;
}

/** Si la plataforma actual sabe entregar un PDF. */
export function hayEntregaDePdf(): boolean {
  return typeof NativeStatementFile?.guardarYCompartir === 'function';
}

export const entregaDePdf: EntregaDePdf = {
  async guardarYCompartir(
    pdfEnBase64: string,
    nombreDeArchivo: string,
  ): Promise<void> {
    if (!hayEntregaDePdf()) {
      throw new Error(
        'La descarga de estados de cuenta solo está disponible en el teléfono.',
      );
    }

    await NativeStatementFile!.guardarYCompartir(pdfEnBase64, nombreDeArchivo);
  },
};
