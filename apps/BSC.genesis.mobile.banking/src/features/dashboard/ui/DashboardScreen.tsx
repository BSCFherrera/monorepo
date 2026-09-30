import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AxiosInstance } from 'axios';

import { formatDOP } from '@bsc/shared';

import {
  BscCard,
  BscColors,
  BscIconTile,
  BscPlaceholder,
  BscPrimaryButton,
  BscSectionHeader,
  BscSheet,
  BscSpacing,
  BscTextButton,
  BscTextStyles,
} from '@bsc/design-system';
import { Endpoints } from '../../../core/network/endpoints';
import { useAuthStore } from '../../auth/authStore';
import {
  agruparProductos,
  parseRespuestaProductos,
  type Producto,
  type ProductosAgrupados,
} from '../data/productContracts';
import {
  calcularResumen,
  parseTasaVentaDolar,
  type ResumenDeBalance,
} from '../data/balanceSummary';

import { BalanceSummaryCard } from './BalanceSummaryCard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSkeleton } from './DashboardSkeleton';
import { ProductList } from './ProductList';
import { QuickActions, type AccionRapida } from './QuickActions';

/**
 * Pantalla principal.
 *
 * Portada de `dashboard_screen.dart`. Reproducir su composición —y no solo la
 * lista de productos— es lo que hace que la pantalla se reconozca como la misma
 * app.
 *
 * De arriba abajo: cabecera con el dinero disponible, acciones rápidas montadas
 * sobre ella, «Para hoy» con lo que vence, los primeros cuatro productos, «Tu
 * balance» con la posición consolidada, y la barra de navegación.
 */

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; productos: ProductosAgrupados; resumen: ResumenDeBalance };

/**
 * Las cuatro acciones rápidas de la cabecera. `mas` no es un destino: abre la
 * hoja con el resto, como en el original.
 */
export type ClaveDeAccionRapida =
  | 'transferir'
  | 'pagar-tarjeta'
  | 'tasa'
  | 'mas';

export interface DashboardScreenProps {
  http: AxiosInstance;
  onLogout: () => Promise<void>;
  onActivity: () => void;
  onSelectProduct: (producto: Producto) => void;
  onAccionRapida: (clave: ClaveDeAccionRapida) => void;
  /** Abre el perfil desde el avatar de la cabecera. */
  onPerfil: () => void;
}

/** Cuánto solapa la tarjeta de acciones sobre la cabecera. */
const SOLAPE = 22;

