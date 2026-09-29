/**
 * Módulos nativos que esta app declara pero **no enlaza**.
 *
 * Las apps móviles del monorepo declaran las mismas dependencias en la misma
 * versión (catálogo de `pnpm-workspace.yaml`, ver
 * `docs/mobile/dependencias-compartidas.md`). Estos módulos los usa la app
 * conversacional; aquí ningún archivo los importa.
 *
 * Declararlos no mete nada en el teléfono, pero el autolinking de React
 * Native compila en la app **todo** módulo nativo declarado: su código Kotlin,
 * Swift y C++, y los permisos de su manifiesto —micrófono, biometría, llavero—
 * se fusionarían en el APK del banco sin haber pasado por el modelo de amenazas
 * (`docs/migration/06-security-threat-model.md`) ni por las reglas de R8.
 * Desactivar su plataforma aquí los deja instalados y fuera del binario.
 *
 * Para usar uno en esta app: quitarlo de la lista, revisar permisos y reglas de
 * `proguard-rules.pro`, `pod install` y probar la compilación de release.
 */
const SOLO_EN_OTRAS_APPS = [
  '@react-native-async-storage/async-storage',
  '@react-native-clipboard/clipboard',
  '@react-native-vector-icons/common',
  '@react-native-vector-icons/feather',
  '@react-native-voice/voice',
  'react-native-biometrics',
  'react-native-blob-util',
  'react-native-config',
  'react-native-device-info',
  'react-native-keychain',
  'react-native-passkey',
  'react-native-pdf',
  'react-native-tts',
];

module.exports = {
  dependencies: Object.fromEntries(
    SOLO_EN_OTRAS_APPS.map(nombre => [nombre, { platforms: { android: null, ios: null } }]),
  ),
};
