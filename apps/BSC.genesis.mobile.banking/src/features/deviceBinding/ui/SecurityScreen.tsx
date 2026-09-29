import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import {
  BscBanner,
  BscCard,
  BscColors,
  BscDetailRow,
  BscIcon,
  BscListRow,
  BscPageHeader,
  BscSheet,
  BscPrimaryButton,
  BscSpacing,
  BscSpinner,
  BscTextStyles,
  fontFamily,
} from '@bsc/design-system';
import { TEXTO_DE_LA_HOJA } from '../../../app/medidasDeLasOchoPantallas';
import NativeBiometric from '../../../specs/NativeBiometric';
import type { DeviceKeySecurity } from '../../../core/security/deviceKey';
import { DeviceBindingState } from '../../../core/security/signingOutcome';
import type { DeviceBindingService } from '../domain/deviceBindingService';
import {
  avisoDeError,
  avisoDeExito,
  presentarAviso,
  type AvisoDeSeguridad,
} from '../domain/avisoDeSeguridad';

import { DeviceEnrollmentSheet } from './DeviceEnrollmentSheet';

/**
 * Perfil → Seguridad.
 *
 * Portada de `security_screen.dart`, con sus medidas literales.
 *
 * **Un interruptor de biometría por sí solo no significa nada.** Si la app se
 * limitara a preguntar «¿huella válida?» y confiar en la respuesta, un
 * dispositivo comprometido la esquivaría respondiendo que sí. Aquí el
 * interruptor **enrola el dispositivo y crea la llave en el hardware**: la
 * biometría pasa a ser lo que desbloquea esa llave, y lo que viaja al banco es
 * una firma que solo ese teléfono puede producir.
 *
 * Es también la pantalla que hace que la oleada 5 exista en un teléfono real:
 * sin enrolamiento no hay llave que el banco reconozca, y toda transferencia
 * cae al código de verificación.
 */

export interface SecurityScreenProps {
  vinculo: DeviceBindingService;
  onBack: () => void;
  onMisDispositivos: () => void;
  onTokenSuave: () => void;
  /** Cada gesto cuenta como actividad para el temporizador de sesión. */
  onActivity?: (() => void) | undefined;
  /**
   * Cambia cada vez que la pantalla recupera el foco, y con ello se vuelve a
   * consultar el estado del dispositivo.
   *
   * Hace falta porque la revocación ocurre en **otra pantalla**: sin esto, el
   * cliente revoca su teléfono en «Mis dispositivos», pulsa atrás y aquí sigue
   * viendo el interruptor encendido y la ficha de la llave. Se recibe como
   * prop, y no con un hook de navegación, para que el componente siga siendo
   * independiente del navegador —se prueba y se previsualiza sin él—.
   */
  recargarEn?: number;
}

