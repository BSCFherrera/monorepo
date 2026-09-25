import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import {
  PERIOD_PRESETS,
  applyDayTap,
  matchingPreset,
  daysInMonth,
  earliestSelectableDate,
  presetRange,
  monthGrid,
  startOfDay,
} from '@bsc/utils';
import { BscRadius, BscSpacing, withAlpha } from '../theme/spacing';

import { BscPrimaryButton } from './BscButton';
import { BscIcon } from './BscIcon';
import { BscSheet } from './BscSheet';
import type {
  DateRange,
  DateRangeSheetProps,
  DraftDateRange,
  PeriodPreset,
} from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Selector de período en el idioma del banco.
 *
 * Portado de `bsc_date_range_sheet.dart`. El original explica por qué no usa el
 * selector de rango de Material: llega con su propio armazón a pantalla completa
 * y su propia paleta, y se lee como otro producto metido en medio de la app. En
 * React Native el argumento es más fuerte todavía, porque el selector nativo es
 * distinto en Android y en iOS. Esta es la misma interacción —atajos primero,
 * calendario después— construida con el kit que usa todo lo demás.
 *
 * **Esta hoja es la razón por la que la app Flutter puede consultar más de
 * noventa días.** Las píldoras de la lista de movimientos llegan hasta 90; de
 * ahí en adelante se entra por aquí, y el techo real es de un año hacia atrás.
 * El backend no impone ningún límite: reenvía las fechas al core tal cual.
 *
 * Detalles del original que llevan intención y conviene no «mejorar»:
 *
 *  - **La semana empieza en lunes**, no en domingo.
 *  - La franja que une los días del rango va **detrás** del número, para que el
 *    rango se lea como un tramo continuo y no como una fila de fichas sueltas.
 *  - Mientras falta el extremo final, el pie explica qué hacer y el botón de
 *    aplicar está inactivo: nunca se envía un rango a medio componer.
 *
 * Una diferencia deliberada con la app Flutter, documentada en el CHANGELOG:
 * allí la píldora «30 días» resta treinta días completos (treinta y un días de
 * rango) mientras que el atajo «30 días» de esta hoja resta veintinueve, y el
 * propio comentario del original dice que quería que coincidieran. Aquí
 * coinciden: «30 días» son treinta contando hoy en los dos sitios.
 */

export type BscDateRangeSheetProps = DateRangeSheetProps;

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Lunes a domingo. La segunda «M» es miércoles, como en el original. */
const DIAS_DE_LA_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const etiquetaDeFecha = (f: Date): string =>
  `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(
    2,
    '0',
  )}/${f.getFullYear()}`;

