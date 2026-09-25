import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscBanner,
  BscColors,
  BscIcon,
  BscPrimaryButton,
  BscRadius,
  BscSelect,
  BscSpacing,
  BscSpinner,
  BscTextField,
  withAlpha,
  BscTextStyles,
} from '@bsc/ui-native';
import { type SelectOption } from '@bsc/contracts';
import { CARGANDO_BENEFICIARIOS } from './medidasDeLosAsistentes';
import { buttonTokens } from '@bsc/ui-native';
import { MEDIDAS_DEL_DESTINO_EXPRESO as DESTINO_EXPRESO } from './medidasDelDestinoExpreso';
import type { Beneficiario } from '../../beneficiaries/data/beneficiaryContracts';
import type { Producto } from '../../dashboard/data/productContracts';
import {
  TipoDeTransferencia,
  usaBeneficiario,
} from '../data/transferContracts';
import {
  destinoEnmascarado,
  lineaDeBeneficiario,
  monedaDelDestino,
  monedaDelOrigen,
  nombreDelDestino,
  necesitaConversion,
  puedeContinuar,
  simboloDeBeneficiario,
  simboloDelDestino,
  type DatosDelAsistente,
} from '../domain/transferFlow';

import { PieDelAsistente } from './TransferWizardChrome';

/**
 * Paso 1: origen, destino, monto y comentario.
 *
 * Portado de `transfer_step_form.dart`. **El campo de destino cambia según el
 * tipo de transferencia** —selector de cuentas propias, número a validar o
 * lista de beneficiarios—, que es lo que hace que este paso sirva para los
 * cinco flujos en vez de necesitar cinco pantallas.
 *
 * El monto se pide **en la moneda del destino**, igual que el original: es lo
 * que el cliente quiere que llegue, y la conversión se avisa debajo.
 */

export interface TransferStepFormProps {
  datos: DatosDelAsistente;
  cuentas: Producto[];
  beneficiarios: Beneficiario[];
  cargandoBeneficiarios: boolean;
  validando: boolean;
  /** Número tecleado en el flujo expreso, antes de validarlo. */
  cuentaExpresa: string;
  error: string | null;
  onOrigen: (cuenta: Producto) => void;
  onDestinoPropio: (cuenta: Producto) => void;
  onBeneficiario: (beneficiario: Beneficiario) => void;
  onCuentaExpresa: (numero: string) => void;
  onValidarExpresa: () => void;
  onMonto: (monto: number) => void;
  onComentario: (texto: string) => void;
  onCancelar: () => void;
  onContinuar: () => void;
}

