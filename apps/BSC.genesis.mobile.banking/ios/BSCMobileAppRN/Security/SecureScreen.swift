import UIKit

/**
 * Protección de la pantalla actual frente a miradas ajenas.
 *
 * Contraparte de `SecureScreenModule.kt`. **iOS no tiene `FLAG_SECURE`**: no
 * hay forma admitida de impedir una captura de pantalla. Lo que sí se puede, y
 * es lo que hace este módulo mientras la protección está activa:
 *
 *  - **Tapar la ventana al pasar a segundo plano**, para que la vista previa
 *    del conmutador de apps no muestre un código de verificación.
 *  - **Tapar la ventana mientras se graba o se duplica la pantalla**
 *    (`isCaptured`), que es la forma de fuga más parecida a la que evita
 *    `FLAG_SECURE`.
 *
 * Una captura estática sigue siendo posible, y se registra como diferencia con
 * Android: evitarla exige trucos no documentados sobre capas del sistema que se
 * rompen de una versión de iOS a otra.
 *
 * Se activa por pantalla, como en Android.
 */
@objc(BscSecureScreen)
public final class BscSecureScreen: NSObject {
  private static var activa = false
  private static var cubierta: UIView?
  private static var observadores: [NSObjectProtocol] = []

  @objc public static func setSecure(
    _ segura: Bool, resolver: @escaping BscResolver, rechazar: @escaping BscRechazo
  ) {
    DispatchQueue.main.async {
      activa = segura
      if segura { observar() } else { dejarDeObservar(); destapar() }
      actualizarPorCaptura()
      resolver(nil)
    }
  }

  private static func observar() {
    guard observadores.isEmpty else { return }
    let centro = NotificationCenter.default
    observadores = [
      centro.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main) { _ in
        if activa { tapar() }
      },
      centro.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { _ in
        actualizarPorCaptura()
      },
      centro.addObserver(forName: UIScreen.capturedDidChangeNotification, object: nil, queue: .main) { _ in
        actualizarPorCaptura()
      },
    ]
  }

  private static func dejarDeObservar() {
    observadores.forEach(NotificationCenter.default.removeObserver)
    observadores = []
  }

  private static func actualizarPorCaptura() {
    let capturada = Pantalla.ventana()?.windowScene?.screen.isCaptured ?? false
    if activa && capturada { tapar() } else { destapar() }
  }

  private static func tapar() {
    guard cubierta == nil, let ventana = Pantalla.ventana() else { return }
    let vista = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
    vista.frame = ventana.bounds
    vista.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    ventana.addSubview(vista)
    cubierta = vista
  }

  private static func destapar() {
    cubierta?.removeFromSuperview()
    cubierta = nil
  }
}
