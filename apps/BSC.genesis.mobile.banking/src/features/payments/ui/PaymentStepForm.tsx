import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscColors,
  BscIcon,
  BscRadio,
  BscRadius,
  BscSegmented,
  BscSelect,
  BscSpacing,
  BscTextField,
  withAlpha,
  BscTextStyles,
} from '@bsc/ui-native';
import { type SelectOption } from '@bsc/contracts';
import { buttonTokens } from '@bsc/ui-native';
import type { Producto } from '../../dashboard/data/productContracts';
import { PieDelAsistente } from '../../transfers/ui/TransferWizardChrome';
import {
  tituloDeSeleccion,
  TipoDeMonto,
  TipoDePago,
} from '../data/paymentContracts';
import {
  codigoDeMonedaDeLaCuenta,
  codigoDeMonedaDelPago,
  esPrestamo,
  esTarjetaMultimoneda,
  montoDelPago,
  necesitaConversion,
  numeroVisible,
  opcionesDeMonto,
  puedeContinuar,
  type DatosDelPago,
} from '../domain/paymentFlow';

/**
 * Paso 1 del pago: qué se paga, desde dónde y cuánto.
 *
 * Portado de `payment_step_form.dart`. La diferencia de fondo con el paso 1 de
 * una transferencia es que aquí **el monto se elige, no se escribe**: el core
 * ya sabe cuánto es el mínimo y cuánto el balance al corte, y hacérselos
 * teclear al cliente es una ocasión de equivocarse en una cifra que el banco ya
 * conoce. «Otro monto» queda para quien quiera abonar una cantidad distinta.
 */

export interface PaymentStepFormProps {
  datos: DatosDelPago;
  productos: Producto[];
  cuentas: Producto[];
  error: string | null;
  onProducto: (producto: Producto) => void;
  onCuenta: (cuenta: Producto) => void;
  onMoneda: (moneda: 'DOP' | 'USD') => void;
  onTipoDeMonto: (tipo: TipoDeMonto) => void;
  onMontoEscrito: (monto: number) => void;
  onComentario: (texto: string) => void;
  onCancelar: () => void;
  onContinuar: () => void;
}