export function DashboardScreen({
  http,
  onLogout,
  onActivity,
  onSelectProduct,
  onAccionRapida,
  onPerfil,
}: DashboardScreenProps): React.JSX.Element {
  const usuario = useAuthStore(s => s.usuario);

  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [refrescando, setRefrescando] = useState(false);
  const [saldosOcultos, setSaldosOcultos] = useState(false);
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);

  /**
   * Tasa de venta del dólar del día.
   *
   * Va aparte de los productos y **no bloquea la pantalla**: si el servicio de
   * tasas no responde, el resumen se consolida con la tasa de respaldo y lo
   * dice en voz alta, en vez de dejar al cliente sin saldos.
   */
  const pedirTasa = useCallback(async (): Promise<number | null> => {
    try {
      const respuesta = await http.get(Endpoints.exchangeRateList);
      return parseTasaVentaDolar(respuesta.data);
    } catch {
      return null;
    }
  }, [http]);

  const cargar = useCallback(async (): Promise<void> => {
    try {
      const [respuesta, tasa] = await Promise.all([
        http.post(Endpoints.products, { productType: '' }),
        pedirTasa(),
      ]);

      const datos = parseRespuestaProductos(respuesta.data);

      // El core devuelve fallos de negocio dentro de un HTTP 200.
      if (datos.codigoResultado !== 0) {
        setEstado({
          tipo: 'error',
          mensaje: datos.mensaje ?? 'No pudimos cargar tus productos.',
        });
        return;
      }

      const productos = agruparProductos(datos.productos);
      setEstado({
        tipo: 'listo',
        productos,
        resumen: calcularResumen(productos, tasa),
      });
    } catch {
      setEstado({
        tipo: 'error',
        mensaje:
          'No pudimos conectarnos. Verifica tu conexión e intenta de nuevo.',
      });
    }
  }, [http, pedirTasa]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const refrescar = useCallback(async (): Promise<void> => {
    setRefrescando(true);
    onActivity();
    await cargar();
    setRefrescando(false);
  }, [cargar, onActivity]);

  const nombre = usuario?.firstName ?? '';
  const iniciales = useMemo(() => {
    const a = (usuario?.firstName ?? '').trim().charAt(0);
    const b = (usuario?.lastName ?? '').trim().charAt(0);
    const resultado = `${a}${b}`.toUpperCase();
    // Nunca vacío: cae a las del banco.
    return resultado === '' ? 'BS' : resultado;
  }, [usuario]);

  const acciones: AccionRapida[] = useMemo(() => {
    const ir = (clave: ClaveDeAccionRapida) => () => {
      onActivity();
      onAccionRapida(clave);
    };

    return [
      {
        clave: 'transferir',
        etiqueta: 'Transferir',
        icono: 'transfer',
        onPress: ir('transferir'),
      },
      {
        clave: 'pagar-tarjeta',
        etiqueta: 'Pagar tarjeta',
        icono: 'card',
        onPress: ir('pagar-tarjeta'),
      },
      {
        clave: 'tasa',
        etiqueta: 'Tasa de cambio',
        icono: 'exchange',
        onPress: ir('tasa'),
      },
      { clave: 'mas', etiqueta: 'Más', icono: 'grid', onPress: ir('mas') },
    ];
  }, [onAccionRapida, onActivity]);

  const pendientes =
    estado.tipo === 'listo' ? tarjetasConPagoPendiente(estado.productos) : [];

  const totalProductos =
    estado.tipo === 'listo'
      ? estado.productos.cuentas.length +
        estado.productos.tarjetas.length +
        estado.productos.prestamos.length +
        estado.productos.certificados.length +
        estado.productos.desconocidos.length
      : 0;

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.cuerpo}
        contentContainerStyle={styles.contenido}
        onScrollBeginDrag={onActivity}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              void refrescar();
            }}
            tintColor={BscColors.primary}
          />
        }
        testID="dashboard-contenido"
      >
        <DashboardHeader
          nombre={nombre}
          iniciales={iniciales}
          resumen={
            estado.tipo === 'listo'
              ? estado.resumen
              : calcularResumen(agruparProductos([]))
          }
          cantidadDeProductos={totalProductos}
          pendientes={pendientes.length}
          saldosOcultos={saldosOcultos}
          onAlternarSaldos={() => {
            onActivity();
            setSaldosOcultos(previo => !previo);
          }}
          onPerfil={() => {
            onActivity();
            onPerfil();
          }}
          onNotificaciones={() => {
            onActivity();
            setAvisosAbiertos(true);
          }}
        />

        {/* La tarjeta de acciones se monta sobre la cabecera. */}
        <QuickActions acciones={acciones} style={styles.acciones} />

        {/*
          La silueta de lo que va a llegar, no un círculo girando: el original
          monta `_DashboardSkeleton` para que la página no dé un salto cuando
          aterrizan los datos.
        */}
        {estado.tipo === 'cargando' ? (
          <View testID="dashboard-cargando">
            <DashboardSkeleton />
          </View>
        ) : null}

        {estado.tipo === 'error' ? (
          <BscPlaceholder
            tone="error"
            title="No pudimos cargar tus productos"
            message={estado.mensaje}
            testID="dashboard-error"
            action={
              <BscTextButton
                label="Reintentar"
                onPress={() => {
                  void refrescar();
                }}
              />
            }
          />
        ) : null}

        {estado.tipo === 'listo' ? (
          <View style={styles.secciones}>
            <ParaHoy
              tarjetas={pendientes}
              saldosOcultos={saldosOcultos}
              onPagar={onSelectProduct}
            />

            {totalProductos === 0 ? (
              <BscPlaceholder
                title="Aún no tienes productos"
                message="Cuando abras una cuenta aparecerá aquí."
                testID="dashboard-vacio"
              />
            ) : (
              <ProductList
                productos={estado.productos}
                saldosOcultos={saldosOcultos}
                onSelectProduct={onSelectProduct}
              />
            )}

            <View>
              <BscSectionHeader title="Tu balance" />
              <BalanceSummaryCard
                resumen={estado.resumen}
                saldosOcultos={saldosOcultos}
              />
            </View>

            {/* Provisional: en la app Flutter cerrar sesión vive en el perfil.
                Se queda aquí hasta que esa pantalla se migre, porque dejar la
                app sin salida mientras tanto sería peor. */}
            <BscTextButton
              label="Cerrar sesión"
              onPress={() => {
                void onLogout();
              }}
              testID="dashboard-cerrar-sesion"
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Notificaciones: hoy es el estado vacío del original, palabra por
          palabra. El centro de avisos de verdad llega con las notificaciones
          push, que quedaron para después de la migración (P-04). */}
      <BscSheet
        visible={avisosAbiertos}
        title="Notificaciones"
        onClose={() => setAvisosAbiertos(false)}
        testID="hoja-notificaciones"
      >
        <BscPlaceholder
          title="Estás al día"
          message="Te avisaremos aquí cuando ocurra algo en tus productos."
        />
      </BscSheet>
    </View>
  );
}

