import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscColors,
  BscIcon,
  BscRadius,
  BscSpacing,
  withAlpha,
  type BscIconName,
  BscTextStyles,
} from '@bsc/ui-native';
import { usaBeneficiario } from '../data/transferContracts';
import {
  bancoDelDestino,
  destinoEnmascarado,
  monedaDelDestino,
  monedaDelOrigen,
  montoAAcreditar,
  montoADebitar,
  necesitaConversion,
  nombreDelDestino,
  totalDebitado,
  type DatosDelAsistente,
} from '../domain/transferFlow';

import { PieDelAsistente } from './TransferWizardChrome';

/**
 * Paso 2: lo que se va a mover, antes de moverlo.
 *
 * Portado de `transfer_step_confirmation.dart`. Es la última pantalla en la que
 * el cliente puede echarse atrás, así que enseña **las dos cifras que
 * importan**: lo que llega al destino y lo que sale de la cuenta, que en una
 * transferencia cruzada no son el mismo número ni la misma moneda.
 *
 * El aviso del impuesto del 0,15 % es literal del original y de la Norma 04-04
 * de la DGII.
 */

export interface TransferStepConfirmationProps {
  datos: DatosDelAsistente;
  /** Nombre y saldo de la cuenta de origen, ya formateados por la pantalla. */
  nombreDelOrigen: string;
  cuentaDelOrigen: string;
  saldoDelOrigen: number;
  error: string | null;
  onAtras: () => void;
  onConfirmar: () => void;
}