export function PaymentStepForm({
  datos,
  productos,
  cuentas,
  error,
  onProducto,
  onCuenta,
  onMoneda,
  onTipoDeMonto,
  onMontoEscrito,
  onComentario,
  onCancelar,
  onContinuar,
}: PaymentStepFormProps): React.JSX.Element {
  const opcionesDeProducto = useMemo<SelectOption<Producto>[]>(
    () =>
      productos.map(p => ({
        key: p.identificacion,
        label: esPrestamo(datos) ? 'Préstamo' : 'Tarjeta de Crédito',
        detail:
          p.numeroEnmascarado ??
          (p.identificacion.length <= 4
            ? p.identificacion
            : `****${p.identificacion.slice(-4)}`),
        value: p,
      })),
    [productos, datos],
  );

  const opcionesDeCuenta = useMemo<SelectOption<Producto>[]>(
    () =>
      cuentas.map(c => {
        const saldo =
          c.saldoDisponible !== 0 ? c.saldoDisponible : c.saldoActual;

        return {
          key: c.identificacion,
          label: `${
            c.categoria === 'CC' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'
          }  ${formatCurrency(saldo, c.codigoMoneda)}`,
          detail:
            c.identificacion.length <= 4
              ? c.identificacion
              : `****${c.identificacion.slice(-4)}`,
          value: c,
        };
      }),
    [cuentas],
  );

  const opciones = opcionesDeMonto(datos);
  const monedaDelPago = codigoDeMonedaDelPago(datos);

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Etiqueta texto={tituloDeSeleccion(datos.tipo)} />
        <BscSelect
          title={tituloDeSeleccion(datos.tipo)}
          placeholder={
            datos.tipo === TipoDePago.Prestamo
              ? 'Selecciona el préstamo'
              : 'Selecciona la tarjeta'
          }
          options={opcionesDeProducto}
          selectedKey={datos.producto?.identificacion ?? null}
          onSelect={opcion => onProducto(opcion.value)}
          testID="select-producto-a-pagar"
        />

        {/* El selector de moneda solo aparece si la tarjeta tiene ciclo en
            dólares: en una que no lo tiene, ofrecerlo prometería un pago que
            el core rechazaría. */}
        {esTarjetaMultimoneda(datos) ? (
          <>
            <View style={styles.separacionGrande} />
            <Etiqueta texto="Moneda" />
            <BscSegmented
              labels={['RD$', 'US$']}
              selectedIndex={datos.moneda === 'USD' ? 1 : 0}
              onChange={indice => onMoneda(indice === 1 ? 'USD' : 'DOP')}
              testID="moneda-del-ciclo"
            />
          </>
        ) : null}

        <View style={styles.separacionGrande} />
        <Etiqueta texto="Monto a Pagar" />
        <View style={styles.grupoDeMontos}>
          {opciones.map((opcion, indice) => {
            const elegida = opcion.tipo === datos.tipoDeMonto;

            return (
              <View key={opcion.tipo}>
                {indice > 0 ? <View style={styles.separadorFino} /> : null}
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: elegida }}
                  onPress={() => onTipoDeMonto(opcion.tipo)}
                  style={({ pressed }) => [
                    styles.filaDeMonto,
                    pressed && styles.filaPresionada,
                  ]}
                  testID={`monto-${opcion.tipo}`}
                >
                  <BscRadio selected={elegida} />
                  <Text style={styles.etiquetaDeMonto}>{opcion.etiqueta}</Text>
                  {!opcion.editable ? (
                    <Text style={styles.cifraDeMonto}>
                      {formatCurrency(opcion.monto, monedaDelPago)}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>

        {datos.tipoDeMonto === TipoDeMonto.Otro ? (
          <View style={styles.separacion}>
            <BscTextField
              label=""
              value={datos.montoEscrito === 0 ? '' : String(datos.montoEscrito)}
              onChangeText={valor => onMontoEscrito(soloMonto(valor))}
              placeholder={`${monedaDelPago === 840 ? 'US$' : 'RD$'} 0.00`}
              keyboardType="decimal-pad"
              testID="campo-monto-pago"
            />
          </View>
        ) : null}

        <View style={styles.separacionGrande} />
        <Etiqueta texto="Cuenta Origen" />
        <BscSelect
          title="Cuenta Origen"
          placeholder="Selecciona la cuenta"
          options={opcionesDeCuenta}
          selectedKey={datos.cuentaOrigen?.identificacion ?? null}
          onSelect={opcion => onCuenta(opcion.value)}
          testID="select-cuenta-a-debitar"
        />

        {necesitaConversion(datos) ? (
          <View style={styles.aviso}>
            <BscIcon name="exchange" size={16} color={BscColors.info} />
            <Text style={styles.textoAviso}>
              Se debitará de una cuenta en{' '}
              {codigoDeMonedaDeLaCuenta(datos) === 840 ? 'USD' : 'DOP'}. El
              monto se convertirá automáticamente.
            </Text>
          </View>
        ) : null}

        {/* Un préstamo no lleva comentario: el core no lo guarda. */}
        {!esPrestamo(datos) ? (
          <>
            <View style={styles.separacionGrande} />
            <Etiqueta texto="Comentario (opcional)" />
            <BscTextField
              label=""
              value={datos.comentario}
              onChangeText={onComentario}
              placeholder="Ingrese un comentario"
              maxLength={90}
              autoCapitalize="sentences"
              testID="campo-comentario-pago"
            />
          </>
        ) : null}

        {error !== null ? (
          <View style={styles.error}>
            <BscIcon name="error" size={20} color={BscColors.error} />
            <Text style={styles.textoError}>{error}</Text>
          </View>
        ) : null}

        {datos.producto !== null ? (
          <Text style={styles.pieNumero}>
            Se aplicará a {numeroVisible(datos)}
          </Text>
        ) : null}
      </ScrollView>

      <PieDelAsistente
        atras={{ etiqueta: 'Cancelar', onPress: onCancelar }}
        adelante={{
          etiqueta: 'Continuar',
          onPress:
            puedeContinuar(datos) && montoDelPago(datos) > 0
              ? onContinuar
              : undefined,
          trailing: (
            <BscIcon
              name="arrow-forward"
              size={buttonTokens.iconTrailing}
            />
          ),
          testID: 'pago-continuar',
        }}
      />
    </View>
  );
}

function Etiqueta({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.etiqueta}>{texto.toUpperCase()}</Text>;
}

/** Igual que en transferencias: hasta dos decimales, y nada más. */
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
  separacion: { marginTop: BscSpacing.sm },
  separacionGrande: { height: 24 },

  etiqueta: {
    marginBottom: 8,
    ...BscTextStyles['Caption/12 Bold'],
    color: BscColors.textSecondary,
  },

  grupoDeMontos: {
    borderRadius: BscRadius.md,
    borderWidth: 1,
    borderColor: BscColors.border,
    backgroundColor: BscColors.surface,
    overflow: 'hidden',
  },
  filaDeMonto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  filaPresionada: {
    backgroundColor: BscColors.surfaceVariant,
  },
  separadorFino: {
    height: 1,
    marginLeft: 46,
    backgroundColor: BscColors.divider,
  },
  etiquetaDeMonto: {
    flex: 1,
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  cifraDeMonto: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.primary,
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

  error: {
    marginTop: 12,
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

  pieNumero: {
    marginTop: 16,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
    textAlign: 'center',
  },

  pie: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  pieUno: { flex: 1 },
  pieDos: { flex: 2 },
});