/**
 * Tarjetas con pago mínimo pendiente.
 *
 * Portado de `TodayItem.from`. Solo se cuenta el mínimo en pesos, que es el que
 * el original mira: el saldo en dólares de una tarjeta se paga por otra vía.
 *
 * El original también contempla cuotas de préstamo, pero su cuota mensual nunca
 * se llena desde el servicio de productos, así que en la práctica la lista es
 * solo de tarjetas. Migrar ese recorrido muerto habría sido copiar código que
 * no se ejecuta.
 */
function tarjetasConPagoPendiente(productos: ProductosAgrupados): Producto[] {
  return productos.tarjetas.filter(tarjeta => tarjeta.pagoMinimoPesos > 0);
}

/**
 * «Para hoy»: lo que pide una decisión.
 *
 * Cuando no hay nada pendiente **no desaparece**, sino que lo dice. Esa es la
 * respuesta a la pregunta con la que el cliente abre la app, y una sección que
 * se esfuma deja la duda de si se revisó.
 */
function ParaHoy({
  tarjetas,
  saldosOcultos,
  onPagar,
}: {
  tarjetas: Producto[];
  saldosOcultos: boolean;
  onPagar: (producto: Producto) => void;
}): React.JSX.Element {
  if (tarjetas.length === 0) {
    return (
      <BscCard testID="para-hoy-vacio">
        <View style={styles.filaVacia}>
          <BscIconTile
            icon="check-circle"
            color={BscColors.success}
            size={38}
            iconSize={20}
          />
          <View style={styles.textoVacio}>
            <Text style={styles.tituloVacio}>No tienes pendientes</Text>
            <Text style={styles.detalleVacio}>
              Todos tus productos están al día
            </Text>
          </View>
        </View>
      </BscCard>
    );
  }

  return (
    <View testID="para-hoy">
      <BscSectionHeader
        title="Para hoy"
        trailingText={`${tarjetas.length} ${
          tarjetas.length === 1 ? 'pendiente' : 'pendientes'
        }`}
      />

      {tarjetas.map(tarjeta => {
        const digitos = (tarjeta.numeroEnmascarado ?? tarjeta.identificacion)
          .replace(/\D/g, '')
          .slice(-4);

        return (
          <BscCard key={tarjeta.identificacion} style={styles.tarjetaPendiente}>
            <BscIconTile icon="card" color={BscColors.warning} />

            <View style={styles.textoPendiente}>
              <Text style={styles.tituloPendiente} numberOfLines={1}>
                Tarjeta •••• {digitos}
              </Text>
              <Text style={styles.detallePendiente} numberOfLines={1}>
                Pago mínimo:{' '}
                {saldosOcultos ? '••••••' : formatDOP(tarjeta.pagoMinimoPesos)}
              </Text>
            </View>

            <BscPrimaryButton
              label="Pagar"
              onPress={() => onPagar(tarjeta)}
              style={styles.botonPagar}
              testID={`pagar-${tarjeta.identificacion}`}
            />
          </BscCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  cuerpo: {
    flex: 1,
  },
  contenido: {
    paddingBottom: BscSpacing.xxl,
  },
  acciones: {
    marginHorizontal: BscSpacing.gutter,
    marginTop: -SOLAPE,
  },
  secciones: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.lg,
    gap: BscSpacing.lg,
  },
  centrado: {
    paddingVertical: BscSpacing.xxl,
    alignItems: 'center',
  },
  filaVacia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  textoVacio: {
    flex: 1,
  },
  tituloVacio: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  detalleVacio: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  tarjetaPendiente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
    padding: BscSpacing.sm,
    marginBottom: BscSpacing.xs,
  },
  textoPendiente: {
    flex: 1,
  },
  tituloPendiente: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  detallePendiente: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginTop: 2,
  },
  botonPagar: {
    height: 38,
    paddingHorizontal: BscSpacing.md,
  },
});