export function TransferStepForm({
  datos,
  cuentas,
  beneficiarios,
  cargandoBeneficiarios,
  validando,
  cuentaExpresa,
  error,
  onOrigen,
  onDestinoPropio,
  onBeneficiario,
  onCuentaExpresa,
  onValidarExpresa,
  onMonto,
  onComentario,
  onCancelar,
  onContinuar,
}: TransferStepFormProps): React.JSX.Element {
  const opcionesDeOrigen = useMemo<SelectOption<Producto>[]>(
    () => cuentas.map(comoOpcionDeCuenta),
    [cuentas],
  );

  /* No se puede transferir a la misma cuenta elegida como origen. */
  const opcionesDeDestino = useMemo<SelectOption<Producto>[]>(
    () =>
      cuentas
        .filter(c => c.identificacion !== datos.origen?.identificacion)
        .map(comoOpcionDeCuenta),
    [cuentas, datos.origen],
  );

  const opcionesDeBeneficiario = useMemo<SelectOption<Beneficiario>[]>(
    () =>
      beneficiarios.map(b => ({
        key: b.id,
        label: `${nombreDeBeneficiario(b)}  ${simboloDeBeneficiario(b)}`,
        detail: lineaDeBeneficiario(b),
        value: b,
      })),
    [beneficiarios],
  );

  const monedaDestino = monedaDelDestino(datos);
  const simbolo = simboloDelDestino(datos);

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Etiqueta texto="Cuenta Origen" />
        <BscSelect
          title="Cuenta origen"
          placeholder="Selecciona la cuenta"
          options={opcionesDeOrigen}
          selectedKey={datos.origen?.identificacion ?? null}
          onSelect={opcion => onOrigen(opcion.value)}
          testID="select-origen"
        />

        <View style={styles.separacionGrande} />
        <Etiqueta texto="Destino" />
        {usaBeneficiario(datos.tipo) ? (
          <SelectorDeBeneficiario
            cargando={cargandoBeneficiarios}
            opciones={opcionesDeBeneficiario}
            seleccion={datos.beneficiario?.id ?? null}
            onSelect={onBeneficiario}
          />
        ) : datos.tipo === TipoDeTransferencia.Expresa ? (
          <DestinoExpreso
            numero={cuentaExpresa}
            validando={validando}
            datos={datos}
            onNumero={onCuentaExpresa}
            onValidar={onValidarExpresa}
          />
        ) : (
          <BscSelect
            title="Cuenta destino"
            placeholder="Selecciona la cuenta destino"
            options={opcionesDeDestino}
            selectedKey={datos.destinoPropio?.identificacion ?? null}
            onSelect={opcion => onDestinoPropio(opcion.value)}
            testID="select-destino"
          />
        )}

        <View style={styles.separacionGrande} />
        <Etiqueta texto={`Monto (${monedaDestino === 840 ? 'USD' : 'DOP'})`} />
        <BscTextField
          label=""
          value={datos.monto === 0 ? '' : String(datos.monto)}
          onChangeText={valor => onMonto(soloMonto(valor))}
          placeholder={`${simbolo} 0.00`}
          keyboardType="decimal-pad"
          testID="campo-monto"
        />

        {necesitaConversion(datos) ? (
          <View style={styles.aviso}>
            <BscIcon name="exchange" size={16} color={BscColors.info} />
            <Text style={styles.textoAviso}>
              Se debitará de una cuenta en{' '}
              {monedaDelOrigen(datos) === 840 ? 'USD' : 'DOP'}. El monto se
              convertirá automáticamente.
            </Text>
          </View>
        ) : null}

        <View style={styles.separacionGrande} />
        <Etiqueta texto="Comentario (opcional)" />
        <BscTextField
          label=""
          value={datos.comentario}
          onChangeText={onComentario}
          placeholder="Ingrese un comentario"
          maxLength={90}
          autoCapitalize="sentences"
          testID="campo-comentario"
        />

        {error !== null ? <BannerDeError mensaje={error} /> : null}
      </ScrollView>

      <PieDelAsistente
        atras={{ etiqueta: 'Cancelar', onPress: onCancelar }}
        adelante={{
          etiqueta: 'Continuar',
          onPress: puedeContinuar(datos) ? onContinuar : undefined,
          trailing: (
            <BscIcon
              name="arrow-forward"
              size={buttonTokens.iconTrailing}
            />
          ),
          testID: 'transferencia-continuar',
        }}
      />
    </View>
  );
}

// ─── Destinos ───────────────────────────────────────────────────────────────

function SelectorDeBeneficiario({
  cargando,
  opciones,
  seleccion,
  onSelect,
}: {
  cargando: boolean;
  opciones: SelectOption<Beneficiario>[];
  seleccion: string | null;
  onSelect: (beneficiario: Beneficiario) => void;
}): React.JSX.Element {
  if (cargando) {
    return (
      <View style={styles.cargandoBeneficiarios}>
        {/*
          El original pone el indicador junto al texto —`SizedBox(18, 18)` con
          `strokeWidth: 2`—, y el porte solo escribía el texto: durante la
          espera la pantalla no daba ninguna señal de estar haciendo algo.
        */}
        <BscSpinner tamano="besideField" testID="cargando-beneficiarios" />
        <Text style={styles.textoCargando}>Cargando beneficiarios…</Text>
      </View>
    );
  }

  if (opciones.length === 0) {
    return (
      <BscBanner
        tone="info"
        icon="info"
        title="No tienes beneficiarios registrados para este tipo de transferencia."
      />
    );
  }

  return (
    <BscSelect
      title="Beneficiario"
      placeholder="Selecciona un beneficiario"
      options={opciones}
      selectedKey={seleccion}
      onSelect={opcion => onSelect(opcion.value)}
      testID="select-beneficiario"
    />
  );
}

