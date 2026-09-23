import UIKit

/**
 * Entrega al teléfono el PDF de un estado de cuenta.
 *
 * Contraparte de `StatementFileModule.kt`, con las mismas decisiones:
 *
 *  - El archivo va al directorio **temporal**, no a Documentos: si el cliente
 *    lo quiere conservar, lo guarda él desde la hoja de compartir.
 *  - **Antes de escribir se borra lo anterior**: no se acumula un histórico de
 *    estados de cuenta en el teléfono.
 *  - El nombre se recorta a su último segmento, para no escribir fuera de la
 *    carpeta prevista.
 *  - Protección de archivo completa: el PDF no se lee con el teléfono
 *    bloqueado.
 */
@objc(BscStatementFile)
public final class BscStatementFile: NSObject {
  private static let carpeta = "estados"

  @objc public static func guardarYCompartir(
    _ pdfEnBase64: String,
    nombreDeArchivo: String,
    resolver: @escaping BscResolver,
    rechazar: @escaping BscRechazo
  ) {
    guard let bytes = Data(base64Encoded: pdfEnBase64, options: .ignoreUnknownCharacters) else {
      return rechazar("pdf_invalido", "El documento recibido no es válido")
    }
    guard !bytes.isEmpty else {
      return rechazar("pdf_invalido", "El documento recibido está vacío")
    }

    let directorio = FileManager.default.temporaryDirectory.appendingPathComponent(carpeta, isDirectory: true)
    let nombre = nombreDeArchivo
      .split(separator: "/").last.map(String.init)?
      .split(separator: "\\").last.map(String.init) ?? "estado-de-cuenta.pdf"
    let archivo = directorio.appendingPathComponent(nombre.isEmpty ? "estado-de-cuenta.pdf" : nombre)

    do {
      try? FileManager.default.removeItem(at: directorio)
      try FileManager.default.createDirectory(at: directorio, withIntermediateDirectories: true)
      try bytes.write(to: archivo, options: [.atomic, .completeFileProtection])
    } catch {
      return rechazar("descarga_fallida", error.localizedDescription)
    }

    DispatchQueue.main.async {
      guard let controlador = Pantalla.controladorVisible() else {
        return rechazar("sin_actividad", "No hay una pantalla sobre la que compartir")
      }
      let hoja = UIActivityViewController(activityItems: [archivo], applicationActivities: nil)
      // En iPad la hoja es un popover y necesita un ancla, o la app se cierra.
      if let popover = hoja.popoverPresentationController {
        popover.sourceView = controlador.view
        popover.sourceRect = CGRect(x: controlador.view.bounds.midX, y: controlador.view.bounds.midY, width: 0, height: 0)
        popover.permittedArrowDirections = []
      }
      controlador.present(hoja, animated: true)
      resolver(nil)
    }
  }
}
