import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatCurrency } from '@bsc/shared';

import {
  BscBorderRadius,
  BscColors,
  BscIconTile,
  BscListRow,
  BscRowDivider,
  BscSectionHeader,
  BscShadows,
  BscSheet,
} from '@bsc/ui-native';
import type { BscIconName } from '@bsc/ui-native';

import {
  nombreDeCategoria,
  ProductCategory,
  type Producto,
  type ProductosAgrupados,
} from '../data/productContracts';

/**
 * «Tus productos»: una tarjeta, una fila por producto.
 *
 * Portada de `product_list_widget.dart`. Tres detalles del original que importan
 * más de lo que parecen:
 *
 *  - **Todos los productos van dentro de una sola tarjeta**, separados por
 *    líneas, no en tarjetas individuales. Una tarjeta por producto convierte
 *    una lista de dieciocho en dieciocho bloques flotantes y la pantalla se
 *    vuelve ruidosa.
 *  - **En el dashboard solo se listan los primeros cuatro**, y el resto se ve
 *    en una hoja al tocar «Ver todos». Sin el corte, la lista empuja la sección
 *    de balance tan abajo que deja de existir para el cliente.
 *  - Cada fila lleva el número con puntos —`•••• 3953`, no `****3953`— y a la
 *    derecha el monto con su etiqueta debajo, que **no siempre dice lo mismo**:
 *    «Disponible» en cuentas y tarjetas, «Balance» en préstamos e «Invertido»
 *    en certificados. Llamar «Disponible» al saldo de un préstamo diría que el
 *    cliente puede gastarlo.
 */

export interface ProductListProps {
  productos: ProductosAgrupados;
  saldosOcultos: boolean;
  onSelectProduct: (producto: Producto) => void;
  /** Cuántos se listan antes de ofrecer «Ver todos». */
  maximo?: number;
  mostrarEncabezado?: boolean;
}

const OCULTO = '••••••';

/** Los cuatro del original: lo demás se ve en la hoja de «Ver todos». */
const MAXIMO_POR_DEFECTO = 4;

interface Apariencia {
  icono: BscIconName;
  tinte: string;
  titulo: string;
  /** Qué significa el monto de la derecha. */
  etiqueta: string;
}

/**
 * Icono, tinte y textos por tipo de producto.
 *
 * El tinte es el atajo: verde para el dinero propio, azul para la tarjeta y el
 * préstamo, verde azulado para el certificado. Se lee antes que el texto.
 */
function apariencia(producto: Producto): Apariencia {
  switch (producto.categoria) {
    case ProductCategory.Savings:
      return {
        icono: 'savings',
        tinte: BscColors.secondary,
        titulo: 'Cuenta de Ahorros',
        etiqueta: 'Disponible',
      };
    case ProductCategory.Checking:
      return {
        icono: 'wallet',
        tinte: BscColors.secondary,
        titulo: 'Cuenta Corriente',
        etiqueta: 'Disponible',
      };
    case ProductCategory.CreditCard:
      return {
        icono: 'card',
        tinte: BscColors.primary,
        titulo: 'Tarjeta de Crédito',
        etiqueta: 'Disponible',
      };
    case ProductCategory.Loan:
      return {
        icono: 'bank',
        tinte: BscColors.info,
        titulo: 'Préstamo',
        etiqueta: 'Balance',
      };
    case ProductCategory.Certificate:
      return {
        icono: 'verified',
        tinte: BscColors.teal,
        titulo: 'Certificado',
        etiqueta: 'Invertido',
      };
    default:
      return {
        icono: 'grid',
        tinte: BscColors.textSecondary,
        titulo: 'Producto',
        etiqueta: 'Balance',
      };
  }
}

/** Últimos cuatro dígitos con puntos, como en el original. */
function ultimosCuatro(producto: Producto): string {
  const numero = producto.numeroEnmascarado ?? producto.identificacion;
  const digitos = numero.replace(/\D/g, '');
  return `•••• ${digitos.slice(-4)}`;
}

/**
 * Monto que se enseña de cada producto.
 *
 * En una tarjeta interesa cuánto se puede gastar; en un préstamo y en un
 * certificado, el balance; en una cuenta, el disponible.
 */
