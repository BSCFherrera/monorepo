import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  BscBanner,
  BscColors,
  BscOtpInput,
  BscPrimaryButton,
  BscSheet,
  BscSpacing,
  BscTextStyles,
} from '@bsc/design-system';
import { exigeVerificacionPresencial } from '../data/deviceContracts';
import type { DeviceBindingService } from '../domain/deviceBindingService';

/**
 * Confirma el enrolamiento con el código que el banco envió.
 *
 * Portada de `device_enrollment_sheet.dart`.
 *
 * **Esta hoja no bloquea capturas de pantalla, y es deliberado.** Los dígitos
 * que se teclean van en casillas visibles, pero el código llega por un canal
 * aparte —correo o mensaje—, así que una captura no le revela a un atacante
 * nada que no tuviera ya. La pantalla del token para otros canales sí las
 * bloquea, porque ahí el secreto está en la pantalla.
 */

export interface DeviceEnrollmentSheetProps {
  visible: boolean;
  vinculo: DeviceBindingService;
  onClose: () => void;
  /** Se llama con el mensaje del banco cuando el dispositivo quedó registrado. */
  onCompletado: (mensaje: string) => void;
}

export function DeviceEnrollmentSheet({
  visible,
  vinculo,
  onClose,
  onCompletado,
}: DeviceEnrollmentSheetProps): React.JSX.Element {
  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avisoPresencial, setAvisoPresencial] = useState<string | null>(null);

  /** Sube con cada código rechazado; borra las casillas para el reintento. */
  const [intentos, setIntentos] = useState(0);

  const enviar = async (valor: string): Promise<void> => {
    if (valor.length !== 6 || ocupado) return;

    setOcupado(true);
    setError(null);
    setAvisoPresencial(null);

    const resultado = await vinculo.completarEnrolamiento(valor);

    setOcupado(false);

    if (resultado.exito) {
      setCodigo('');
      setIntentos(0);
      onCompletado(resultado.mensaje);
      return;
    }

    setCodigo('');
    setIntentos(anterior => anterior + 1);

    /*
      El primer dispositivo de un cliente necesita verificación presencial. **No
      es un error del cliente y no debe presentarse como tal**: quien llega aquí
      hizo todo bien, y enseñarle las casillas en rojo lo haría reintentar un
      código que nunca va a funcionar.
    */
    if (exigeVerificacionPresencial(resultado)) {
      setAvisoPresencial(resultado.mensaje);
      setError(null);
    } else {
      setError(resultado.mensaje);
    }
  };

  return (
    <BscSheet
      visible={visible}
      title="Registrar este dispositivo"
      onClose={onClose}
      footnote={
        'Te avisamos por correo y mensaje cada vez que se registra un ' +
        'dispositivo. Si no fuiste tú, llámanos.'
      }
      footer={
        <BscPrimaryButton
          label="Confirmar"
          loading={ocupado}
          disabled={codigo.length !== 6}
          onPress={() => void enviar(codigo)}
          testID="confirmar-enrolamiento"
        />
      }
      testID="hoja-enrolamiento"
    >
      {avisoPresencial !== null ? (
        <>
          <BscBanner
            tone="warning"
            icon="person-add"
            title="Necesitamos verificarte una vez más"
            subtitle={avisoPresencial}
            testID="aviso-presencial"
          />
          <View style={styles.separacionMedia} />
        </>
      ) : (
        <>
          <BscBanner
            tone="info"
            icon="mail"
            title="Te enviamos un código"
            subtitle="Ingrésalo para terminar de registrar este teléfono."
          />
          <View style={styles.separacionGrande} />
        </>
      )}

      <Text style={styles.titulo}>Código de 6 dígitos</Text>
      <View style={styles.separacionMedia} />

      <BscOtpInput
        value={codigo}
        onChangeText={setCodigo}
        onCompleted={valor => void enviar(valor)}
        enabled={!ocupado}
        hasError={error !== null}
        errorMessage={error ?? undefined}
        clearOn={intentos}
        testID="codigo-enrolamiento"
      />

      <View style={styles.separacionGrande} />

      <Text style={styles.explicacion}>
        Al confirmar, tu teléfono crea una llave de seguridad dentro de su chip
        protegido. Esa llave no sale del dispositivo y se usa para autorizar tus
        operaciones con tu rostro o huella.
      </Text>
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  // `titleMedium` del original.
  titulo: {
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },
  // 12.5 literal del widget Dart.
  explicacion: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  separacionMedia: { height: BscSpacing.md },
  separacionGrande: { height: BscSpacing.lg },
});