function DestinoExpreso({
  numero,
  validando,
  datos,
  onNumero,
  onValidar,
}: {
  numero: string;
  validando: boolean;
  datos: DatosDelAsistente;
  onNumero: (numero: string) => void;
  onValidar: () => void;
}): React.JSX.Element {
  const resuelto =
    datos.validacion.cliente !== null || datos.validacion.producto !== null;

  return (
    <View>
      <View style={styles.filaExpresa}>
        <View style={styles.campoExpreso}>
          <BscTextField
            label=""
            value={numero}
            onChangeText={valor => onNumero(valor.replace(/\D/g, ''))}
            placeholder="Número de cuenta destino"
            keyboardType="number-pad"
            testID="campo-cuenta-expresa"
          />
        </View>
        <View style={styles.botonExpreso}>
          <BscPrimaryButton
            label="Validar"
            color={BscColors.secondary}
            loading={validando}
            onPress={validando ? undefined : onValidar}
            style={styles.botonValidar}
            testID="validar-cuenta-expresa"
          />
        </View>
      </View>

      {resuelto ? (
        <View style={styles.destinoResuelto}>
          <BscIcon name="check-circle" size={22} color={BscColors.success} />
          <View style={styles.textoResuelto}>
            <Text style={styles.nombreResuelto}>
              {nombreDelDestino(datos) === ''
                ? 'Cuenta válida'
                : nombreDelDestino(datos)}
            </Text>
            <Text style={styles.cuentaResuelta}>
              {destinoEnmascarado(datos)}
            </Text>
          </View>
          <Text style={styles.simboloResuelto}>{simboloDelDestino(datos)}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function Etiqueta({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.etiqueta}>{texto.toUpperCase()}</Text>;
}

function BannerDeError({ mensaje }: { mensaje: string }): React.JSX.Element {
  return (
    <View style={styles.error}>
      <BscIcon name="error" size={20} color={BscColors.error} />
      <Text style={styles.textoError}>{mensaje}</Text>
    </View>
  );
}

function comoOpcionDeCuenta(cuenta: Producto): SelectOption<Producto> {
  const nombre =
    cuenta.categoria === 'CC' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
  const saldo =
    cuenta.saldoDisponible !== 0 ? cuenta.saldoDisponible : cuenta.saldoActual;

  return {
    key: cuenta.identificacion,
    label: `${nombre}  ${formatCurrency(saldo, cuenta.codigoMoneda)}`,
    detail: enmascarar(cuenta.identificacion),
    value: cuenta,
  };
}

function nombreDeBeneficiario(beneficiario: Beneficiario): string {
  return beneficiario.alias !== '' ? beneficiario.alias : beneficiario.nombre;
}

function enmascarar(numero: string): string {
  return numero.length <= 4 ? numero : `****${numero.slice(-4)}`;
}

/**
 * Deja escribir solo un monto con hasta dos decimales.
 *
 * El original lo consigue con un `inputFormatter`; aquí se limpia al leer. Un
 * tercer decimal cambiaría la huella respecto de lo que el backend recibe.
 */
function soloMonto(valor: string): number {
  const limpio = valor.replace(/[^\d.]/g, '');
  const partes = limpio.split('.');
  const normalizado =
    partes.length <= 1
      ? limpio
      : `${partes[0] ?? ''}.${(partes[1] ?? '').slice(0, 2)}`;

  const numero = Number.parseFloat(normalizado);
  return Number.isNaN(numero) ? 0 : numero;
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: {
    padding: 16,
    paddingTop: 20,
  },
  separacionGrande: { height: 24 },

  etiqueta: {
    marginBottom: 8,
    ...BscTextStyles['Caption/12 Bold'],
    color: BscColors.textSecondary,
  },

  aviso: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoAviso: {
    flex: 1,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },

  /**
   * La espera de los beneficiarios, con las medidas de `_dropdownContainer`
   * más el relleno de dentro: 14 a los lados y 14 arriba y abajo, no 16.
   */
  cargandoBeneficiarios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CARGANDO_BENEFICIARIOS.separacion,
    paddingHorizontal: CARGANDO_BENEFICIARIOS.lateral,
    paddingVertical: CARGANDO_BENEFICIARIOS.vertical,
    borderRadius: BscRadius.sm,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
  },
  textoCargando: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },

  /**
   * La fila «Destino» de la transferencia expresa.
   *
   * ⚠️ **Es el único sitio donde el original no se puede copiar tal cual**: su
   * botón pide `width: double.infinity` dentro de un `Row`, que da ancho no
   * acotado, y medido en el Pixel el original no dibuja ni el campo —le quedan
   * 5 px— ni el botón. Lo que se porta es lo que el original quiso escribir.
   * El porqué de cada número está en `medidasDelDestinoExpreso.ts`.
   */
  filaExpresa: {
    flexDirection: 'row',
    // `Row` de Flutter centra por defecto y el original no lo cambia.
    alignItems: 'center',
    gap: DESTINO_EXPRESO.separacion,
  },
  campoExpreso: { flex: 1 },
  /** Ancho intrínseco: el texto más los 24 de relleno a cada lado. */
  botonExpreso: { paddingHorizontal: DESTINO_EXPRESO.rellenoLateralDelBoton },
  botonValidar: { height: DESTINO_EXPRESO.altoDelBoton },

  destinoResuelto: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: BscRadius.sm,
    backgroundColor: withAlpha(BscColors.success, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(BscColors.success, 0.3),
  },
  textoResuelto: { flex: 1 },
  nombreResuelto: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  cuentaResuelta: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  simboloResuelto: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.success,
  },

  error: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: BscRadius.xs,
    backgroundColor: withAlpha(BscColors.error, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(BscColors.error, 0.3),
  },
  textoError: {
    flex: 1,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.error,
  },

  pie: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  pieUno: { flex: 1 },
  pieDos: { flex: 2 },
});