export function SecurityScreen({
  vinculo,
  onBack,
  onMisDispositivos,
  onTokenSuave,
  onActivity,
  recargarEn,
}: SecurityScreenProps): React.JSX.Element {
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [estado, setEstado] = useState<DeviceBindingState>(
    DeviceBindingState.NotEnrolled,
  );
  const [seguridad, setSeguridad] = useState<DeviceKeySecurity | null>(null);
  const [hayBiometria, setHayBiometria] = useState(false);
  const [hayRostro, setHayRostro] = useState(false);
  const [enrolando, setEnrolando] = useState(false);
  const [confirmandoApagado, setConfirmandoApagado] = useState(false);
  const [aviso, setAviso] = useState<AvisoDeSeguridad | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    /*
      Si una sonda falla, la pantalla muestra el estado más conservador en vez
      de quedarse cargando para siempre. Un indicador eterno es peor que una
      función deshabilitada: el cliente no sabe si esperar o si algo se rompió.
    */
    let siguiente: DeviceBindingState = DeviceBindingState.Unsupported;
    let detalle: DeviceKeySecurity | null = null;
    let disponible = false;
    let rostro = false;

    try {
      siguiente = await vinculo.estado();
      detalle = await vinculo.seguridadDeLlave();
      disponible = await NativeBiometric.isAvailable();
      rostro = disponible && (await NativeBiometric.hasFaceUnlock());
    } catch {
      // Se queda con los valores conservadores.
    }

    setEstado(siguiente);
    setSeguridad(detalle);
    setHayBiometria(disponible);
    setHayRostro(rostro);
    setCargando(false);
  }, [vinculo]);

  useEffect(() => {
    void cargar();
    // `recargarEn` entra a propósito: es la señal de que la pantalla volvió a
    // tener el foco y el estado pudo cambiar en otra pantalla.
  }, [cargar, recargarEn]);

  const nombreBiometrico = hayRostro ? 'Face ID' : 'tu huella';

  const activar = async (): Promise<void> => {
    onActivity?.();
    setOcupado(true);
    setAviso(null);

    const inicio = await vinculo.iniciarEnrolamiento();
    setOcupado(false);

    if (!inicio.exito) {
      setAviso(avisoDeError(inicio.mensaje));
      return;
    }

    setEnrolando(true);
  };

  const desactivar = async (): Promise<void> => {
    onActivity?.();
    setConfirmandoApagado(false);
    setOcupado(true);

    // Se revoca en el banco y se borra la llave local. Dejar una sin la otra
    // haría que la app crea que puede firmar cuando el banco ya no la acepta.
    const resultado = await vinculo.revocarEsteDispositivo();

    setOcupado(false);
    setAviso(
      resultado.exito
        ? avisoDeExito('Firma desactivada en este dispositivo.')
        : avisoDeError(resultado.mensaje),
    );
    await cargar();
  };

  const banda = aviso === null ? null : presentarAviso(aviso);
  const listo = estado === DeviceBindingState.Ready;
  const sinSoporte = estado === DeviceBindingState.Unsupported;

  return (
    <View style={estilosDeSeguridad.pantalla}>
      <BscPageHeader
        title="Seguridad"
        subtitle="Cómo autorizas tus operaciones"
        onBack={onBack}
        testID="cabecera-seguridad"
      />

      {cargando ? (
        <View style={estilosDeSeguridad.centro}>
          <BscSpinner />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={estilosDeSeguridad.contenido}
          onScrollBeginDrag={onActivity}
        >
          <BscCard testID="tarjeta-firma">
            <View style={estilosDeSeguridad.filaInterruptor}>
              <View style={estilosDeSeguridad.textoInterruptor}>
                <Text style={estilosDeSeguridad.tituloTarjeta}>
                  {`Autorizar con ${nombreBiometrico}`}
                </Text>
                <View style={estilosDeSeguridad.separacionDos} />
                <Text style={estilosDeSeguridad.subtituloTarjeta}>
                  {subtituloDe(estado)}
                </Text>
              </View>

              {ocupado ? (
                <BscSpinner
                  tamano="inRow"
                  style={estilosDeSeguridad.indicadorInterruptor}
                />
              ) : (
                <Switch
                  value={listo}
                  disabled={sinSoporte || !hayBiometria}
                  onValueChange={valor => {
                    if (valor) void activar();
                    else setConfirmandoApagado(true);
                  }}
                  trackColor={{
                    false: BscColors.divider,
                    true: BscColors.primarySoft,
                  }}
                  thumbColor={
                    listo ? BscColors.primary : BscColors.textTertiary
                  }
                  testID="interruptor-firma"
                />
              )}
            </View>

            {listo && seguridad !== null ? (
              <>
                <View style={estilosDeSeguridad.separacionMedia} />
                {/*
                  A todo el ancho, como el original: `security_screen.dart`
                  escribe `Divider(height: 1)` pelado, no `BscRowDivider`, que
                  sangra 16 a cada lado para separar filas de una lista.
                */}
                <View style={estilosDeSeguridad.separadorDeBloque} />
                <View style={estilosDeSeguridad.separacionPequena} />
                <DetalleDeSeguridad seguridad={seguridad} />
              </>
            ) : null}

            {estado === DeviceBindingState.KeyLost ? (
              <>
                <View style={estilosDeSeguridad.separacionMedia} />
                <BscBanner
                  tone="warning"
                  icon="key-off"
                  title="La llave dejó de ser válida"
                  subtitle={
                    'Suele pasar cuando cambia la biometría del teléfono. ' +
                    'Vuelve a activarla para seguir autorizando sin código.'
                  }
                />
              </>
            ) : null}

            {sinSoporte ? (
              <>
                <View style={estilosDeSeguridad.separacionMedia} />
                <BscBanner
                  tone="neutral"
                  icon="info"
                  title="No disponible en este teléfono"
                  subtitle={
                    'Seguirás autorizando con tu código de verificación, que es ' +
                    'igual de válido.'
                  }
                />
              </>
            ) : null}
          </BscCard>

          {banda !== null ? (
            <>
              <View style={estilosDeSeguridad.separacionMedia} />
              <BscBanner
                tone={banda.tono}
                icon={banda.icono}
                title={banda.titulo}
                subtitle={banda.subtitulo}
                testID="aviso-seguridad"
              />
            </>
          ) : null}

          <View style={estilosDeSeguridad.separacionMedia} />

          <BscCard style={estilosDeSeguridad.tarjetaSinRelleno}>
            <BscListRow
              leading={
                <BscIcon name="devices" size={24} color={BscColors.primary} />
              }
              title="Mis dispositivos"
              subtitle="Revisa y revoca los teléfonos autorizados"
              onPress={() => {
                onActivity?.();
                onMisDispositivos();
              }}
              /*
                Sin chevron, como el original: `security_screen.dart` llama a
                `BscListRow` sin `showChevron`, cuyo valor por defecto es falso.
                Se comprobó comparando las dos aplicaciones en el mismo teléfono
                — el porte lo dibujaba y la app Flutter no.
              */
              testID="fila-mis-dispositivos"
            />
          </BscCard>

          <View style={estilosDeSeguridad.separacionMedia} />

          <BscCard style={estilosDeSeguridad.tarjetaSinRelleno}>
            <BscListRow
              leading={
                <BscIcon name="password" size={24} color={BscColors.primary} />
              }
              title="Token para otros canales"
              subtitle="Genera un código para operar por la web"
              onPress={() => {
                onActivity?.();
                onTokenSuave();
              }}
              testID="fila-token-suave"
            />
          </BscCard>

          <View style={estilosDeSeguridad.separacionGrande} />

          <BscBanner
            tone="neutral"
            icon="shield-check"
            title="Cómo funciona"
            subtitle={
              'La llave de firma se crea dentro del chip de seguridad de tu ' +
              'teléfono y no puede salir de ahí. El banco solo guarda la parte ' +
              'pública, así que nadie más puede autorizar en tu nombre.'
            }
          />
        </ScrollView>
      )}

      <DeviceEnrollmentSheet
        visible={enrolando}
        vinculo={vinculo}
        onClose={() => setEnrolando(false)}
        onCompletado={mensaje => {
          setEnrolando(false);
          setAviso(null);
          void cargar();
          setAviso(avisoDeExito(mensaje));
        }}
      />

      <BscSheet
        visible={confirmandoApagado}
        title="Desactivar la firma en este dispositivo"
        onClose={() => setConfirmandoApagado(false)}
        footnote="Podrás volver a activarla cuando quieras."
        footer={
          <BscPrimaryButton
            label="Desactivar"
            onPress={() => void desactivar()}
            testID="confirmar-desactivar"
          />
        }
      >
        <Text style={estilosDeSeguridad.textoHoja}>
          Borraremos la llave de seguridad de este teléfono y volverás a
          autorizar tus operaciones con un código de verificación.
        </Text>
      </BscSheet>
    </View>
  );
}

