import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BscBanner,
  BscColors,
  BscEmptyState,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscOtpInput,
  BscPrimaryButton,
  BscRadio,
  BscRadius,
  BscRowDivider,
  BscSecondaryButton,
  BscSheet,
  BscSpacing,
  BscSpinner,
  type BscIconName,
  BscTextStyles,
} from '@bsc/ui-native';
import { buttonTokens } from '@bsc/ui-native';
import {
  esCorreo,
  esSms,
  esTokenDeApp,
  metodoPreferido,
  type MetodoDeSegundoFactor,
  type Proposito,
} from '../data/twoFactorContracts';
import type { TwoFactorRepository } from '../data/twoFactorRepository';

/**
 * El segundo factor de una operación que mueve dinero.
 *
 * Portada de `two_factor_sheet.dart`. **Devuelve la autorización que emitió el
 * backend, no un sí o un no.** El original ya hizo ese cambio y su comentario
 * explica por qué: con un booleano, quien llamaba ejecutaba la transacción por
 * su cuenta y la decisión quedaba entera en el cliente; con la autorización,
 * lo que sale de aquí es una prueba que el servidor verifica.
 *
 * Todos los mensajes vienen de la API —incluido el aviso de los intentos que
 * quedan— para que el cliente vea el motivo real de un código rechazado.
 */

export interface TwoFactorSheetProps {
  visible: boolean;
  repositorio: TwoFactorRepository;
  proposito: Proposito;
  title?: string;
  /** Qué se está autorizando, en una línea: «RD$ 1,000.00 a Mamá ****7431». */
  resumenDeOperacion?: string | undefined;
  /**
   * Huella de la operación.
   *
   * ⚠️ **Sin ella el backend valida el código pero no emite autorización**, y
   * la transacción se rechaza al ejecutarla. Es opcional porque el alta de un
   * beneficiario no mueve dinero y no la tiene.
   */
  huellaDeOperacion?: string | undefined;
  /** Se cierra con la autorización, o con nulo si el cliente no la completó. */
  onCerrar: (autorizacionId: string | null) => void;
}

type Etapa = 'cargando' | 'elegir-metodo' | 'codigo' | 'sin-metodos';

