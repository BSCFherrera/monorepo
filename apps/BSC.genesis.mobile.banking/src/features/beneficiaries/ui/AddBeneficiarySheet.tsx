import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BscBanner,
  BscColors,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscOtpInput,
  BscPrimaryButton,
  BscRadio,
  BscRadius,
  BscRowDivider,
  BscSecondaryButton,
  BscSelect,
  BscSheet,
  BscSpacing,
  BscTextField,
  BscTextStyles,
} from '@bsc/design-system';
import { type SelectOption } from '@bsc/contracts';
import { buttonTokens } from '@bsc/design-system';
import {
  metodoPreferido,
  PropositoDeSegundoFactor,
} from '../../twoFactor/data/twoFactorContracts';
import type { TwoFactorRepository } from '../../twoFactor/data/twoFactorRepository';
import {
  esTarjetaDeCredito,
  normalizarDocumento,
  validarDocumento,
  type CatalogosDeBeneficiario,
  type OpcionDeBanco,
  type OpcionDeDocumento,
  type OpcionDeTipoDeCuenta,
  type ValidacionDeCuenta,
} from '../data/beneficiaryContracts';
import type { BeneficiaryRepository } from '../data/beneficiaryRepository';

/**
 * Alta de un beneficiario, en cinco pasos.
 *
 * Portada de `add_beneficiary_sheet.dart`. El recorrido es el del original:
 * destino → cuenta → datos → código → listo, con el título de la hoja
 * cambiando en cada paso y el pie llevando los botones que tocan.
 *
 * **Un beneficiario no queda dado de alta hasta que se confirma con un
 * código.** El backend lo crea en estado pendiente y la lista solo pide los
 * activos, así que abandonar el asistente en el paso del código deja un
 * beneficiario que no se ve ni se puede usar. Es el diseño del backend y no se
 * toca (P-03); lo que sí se hace aquí es no fingir que el alta terminó.
 */

type Paso = 'destino' | 'cuenta' | 'datos' | 'codigo' | 'listo';

const TITULOS: Readonly<Record<Paso, string>> = {
  destino: 'Nuevo beneficiario',
  cuenta: 'Cuenta destino',
  datos: 'Datos del beneficiario',
  codigo: 'Confirma con tu código',
  listo: 'Beneficiario agregado',
};

export interface AddBeneficiarySheetProps {
  visible: boolean;
  catalogos: CatalogosDeBeneficiario;
  repositorio: BeneficiaryRepository;
  segundoFactor: TwoFactorRepository;
  /** Se cierra con `true` cuando quedó uno creado y confirmado. */
  onCerrar: (creado: boolean) => void;
  onActivity?: (() => void) | undefined;
}

