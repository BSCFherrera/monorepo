import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = ReactNativeDelegate.fondoDeArranque

    factory.startReactNative(
      withModuleName: "BSCMobileAppRN",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  /**
   * El promedio de la foto de acceso con su velo (#1A1718), el mismo color de
   * respaldo de LaunchScreen.storyboard y de las pantallas de React Native.
   *
   * Sin él, la vista raíz de React Native es blanca por defecto: entre la
   * pantalla de lanzamiento y el primer dibujo de JavaScript se ve un destello
   * blanco, justo lo que la foto compartida existe para evitar.
   */
  static let fondoDeArranque = UIColor(red: 26 / 255, green: 23 / 255, blue: 24 / 255, alpha: 1)

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    rootView.backgroundColor = ReactNativeDelegate.fondoDeArranque
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