export function TwoFactorSheet({
  visible,
  repositorio,
  proposito,
  title = 'Verificación de seguridad',
  resumenDeOperacion,
  huellaDeOperacion,
  onCerrar,
}: TwoFactorSheetProps): React.JSX.Element {
  const [etapa, setEtapa] = useState<Etapa>('cargando');
  const [metodos, setMetodos] = useState<MetodoDeSegundoFactor[]>([]);
  const [elegido, setElegido] = useState<MetodoDeSegundoFactor | null>(null);
  const [contactoDelEnvio, setContactoDelEnvio] = useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const enviarCodigo = useCallback(
    async (metodo: MetodoDeSegundoFactor): Promise<void> => {
      setOcupado(true);
      setError(null);
      setAviso(null);

      const envio = await repositorio.enviarCodigo(metodo.id, proposito);

      setOcupado(false);
      setEtapa('codigo');
      setContactoDelEnvio(envio.contactoEnmascarado ?? null);

      if (envio.enviado) setAviso(envio.mensaje);
      else setError(envio.mensaje);
    },
    [repositorio, proposito],
  );

  useEffect(() => {
    if (!visible) return;

    let vigente = true;
    setEtapa('cargando');
    setCodigo('');
    setError(null);
    setAviso(null);

    void (async () => {
      try {
        const leidos = await repositorio.obtenerMetodos();
        if (!vigente) return;

        if (leidos.length === 0) {
          setEtapa('sin-metodos');
          return;
        }

        setMetodos(leidos);
        const preferido = metodoPreferido(leidos);
        setElegido(preferido);

        // Con un solo método no hay nada que elegir: se manda el código.
        if (leidos.length === 1 && preferido !== null) {
          await enviarCodigo(preferido);
          return;
        }

        setEtapa('elegir-metodo');
      } catch {
        if (vigente) {
          setEtapa('sin-metodos');
          setError('No pudimos consultar tus métodos de verificación.');
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, [visible, repositorio, enviarCodigo]);

  const verificar = async (escrito: string): Promise<void> => {
    if (escrito.length !== 6 || ocupado) return;

    setOcupado(true);
    setError(null);

    const resultado = await repositorio.verificarCodigo(
      escrito,
      proposito,
      huellaDeOperacion,
    );

    setOcupado(false);

    if (resultado.valido && resultado.autorizacionId !== undefined) {
      onCerrar(resultado.autorizacionId);
      return;
    }

    /*
      Un código válido sin autorización no sirve para ejecutar nada: pasa
      cuando no se envió la huella. Se trata como fallo en vez de dejar seguir
      hasta que el backend rechace la transferencia sin explicación.
    */
    setCodigo('');
    setIntentos(n => n + 1);
    setError(
      resultado.valido
        ? 'El código se verificó pero no autorizó esta operación. Intenta de nuevo.'
        : resultado.mensaje,
    );
  };

  /*
    TokenBSC responde con su propio destino enmascarado, que muchas veces es
    solo `***-****` y no le dice nada al cliente. El contacto registrado es el
    útil: es así como alguien nota que el código va a un número que ya no es
    suyo.
  */
  const registrado = elegido?.contactoEnmascarado;
  const contacto =
    registrado !== undefined && registrado.trim().length > 7
      ? registrado
      : contactoDelEnvio ?? registrado;

  return (
    <BscSheet
      visible={visible}
      title={title}
      onClose={() => onCerrar(null)}
      footnote={
        etapa === 'codigo'
          ? 'Nunca compartas este código. BSC jamás te lo pedirá por teléfono.'
          : undefined
      }
      footer={
        <Pie
          etapa={etapa}
          ocupado={ocupado}
          hayMetodo={elegido !== null}
          codigoCompleto={codigo.length === 6}
          onCerrar={() => onCerrar(null)}
          onEnviar={() => {
            if (elegido !== null) void enviarCodigo(elegido);
          }}
          onVerificar={() => void verificar(codigo)}
        />
      }
      testID="hoja-segundo-factor"
    >
      {etapa === 'cargando' ? (
        <View style={styles.cargando}>
          <BscSpinner tamano="screenList" testID="2fa-cargando" />
        </View>
      ) : null}

      {etapa === 'sin-metodos' ? (
        <BscEmptyState
          icon="shield-check"
          title="Sin métodos de verificación"
          message={
            error ??
            'Tu usuario no tiene métodos de verificación activos. Contacta a tu oficial de cuenta.'
          }
          testID="2fa-sin-metodos"
        />
      ) : null}

      {etapa === 'elegir-metodo' ? (
        <View>
          {resumenDeOperacion !== undefined ? (
            <View style={styles.separacionGrande}>
              <BscBanner
                tone="info"
                icon="lock"
                title="Autoriza la operación"
                subtitle={resumenDeOperacion}
              />
            </View>
          ) : null}

          <Text style={styles.tituloMedio}>
            ¿Cómo quieres recibir el código?
          </Text>

          <View style={styles.grupo}>
            {metodos.map((metodo, indice) => (
              <View key={metodo.id}>
                {indice > 0 ? <BscRowDivider /> : null}
                <BscListRow
                  leading={
                    <BscIconTile
                      icon={iconoDelMetodo(metodo)}
                      background={BscColors.surface}
                      size={38}
                      iconSize={19}
                    />
                  }
                  title={metodo.nombre}
                  subtitle={metodo.contactoEnmascarado}
                  trailing={<BscRadio selected={metodo.id === elegido?.id} />}
                  onPress={() => setElegido(metodo)}
                  testID={`metodo-${metodo.id}`}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {etapa === 'codigo' ? (
        <View>
          {aviso !== null ? (
            <BscBanner
              tone="success"
              icon="mail"
              title={aviso}
              subtitle={
                contacto === undefined ? undefined : `Enviado a ${contacto}`
              }
            />
          ) : null}

          <Text style={[styles.tituloMedio, styles.separacionArriba]}>
            Ingresa el código de 6 dígitos
          </Text>

          <View style={styles.separacion}>
            <BscOtpInput
              value={codigo}
              onChangeText={setCodigo}
              onCompleted={escrito => void verificar(escrito)}
              enabled={!ocupado}
              hasError={error !== null}
              errorMessage={error ?? undefined}
              clearOn={intentos}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={
              ocupado || elegido === null
                ? undefined
                : () => void enviarCodigo(elegido)
            }
            hitSlop={8}
            style={styles.enlace}
            testID="2fa-reenviar"
          >
            <BscIcon name="refresh" size={18} color={BscColors.primary} />
            <Text style={styles.textoEnlace}>Enviar un nuevo código</Text>
          </Pressable>

          {metodos.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={
                ocupado
                  ? undefined
                  : () => {
                      setEtapa('elegir-metodo');
                      setError(null);
                      setAviso(null);
                    }
              }
              hitSlop={8}
              style={styles.enlace}
              testID="2fa-otro-metodo"
            >
              <Text style={styles.textoEnlace}>Usar otro método</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </BscSheet>
  );
}

function Pie({
  etapa,
  ocupado,
  hayMetodo,
  codigoCompleto,
  onCerrar,
  onEnviar,
  onVerificar,
}: {
  etapa: Etapa;
  ocupado: boolean;
  hayMetodo: boolean;
  codigoCompleto: boolean;
  onCerrar: () => void;
  onEnviar: () => void;
  onVerificar: () => void;
}): React.JSX.Element {
  if (etapa === 'cargando') return <View />;

  if (etapa === 'sin-metodos') {
    return <BscSecondaryButton label="Cerrar" onPress={onCerrar} />;
  }

  if (etapa === 'elegir-metodo') {
    return (
      <BscPrimaryButton
        label="Enviar código"
        loading={ocupado}
        onPress={hayMetodo ? onEnviar : undefined}
        trailing={
          <BscIcon
            name="arrow-forward"
            size={buttonTokens.iconTrailing}
          />
        }
        testID="2fa-enviar"
      />
    );
  }

  return (
    <View style={styles.pie}>
      <View style={styles.pieUno}>
        <BscSecondaryButton
          label="Cancelar"
          onPress={ocupado ? undefined : onCerrar}
        />
      </View>
      <View style={styles.pieDos}>
        <BscPrimaryButton
          label="Verificar"
          loading={ocupado}
          onPress={codigoCompleto ? onVerificar : undefined}
          testID="2fa-verificar"
        />
      </View>
    </View>
  );
}

function iconoDelMetodo(metodo: MetodoDeSegundoFactor): BscIconName {
  if (esSms(metodo)) return 'smartphone';
  if (esCorreo(metodo)) return 'mail';
  if (esTokenDeApp(metodo)) return 'lock';
  return 'shield-check';
}

const styles = StyleSheet.create({
  cargando: {
    paddingVertical: BscSpacing.xxl,
    alignItems: 'center',
  },
  tituloMedio: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  grupo: {
    marginTop: BscSpacing.xs,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
    overflow: 'hidden',
  },
  separacion: { marginTop: BscSpacing.md },
  separacionArriba: { marginTop: BscSpacing.lg },
  separacionGrande: { marginBottom: BscSpacing.lg },
  enlace: {
    marginTop: BscSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: BscSpacing.xs,
  },
  textoEnlace: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.primary,
  },
  pie: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  pieUno: { flex: 1 },
  pieDos: { flex: 2 },
});
