#!/bin/sh
#
# La versión de iOS sale de `package.json`, igual que la de Android.
#
# Contraparte de `leerVersionDelPaquete` y `codigoDeVersion` en
# `android/app/build.gradle`: una sola fuente, para que la app no diga una
# versión en el perfil y otra en la tienda (el defecto que ya pasó en Android).
#
#  - CFBundleShortVersionString = "version" de package.json (p. ej. 0.1.0)
#  - CFBundleVersion = mayor × 10000 + menor × 100 + parche (0.1.0 → 100),
#    el mismo número que el versionCode de Android.
#
# Se escribe sobre el Info.plist **ya procesado** del producto, no sobre el
# fuente: `MARKETING_VERSION` y `CURRENT_PROJECT_VERSION` del proyecto de Xcode
# quedan sin efecto. Xcode procesa el Info.plist al final, después de las
# fases de script; por eso la fase declara ese archivo como entrada, que es lo
# que la obliga a correr después de él (y antes de la firma).
#
# Si no se puede leer la versión, la compilación falla: una versión inventada
# es peor que una compilación rota.
set -eu

PAQUETE="${SRCROOT}/../package.json"
PLIST="${TARGET_BUILD_DIR}/${INFOPLIST_PATH}"

VERSION=$(/usr/bin/plutil -extract version raw -o - "$PAQUETE")
if [ -z "$VERSION" ]; then
  echo "error: package.json no tiene \"version\"" >&2
  exit 1
fi

# Los tres primeros números; lo que siga a un guion (1.2.3-rc.1) no cuenta.
NUCLEO=${VERSION%%-*}
MAYOR=$(echo "$NUCLEO" | cut -d. -f1)
MENOR=$(echo "$NUCLEO" | cut -d. -f2)
PARCHE=$(echo "$NUCLEO" | cut -d. -f3)
COMPILACION=$(( ${MAYOR:-0} * 10000 + ${MENOR:-0} * 100 + ${PARCHE:-0} ))

/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $COMPILACION" "$PLIST"

echo "Versión $VERSION ($COMPILACION), de package.json"

# La salida declarada de la fase: sin ella, Xcode la correría en cada compilación.
if [ -n "${SCRIPT_OUTPUT_FILE_0:-}" ]; then
  touch "$SCRIPT_OUTPUT_FILE_0"
fi
