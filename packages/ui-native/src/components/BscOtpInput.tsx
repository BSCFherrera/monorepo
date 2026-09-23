import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputHandle,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';

import { BscIcon } from './BscIcon';
import type { OtpInputProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Campo para el código de un solo uso.
 *
 * Portado de `otp_input.dart`. Lo importante de aquel archivo no es el dibujo:
 * es que **lo escribe un solo campo de texto** y las casillas son su
 * representación. Su comentario explica las tres formas en que se rompía la
 * versión de seis campos independientes, y las tres se conservan aquí como
 * razón de ser:
 *
 * 1. El retroceso sobre una casilla vacía no cambia el texto, así que no
 *    disparaba el aviso de cambio y el foco no retrocedía nunca.
 * 2. Escribir sobre una casilla llena se descartaba, pero el aviso ya había
 *    reportado seis caracteres: se enviaba un código que el cliente no tecleó.
 * 3. Pegar el código, o dejar que el teléfono lo rellene desde el SMS, no
 *    funcionaba, porque cada casilla aceptaba uno y tiraba el resto.
 *
 * Con un campo único los tres desaparecen por construcción, y el autorrelleno
 * del código empieza a funcionar. En React Native eso se pide con
 * `textContentType="oneTimeCode"` en iOS y `autoComplete="sms-otp"` en Android.
 *
 * Medidas literales del original: casillas de 56 de alto con 3 de margen a cada
 * lado, radio de 12 y borde de 1,6 en la activa.
 */

export type BscOtpInputProps = OtpInputProps;

export function BscOtpInput({
  length = 6,
  value,
  onChangeText,
  onCompleted,
  hasError = false,
  errorMessage,
  enabled = true,
  clearOn = 0,
  testID,
}: BscOtpInputProps): React.JSX.Element {
  const campo = useRef<React.ComponentRef<typeof TextInputHandle> | null>(null);
  const [enfocado, setEnfocado] = useState(false);

  /*
    El código con el que ya se avisó que estaba completo. Sin esto, cualquier
    redibujado con las casillas llenas volvería a disparar el envío, y un
    segundo factor enviado dos veces le consume un intento al cliente.
  */
  const avisado = useRef<string | null>(null);

  useEffect(() => {
    if (clearOn === 0) return;
    avisado.current = null;
    onChangeText('');
    if (enabled) campo.current?.focus();
    // Solo debe correr cuando cambia el contador de intentos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearOn]);

  const escribir = (crudo: string): void => {
    const digitos = crudo.replace(/\D/g, '').slice(0, length);
    onChangeText(digitos);

    if (digitos.length === length && digitos !== avisado.current) {
      avisado.current = digitos;
      campo.current?.blur();
      onCompleted?.(digitos);
    } else if (digitos.length < length) {
      avisado.current = null;
    }
  };

  return (
    <View>
      <View style={styles.casillas}>
        {Array.from({ length }, (_, indice) => {
          const llena = indice < value.length;
          const activa = enabled && enfocado && indice === value.length;

          return (
            <View
              key={indice}
              style={[
                styles.casilla,
                {
                  backgroundColor: hasError
                    ? BscColors.errorSoft
                    : enabled
                    ? BscColors.surfaceVariant
                    : BscColors.background,
                  borderColor: activa
                    ? BscColors.primary
                    : hasError
                    ? BscColors.error
                    : BscColors.border,
                  borderWidth: activa ? 1.6 : 1,
                },
              ]}
            >
              <Text style={styles.punto}>{llena ? '•' : ''}</Text>
            </View>
          );
        })}

        {/*
          El campo real va encima de las casillas, transparente y a todo lo
          ancho, para que tocar cualquiera abra el teclado.
        */}
        <TextInput
          ref={campo}
          value={value}
          onChangeText={escribir}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          editable={enabled}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={length}
          caretHidden
          contextMenuHidden
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          style={styles.campoInvisible}
          accessibilityLabel={`Código de ${String(length)} dígitos`}
          testID={testID ?? 'codigo'}
        />
      </View>

      {errorMessage !== undefined ? (
        <View style={styles.zonaError}>
          <BscIcon name="error" size={15} color={BscColors.error} />
          <Text style={styles.textoError}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  casillas: {
    flexDirection: 'row',
  },
  casilla: {
    flex: 1,
    height: 56,
    marginHorizontal: 3,
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    ...BscTextStyles['Subtitle/20 Bold'],
    color: BscColors.textPrimary,
  },
  campoInvisible: {
    ...StyleSheet.absoluteFill,
    textAlign: 'center',
    ...BscTextStyles['Subtitle/20 Regular'],
    // Invisible: lo que se ve son las casillas de atrás.
    color: 'transparent',
    opacity: 0.01,
  },
  zonaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: BscSpacing.xs,
  },
  textoError: {
    flex: 1,
    color: BscColors.error,
    ...BscTextStyles['Caption/12 Medium'],
  },
});
