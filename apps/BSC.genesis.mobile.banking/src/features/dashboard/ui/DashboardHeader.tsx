import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDOP, formatUSD } from '@bsc/shared';

import {
  BscColors,
  BscGradientSurface,
  BscIcon,
  BscRadius,
  BscSpacing,
  withAlpha,
  BscTextStyles,
  fontFamily,
} from '@bsc/ui-native';
import type { ResumenDeBalance } from '../data/balanceSummary';

/**
 * Cabecera del dashboard.
 *
 * Portada de `dashboard_header.dart`. Es la pieza que más define el carácter de
 * la pantalla, y reproducirla completa —no solo su gradiente— es lo que hace
 * que la app se reconozca como la misma.
 *
 * Sus partes, en el orden del original:
 *
 *  - Avatar con las iniciales del cliente, que abre el perfil, y a la derecha
 *    los botones de ocultar saldos y de notificaciones.
 *  - Saludo con el primer nombre.
 *  - **El dinero disponible consolidado**, con los centavos en tamaño menor:
 *    es el número más grande de la app y el que el cliente busca al abrirla.
 *  - El desglose entre cuentas y crédito.
 *  - Dos chips: el total disponible en dólares y el estado del día.
 *
 * Las medidas van en números y no en tokens de espaciado allí donde el original
 * también las escribe a mano —42 del avatar, 40 del botón, 11/6 del chip—. Un
 * token cercano cambiaría el aire de la cabecera, que es justo lo que se está
 * intentando igualar.
 */

export interface DashboardHeaderProps {
  /** Primer nombre para el saludo. */
  nombre: string;
  /** Iniciales para el avatar. Nunca vacías. */
  iniciales: string;
  resumen: ResumenDeBalance;
  cantidadDeProductos: number;
  /** Cuántos pagos vencen hoy, para el chip. */
  pendientes: number;
  saldosOcultos: boolean;
  onAlternarSaldos: () => void;
  onPerfil?: (() => void) | undefined;
  onNotificaciones?: (() => void) | undefined;
  hayNotificaciones?: boolean;
}

function saludo(hora: number): string {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Separa los centavos para poder mostrarlos más pequeños.
 *
 * Es un detalle del diseño original que cambia bastante el peso visual del
 * número: `RD$ 1,400,880` grande con `.34` pequeño se lee como una cifra, no
 * como una ristra de dígitos. En el original los centavos van al 62 % del
 * tamaño y en el mismo blanco, no en un blanco más apagado.
 */
function partirMonto(formateado: string): { entero: string; centavos: string } {
  const punto = formateado.lastIndexOf('.');
  if (punto === -1) return { entero: formateado, centavos: '' };

  return {
    entero: formateado.slice(0, punto),
    centavos: formateado.slice(punto),
  };
}

/** Tamaño del monto principal, tal cual el token `balanceHero` del original. */
const HERO = 34;

export function DashboardHeader({
  nombre,
  iniciales,
  resumen,
  cantidadDeProductos,
  pendientes,
  saldosOcultos,
  onAlternarSaldos,
  onPerfil,
  onNotificaciones,
  hayNotificaciones = true,
}: DashboardHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  // «Tu dinero disponible» es cuentas más crédito disponible — no el patrimonio
  // neto, y no incluye certificados ni resta deudas. El cálculo vive en
  // `balanceSummary`, donde está probado; aquí solo se muestra.
  const { entero, centavos } = partirMonto(
    formatDOP(resumen.disponibleTotalPesos),
  );

  const alDia = pendientes === 0;
  const hora = new Date().getHours();

  return (
    <BscGradientSurface
      style={[styles.cabecera, { paddingTop: insets.top + BscSpacing.sm }]}
    >
      {/* ─── Fila superior ──────────────────────────────────────────────── */}
      <View style={styles.filaSuperior}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Perfil"
          onPress={onPerfil}
          style={styles.avatar}
          testID="dashboard-perfil"
        >
          <Text style={styles.iniciales}>{iniciales}</Text>
        </Pressable>

        <View style={styles.acciones}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              saldosOcultos ? 'Mostrar saldos' : 'Ocultar saldos'
            }
            onPress={onAlternarSaldos}
            style={styles.botonIcono}
            testID="dashboard-alternar-saldos"
          >
            <BscIcon
              name={saldosOcultos ? 'eye-off' : 'eye'}
              size={23}
              color={BscColors.textOnDark}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            onPress={onNotificaciones}
            style={styles.botonIcono}
            testID="dashboard-notificaciones"
          >
            <BscIcon name="bell" size={23} color={BscColors.textOnDark} />
            {hayNotificaciones ? <View style={styles.puntoAviso} /> : null}
          </Pressable>
        </View>
      </View>

      {/* ─── Saludo y saldo ─────────────────────────────────────────────── */}
      {/* Mientras el perfil carga se saluda sin nombre, en vez de rellenar con
          uno inventado. */}
      <Text style={styles.saludo} numberOfLines={1}>
        {nombre.trim() === ''
          ? saludo(hora)
          : `${saludo(hora)}, ${nombre.trim()}`}
      </Text>

      <Text style={styles.etiquetaSaldo}>
        {cantidadDeProductos > 0
          ? `Tu dinero disponible en ${cantidadDeProductos} productos`
          : 'Tu dinero disponible'}
      </Text>

      <View style={styles.filaMonto}>
        {saldosOcultos ? (
          <Text style={styles.montoOculto} testID="dashboard-saldo-oculto">
            RD$ ••••••
          </Text>
        ) : (
          <>
            <Text style={styles.montoEntero} testID="dashboard-saldo">
              {entero}
            </Text>
            <Text style={styles.montoCentavos}>{centavos}</Text>
          </>
        )}
      </View>

      <Text style={styles.desglose} numberOfLines={1}>
        {saldosOcultos
          ? 'Cuentas y crédito ocultos'
          : `Cuentas: ${formatDOP(
              resumen.cuentasPesos,
            )}   ·   Crédito: ${formatDOP(resumen.creditoDisponiblePesos)}`}
      </Text>

      {/* ─── Chips ──────────────────────────────────────────────────────── */}
      {/* Los dos van siempre, incluso en cero: si aparecieran y desaparecieran,
          todo lo que sigue se movería de sitio entre una carga y otra. */}
      <View style={styles.filaChips}>
        <Chip
          etiqueta={
            saldosOcultos ? 'US$ ••••' : formatUSD(resumen.disponibleDolares)
          }
        />
        <Chip
          etiqueta={
            alDia
              ? 'Todo al día'
              : `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'}`
          }
          icono={alDia ? 'check-circle' : 'clock'}
          destacado={alDia}
        />
      </View>
    </BscGradientSurface>
  );
}

