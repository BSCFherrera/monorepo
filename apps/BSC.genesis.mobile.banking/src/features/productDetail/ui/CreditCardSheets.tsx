import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { currencySymbol, formatCurrency, formatInteger } from '@bsc/shared';

import {
  BscBanner,
  BscCard,
  BscColors,
  BscDetailRow,
  BscGradientSurface,
  BscGradients,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscLogo,
  BscOptionCard,
  BscPill,
  BscPrimaryButton,
  BscRadius,
  BscRowDivider,
  BscSheet,
  BscSpacing,
  BscTypography,
  BscTextStyles,
} from '@bsc/ui-native';
import { buttonTokens } from '@bsc/ui-native';
import { MEDIDAS_DE_LAS_HOJAS_DE_TARJETA as M } from './medidasDeLasHojasDeTarjeta';
import {
  tieneActividadDePuntos,
  ultimosCuatroDigitos,
  type DetalleDeTarjeta,
  type MontosDeLaTarjeta,
} from '../data/creditCardDetailContracts';

/**
 * Las hojas del detalle de tarjeta.
 *
 * Portadas de `_showPoints` y `_showCardNumber` en `credit_card_detail_view.dart`
 * y de `CreditCardPaymentSheet` y `CreditCardControlSheet` en
 * `credit_card_sheets.dart`, más la hoja que elige entre ver el ciclo y
 * descargar el PDF.
 */

// ═══════════════════════════════════════════════════════════════════════════
// Beneficios
// ═══════════════════════════════════════════════════════════════════════════

