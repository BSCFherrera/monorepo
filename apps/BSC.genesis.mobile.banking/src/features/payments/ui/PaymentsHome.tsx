import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatDOP, formatUSD, maskAccountNumber } from '@bsc/shared';

import {
  BscCard,
  BscColors,
  BscEmptyState,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPageHeader,
  BscRadius,
  BscSpacing,
  BscGradients,
  BscGradientSurface,
  BscTextStyles,
} from '@bsc/ui-native';
import {
  nombreDeCategoria,
  type Producto,
} from '../../dashboard/data/productContracts';

/**
 * La pantalla con la que abre la pestaña de pagos.
 *
 * Portada de `payment_home_body.dart`: **la lista de productos, no un selector
 * de tipo**. El porte abría con un menú de dos opciones —«Tarjeta de Crédito ·
 * 4 tarjetas a tu nombre»— y eso costaba un toque de más y escondía justo lo
 * que el cliente necesita para decidir.
 *
 * Por qué se volvió al modelo del original, que es además el que recomienda la
 * práctica corriente:
 *
 * - **Reconocer en vez de recordar.** «Tarjeta •••• 7147 · RD$ 62,377.35» le
 *   dice al cliente cuál es; «4 tarjetas a tu nombre» le obliga a acordarse.
 * - **Coherencia con el propio inicio.** El dashboard ya enseña «Para hoy ·
 *   Tarjeta •••• 7147 · Pago mínimo RD$ 174.04 · Pagar». Que la pestaña de
 *   pagos escondiera ese dato se contradecía con la pantalla principal.
 * - **Un nivel de jerarquía se añade cuando hay amplitud que ordenar.** El
 *   portal tiene siete categorías de pago y por eso allí sí hay un menú; la
 *   aplicación móvil implementa dos.
 *
 * ⚠️ **Si algún día llegan Servicios o Impuestos al móvil, esta decisión hay
 * que revisarla**: con cinco o siete categorías el selector vuelve a tener
 * sentido, y el patrón que conviene entonces no es solo categorías, sino las
 * categorías con los pagos pendientes surfaceados encima.
 */

/** Lo que el cliente eligió pagar. */
export interface ProductoAPagar {
  producto: Producto;
  esPrestamo: boolean;
}

export interface PaymentsHomeProps {
  tarjetas: Producto[];
  prestamos: Producto[];
  onElegir: (eleccion: ProductoAPagar) => void;
  /** Se muestran ocultos cuando el cliente escondió sus saldos en el inicio. */
  saldosOcultos?: boolean | undefined;
  onActivity?: (() => void) | undefined;
}