function Chip({
  etiqueta,
  icono,
  destacado = false,
}: {
  etiqueta: string;
  icono?: 'check-circle' | 'clock';
  destacado?: boolean;
}): React.JSX.Element {
  return (
    <View style={[styles.chip, destacado && styles.chipDestacado]}>
      {icono !== undefined ? (
        <BscIcon name={icono} size={13} color={BscColors.textOnDark} />
      ) : null}
      <Text style={styles.textoChip}>{etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: {
    paddingHorizontal: BscSpacing.lg,
    // La tarjeta de acciones rápidas se monta encima; este redondeo es lo que
    // hace que se lean como dos capas.
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
    paddingBottom: BscSpacing.xl,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: BscSpacing.lg,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: withAlpha('#FFFFFF', 0.18),
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Body S/14 Bold'],
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  botonIcono: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puntoAviso: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: BscColors.notificationDot,
    borderWidth: 1.5,
    borderColor: withAlpha(BscColors.primary, 0.6),
  },
  saludo: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Subtitle/20 Bold'],
  },
  etiquetaSaldo: {
    color: withAlpha('#FFFFFF', 0.78),
    ...BscTextStyles['Body S/14 Regular'],
    marginTop: BscSpacing.md,
  },
  filaMonto: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  montoEntero: {
    color: BscColors.textOnDark,
    fontFamily,
    fontSize: HERO,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: HERO * 1.1,
  },
  montoCentavos: {
    // 62 % del tamaño del entero y en el mismo blanco: en el original los
    // centavos se ven más pequeños, no más apagados.
    color: BscColors.textOnDark,
    fontFamily,
    fontSize: HERO * 0.62,
    fontWeight: '600',
    letterSpacing: -1,
  },
  montoOculto: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Title S/30 Bold'],
  },
  desglose: {
    color: withAlpha('#FFFFFF', 0.72),
    ...BscTextStyles['Caption/12 Regular'],
    marginTop: BscSpacing.xs,
  },
  filaChips: {
    flexDirection: 'row',
    gap: BscSpacing.xs,
    marginTop: BscSpacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: withAlpha('#FFFFFF', 0.14),
    borderRadius: BscRadius.pill,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.22),
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipDestacado: {
    backgroundColor: withAlpha('#FFFFFF', 0.22),
  },
  textoChip: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Caption/12 SemiBold'],
  },
});