export function TransferStepConfirmation({
  datos,
  nombreDelOrigen,
  cuentaDelOrigen,
  saldoDelOrigen,
  error,
  onAtras,
  onConfirmar,
}: TransferStepConfirmationProps): React.JSX.Element {
  const monedaOrigen = monedaDelOrigen(datos);
  const monedaDestino = monedaDelDestino(datos);
  const banco = bancoDelDestino(datos);

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Etiqueta texto="Cuenta Origen" />
        <Ficha
          icono="wallet"
          color={BscColors.success}
          titulo={nombreDelOrigen}
          subtitulo={cuentaDelOrigen}
          derecha={formatCurrency(saldoDelOrigen, monedaOrigen)}
          etiquetaDerecha="Disponible"
        />

        <View style={styles.separacion} />
        <Etiqueta texto="Destino" />
        <Ficha
          icono={usaBeneficiario(datos.tipo) ? 'person' : 'bank'}
          color={BscColors.secondary}
          titulo={
            nombreDelDestino(datos) === ''
              ? 'Cuenta destino'
              : nombreDelDestino(datos)
          }
          subtitulo={
            banco === undefined
              ? destinoEnmascarado(datos)
              : `${destinoEnmascarado(datos)} · ${banco}`
          }
        />

        <View style={styles.separacion} />
        <Etiqueta texto="Monto a Transferir" />
        <View style={styles.tarjeta}>
          <View style={styles.filaMonto}>
            <Text style={styles.etiquetaMonto}>Monto</Text>
            <Text style={styles.montoGrande}>
              {formatCurrency(montoAAcreditar(datos), monedaDestino)}
            </Text>
          </View>
        </View>

        <View style={styles.separacion} />
        <Etiqueta texto="Detalles" />
        <View style={styles.tarjeta}>
          <Renglon
            etiqueta="Monto a Acreditar"
            valor={formatCurrency(montoAAcreditar(datos), monedaDestino)}
          />

          {necesitaConversion(datos) && datos.cotizacion !== null ? (
            <>
              <Renglon
                etiqueta="Tasa de Cambio"
                valor={datos.cotizacion.tasa}
              />
              <Renglon
                etiqueta="Monto a Debitar"
                valor={formatCurrency(montoADebitar(datos), monedaOrigen)}
              />
            </>
          ) : null}

          <Renglon
            etiqueta="Comisión"
            valor={formatCurrency(datos.comisiones.comision, monedaOrigen)}
          />
          <Renglon
            etiqueta="Impuesto 0.15%"
            valor={formatCurrency(datos.comisiones.impuesto, monedaOrigen)}
          />

          <View style={styles.separador} />

          <Renglon
            etiqueta="Total a Debitar"
            valor={formatCurrency(totalDebitado(datos), monedaOrigen)}
            total
          />
        </View>

        {datos.comentario !== '' ? (
          <>
            <View style={styles.separacion} />
            <Etiqueta texto="Comentario" />
            <View style={styles.tarjetaTexto}>
              <Text style={styles.comentario}>{datos.comentario}</Text>
            </View>
          </>
        ) : null}

        <View style={styles.avisoImpuesto}>
          <BscIcon name="info" size={20} color={BscColors.info} />
          <Text style={styles.textoAviso}>
            Operación sujeta al pago del impuesto de 0.15%, sobre el monto
            solicitado, según Norma 04-04 de la DGII.
          </Text>
        </View>

        {error !== null ? (
          <View style={styles.error}>
            <BscIcon name="error" size={20} color={BscColors.error} />
            <Text style={styles.textoError}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <PieDelAsistente
        atras={{ etiqueta: 'Atrás', onPress: onAtras }}
        adelante={{
          etiqueta: 'Confirmar Transferencia',
          leading: (
            <BscIcon name="lock" size={19} color={BscColors.textOnPrimary} />
          ),
          onPress: onConfirmar,
          testID: 'transferencia-confirmar',
        }}
      />
    </View>
  );
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function Etiqueta({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.etiqueta}>{texto.toUpperCase()}</Text>;
}

function Ficha({
  icono,
  color,
  titulo,
  subtitulo,
  derecha,
  etiquetaDerecha,
}: {
  icono: BscIconName;
  color: string;
  titulo: string;
  subtitulo: string;
  derecha?: string;
  etiquetaDerecha?: string;
}): React.JSX.Element {
  return (
    <View style={[styles.tarjeta, styles.fichaFila]}>
      <View
        style={[styles.recuadro, { backgroundColor: withAlpha(color, 0.12) }]}
      >
        <BscIcon name={icono} size={22} color={color} />
      </View>

      <View style={styles.textoFicha}>
        <Text style={styles.tituloFicha} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={styles.subtituloFicha} numberOfLines={1}>
          {subtitulo}
        </Text>
      </View>

      {derecha !== undefined ? (
        <View style={styles.derecha}>
          <Text style={styles.valorDerecha}>{derecha}</Text>
          {etiquetaDerecha !== undefined ? (
            <Text style={styles.etiquetaDerecha}>{etiquetaDerecha}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Renglon({
  etiqueta,
  valor,
  total = false,
}: {
  etiqueta: string;
  valor: string;
  total?: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.renglon}>
      <Text style={total ? styles.etiquetaTotal : styles.etiquetaRenglon}>
        {etiqueta}
      </Text>
      <Text style={total ? styles.valorTotal : styles.valorRenglon}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: {
    padding: 16,
    paddingTop: 20,
  },
  separacion: { height: 20 },

  etiqueta: {
    marginBottom: 10,
    ...BscTextStyles['Caption/12 Bold'],
    color: BscColors.textSecondary,
  },

  // Borde en vez de sombra, como el `_cardDecoration` del original.
  tarjeta: {
    padding: 16,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  tarjetaTexto: {
    padding: 14,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  comentario: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },

  fichaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  recuadro: {
    width: 44,
    height: 44,
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFicha: { flex: 1 },
  tituloFicha: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  subtituloFicha: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  derecha: { alignItems: 'flex-end' },
  valorDerecha: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  etiquetaDerecha: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },

  filaMonto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etiquetaMonto: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  montoGrande: {
    ...BscTextStyles['Subtitle/20 Bold'],
    color: BscColors.textPrimary,
  },

  renglon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  etiquetaRenglon: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.textSecondary,
  },
  valorRenglon: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  etiquetaTotal: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  valorTotal: {
    ...BscTextStyles['Body L/18 Bold'],
    color: BscColors.primary,
  },
  separador: {
    height: 1,
    marginVertical: 8,
    backgroundColor: BscColors.divider,
  },

  avisoImpuesto: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: BscRadius.xs,
    backgroundColor: withAlpha(BscColors.info, 0.08),
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

  pie: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  pieUno: { flex: 1 },
  pieDos: { flex: 2 },
});