/** Los tres «no» del estado llevan a sitios distintos y se nombran distinto. */
function subtituloDe(estado: DeviceBindingState): string {
  switch (estado) {
    case DeviceBindingState.Ready:
      return 'Tus operaciones del día a día no piden código';
    case DeviceBindingState.NotEnrolled:
      return 'Registra este dispositivo para autorizar sin código';
    case DeviceBindingState.KeyLost:
      return 'Necesita volver a registrarse';
    case DeviceBindingState.Unsupported:
      return 'Este teléfono no puede proteger la llave';
    default:
      return '';
  }
}

/**
 * Dónde vive la llave.
 *
 * Se le enseña al cliente porque **no todas las garantías son iguales** y tiene
 * derecho a saber cuál le da su teléfono: un elemento seguro dedicado y una
 * llave en software protegen de cosas muy distintas.
 */
function DetalleDeSeguridad({
  seguridad,
}: {
  seguridad: DeviceKeySecurity;
}): React.JSX.Element {
  return (
    <View testID="detalle-de-la-llave">
      <BscDetailRow
        label="Llave protegida por"
        value={etiquetaDeRespaldo(seguridad)}
      />
      <BscDetailRow
        label="Exige tu verificación"
        value={seguridad.userAuthenticationRequired === true ? 'Sí' : 'No'}
      />
      <BscDetailRow
        label="Se invalida si cambia la biometría"
        value={
          seguridad.invalidatedByBiometricEnrollment === true ? 'Sí' : 'No'
        }
      />
    </View>
  );
}

export function etiquetaDeRespaldo(seguridad: DeviceKeySecurity): string {
  switch (seguridad.backing) {
    case 'strongbox':
      return 'Elemento seguro dedicado (StrongBox)';
    case 'tee':
      return 'Entorno de ejecución seguro';
    case 'hardware':
      return 'Hardware del dispositivo';
    case 'software':
      return 'Software';
    default:
      return 'No determinado';
  }
}

export const estilosDeSeguridad = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: {
    padding: BscSpacing.gutter,
  },
  filaInterruptor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoInterruptor: {
    flex: 1,
  },
  indicadorInterruptor: {
    width: 24,
    height: 24,
  },
  // `titleMedium` del original.
  tituloTarjeta: {
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },
  // 12.5 literal del widget Dart, no un token: el original lo escribe a mano.
  subtituloTarjeta: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  // El original no le pone tamaño: hereda `bodyMedium` del tema, que es 13.5
  // con interlínea 1.45. Un 14 a pelo se parece mucho y no es lo mismo.
  textoHoja: {
    fontFamily,
    fontSize: TEXTO_DE_LA_HOJA.tamano,
    lineHeight: TEXTO_DE_LA_HOJA.interlinea,
    color: BscColors.textSecondary,
  },
  separadorDeBloque: {
    height: 1,
    backgroundColor: BscColors.divider,
  },
  // Las filas que llevan a otra pantalla traen su propio relleno, igual que en
  // el original, donde la tarjeta se declara con `padding: EdgeInsets.zero`.
  tarjetaSinRelleno: {
    padding: 0,
  },
  separacionDos: { height: 2 },
  separacionPequena: { height: BscSpacing.sm },
  separacionMedia: { height: BscSpacing.md },
  separacionGrande: { height: BscSpacing.lg },
});