function montoDe(producto: Producto): number {
  switch (producto.categoria) {
    case ProductCategory.CreditCard:
      return producto.disponiblePesos;
    case ProductCategory.Loan:
      // Lo que falta por pagar, no el monto original del préstamo.
      return producto.saldoPendiente > 0
        ? producto.saldoPendiente
        : producto.saldoActual;
    case ProductCategory.Certificate:
      return producto.saldoActual;
    default:
      return producto.saldoDisponible !== 0
        ? producto.saldoDisponible
        : producto.saldoActual;
  }
}

/** El orden importa: primero lo que el cliente tiene, después lo que debe. */
function ordenar(productos: ProductosAgrupados): Producto[] {
  return [
    ...productos.cuentas,
    ...productos.tarjetas,
    ...productos.prestamos,
    ...productos.certificados,
    // Las categorías que no reconocemos se muestran igual. En la app Flutter
    // desaparecían sin dejar rastro.
    ...productos.desconocidos,
  ];
}

export function ProductList({
  productos,
  saldosOcultos,
  onSelectProduct,
  maximo = MAXIMO_POR_DEFECTO,
  mostrarEncabezado = true,
}: ProductListProps): React.JSX.Element {
  const [hojaAbierta, setHojaAbierta] = useState(false);

  const todos = ordenar(productos);
  const recortada = todos.length > maximo;
  const visibles = recortada ? todos.slice(0, maximo) : todos;

  return (
    <View>
      {mostrarEncabezado ? (
        <BscSectionHeader
          title="Tus productos"
          {...(recortada
            ? {
                actionLabel: 'Ver todos',
                onAction: () => setHojaAbierta(true),
              }
            : {})}
        />
      ) : null}

      <View style={styles.tarjeta}>
        {visibles.map((producto, indice) => (
          <View key={`${producto.categoria}-${producto.identificacion}`}>
            {indice > 0 ? <BscRowDivider /> : null}
            <Fila
              producto={producto}
              saldosOcultos={saldosOcultos}
              onPress={() => onSelectProduct(producto)}
            />
          </View>
        ))}
      </View>

      <HojaTodos
        visible={hojaAbierta}
        productos={todos}
        saldosOcultos={saldosOcultos}
        onCerrar={() => setHojaAbierta(false)}
        onSelectProduct={producto => {
          setHojaAbierta(false);
          onSelectProduct(producto);
        }}
      />
    </View>
  );
}

function Fila({
  producto,
  saldosOcultos,
  onPress,
}: {
  producto: Producto;
  saldosOcultos: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const estilo = apariencia(producto);

  // El disponible de una tarjeta siempre se anuncia en pesos, aunque la tarjeta
  // maneje las dos monedas.
  const moneda =
    producto.categoria === ProductCategory.CreditCard
      ? 214
      : producto.codigoMoneda;

  return (
    <BscListRow
      leading={<BscIconTile icon={estilo.icono} color={estilo.tinte} />}
      title={nombreDeCategoria(producto.categoria)}
      subtitle={ultimosCuatro(producto)}
      trailingLabel={
        saldosOcultos ? OCULTO : formatCurrency(montoDe(producto), moneda)
      }
      trailingSubLabel={estilo.etiqueta}
      onPress={onPress}
      testID={`producto-${producto.identificacion}`}
    />
  );
}

/**
 * Hoja con la lista completa.
 *
 * Es una hoja y no una pantalla propia porque en el original también lo es: se
 * abre sobre el dashboard, se cierra, y la posición del desplazamiento no se
 * pierde.
 */
function HojaTodos({
  visible,
  productos,
  saldosOcultos,
  onCerrar,
  onSelectProduct,
}: {
  visible: boolean;
  productos: Producto[];
  saldosOcultos: boolean;
  onCerrar: () => void;
  onSelectProduct: (producto: Producto) => void;
}): React.JSX.Element {
  return (
    <BscSheet
      visible={visible}
      title="Tus productos"
      onClose={onCerrar}
      testID="hoja-productos"
    >
      <View style={styles.bloqueHoja}>
        {productos.map((producto, indice) => (
          <View key={`todos-${producto.categoria}-${producto.identificacion}`}>
            {indice > 0 ? <BscRowDivider /> : null}
            <Fila
              producto={producto}
              saldosOcultos={saldosOcultos}
              onPress={() => onSelectProduct(producto)}
            />
          </View>
        ))}
      </View>
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: BscColors.surface,
    borderRadius: BscBorderRadius.card,
    ...BscShadows.card,
  },
  bloqueHoja: {
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscBorderRadius.card,
  },
});
