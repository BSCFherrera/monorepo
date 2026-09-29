//
//  AutentikarBridgeViewController.swift
//  AppConversacionalBSC
//
//  Verificación de identidad (Autentikar): cédula dominicana + rostro. Puerto a iOS del mismo
//  flujo nativo que ya existe en Android (RNAutentikarBridgeModule.kt). El alias se lee del
//  mismo AUTENTIKAR_ALIAS del .env raíz vía react-native-config (RNCConfig, generado
//  automáticamente por su propio script_phase de CocoaPods) -no se duplica el valor a mano-,
//  igual que en Android lee BuildConfig.AUTENTIKAR_ALIAS desde el mismo .env.
//

import Foundation
import UIKit
import AutentikarCore
import AutentikarUnifiedID
import FaceTecSDK

@objc protocol AutentikarBridgeProtocol: NSObjectProtocol {
  @objc func onResult(_ result: Bool)
}

@objc(AutentikarBridgeViewController)
class AutentikarBridgeViewController: UIViewController {
  @objc weak var delegate: AutentikarBridgeProtocol?

  private var dictionary: [String: String]

  @objc init(dictionary: [String: String]) {
    self.dictionary = dictionary

    AutentikarManager.shared.register(for: AutentikarUnifiedIDManager.shared.setProtocol(.faceFaceTec))
    AutentikarManager.shared.register(for: AutentikarUnifiedIDManager.shared.setProtocol(.faceTecCardID))

    super.init(nibName: nil, bundle: nil)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func viewDidLoad() {
    super.viewDidLoad()

    guard let link = dictionary["link"], !link.isEmpty else {
      delegate?.onResult(false)
      return
    }

    // Mismo AUTENTIKAR_ALIAS del .env raíz que usa Android; "bancosantacruz" queda solo como
    // último respaldo si RNCConfig no pudo leer el .env (no debería pasar en un build normal).
    AutentikarConfiguration.shared.alias = RNCConfig.env(for: "AUTENTIKAR_ALIAS") ?? "bancosantacruz"
    AutentikarConfiguration.shared.stage = .sandbox

    DispatchQueue.main.asyncAfter(deadline: .now(), execute: {
      AutentikarManager.shared.start(self, with: link) { }
    })
  }
}

extension AutentikarBridgeViewController: AutentikarCoreDelegate {

  func failed() {
    self.delegate?.onResult(false)
  }

  func success() {
    self.delegate?.onResult(true)
  }
}
