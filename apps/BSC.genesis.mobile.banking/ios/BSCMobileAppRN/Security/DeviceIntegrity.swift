import Darwin
import Foundation
import MachO

/**
 * Integridad del dispositivo.
 *
 * Contraparte de `DeviceIntegrityModule.kt`. Son comprobaciones baratas y
 * conocidas de jailbreak; ninguna es infalible y ninguna pretende serlo.
 *
 * ⚠️ **Una señal, no una garantía**: un atacante con el teléfono liberado
 * parchea la app o devuelve `false` desde aquí mismo. Atrapa el caso honesto y
 * deja constancia del resto. La protección real es que la llave de firma no
 * sale del Secure Enclave.
 */
@objc(BscDeviceIntegrity)
public final class BscDeviceIntegrity: NSObject {
  /**
   * La URL del backend inyectada en la compilación (D-18).
   *
   * `Info.plist` la toma de la variable de compilación `BSC_BASE_URL`, que
   * Xcode recibe del entorno igual que Gradle. **Vacía si no se inyectó**: una
   * release mal configurada tiene que fallar, no adivinar.
   */
  @objc public static func baseUrl() -> String {
    let valor = Bundle.main.object(forInfoDictionaryKey: "BSCBaseURL") as? String ?? ""
    return valor.contains("$(") ? "" : valor
  }

  /** Nunca lanza: una sonda que falla no es una acusación. */
  @objc public static func isDeviceCompromised(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    #if targetEnvironment(simulator)
      resolver(false)
    #else
      resolver(tieneArchivosDeJailbreak() || puedeEscribirFueraDelSandbox() || tieneBibliotecasInyectadas())
    #endif
  }

  /** Si un depurador sigue al proceso (`P_TRACED`). */
  @objc public static func isDebuggerAttached(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    var info = kinfo_proc()
    var tamano = MemoryLayout<kinfo_proc>.stride
    var nombre: [Int32] = [CTL_KERN, KERN_PROC, KERN_PROC_PID, getpid()]
    let estado = sysctl(&nombre, u_int(nombre.count), &info, &tamano, nil, 0)
    resolver(estado == 0 && (info.kp_proc.p_flag & P_TRACED) != 0)
  }

  /** El identificador real del paquete instalado, leído del sistema. */
  @objc public static func getPackageName(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    guard let id = Bundle.main.bundleIdentifier else {
      return rechazar("package_name_failed", "No se pudo leer el identificador del paquete")
    }
    resolver(id)
  }

  /** La versión que declara el paquete instalado (`CFBundleShortVersionString`). */
  @objc public static func getAppVersion(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    resolver(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")
  }

  /** El número de compilación (`CFBundleVersion`). */
  @objc public static func getAppBuild(_ resolver: @escaping BscResolver, rechazar: @escaping BscRechazo) {
    resolver(Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "")
  }

  // ─── Sondas ──────────────────────────────────────────────────────────────

  /**
   * Lo que dejan instalado las herramientas de jailbreak, incluidas las
   * «rootless» (`/var/jb`) de iOS 15 en adelante.
   *
   * No se consultan esquemas de URL (`cydia://`): exigiría declararlos en
   * `Info.plist`, y esa lista le diría al atacante exactamente qué se busca.
   */
  private static let rutas = [
    "/Applications/Cydia.app",
    "/Applications/Sileo.app",
    "/Applications/Zebra.app",
    "/Library/MobileSubstrate/MobileSubstrate.dylib",
    "/usr/sbin/sshd",
    "/usr/bin/ssh",
    "/bin/bash",
    "/etc/apt",
    "/private/var/lib/apt",
    "/var/jb",
    "/var/binpack",
    "/usr/lib/libjailbreak.dylib",
  ]

  private static func tieneArchivosDeJailbreak() -> Bool {
    rutas.contains { FileManager.default.fileExists(atPath: $0) }
  }

  /** En un iPhone sano, la app no puede escribir fuera de su contenedor. */
  private static func puedeEscribirFueraDelSandbox() -> Bool {
    let ruta = "/private/bsc_integridad_\(UUID().uuidString)"
    do {
      try "x".write(toFile: ruta, atomically: false, encoding: .utf8)
      try? FileManager.default.removeItem(atPath: ruta)
      return true
    } catch {
      return false
    }
  }

  /** Bibliotecas de inyección de código que un jailbreak carga en cada app. */
  private static let bibliotecas = ["MobileSubstrate", "SubstrateLoader", "libhooker", "TweakInject", "ellekit", "substitute"]

  private static func tieneBibliotecasInyectadas() -> Bool {
    for indice in 0..<_dyld_image_count() {
      guard let nombre = _dyld_get_image_name(indice) else { continue }
      let texto = String(cString: nombre)
      if bibliotecas.contains(where: { texto.localizedCaseInsensitiveContains($0) }) { return true }
    }
    return false
  }
}
