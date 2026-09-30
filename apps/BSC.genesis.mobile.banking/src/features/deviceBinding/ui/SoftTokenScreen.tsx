import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { codigoTotp, PERIODO_TOTP, segundosRestantes } from '@bsc/shared';

import {
  BscBanner,
  BscCard,
  BscColors,
  BscIcon,
  BscMeterBar,
  BscPageHeader,
  BscPrimaryButton,
  BscRadius,
  BscSecondaryButton,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';
import type { SecureStorage } from '../../../core/security/secureStorage';
import { t } from '@bsc/i18n';

import NativeBiometric from '../../../specs/NativeBiometric';
import NativeSecureScreen from '../../../specs/NativeSecureScreen';
import { Registro } from '../../../core/observability/registro';
import type { TwoFactorRepository } from '../../twoFactor/data/twoFactorRepository';

/**
 * Token para operar por la web u otros canales.
 *
 * Portada de `soft_token_screen.dart`, con sus tres decisiones de seguridad,
 * que no son evidentes y conviene no perder al portar:
 *
 * 1. **Exige biometría para revelar el código**, aunque la sesión esté abierta.
 *    Un código visible con solo abrir la pantalla es un segundo factor que
 *    cualquiera con el teléfono desbloqueado puede leer.
 * 2. **Bloquea capturas** mientras está visible. Sin `FLAG_SECURE`, el código
 *    queda en la galería y en la vista previa del conmutador de aplicaciones.
 * 3. **Se oculta solo** al cabo de un minuto. Una pantalla olvidada encima de
 *    la mesa deja de ser un secreto.
 *
 * El secreto es **uno por cliente, no por dispositivo**: es lo que permite que
 * el mismo código sirva en la banca en línea. Y es el mismo con el que el banco
 * genera el código que envía por SMS, razón por la cual **la app no acepta este
 * token para sus propias transacciones** —sería pedirse permiso a sí misma—:
 * las operaciones de la app van por la firma del dispositivo.
 *
 * ⚠️ **Hoy esta pantalla no puede mostrar un código, y tampoco podía en el
 * original.** El backend no entrega el secreto: ver `provisionarTokenSuave`.
 * El camino que el cliente recorre es el de «No pudimos preparar tu token».
 * Está escalado al banco y anotado en el traspaso.
 */

/** Cuánto se muestra el código antes de ocultarse solo. */
const VISIBLE_DURANTE = 60;

/**
 * Cuántas veces se ha montado esta pantalla en la vida del proceso.
 *
 * ── Instrumentación de V-05, y por qué está aquí ──────────────────────────
 *
 * En el Pixel, **al cancelar el diálogo biométrico el aviso «No pudimos
 * verificarte» no aparece**. Lo que se sabe: el botón vuelve a habilitarse, así
 * que la promesa de `authenticate` sí se resuelve y `setOcupado(false)` corre.
 * Lo que no aparece es la banda, y el mismo patrón sí funciona en la pantalla
 * de Seguridad, que no abre ningún diálogo del sistema.
 *
 * La hipótesis es que `BiometricPrompt` provoca un remontaje que limpia el
 * estado. **No está confirmada**: `always_finish_activities` está en 0 y el
 * gestor de sesión no remonta nada.
 *
 * Este contador lo resuelve en una sola pasada: vive fuera del componente, así
 * que **sobrevive a un remontaje**. Si en la bitácora aparecen dos montajes
 * alrededor del diálogo, la hipótesis es cierta y la corrección es conservar el
 * aviso fuera del estado del componente. Si solo aparece uno, el problema está
 * en el propio flujo y hay que mirar el orden de los `setState`.
 *
 * Se lee en el teléfono sin depurador:
 *
 *     adb logcat -s ReactNativeJS:V | findstr token-suave
 */
let montajes = 0;

/**
 * Activa o levanta el bloqueo de capturas, sin propagar el fallo.
 *
 * El módulo puede no estar —en la vista previa del navegador y en las pruebas
 * no existe— y una llamada a `undefined` dentro de un efecto **tumba la
 * pantalla entera**: el cliente vería un lienzo en blanco donde esperaba su
 * token. La protección se pierde en esos entornos, que es lo correcto, pero la
 * pantalla sigue de pie. En el teléfono, que es donde importa, el módulo está
 * registrado y esto no cambia nada.
 */
async function bloquearCapturas(activo: boolean): Promise<void> {
  try {
    await NativeSecureScreen.setSecure(activo);
  } catch {
    // Sin el módulo la pantalla funciona igual; se pierde el bloqueo.
  }
}

export interface SoftTokenScreenProps {
  segundoFactor: TwoFactorRepository;
  almacenamiento: SecureStorage;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
  /** Reloj inyectable, para poder probar el conteo sin esperar un minuto. */
  ahora?: (() => number) | undefined;
}

export function SoftTokenScreen({
  segundoFactor,
  almacenamiento,
  onBack,
  onActivity,
  ahora = Date.now,
}: SoftTokenScreenProps): React.JSX.Element {
  const [revelado, setRevelado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [restantes, setRestantes] = useState(PERIODO_TOTP);
  const [visibles, setVisibles] = useState(VISIBLE_DURANTE);

  const secreto = useRef<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  const detener = useCallback((): void => {
    if (temporizador.current !== null) {
      clearInterval(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  const ocultar = useCallback((): void => {
    detener();
    secreto.current = null;
    setRevelado(false);
    setCodigo('');
  }, [detener]);

  /*
    El bloqueo de capturas cubre toda la pantalla y no solo el recuadro del
    código: el conmutador de aplicaciones captura la ventana entera. Se levanta
    al salir para no impedirle al cliente capturar un comprobante legítimo en
    otra pantalla, que es algo que la gente hace.
  */
  useEffect(() => {
    montajes += 1;
    Registro.debug('token-suave: montada', { montaje: montajes });

    void bloquearCapturas(true);

    return () => {
      Registro.debug('token-suave: desmontada', { montaje: montajes });
      void bloquearCapturas(false);
      detener();
    };
  }, [detener]);

  const refrescarCodigo = useCallback((): void => {
    const actual = secreto.current;
    if (actual === null) return;

    const instante = ahora();
    setCodigo(codigoTotp(actual, instante) ?? '');
    setRestantes(segundosRestantes(instante));
  }, [ahora]);

  const revelar = async (): Promise<void> => {
    onActivity?.();
    setOcupado(true);
    setError(null);

    // La verificación va primero, antes de tocar el secreto.
    let verificado = false;
    Registro.debug('token-suave: se abre el diálogo biométrico', {
      montaje: montajes,
    });

    try {
      verificado = await NativeBiometric.authenticate(
        'Verifícate para ver tu token',
        t('common:biometria.titulo'),
        t('common:biometria.cancelar'),
      );
    } catch {
      verificado = false;
    }

    Registro.debug('token-suave: el diálogo respondió', {
      verificado,
      montaje: montajes,
    });

    if (!verificado) {
      setOcupado(false);
      setError('No pudimos verificarte. El token no se muestra.');
      // Si este mensaje sale en la bitácora y la banda no aparece en pantalla,
      // el estado se perdió después de escribirlo: es el remontaje.
      Registro.debug('token-suave: aviso de verificación fallida escrito', {
        montaje: montajes,
      });
      return;
    }

    // El secreto se pide al banco una sola vez y queda guardado; desde
    // entonces el código se calcula en el teléfono, sin red.
    let guardado = await almacenamiento.getSoftTokenSecret();

    if (guardado === null || guardado === '') {
      guardado = await segundoFactor.provisionarTokenSuave();
      if (guardado !== null && guardado !== '') {
        await almacenamiento.saveSoftTokenSecret(guardado);
      }
    }

    if (guardado === null || guardado === '') {
      setOcupado(false);
      setError('No pudimos preparar tu token. Intenta más tarde.');
      return;
    }

    secreto.current = guardado;
    setOcupado(false);
    setRevelado(true);
    setVisibles(VISIBLE_DURANTE);
    refrescarCodigo();
  };

  useEffect(() => {
    if (!revelado) return undefined;

    temporizador.current = setInterval(() => {
      refrescarCodigo();
      setVisibles(quedan => {
        if (quedan <= 1) {
          // Se oculta solo: una pantalla olvidada deja de ser un secreto.
          ocultar();
          return VISIBLE_DURANTE;
        }
        return quedan - 1;
      });
    }, 1000);

    return detener;
  }, [revelado, refrescarCodigo, ocultar, detener]);

  return (
    <View style={styles.pantalla}>
      <BscPageHeader
        title="Token para otros canales"
        subtitle="Para operar por la web"
        onBack={onBack}
        testID="cabecera-token-suave"
      />

      <ScrollView
        contentContainerStyle={styles.contenido}
        onScrollBeginDrag={onActivity}
      >
        {revelado ? (
          <CodigoVisible
            codigo={codigo}
            restantes={restantes}
            visibles={visibles}
            onOcultar={ocultar}
          />
        ) : (
          <TokenBloqueado
            ocupado={ocupado}
            error={error}
            onRevelar={() => void revelar()}
          />
        )}

        <View style={styles.separacionMedia} />

        <BscBanner
          tone="neutral"
          icon="info"
          title="Cuándo usarlo"
          subtitle={
            'Este código sirve para operar en la banca en línea u otros canales. ' +
            'Las operaciones de esta app se autorizan con tu rostro o huella, sin ' +
            'necesidad de escribirlo. El banco nunca te pedirá este código por ' +
            'teléfono, correo ni mensaje.'
          }
        />
      </ScrollView>
    </View>
  );
}

function TokenBloqueado({
  ocupado,
  error,
  onRevelar,
}: {
  ocupado: boolean;
  error: string | null;
  onRevelar: () => void;
}): React.JSX.Element {
  return (
    <BscCard testID="token-bloqueado">
      <View style={styles.centrado}>
        <View style={styles.separacionPequena} />

        <View style={styles.candado}>
          <BscIcon name="lock" size={30} color={BscColors.primary} />
        </View>

        <View style={styles.separacionMedia} />
        <Text style={styles.titulo}>Tu token está protegido</Text>
        <View style={styles.separacionMinima} />
        <Text style={styles.explicacion}>
          Verifícate con tu rostro o huella para verlo.
        </Text>

        {error !== null ? (
          <>
            <View style={styles.separacionMedia} />
            <BscBanner
              tone="danger"
              icon="error"
              title="No se pudo mostrar"
              subtitle={error}
              testID="error-token"
            />
          </>
        ) : null}

        <View style={styles.separacionGrande} />
        <View style={styles.anchoCompleto}>
          <BscPrimaryButton
            label="Ver mi token"
            loading={ocupado}
            onPress={onRevelar}
            testID="ver-token"
          />
        </View>
      </View>
    </BscCard>
  );
}

function CodigoVisible({
  codigo,
  restantes,
  visibles,
  onOcultar,
}: {
  codigo: string;
  restantes: number;
  visibles: number;
  onOcultar: () => void;
}): React.JSX.Element {
  // El original parte el código en dos grupos de tres para que se pueda leer y
  // teclear sin perder la cuenta.
  const agrupado =
    codigo.length === 6 ? `${codigo.slice(0, 3)} ${codigo.slice(3)}` : codigo;

  return (
    <BscCard testID="token-visible">
      <View style={styles.centrado}>
        <View style={styles.separacionMinima} />

        <Text style={styles.codigo} testID="codigo-token">
          {agrupado}
        </Text>

        <View style={styles.separacionPequena} />
        <View style={styles.anchoCompleto}>
          <BscMeterBar
            label={`Cambia en ${restantes} s`}
            value={restantes / PERIODO_TOTP}
            valueLabel={`${restantes} s`}
            color={restantes <= 5 ? BscColors.warning : BscColors.primary}
          />
        </View>

        <View style={styles.separacionMedia} />
        <Text style={styles.cuentaAtras}>{`Se oculta en ${visibles} s`}</Text>

        <View style={styles.separacionPequena} />
        <View style={styles.anchoCompleto}>
          <BscSecondaryButton
            label="Ocultar ahora"
            onPress={onOcultar}
            testID="ocultar-token"
          />
        </View>
      </View>
    </BscCard>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    padding: BscSpacing.gutter,
  },
  centrado: {
    alignItems: 'center',
  },
  anchoCompleto: {
    alignSelf: 'stretch',
  },
  // 64×64 con radio md, literal del original.
  candado: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.primarySoft,
  },
  // `titleMedium`.
  titulo: {
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },
  explicacion: {
    ...BscTextStyles['Body S/14 Regular'],
    textAlign: 'center',
    color: BscColors.textSecondary,
  },
  // 46 con espaciado 6 y peso 700, literal del original. Las cifras van
  // tabulares para que el número no baile al cambiar de dígito.
  codigo: {
    ...BscTextStyles['Title L/48 Bold'],
    letterSpacing: 6,
    color: BscColors.primary,
    fontVariant: ['tabular-nums'],
  },
  cuentaAtras: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },
  separacionMinima: { height: BscSpacing.xs },
  separacionPequena: { height: BscSpacing.sm },
  separacionMedia: { height: BscSpacing.md },
  separacionGrande: { height: BscSpacing.lg },
});
