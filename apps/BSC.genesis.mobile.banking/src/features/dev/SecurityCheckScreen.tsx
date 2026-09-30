import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BscColors } from '@bsc/design-system';
import { BscSpacing, BscBorderRadius } from '@bsc/design-system';
import { BscTypography } from '@bsc/design-system';
import {
  DeviceKey,
  isStrongBox,
  isHardwareBacked,
  meetsBankingBar,
  type DeviceKeySecurity,
} from '../../core/security/deviceKey';
import { buildSigningPayload } from '../../core/security/signingPayload';

/**
 * Verificación de la firma en hardware, sobre el dispositivo real.
 *
 * Es el criterio de salida de la oleada 0: si la llave del StrongBox no firma
 * con las mismas garantías que en la app Flutter, la migración no procede. Nada
 * de esto se puede comprobar en un emulador ni en las pruebas automáticas,
 * porque depende del chip de seguridad del teléfono.
 *
 * Cada paso escribe su resultado en la bitácora del sistema con la etiqueta
 * `BSC-VERIFY`, para poder leerlo desde la laptop con `adb logcat` y —lo más
 * importante— **verificar la firma fuera del teléfono**, igual que hará el
 * backend en .NET.
 *
 * ⚠️ Pantalla de diagnóstico. No forma parte del producto y no debe llegar a
 * una compilación de release.
 */

/**
 * Reto y huella fijos, para que el resultado sea reproducible y verificable
 * desde la laptop. La huella es la del vector compartido entre los tres
 * canales, la misma que usan las pruebas de `operationFingerprint`.
 */
const NONCE_FIJO = 'YmFuY29zYW50YWNydXpub25jZTAx';
const HUELLA_FIJA =
  'a455a04b5aff0450635bef222eac23bd7932b4add72a55e5452e00352eed01ea';

type Estado = 'ok' | 'fallo' | 'aviso';

interface Paso {
  titulo: string;
  estado: Estado;
  detalle: string;
}

const registrar = (linea: string): void => {
  // eslint-disable-next-line no-console
  console.log(`BSC-VERIFY ${linea}`);
};

function describirSeguridad(seguridad: DeviceKeySecurity): string {
  return [
    `backing=${seguridad.backing ?? 'desconocido'}`,
    `userAuth=${seguridad.userAuthenticationRequired ?? false}`,
    `invalidatedByBiometric=${
      seguridad.invalidatedByBiometricEnrollment ?? false
    }`,
  ].join(' ');
}