export function PaymentsHome({
  tarjetas,
  prestamos,
  onElegir,
  saldosOcultos = false,
  onActivity,
}: PaymentsHomeProps): React.JSX.Element {
  const nada = tarjetas.length === 0 && prestamos.length === 0;

  return (
    <View style={styles.pantalla}>
      <BscPageHeader
        title="Pagar"
        subtitle="Tarjetas de crédito y préstamos"
        testID="cabecera-pagos"
      />

      {nada ? (
        <BscEmptyState
          icon="payments"
          title="Nada por pagar"
          message="No tienes tarjetas ni préstamos para pagar en este momento."
          testID="pagos-vacio"
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          onScrollBeginDrag={onActivity}
          showsVerticalScrollIndicator={false}
        >
          {tarjetas.length > 0 ? (
            <>
              <TituloDeSeccion icono="card" texto="Tarjetas de Crédito" />
              <View style={styles.separacion12} />
              {tarjetas.map(tarjeta => (
                <FilaDeProducto
                  key={tarjeta.identificacion}
                  producto={tarjeta}
                  esPrestamo={false}
                  saldosOcultos={saldosOcultos}
                  onPress={() => {
                    onActivity?.();
                    onElegir({ producto: tarjeta, esPrestamo: false });
                  }}
                />
              ))}
              <View style={styles.separacion24} />
            </>
          ) : null}

          {prestamos.length > 0 ? (
            <>
              <TituloDeSeccion icono="bank" texto="Préstamos" />
              <View style={styles.separacion12} />
              {prestamos.map(prestamo => (
                <FilaDeProducto
                  key={prestamo.identificacion}
                  producto={prestamo}
                  esPrestamo
                  saldosOcultos={saldosOcultos}
                  onPress={() => {
                    onActivity?.();
                    onElegir({ producto: prestamo, esPrestamo: true });
                  }}
                />
              ))}
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function TituloDeSeccion({
  icono,
  texto,
}: {
  icono: 'card' | 'bank';
  texto: string;
}): React.JSX.Element {
  return (
    <View style={styles.tituloSeccion}>
      <BscIconTile icon={icono} size={30} iconSize={15} />
      <View style={styles.separacionH4} />
      <Text style={styles.textoSeccion}>{texto}</Text>
    </View>
  );
}

/**
 * Una fila de producto.
 *
 * El original enseña el balance a la fecha. Aquí se enseña **además el pago
 * mínimo**, por decisión del banco: es el dato con el que el cliente decide, y
 * el que el dashboard ya le muestra en «Para hoy». Es la única diferencia
 * deliberada con `payment_home_body.dart`.
 *
 * ⚠️ **La fecha límite no se muestra, y no es un olvido.** El servicio de
 * productos no la trae: sale de `FECHA_VENCIMIENTO` en el detalle de la
 * tarjeta, que es una llamada por tarjeta. Pedir cuatro detalles para dibujar
 * una lista sería cambiar una lista instantánea por una que tarda. Queda
 * anotado para cuando el backend la incluya en el listado.
 */
function FilaDeProducto({
  producto,
  esPrestamo,
  saldosOcultos,
  onPress,
}: {
  producto: Producto;
  esPrestamo: boolean;
  saldosOcultos: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const oculto = '••••••';

  return (
    <View style={styles.filaProducto}>
      <BscCard style={styles.tarjetaSinRelleno}>
        <BscListRow
          leading={
            <BscGradientSurface
              gradient={
                esPrestamo ? BscGradients.accountCard : BscGradients.creditCard
              }
              style={styles.iconoDeProducto}
            >
              <BscIcon
                name={esPrestamo ? 'bank' : 'card'}
                size={21}
                color={BscColors.textOnPrimary}
              />
            </BscGradientSurface>
          }
          title={nombreDeCategoria(producto.categoria)}
          subtitle={numeroVisible(producto)}
          trailing={
            <View style={styles.montos}>
              {esPrestamo ? (
                <>
                  <Text style={styles.montoPrincipal}>
                    {saldosOcultos
                      ? oculto
                      : montoEnSuMoneda(
                          producto.saldoPendiente,
                          producto.codigoMoneda,
                        )}
                  </Text>
                  <Text style={styles.etiquetaMonto}>Pendiente</Text>
                </>
              ) : (
                <>
                  <Text style={styles.montoPrincipal}>
                    {saldosOcultos ? oculto : formatDOP(producto.saldoPesos)}
                  </Text>
                  <Text style={styles.montoSecundario}>
                    {saldosOcultos ? oculto : formatUSD(producto.saldoDolares)}
                  </Text>
                  <Text style={styles.etiquetaMonto}>Balance a la fecha</Text>

                  {/*
                    La mejora sobre el original: el pago mínimo, que es lo que
                    el cliente viene a resolver. Solo cuando hay uno — una
                    tarjeta de contado manda cero, y escribir «Mín. RD$ 0.00»
                    sería inventar una obligación que no existe.

                    Se abrevia «Mín.» y no «Mínimo» porque la columna de montos
                    se dimensiona por su línea más ancha, y la larga empujaba el
                    nombre del producto hasta cortarlo. El nombre es lo que el
                    cliente lee primero.
                  */}
                  {producto.pagoMinimoPesos > 0 ? (
                    <Text style={styles.pagoMinimo} testID="pago-minimo">
                      {saldosOcultos
                        ? oculto
                        : `Mín. ${formatDOP(producto.pagoMinimoPesos)}`}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          }
          showChevron
          onPress={onPress}
          testID={`pagar-${producto.identificacion}`}
        />
      </BscCard>
    </View>
  );
}

/**
 * El número que se enseña bajo el nombre del producto.
 *
 * Una tarjeta usa el enmascarado que manda el core —`4539********0668`—, que es
 * lo que el cliente lee en su plástico. Un préstamo no tiene enmascarado propio
 * y el original lo compone como `****` más los últimos cuatro dígitos, que es
 * justo lo que hace `maskAccountNumber`.
 */
export function numeroVisible(producto: Producto): string {
  if (
    producto.numeroEnmascarado !== undefined &&
    producto.numeroEnmascarado !== ''
  ) {
    return producto.numeroEnmascarado;
  }
  return maskAccountNumber(producto.identificacion);
}

function montoEnSuMoneda(monto: number, codigoMoneda: number): string {
  return codigoMoneda === 840 ? formatUSD(monto) : formatDOP(monto);
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  // 16, 20, 16, 24 literal del original.
  contenido: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  tituloSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 15/700 con espaciado -0.1, el `BscTitleStyles.section` del original.
  textoSeccion: {
    ...BscTextStyles['Body MD/16 Bold'],
    color: BscColors.textPrimary,
  },
  filaProducto: {
    marginBottom: BscSpacing.xs,
  },
  tarjetaSinRelleno: {
    padding: 0,
  },
  // 44×44 con radio pequeño, como el original.
  iconoDeProducto: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.sm,
  },
  montos: {
    alignItems: 'flex-end',
  },
  montoPrincipal: {
    ...BscTextStyles['Body S/14 Bold'],
    color: BscColors.textPrimary,
  },
  montoSecundario: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textSecondary,
  },
  etiquetaMonto: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  pagoMinimo: {
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.warning,
  },
  separacionH4: { width: BscSpacing.xs },
  separacion12: { height: 12 },
  separacion24: { height: 24 },
});