export function HojaDePuntos({
  visible,
  tarjeta,
  onClose,
}: {
  visible: boolean;
  tarjeta: DetalleDeTarjeta;
  onClose: () => void;
}): React.JSX.Element {
  const { puntos } = tarjeta;

  return (
    <BscSheet
      visible={visible}
      title="Beneficios"
      onClose={onClose}
      testID="hoja-de-puntos"
    >
      <BscCard style={styles.tarjetaPlana}>
        <View style={styles.filaDePuntos}>
          <BscIconTile
            icon="star"
            color={BscColors.warning}
            size={48}
            iconSize={24}
          />
          <View>
            <Text style={BscTypography.amountLarge}>
              {formatInteger(puntos.balance)}
            </Text>
            <Text style={styles.leyenda}>Puntos Santa Cruz disponibles</Text>
          </View>
        </View>
      </BscCard>

      {/*
        El movimiento del mes solo cuando hubo alguno: cuatro filas en cero no
        dicen nada y empujan fuera de la vista el saldo, que es lo que se vino
        a mirar.
      */}
      {tieneActividadDePuntos(tarjeta) ? (
        <View style={styles.antesDelTitulo}>
          <Text style={BscTypography.titleMedium}>Movimiento del mes</Text>
          <View style={styles.trasElTituloDelMovimiento} />
          <BscDetailRow
            label="Balance anterior"
            value={formatInteger(puntos.anterior)}
          />
          <BscDetailRow
            label="Ganados"
            value={`+${formatInteger(puntos.ganadosEnElMes)}`}
            valueColor={BscColors.success}
          />
          <BscDetailRow
            label="Utilizados"
            value={formatInteger(puntos.usadosEnElMes)}
          />
          <BscDetailRow
            label="Expirados"
            value={formatInteger(puntos.vencidosEnElMes)}
            valueColor={
              puntos.vencidosEnElMes > 0 ? BscColors.warning : undefined
            }
          />
        </View>
      ) : null}

      <Text style={styles.nota}>
        Canjea tus puntos por millas, productos o abonos a tu estado de cuenta
        desde la web de Banco Santa Cruz.
      </Text>
    </BscSheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Ver número
// ═══════════════════════════════════════════════════════════════════════════

export function HojaDeDatosDeLaTarjeta({
  visible,
  tarjeta,
  onClose,
}: {
  visible: boolean;
  tarjeta: DetalleDeTarjeta;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <BscSheet
      visible={visible}
      title="Datos de la tarjeta"
      onClose={onClose}
      testID="hoja-del-numero"
    >
      <BscGradientSurface
        gradient={BscGradients.creditCard}
        style={styles.plastico}
      >
        <BscLogo height={26} onDark />
        <Text style={styles.numeroDelPlastico}>
          •••• •••• •••• {ultimosCuatroDigitos(tarjeta)}
        </Text>
        <Text style={styles.nombreEnElPlastico}>
          {tarjeta.nombreDelProducto}
        </Text>
      </BscGradientSurface>

      {/*
        El número completo **no se enseña**, ni siquiera tras validar. El
        original deja aquí la promesa de que se pedirá el Token BSC, y así se
        queda: la app no tiene endpoint que lo devuelva y dibujar el flujo
        prometería algo que no ocurre.
      */}
      <View style={styles.antesDelAvisoDeSeguridad}>
        <BscBanner
          tone="warning"
          icon="shield-check"
          title="Número completo protegido"
          subtitle="Por seguridad, requiere validación con tu Token BSC."
        />
      </View>
    </BscSheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Pagar
// ═══════════════════════════════════════════════════════════════════════════

type OpcionDeMonto = 'minimo' | 'alCorte' | 'otro';

/**
 * Con qué opción abre la hoja.
 *
 * **Una tarjeta sin nada pendiente reporta mínimo cero**, y preseleccionarlo
 * dejaría el botón de continuar muerto nada más abrir. Se cae al saldo al
 * corte, y solo a «Otro» cuando ninguna de las dos cifras existe.
 */
export function opcionInicial(montos: MontosDeLaTarjeta): OpcionDeMonto {
  if (montos.pagoMinimo > 0) return 'minimo';
  if (montos.pagoTotal > 0) return 'alCorte';
  return 'otro';
}

export function HojaDePago({
  visible,
  tarjeta,
  montos,
  codigoMoneda,
  onClose,
  onContinuar,
}: {
  visible: boolean;
  tarjeta: DetalleDeTarjeta;
  montos: MontosDeLaTarjeta;
  codigoMoneda: number;
  onClose: () => void;
  /** Lleva al flujo de pagos, que todavía no está migrado. */
  onContinuar: (monto: number) => void;
}): React.JSX.Element {
  const [opcion, setOpcion] = useState<OpcionDeMonto>(() =>
    opcionInicial(montos),
  );
  const [escrito, setEscrito] = useState('');

  const hayMinimo = montos.pagoMinimo > 0;
  const monto = (valor: number): string => formatCurrency(valor, codigoMoneda);

  const importe = useMemo(() => {
    if (opcion === 'minimo') return montos.pagoMinimo;
    if (opcion === 'alCorte') return montos.pagoTotal;
    const numero = Number(escrito.replace(/,/g, ''));
    return Number.isFinite(numero) ? numero : 0;
  }, [opcion, escrito, montos]);

  const simbolo = currencySymbol(codigoMoneda);

  return (
    <BscSheet
      visible={visible}
      title="Pagar tarjeta"
      onClose={onClose}
      testID="hoja-de-pago"
      footnote="Podrás confirmar el monto antes de completar la operación."
      footer={
        <BscPrimaryButton
          label="Continuar con el pago"
          trailing={
            <BscIcon
              name="arrow-forward"
              size={buttonTokens.iconTrailing}
            />
          }
          disabled={importe <= 0}
          onPress={() => onContinuar(importe)}
          testID="continuar-con-el-pago"
        />
      }
    >
      <BscBanner
        icon="event-available"
        title={
          tarjeta.fechaDePago === undefined || tarjeta.fechaDePago === ''
            ? 'Pago mínimo pendiente'
            : `Vence el ${tarjeta.fechaDePago}`
        }
        subtitle={
          hayMinimo
            ? `Pago mínimo ${monto(montos.pagoMinimo)}`
            : `Pago de contado ${monto(montos.pagoTotal)}`
        }
      />

      <View style={styles.antesDelTitulo}>
        <Text style={BscTypography.titleMedium}>¿Cuánto quieres pagar?</Text>
      </View>

      <View style={styles.opciones}>
        {/*
          La opción del mínimo desaparece cuando el core lo manda en cero. El
          banco cobra algunas tarjetas de contado, y ofrecer un «Mínimo» de
          RD$ 0.00 es a la vez falso e impagable.
        */}
        {hayMinimo ? (
          <BscOptionCard
            title="Mínimo"
            subtitle={`${simbolo} ${formatInteger(montos.pagoMinimo)}`}
            selected={opcion === 'minimo'}
            onPress={() => setOpcion('minimo')}
            testID="opcion-minimo"
          />
        ) : null}
        <BscOptionCard
          title="Al corte"
          subtitle={`${simbolo} ${formatInteger(montos.pagoTotal)}`}
          selected={opcion === 'alCorte'}
          onPress={() => setOpcion('alCorte')}
          testID="opcion-al-corte"
        />
        <BscOptionCard
          title="Otro"
          subtitle="Definir"
          selected={opcion === 'otro'}
          onPress={() => setOpcion('otro')}
          testID="opcion-otro"
        />
      </View>

      <View style={styles.cajaDelMonto}>
        <View style={styles.columnaDelMonto}>
          <Text style={styles.etiquetaDelMonto}>Monto a pagar</Text>
          {opcion === 'otro' ? (
            <TextInput
              value={escrito}
              onChangeText={setEscrito}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={BscColors.textTertiary}
              style={styles.montoEscrito}
              testID="monto-escrito"
            />
          ) : (
            <Text style={styles.montoElegido}>{monto(importe)}</Text>
          )}
        </View>
        <BscPill label={simbolo} />
      </View>

      <View style={styles.selectorDeOrigen}>
        <BscListRow
          leading={
            <BscIconTile
              icon="savings"
              color={BscColors.secondary}
              size={38}
              iconSize={19}
            />
          }
          title="Elegir cuenta de origen"
          subtitle="Se selecciona en el siguiente paso"
          showChevron
          onPress={() => onContinuar(importe)}
        />
      </View>

      <View style={styles.antesDelAviso}>
        <BscBanner
          tone="neutral"
          icon="info"
          title="Comisiones e impuestos"
          subtitle="Se calculan en el siguiente paso, antes de confirmar."
        />
      </View>
    </BscSheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Límites
// ═══════════════════════════════════════════════════════════════════════════

/** El core reporta el estado con una letra o con la palabra completa. */
export function tarjetaActiva(estado: string): boolean {
  const limpio = estado.trim().toUpperCase();
  return limpio === 'A' || limpio === 'ACTIVA' || limpio === 'ACTIVE';
}

export function HojaDeLimites({
  visible,
  tarjeta,
  montos,
  codigoMoneda,
  onClose,
}: {
  visible: boolean;
  tarjeta: DetalleDeTarjeta;
  montos: MontosDeLaTarjeta;
  codigoMoneda: number;
  onClose: () => void;
}): React.JSX.Element {
  const activa = tarjetaActiva(tarjeta.estado);
  const monto = (valor: number): string => formatCurrency(valor, codigoMoneda);

  return (
    <BscSheet
      visible={visible}
      title="Estado de la tarjeta"
      onClose={onClose}
      testID="hoja-de-limites"
    >
      {/*
        Esta hoja **no dibuja interruptores**. El original los tuvo —3DS,
        compras internacionales, avisos de viaje— y los quitó: ninguno tiene
        endpoint, así que cada interruptor mentía sobre un ajuste que no se
        guardaba en ningún sitio.
      */}
      <BscBanner
        icon={activa ? 'card' : 'block'}
        tone={activa ? 'success' : 'danger'}
        title={activa ? 'Tarjeta activa' : 'Tarjeta no activa'}
        subtitle={`Estado reportado por el core: ${tarjeta.estado}`}
      />

      <View style={styles.antesDelTitulo}>
        <Text style={BscTypography.titleMedium}>Límites disponibles</Text>
      </View>

      <View style={styles.cajaGris}>
        <BscDetailRow
          label="Límite de crédito"
          value={monto(montos.limiteDeCredito)}
        />
        <BscDetailRow
          label="Disponible para compras"
          value={monto(montos.disponibleParaCompras)}
        />
        <BscDetailRow
          label="Disponible para retiros"
          value={monto(montos.disponibleParaRetiros)}
        />
        <BscDetailRow
          label="Tasa de financiamiento"
          value={
            tarjeta.tasaDeFinanciamiento === undefined
              ? 'No disponible'
              : `${tarjeta.tasaDeFinanciamiento}%`
          }
        />
      </View>

      <View style={styles.antesDelAvisoDeGestion}>
        <BscBanner
          tone="info"
          icon="headset"
          title="Bloqueo, límites y aviso de viaje"
          subtitle="Gestiónalos con tu oficial de cuenta o en una sucursal. Aún no están disponibles en la app."
        />
      </View>
    </BscSheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Estados de cuenta: elegir qué se quiere
// ═══════════════════════════════════════════════════════════════════════════

/**
 * El ciclo con sus datos y el PDF del mes son dos cosas distintas, y el
 * original hace elegir en vez de que el cliente adivine qué significa
 * «Estados».
 */
export function HojaDeOpcionesDeEstados({
  visible,
  onClose,
  onVerCiclo,
  onDescargar,
}: {
  visible: boolean;
  onClose: () => void;
  onVerCiclo: () => void;
  onDescargar: () => void;
}): React.JSX.Element {
  return (
    <BscSheet
      visible={visible}
      title="Estados de cuenta"
      onClose={onClose}
      testID="hoja-de-estados"
    >
      <View style={styles.cajaDeFilas}>
        <BscListRow
          leading={
            <BscIconTile
              icon="receipt"
              background={BscColors.surface}
              size={38}
              iconSize={19}
            />
          }
          title="Ver estado del ciclo"
          subtitle="Balances, actividad y movimientos"
          showChevron
          onPress={onVerCiclo}
          testID="ver-estado-del-ciclo"
        />
        <BscRowDivider />
        <BscListRow
          leading={
            <BscIconTile
              icon="pdf"
              background={BscColors.surface}
              size={38}
              iconSize={19}
            />
          }
          title="Descargar en PDF"
          subtitle="Estados de meses cerrados"
          showChevron
          onPress={onDescargar}
          testID="descargar-en-pdf"
        />
      </View>
    </BscSheet>
  );
}

/**
 * Expuesta para que `medidasDeLasHojasDeTarjeta.test.ts` compruebe la segunda
 * mitad del circuito: que la hoja de estilos usa de verdad las medidas del
 * original, y no una copia escrita a mano al lado.
 */
export const estilosDeLasHojasDeTarjeta = StyleSheet.create({
  tarjetaPlana: {
    backgroundColor: BscColors.surfaceVariant,
  },
  filaDePuntos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.sm,
  },
  leyenda: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  /*
    Los huecos del original, uno por uno.

    Antes había un solo `bloque` con `marginTop: md` haciendo de comodín en
    cuatro sitios donde el Dart escribe tres medidas distintas. Se lee muy
    razonable y desplaza la hoja entera cuatro puntos en cada tramo, que es
    justo lo que el método de las medidas literales está para encontrar.
  */
  antesDelTitulo: {
    marginTop: M.antesDelTituloDeSeccion,
  },
  trasElTituloDelMovimiento: {
    marginTop: M.trasElTituloDelMovimiento,
  },
  antesDelAviso: {
    marginTop: M.antesDelAvisoDeComisiones,
  },
  antesDelAvisoDeGestion: {
    marginTop: M.antesDelAvisoDeGestion,
  },
  antesDelAvisoDeSeguridad: {
    marginTop: M.antesDelAvisoDeSeguridad,
  },
  nota: {
    marginTop: M.antesDeLaNotaDeCanje,
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
  plastico: {
    borderRadius: BscRadius.md,
    padding: BscSpacing.lg,
    alignItems: 'flex-start',
  },
  numeroDelPlastico: {
    marginTop: BscSpacing.lg,
    color: BscColors.textOnDark,
    ...BscTextStyles['Subtitle/20 SemiBold'],
    letterSpacing: 2,
  },
  nombreEnElPlastico: {
    marginTop: BscSpacing.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    ...BscTextStyles['Body S/14 Regular'],
  },
  opciones: {
    flexDirection: 'row',
    gap: BscSpacing.xs,
    marginTop: BscSpacing.xs,
  },
  cajaDelMonto: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: BscSpacing.md,
    padding: BscSpacing.md,
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surfaceVariant,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  columnaDelMonto: {
    flex: 1,
  },
  etiquetaDelMonto: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  montoEscrito: {
    marginTop: 4,
    padding: 0,
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.textPrimary,
  },
  montoElegido: {
    marginTop: 4,
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.textPrimary,
  },
  selectorDeOrigen: {
    marginTop: BscSpacing.sm,
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  cajaGris: {
    marginTop: BscSpacing.xs,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
    paddingHorizontal: BscSpacing.md,
  },
  // Las filas de lista ya traen su propio margen lateral; con el de la caja
  // quedarían sangradas el doble que en el original.
  cajaDeFilas: {
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
    overflow: 'hidden',
  },
});

const styles = estilosDeLasHojasDeTarjeta;