export function AddBeneficiarySheet({
  visible,
  catalogos,
  repositorio,
  segundoFactor,
  onCerrar,
  onActivity,
}: AddBeneficiarySheetProps): React.JSX.Element {
  const [paso, setPaso] = useState<Paso>('destino');
  const [interno, setInterno] = useState(true);

  const [cuenta, setCuenta] = useState('');
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [alias, setAlias] = useState('');
  const [moneda, setMoneda] = useState('214');

  const [banco, setBanco] = useState<OpcionDeBanco | null>(null);
  const [tipoDeCuenta, setTipoDeCuenta] = useState<OpcionDeTipoDeCuenta | null>(
    null,
  );
  const [tipoDeDocumento, setTipoDeDocumento] =
    useState<OpcionDeDocumento | null>(null);

  const [validacion, setValidacion] = useState<ValidacionDeCuenta | null>(null);
  const [pendienteId, setPendienteId] = useState('');
  const [avisoDelCodigo, setAvisoDelCodigo] = useState('');

  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  /** Sube con cada código rechazado y borra las casillas para el reintento. */
  const [intentos, setIntentos] = useState(0);

  // Valores por omisión del original: ahorros y cédula, o el primero que haya.
  useEffect(() => {
    setTipoDeCuenta(
      previo =>
        previo ??
        catalogos.tiposDeCuenta.find(
          t => t.codigo.toUpperCase() === 'SAVINGS',
        ) ??
        catalogos.tiposDeCuenta[0] ??
        null,
    );
    setTipoDeDocumento(
      previo =>
        previo ??
        catalogos.documentos.find(d => d.codigo.toUpperCase() === 'CEDULA') ??
        catalogos.documentos[0] ??
        null,
    );
  }, [catalogos]);

  const reiniciar = useCallback((): void => {
    setPaso('destino');
    setInterno(true);
    setCuenta('');
    setNombre('');
    setDocumento('');
    setAlias('');
    setMoneda('214');
    setBanco(null);
    setValidacion(null);
    setPendienteId('');
    setAvisoDelCodigo('');
    setError(null);
    setCodigo('');
    setIntentos(0);
    setOcupado(false);
  }, []);

  const cerrar = useCallback(
    (creado: boolean): void => {
      reiniciar();
      onCerrar(creado);
    },
    [onCerrar, reiniciar],
  );

  // ─── Acciones ─────────────────────────────────────────────────────────────

  const validarCuenta = async (): Promise<void> => {
    onActivity?.();
    const numero = cuenta.trim();
    if (numero === '') {
      setError('Ingresa el número de cuenta');
      return;
    }

    /*
      Solo las cuentas del banco se pueden comprobar contra el core. Para otro
      banco se pasa directo a los datos, que el cliente escribe él mismo.
    */
    if (!interno) {
      if (banco === null) {
        setError('Selecciona el banco destino');
        return;
      }
      setPaso('datos');
      setError(null);
      return;
    }

    setOcupado(true);
    setError(null);

    const resultado = await repositorio.validarCuenta(numero);
    setOcupado(false);
    setValidacion(resultado);

    if (!resultado.valida) {
      setError(resultado.mensaje);
      return;
    }

    // El titular y la moneda llegan del core: se rellenan para que el cliente
    // los confirme en vez de teclearlos y equivocarse.
    if (resultado.titular !== undefined) setNombre(resultado.titular);
    if (resultado.codigoMoneda !== undefined) setMoneda(resultado.codigoMoneda);
    if (resultado.documentoNumero !== undefined) {
      // El core lo devuelve con guiones y el catálogo cuenta caracteres.
      setDocumento(normalizarDocumento(resultado.documentoNumero));
    }
    if (resultado.documentoTipo !== undefined) {
      const delCore = catalogos.documentos.find(
        d => d.id === resultado.documentoTipo,
      );
      if (delCore !== undefined) setTipoDeDocumento(delCore);
    }

    setPaso('datos');
  };

  const crear = async (): Promise<void> => {
    onActivity?.();

    const errorDeDocumento = validarDocumento(tipoDeDocumento, documento);
    if (errorDeDocumento !== undefined) {
      setError(errorDeDocumento);
      return;
    }
    if (nombre.trim() === '') {
      setError('Ingresa el nombre del beneficiario');
      return;
    }
    if (!interno && banco === null) {
      setError('Selecciona el banco destino');
      return;
    }

    setOcupado(true);
    setError(null);

    try {
      const comunes = {
        numeroDeCuenta: cuenta.trim(),
        nombre: nombre.trim(),
        tipoDeCuenta: tipoDeCuenta?.id ?? 1,
        documentoTipo: tipoDeDocumento?.id ?? 1,
        documentoNumero: documento.trim(),
        codigoMoneda: moneda,
        alias: alias.trim(),
      };

      const pendiente =
        interno || banco === null
          ? await repositorio.agregarInterno(comunes)
          : await repositorio.agregarInterbancario({
              ...comunes,
              bancoCodigo: banco.codigo,
              bancoNombre: banco.nombre,
              bancoSwift: banco.swift,
            });

      if (pendiente.id === '') {
        setOcupado(false);
        setError(pendiente.mensaje);
        return;
      }

      setPendienteId(pendiente.id);
      setAvisoDelCodigo(pendiente.mensaje);
      setPaso('codigo');
      await enviarCodigo();
    } catch {
      setOcupado(false);
      setError('No pudimos registrar el beneficiario.');
    }
  };

  const enviarCodigo = async (): Promise<void> => {
    setOcupado(true);
    setError(null);

    try {
      const metodos = await segundoFactor.obtenerMetodos();
      const metodo = metodoPreferido(metodos);

      if (metodo === null) {
        setOcupado(false);
        setError('No tienes métodos de verificación activos.');
        return;
      }

      const envio = await segundoFactor.enviarCodigo(
        metodo.id,
        PropositoDeSegundoFactor.AltaDeBeneficiario,
      );

      setOcupado(false);
      if (!envio.enviado) setError(envio.mensaje);
      else if (envio.contactoEnmascarado !== undefined) {
        setAvisoDelCodigo(
          `Te enviamos un código a ${envio.contactoEnmascarado}.`,
        );
      }
    } catch {
      setOcupado(false);
      setError('No pudimos enviar el código.');
    }
  };

  const confirmar = async (codigoEscrito: string): Promise<void> => {
    if (codigoEscrito.length !== 6 || pendienteId === '') return;
    onActivity?.();

    setOcupado(true);
    setError(null);

    /*
      La confirmación del beneficiario va contra `/beneficiaries/confirm`, no
      contra `/two-factor/verify-token`. Es el endpoint del original y el que
      activa el registro; verificar el código aparte dejaría el beneficiario
      pendiente con un código ya consumido.
    */
    const resultado = await repositorio.confirmar(pendienteId, codigoEscrito);
    setOcupado(false);

    if (resultado.exito) {
      setPaso('listo');
      return;
    }

    setCodigo('');
    setIntentos(n => n + 1);
    setError(resultado.mensaje);
  };

  // ─── Cuerpo ───────────────────────────────────────────────────────────────

  const bancos = useMemo<SelectOption<OpcionDeBanco>[]>(
    () =>
      catalogos.bancos.map(b => ({
        key: b.codigo === '' ? b.id : b.codigo,
        label: b.nombre,
        detail: b.swift,
        value: b,
      })),
    [catalogos.bancos],
  );

  /* La tarjeta de crédito no es un destino válido dentro del propio banco. */
  const tiposVisibles = useMemo<SelectOption<OpcionDeTipoDeCuenta>[]>(
    () =>
      catalogos.tiposDeCuenta
        .filter(t => !esTarjetaDeCredito(t) || !interno)
        .map(t => ({ key: String(t.id), label: t.nombre, value: t })),
    [catalogos.tiposDeCuenta, interno],
  );

  const documentosVisibles = useMemo<SelectOption<OpcionDeDocumento>[]>(
    () =>
      catalogos.documentos.map(d => ({
        key: String(d.id),
        label: d.nombre,
        value: d,
      })),
    [catalogos.documentos],
  );

  return (
    <BscSheet
      visible={visible}
      title={paso === 'cuenta' && interno ? 'Cuenta BSC' : TITULOS[paso]}
      onClose={() => cerrar(false)}
      footer={
        <Pie
          paso={paso}
          interno={interno}
          ocupado={ocupado}
          codigoCompleto={codigo.length === 6}
          onCancelar={() => cerrar(false)}
          onListo={() => cerrar(true)}
          onAtras={destino => {
            setPaso(destino);
            setError(null);
          }}
          onSiguiente={() => {
            setPaso('cuenta');
            setError(null);
          }}
          onValidar={() => void validarCuenta()}
          onRegistrar={() => void crear()}
          onConfirmar={() => void confirmar(codigo)}
        />
      }
      testID="hoja-alta-beneficiario"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {paso === 'destino' ? (
          <Destino interno={interno} onElegir={setInterno} />
        ) : null}

        {paso === 'cuenta' ? (
          <View>
            {!interno ? (
              <>
                <Etiqueta texto="Banco destino" />
                {bancos.length === 0 ? (
                  <BscBanner
                    tone="warning"
                    icon="warning"
                    title="Catálogo de bancos no disponible"
                    subtitle="Intenta de nuevo en unos minutos."
                  />
                ) : (
                  <BscSelect
                    title="Banco destino"
                    placeholder="Selecciona el banco"
                    options={bancos}
                    selectedKey={banco === null ? null : banco.codigo || banco.id}
                    onSelect={opcion => {
                      setBanco(opcion.value);
                      setError(null);
                    }}
                    testID="select-banco"
                  />
                )}
                <View style={styles.separacion} />
              </>
            ) : null}

            <BscTextField
              label="Número de cuenta"
              value={cuenta}
              onChangeText={valor => {
                setCuenta(valor);
                setError(null);
              }}
              placeholder="Ej. 11042010013953"
              keyboardType="number-pad"
              error={error ?? undefined}
              testID="campo-cuenta"
            />

            {interno ? (
              <View style={styles.separacion}>
                <BscBanner
                  tone="info"
                  icon="shield-check"
                  title="Verificamos la cuenta"
                  subtitle="Te mostramos el nombre del titular antes de guardar."
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {paso === 'datos' ? (
          <View>
            {validacion?.valida === true ? (
              <View style={styles.separacionAbajo}>
                <BscBanner
                  icon="check-circle"
                  title="Cuenta verificada"
                  subtitle={validacion.titular}
                />
              </View>
            ) : null}

            <BscTextField
              label="Nombre del beneficiario"
              value={nombre}
              onChangeText={valor => {
                setNombre(valor);
                setError(null);
              }}
              placeholder="Nombre completo"
              autoCapitalize="words"
              testID="campo-nombre"
            />

            <View style={styles.separacion} />
            <Etiqueta texto="Tipo de cuenta" />
            {tiposVisibles.length > 0 ? (
              <BscSelect
                title="Tipo de cuenta"
                placeholder="Selecciona el tipo"
                options={tiposVisibles}
                selectedKey={
                  tipoDeCuenta === null ? null : String(tipoDeCuenta.id)
                }
                onSelect={opcion => setTipoDeCuenta(opcion.value)}
                testID="select-tipo-cuenta"
              />
            ) : null}

            <View style={styles.separacion} />
            <Etiqueta texto="Documento" />
            {documentosVisibles.length > 0 ? (
              <>
                <BscSelect
                  title="Tipo de documento"
                  placeholder="Selecciona el documento"
                  options={documentosVisibles}
                  selectedKey={
                    tipoDeDocumento === null ? null : String(tipoDeDocumento.id)
                  }
                  onSelect={opcion => {
                    setTipoDeDocumento(opcion.value);
                    setError(null);
                  }}
                  testID="select-tipo-documento"
                />
                <View style={styles.separacionCorta} />
              </>
            ) : null}

            <BscTextField
              label=""
              value={documento}
              onChangeText={valor => {
                setDocumento(valor);
                setError(null);
              }}
              placeholder={tipoDeDocumento?.nombre ?? 'Número de documento'}
              keyboardType="number-pad"
              testID="campo-documento"
            />

            <View style={styles.separacion} />
            <BscTextField
              label="Alias (opcional)"
              value={alias}
              onChangeText={setAlias}
              placeholder="Cómo quieres identificarlo"
              autoCapitalize="sentences"
              testID="campo-alias"
            />

            {error !== null ? <TextoDeError mensaje={error} /> : null}
          </View>
        ) : null}

        {paso === 'codigo' ? (
          <View>
            <BscBanner
              tone="info"
              icon="lock"
              title="Autoriza el registro"
              subtitle={avisoDelCodigo}
            />

            <View style={styles.separacionGrande} />
            <Text style={styles.tituloMedio}>
              Ingresa el código de 6 dígitos
            </Text>

            <View style={styles.separacion} />
            <BscOtpInput
              value={codigo}
              onChangeText={setCodigo}
              onCompleted={escrito => void confirmar(escrito)}
              enabled={!ocupado}
              hasError={error !== null}
              errorMessage={error ?? undefined}
              clearOn={intentos}
            />

            <Pressable
              accessibilityRole="button"
              onPress={ocupado ? undefined : () => void enviarCodigo()}
              hitSlop={8}
              style={styles.reenviar}
              testID="reenviar-codigo"
            >
              <BscIcon name="refresh" size={18} color={BscColors.primary} />
              <Text style={styles.textoReenviar}>Enviar un nuevo código</Text>
            </Pressable>
          </View>
        ) : null}

        {paso === 'listo' ? (
          <View style={styles.listo}>
            <View style={styles.circuloExito}>
              <BscIcon name="check" size={36} color={BscColors.success} />
            </View>
            <Text style={styles.nombreListo}>{nombre.trim()}</Text>
            <Text style={styles.notaListo}>
              Ya puedes transferirle sin escribir la cuenta cada vez.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </BscSheet>
  );
}

// ─── Paso del destino ───────────────────────────────────────────────────────

function Destino({
  interno,
  onElegir,
}: {
  interno: boolean;
  onElegir: (interno: boolean) => void;
}): React.JSX.Element {
  return (
    <View>
      <Text style={styles.tituloMedio}>¿A dónde va el dinero?</Text>
      <View style={styles.grupoDestino}>
        <BscListRow
          leading={
            <BscIconTile
              icon="wallet"
              background={BscColors.surface}
              size={38}
              iconSize={19}
            />
          }
          title="Cuenta del Banco Santa Cruz"
          subtitle="Validamos el titular por ti"
          trailing={<BscRadio selected={interno} />}
          onPress={() => onElegir(true)}
          testID="destino-interno"
        />
        <BscRowDivider />
        <BscListRow
          leading={
            <BscIconTile
              icon="bank"
              background={BscColors.surface}
              size={38}
              iconSize={19}
            />
          }
          title="Otro banco local"
          subtitle="Transferencias ACH dentro del país"
          trailing={<BscRadio selected={!interno} />}
          onPress={() => onElegir(false)}
          testID="destino-otro-banco"
        />
      </View>
    </View>
  );
}

// ─── Pie ────────────────────────────────────────────────────────────────────

function Pie({
  paso,
  interno,
  ocupado,
  codigoCompleto,
  onCancelar,
  onListo,
  onAtras,
  onSiguiente,
  onValidar,
  onRegistrar,
  onConfirmar,
}: {
  paso: Paso;
  interno: boolean;
  ocupado: boolean;
  codigoCompleto: boolean;
  onCancelar: () => void;
  onListo: () => void;
  onAtras: (destino: Paso) => void;
  onSiguiente: () => void;
  onValidar: () => void;
  onRegistrar: () => void;
  onConfirmar: () => void;
}): React.JSX.Element {
  if (paso === 'listo') {
    return (
      <BscPrimaryButton label="Listo" onPress={onListo} testID="pie-listo" />
    );
  }

  /*
    El original reparte el pie en uno a uno y dos: el botón que avanza es el
    doble de ancho que el que retrocede. Se copia la proporción.
  */
  const dosBotones = (
    izquierda: React.JSX.Element,
    derecha: React.JSX.Element,
  ): React.JSX.Element => (
    <View style={styles.pie}>
      <View style={styles.pieUno}>{izquierda}</View>
      <View style={styles.pieDos}>{derecha}</View>
    </View>
  );

  switch (paso) {
    case 'destino':
      return dosBotones(
        <BscSecondaryButton label="Cancelar" onPress={onCancelar} />,
        <BscPrimaryButton
          label="Continuar"
          onPress={onSiguiente}
          trailing={
            <BscIcon
              name="arrow-forward"
              size={buttonTokens.iconTrailing}
            />
          }
          testID="pie-continuar"
        />,
      );

    case 'cuenta':
      return dosBotones(
        <BscSecondaryButton
          label="Atrás"
          onPress={ocupado ? undefined : () => onAtras('destino')}
        />,
        <BscPrimaryButton
          label={interno ? 'Validar cuenta' : 'Continuar'}
          loading={ocupado}
          onPress={onValidar}
          testID="pie-validar"
        />,
      );

    case 'datos':
      return dosBotones(
        <BscSecondaryButton
          label="Atrás"
          onPress={ocupado ? undefined : () => onAtras('cuenta')}
        />,
        <BscPrimaryButton
          label="Registrar"
          leading={
            <BscIcon name="lock" size={19} color={BscColors.textOnPrimary} />
          }
          loading={ocupado}
          onPress={onRegistrar}
          testID="pie-registrar"
        />,
      );

    case 'codigo':
      return dosBotones(
        <BscSecondaryButton
          label="Cancelar"
          onPress={ocupado ? undefined : onCancelar}
        />,
        <BscPrimaryButton
          label="Confirmar"
          loading={ocupado}
          onPress={codigoCompleto ? onConfirmar : undefined}
          testID="pie-confirmar"
        />,
      );
  }
}

// ─── Piezas menores ─────────────────────────────────────────────────────────

function Etiqueta({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.etiqueta}>{texto}</Text>;
}

function TextoDeError({ mensaje }: { mensaje: string }): React.JSX.Element {
  return (
    <View style={styles.zonaError}>
      <BscIcon name="error" size={15} color={BscColors.error} />
      <Text style={styles.textoError}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  separacion: { marginTop: BscSpacing.md },
  separacionCorta: { marginTop: BscSpacing.xs },
  separacionGrande: { marginTop: BscSpacing.lg },
  separacionAbajo: { marginBottom: BscSpacing.md },

  tituloMedio: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  grupoDestino: {
    marginTop: BscSpacing.xs,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
    overflow: 'hidden',
  },

  // El original pone 7 entre la etiqueta y su campo.
  etiqueta: {
    marginBottom: 7,
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },

  reenviar: {
    marginTop: BscSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: BscSpacing.xs,
  },
  textoReenviar: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.primary,
  },

  listo: {
    alignItems: 'center',
    paddingVertical: BscSpacing.md,
  },
  circuloExito: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BscColors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombreListo: {
    marginTop: BscSpacing.md,
    ...BscTextStyles['Body L/18 Bold'],
    color: BscColors.textPrimary,
    textAlign: 'center',
  },
  notaListo: {
    marginTop: BscSpacing.xxs,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
    textAlign: 'center',
  },

  pie: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  pieUno: { flex: 1 },
  pieDos: { flex: 2 },

  zonaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: BscSpacing.sm,
  },
  textoError: {
    flex: 1,
    color: BscColors.error,
    ...BscTextStyles['Caption/12 Medium'],
  },
});