export function BscDateRangeSheet({
  visible,
  initialRange: rangoInicial,
  onApply: onAplicar,
  onClose: onCerrar,
  minDate: fechaMinima,
  maxDate: fechaMaxima,
  title: titulo = 'Seleccionar período',
  today: hoy = new Date(),
  testID,
}: BscDateRangeSheetProps): React.JSX.Element {
  const minima = startOfDay(fechaMinima ?? earliestSelectableDate(hoy));
  const maxima = startOfDay(fechaMaxima ?? hoy);

  const [enCurso, setEnCurso] = useState<DraftDateRange>({
    from: startOfDay(rangoInicial.from),
    to: startOfDay(rangoInicial.to),
  });
  const [mesVisible, setMesVisible] = useState(() =>
    primerDiaDelMes(rangoInicial.from),
  );

  // Al reabrir, la hoja vuelve a partir del rango vigente. Sin esto conservaría
  // lo que el cliente dejó a medias la vez anterior y mostraría un rango que no
  // es el que la pantalla está usando.
  useEffect(() => {
    if (!visible) return;
    setEnCurso({
      from: startOfDay(rangoInicial.from),
      to: startOfDay(rangoInicial.to),
    });
    setMesVisible(primerDiaDelMes(rangoInicial.from));
  }, [visible, rangoInicial.from, rangoInicial.to]);

  const completo = enCurso.to !== null;
  const rango: DateRange | null = completo
    ? { from: enCurso.from, to: enCurso.to as Date }
    : null;
  const atajoActivo = rango === null ? null : matchingPreset(rango, hoy);

  const aplicarAtajo = (clave: PeriodPreset): void => {
    const nuevo = presetRange(clave, hoy);
    setEnCurso({ from: nuevo.from, to: nuevo.to });
    setMesVisible(primerDiaDelMes(nuevo.from));
  };

  const tocarDia = (dia: Date): void => {
    setEnCurso(previo => applyDayTap(previo, dia));
  };

  const habilitado = (dia: Date): boolean =>
    dia.getTime() >= minima.getTime() && dia.getTime() <= maxima.getTime();

  const puedeRetroceder =
    mesVisible.getTime() > primerDiaDelMes(minima).getTime();
  const puedeAvanzar = mesVisible.getTime() < primerDiaDelMes(maxima).getTime();

  const moverMes = (delta: number): void => {
    setMesVisible(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <BscSheet
      visible={visible}
      title={titulo}
      onClose={onCerrar}
      testID={testID}
      footnote={completo ? undefined : 'Toca el día en que termina el período.'}
      footer={
        <BscPrimaryButton
          label="Aplicar período"
          disabled={rango === null}
          onPress={rango === null ? undefined : () => onAplicar(rango)}
          testID={testID === undefined ? undefined : `${testID}-aplicar`}
        />
      }
    >
      <Resumen desde={enCurso.from} hasta={enCurso.to} testID={testID} />

      <View style={styles.atajos}>
        {PERIOD_PRESETS.map(({ key: clave, label: etiqueta }) => (
          <Atajo
            key={clave}
            etiqueta={etiqueta}
            seleccionado={atajoActivo === clave}
            onPress={() => aplicarAtajo(clave)}
            testID={testID === undefined ? undefined : `${testID}-${clave}`}
          />
        ))}
      </View>

      <View style={styles.cabeceraDelMes}>
        <FlechaDeMes
          icono="chevron-left"
          onPress={puedeRetroceder ? () => moverMes(-1) : undefined}
          etiqueta="Mes anterior"
        />
        <Text style={styles.nombreDelMes}>
          {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
        </Text>
        <FlechaDeMes
          icono="chevron-right"
          onPress={puedeAvanzar ? () => moverMes(1) : undefined}
          etiqueta="Mes siguiente"
        />
      </View>

      <View style={styles.filaDeDiasSemana}>
        {DIAS_DE_LA_SEMANA.map((dia, indice) => (
          <View key={`${dia}-${indice}`} style={styles.celdaDiaSemana}>
            <Text style={styles.textoDiaSemana}>{dia}</Text>
          </View>
        ))}
      </View>

      <Rejilla
        mes={mesVisible}
        desde={enCurso.from}
        hasta={enCurso.to}
        habilitado={habilitado}
        onTocar={tocarDia}
        testID={testID}
      />
    </BscSheet>
  );
}

function primerDiaDelMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function Resumen({
  desde,
  hasta,
  testID,
}: {
  desde: Date;
  hasta: Date | null;
  testID?: string;
}): React.JSX.Element {
  return (
    <View style={styles.resumen}>
      <Extremo
        etiqueta="Desde"
        valor={etiquetaDeFecha(desde)}
        activo={hasta === null}
        testID={testID === undefined ? undefined : `${testID}-desde`}
      />
      <BscIcon name="arrow-forward" size={18} color={BscColors.textTertiary} />
      <Extremo
        etiqueta="Hasta"
        valor={hasta === null ? 'Elige el día' : etiquetaDeFecha(hasta)}
        activo={hasta !== null}
        apagado={hasta === null}
        alFinal
        testID={testID === undefined ? undefined : `${testID}-hasta`}
      />
    </View>
  );
}

function Extremo({
  etiqueta,
  valor,
  activo,
  apagado = false,
  alFinal = false,
  testID,
}: {
  etiqueta: string;
  valor: string;
  activo: boolean;
  apagado?: boolean;
  alFinal?: boolean;
  testID?: string;
}): React.JSX.Element {
  return (
    <View style={[styles.extremo, alFinal ? styles.extremoAlFinal : null]}>
      <Text style={styles.etiquetaDelExtremo}>{etiqueta}</Text>
      <Text
        testID={testID}
        style={[
          styles.valorDelExtremo,
          apagado
            ? styles.valorApagado
            : activo
            ? styles.valorActivo
            : styles.valorNormal,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function Atajo({
  etiqueta,
  seleccionado,
  onPress,
  testID,
}: {
  etiqueta: string;
  seleccionado: boolean;
  onPress: () => void;
  testID?: string;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionado }}
      onPress={onPress}
      testID={testID}
      style={[styles.atajo, seleccionado ? styles.atajoActivo : null]}
    >
      <Text
        style={[
          styles.textoDelAtajo,
          seleccionado ? styles.textoDelAtajoActivo : null,
        ]}
      >
        {etiqueta}
      </Text>
    </Pressable>
  );
}

function FlechaDeMes({
  icono,
  onPress,
  etiqueta,
}: {
  icono: 'chevron-left' | 'chevron-right';
  onPress?: (() => void) | undefined;
  etiqueta: string;
}): React.JSX.Element {
  const inactiva = onPress === undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: inactiva }}
      disabled={inactiva}
      onPress={onPress}
      style={styles.flechaDeMes}
    >
      <BscIcon
        name={icono}
        size={20}
        color={
          inactiva ? withAlpha(BscColors.textTertiary, 0.4) : BscColors.primary
        }
      />
    </Pressable>
  );
}

function Rejilla({
  mes,
  desde,
  hasta,
  habilitado,
  onTocar,
  testID,
}: {
  mes: Date;
  desde: Date;
  hasta: Date | null;
  habilitado: (dia: Date) => boolean;
  onTocar: (dia: Date) => void;
  testID?: string;
}): React.JSX.Element {
  const filas = monthGrid(mes.getFullYear(), mes.getMonth());
  const total = daysInMonth(mes.getFullYear(), mes.getMonth());

  return (
    <View>
      {filas.map((fila, indiceFila) => (
        <View key={indiceFila} style={styles.filaDeLaRejilla}>
          {fila.map((numero, indiceColumna) => (
            <Celda
              key={indiceColumna}
              numero={numero}
              mes={mes}
              totalDelMes={total}
              desde={desde}
              hasta={hasta}
              habilitado={habilitado}
              onTocar={onTocar}
              testID={testID}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Celda({
  numero,
  mes,
  totalDelMes,
  desde,
  hasta,
  habilitado,
  onTocar,
  testID,
}: {
  numero: number | null;
  mes: Date;
  totalDelMes: number;
  desde: Date;
  hasta: Date | null;
  habilitado: (dia: Date) => boolean;
  onTocar: (dia: Date) => void;
  testID?: string;
}): React.JSX.Element {
  if (numero === null || numero > totalDelMes) {
    return <View style={styles.celda} />;
  }

  const dia = new Date(mes.getFullYear(), mes.getMonth(), numero);
  const tiempo = dia.getTime();
  const esDesde = tiempo === desde.getTime();
  const esHasta = hasta !== null && tiempo === hasta.getTime();
  const seleccionado = esDesde || esHasta;
  const dentro =
    hasta !== null && tiempo > desde.getTime() && tiempo < hasta.getTime();
  const activo = habilitado(dia);

  return (
    <View style={styles.celda}>
      {dentro || (seleccionado && hasta !== null) ? (
        <View style={styles.franja} pointerEvents="none">
          <View
            style={[
              styles.mitadDeLaFranja,
              dentro || esHasta ? styles.mitadPintada : null,
            ]}
          />
          <View
            style={[
              styles.mitadDeLaFranja,
              dentro || esDesde ? styles.mitadPintada : null,
            ]}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={etiquetaDeFecha(dia)}
        accessibilityState={{ selected: seleccionado, disabled: !activo }}
        disabled={!activo}
        onPress={() => onTocar(dia)}
        testID={
          testID === undefined
            ? undefined
            : `${testID}-dia-${mes.getFullYear()}-${
                mes.getMonth() + 1
              }-${numero}`
        }
        style={[styles.circulo, seleccionado ? styles.circuloActivo : null]}
      >
        <Text
          style={[
            styles.numeroDelDia,
            seleccionado ? styles.numeroSeleccionado : null,
            !activo ? styles.numeroInactivo : null,
          ]}
        >
          {numero}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.sm,
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscRadius.md,
  },
  extremo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  extremoAlFinal: {
    alignItems: 'flex-end',
  },
  etiquetaDelExtremo: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
    marginBottom: 2,
  },
  valorDelExtremo: {
    ...BscTextStyles['Body MD/16 SemiBold'],
  },
  valorApagado: { color: BscColors.textTertiary },
  valorActivo: { color: BscColors.primary },
  valorNormal: { color: BscColors.textPrimary },

  atajos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BscSpacing.xs,
    marginTop: BscSpacing.md,
  },
  atajo: {
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.xs,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.surfaceVariant,
  },
  atajoActivo: {
    backgroundColor: BscColors.primary,
  },
  textoDelAtajo: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textSecondary,
  },
  textoDelAtajoActivo: {
    color: BscColors.textOnPrimary,
  },

  cabeceraDelMes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: BscSpacing.md,
  },
  nombreDelMes: {
    flex: 1,
    textAlign: 'center',
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },
  flechaDeMes: {
    width: 36,
    height: 36,
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filaDeDiasSemana: {
    flexDirection: 'row',
    marginTop: BscSpacing.xs,
  },
  celdaDiaSemana: {
    flex: 1,
    alignItems: 'center',
  },
  textoDiaSemana: {
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.textTertiary,
  },

  filaDeLaRejilla: {
    flexDirection: 'row',
    marginTop: 2,
  },
  celda: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // La franja va detrás del número para que el rango se lea como un tramo
  // continuo; por eso ocupa toda la celda y no tiene esquinas redondeadas.
  franja: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mitadDeLaFranja: {
    flex: 1,
    height: 34,
  },
  mitadPintada: {
    backgroundColor: BscColors.primarySoft,
  },
  circulo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloActivo: {
    backgroundColor: BscColors.primary,
  },
  numeroDelDia: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.textPrimary,
  },
  numeroSeleccionado: {
    fontWeight: '700',
    color: BscColors.textOnPrimary,
  },
  numeroInactivo: {
    color: withAlpha(BscColors.textTertiary, 0.45),
  },
});