export function SecurityCheckScreen(): React.JSX.Element {
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [corriendo, setCorriendo] = useState(false);

  const ejecutar = useCallback(async () => {
    setCorriendo(true);
    const resultados: Paso[] = [];

    const anotar = (titulo: string, estado: Estado, detalle: string) => {
      resultados.push({ titulo, estado, detalle });
      registrar(`${estado.toUpperCase()} | ${titulo} | ${detalle}`);
      setPasos([...resultados]);
    };

    try {
      // 1 — ¿El teléfono puede sostener una llave con verificación de usuario?
      const soportado = await DeviceKey.isSupported();
      anotar(
        'Soporte de llave con verificación de usuario',
        soportado ? 'ok' : 'fallo',
        soportado
          ? 'El dispositivo lo soporta'
          : 'Requiere Android 9 o superior',
      );
      if (!soportado) return;

      // 2 — Partir de cero, para que el resultado no dependa de una corrida
      // anterior.
      await DeviceKey.deleteKey();
      anotar('Llave previa descartada', 'ok', 'Se parte de un estado limpio');

      // 3 — Generar el par dentro del hardware seguro.
      const par = await DeviceKey.createKey();
      const seguridad = par.security;

      anotar(
        'Par de llaves generado',
        'ok',
        `algoritmo=${par.algorithm} ${describirSeguridad(seguridad)}`,
      );

      anotar(
        'La llave vive en hardware',
        isHardwareBacked(seguridad) ? 'ok' : 'fallo',
        isStrongBox(seguridad)
          ? 'StrongBox: elemento seguro dedicado, el nivel más alto'
          : `Respaldo: ${seguridad.backing ?? 'desconocido'}`,
      );

      anotar(
        'Cumple el nivel exigido para banca',
        meetsBankingBar(seguridad) ? 'ok' : 'aviso',
        meetsBankingBar(seguridad)
          ? 'Hardware + verificación obligatoria + invalidación por biometría'
          : 'Falta alguna garantía; este teléfono seguiría pidiendo código',
      );

      // 4 — La llave pública es lo único que sale del teléfono.
      const publica = par.publicKey ?? (await DeviceKey.getPublicKey());
      anotar(
        'Llave pública exportable (SPKI)',
        publica ? 'ok' : 'fallo',
        publica ? `${publica.length} caracteres base64` : 'No se obtuvo',
      );
      if (publica) registrar(`PUBKEY ${publica}`);

      // 5 — Firmar. Aquí el sistema operativo pide rostro o huella.
      const payload = buildSigningPayload(NONCE_FIJO, HUELLA_FIJA);
      registrar(`PAYLOAD ${payload}`);

      const firma = await DeviceKey.signChallenge(NONCE_FIJO, HUELLA_FIJA);
      anotar(
        'Operación firmada con la llave del hardware',
        'ok',
        `firma DER de ${firma.length} caracteres base64`,
      );
      registrar(`SIGNATURE ${firma}`);

      anotar(
        'Verificación completa',
        'ok',
        'Falta comprobar la firma fuera del teléfono, como hará el backend',
      );
    } catch (causa) {
      const error = causa as { code?: string; message?: string };
      anotar(
        'Fallo durante la verificación',
        'fallo',
        `${error.code ?? 'sin-codigo'}: ${error.message ?? 'sin mensaje'}`,
      );
    } finally {
      setCorriendo(false);
      registrar('FIN');
    }
  }, []);

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      testID="security-check-screen"
    >
      <Text style={styles.overline}>DIAGNÓSTICO</Text>
      <Text style={styles.titulo}>Firma en hardware</Text>
      <Text style={styles.cuerpo}>
        Genera una llave en el chip de seguridad del teléfono y firma una
        operación de prueba. El sistema pedirá tu huella o tu rostro.
      </Text>

      <Pressable
        onPress={ejecutar}
        disabled={corriendo}
        style={({ pressed }) => [
          styles.boton,
          (pressed || corriendo) && styles.botonPresionado,
        ]}
        testID="ejecutar-verificacion"
      >
        {corriendo ? (
          <ActivityIndicator color={BscColors.textOnPrimary} />
        ) : (
          <Text style={styles.botonTexto}>Ejecutar verificación</Text>
        )}
      </Pressable>

      {pasos.map((paso, indice) => (
        <View key={`${paso.titulo}-${indice}`} style={styles.fila}>
          <View style={[styles.punto, styles[paso.estado]]} />
          <View style={styles.filaTexto}>
            <Text style={styles.filaTitulo}>{paso.titulo}</Text>
            <Text style={styles.filaDetalle}>{paso.detalle}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    padding: BscSpacing.gutter,
    gap: BscSpacing.sm,
  },
  overline: BscTypography.overline,
  titulo: BscTypography.headlineSmall,
  cuerpo: BscTypography.bodyMedium,
  boton: {
    backgroundColor: BscColors.primary,
    borderRadius: BscBorderRadius.button,
    paddingVertical: BscSpacing.md,
    alignItems: 'center',
    marginVertical: BscSpacing.sm,
  },
  botonPresionado: {
    backgroundColor: BscColors.primaryDark,
  },
  botonTexto: {
    ...BscTypography.labelLarge,
    color: BscColors.textOnPrimary,
  },
  fila: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
    backgroundColor: BscColors.surface,
    borderRadius: BscBorderRadius.card,
    padding: BscSpacing.md,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  ok: { backgroundColor: BscColors.success },
  fallo: { backgroundColor: BscColors.error },
  aviso: { backgroundColor: BscColors.warning },
  filaTexto: {
    flex: 1,
    gap: 2,
  },
  filaTitulo: BscTypography.titleSmall,
  filaDetalle: BscTypography.bodySmall,
});
