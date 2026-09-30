import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { formatCurrency } from '@bsc/shared';

import {
  BscColors,
  BscDetailRow,
  BscDetailSection,
  BscRadius,
  withAlpha,
  BscTextStyles,
} from '@bsc/design-system';
import {
  avanceDelPlazo,
  estaVigente,
  interesesPendientes,
  type DetalleDeCertificado,
} from '../data/certificateDetailContracts';

/**
 * Los bloques propios del detalle de un certificado financiero.
 *
 * Portados de `certificate_detail_view.dart`: «Resumen de Inversión», con su
 * anillo de progreso y la tasa en el centro, «Rendimiento», con los intereses
 * ganados destacados en un recuadro verde, e «Información del Certificado».
 *
 * Donde el original usa `BscColors.accent` aquí se usa `secondary`: en
 * `bsc_colors.dart` el primero es un alias del segundo, así que es el mismo
 * verde y no hacía falta portar el alias.
 */

/** Medidas del anillo, tomadas del original: 120 de diámetro, trazo de 8. */
const DIAMETRO = 120;
const GROSOR = 8;
const RADIO = (DIAMETRO - GROSOR) / 2;
const PERIMETRO = 2 * Math.PI * RADIO;

export function ResumenDeInversion({
  certificado,
  hoy = new Date(),
}: {
  certificado: DetalleDeCertificado;
  hoy?: Date;
}): React.JSX.Element {
  const { avance, diasRestantes } = avanceDelPlazo(certificado, hoy);
  const plazo = certificado.plazoRedactado ?? `${certificado.plazoEnDias} días`;

  return (
    <BscDetailSection
      title="Resumen de Inversión"
      icon="savings"
      testID="resumen-de-inversion"
    >
      <View style={styles.centrado}>
        {/*
          El anillo se dibuja con un círculo SVG y un trazo discontinuo cuyo
          hueco es lo que falta por cumplir. Es la forma de tener el mismo
          grosor y el mismo color que el original sin depender de un indicador
          nativo, que en Android trae su propia altura y su propia animación.
        */}
        <Svg width={DIAMETRO} height={DIAMETRO}>
          <Circle
            cx={DIAMETRO / 2}
            cy={DIAMETRO / 2}
            r={RADIO}
            stroke={BscColors.border}
            strokeWidth={GROSOR}
            fill="none"
          />
          <Circle
            cx={DIAMETRO / 2}
            cy={DIAMETRO / 2}
            r={RADIO}
            stroke={BscColors.secondary}
            strokeWidth={GROSOR}
            fill="none"
            strokeDasharray={`${PERIMETRO * avance} ${PERIMETRO}`}
            strokeLinecap="round"
            // Arranca arriba, no a la derecha, que es donde empieza un arco SVG.
            transform={`rotate(-90 ${DIAMETRO / 2} ${DIAMETRO / 2})`}
          />
        </Svg>

        <View style={styles.centroDelAnillo} pointerEvents="none">
          <Text style={styles.tasaGrande}>{certificado.tasaDeInteres}%</Text>
          <Text style={styles.leyendaDeLaTasa}>Tasa anual</Text>
        </View>
      </View>

      {/*
        La cuenta atrás solo cuando queda algo. En un certificado vencido
        «0 días restantes» no informa, distrae.
      */}
      {diasRestantes > 0 ? (
        <View style={styles.centrado}>
          <View style={styles.pastillaDeDias}>
            <Text style={styles.textoDeDias} testID="dias-restantes">
              {diasRestantes} días restantes
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.respiro} />

      <BscDetailRow
        label="Monto inicial"
        value={formatCurrency(
          certificado.montoInicial,
          certificado.codigoMoneda,
        )}
        emphasized
      />
      <BscDetailRow label="Plazo" value={plazo} />
      <BscDetailRow label="Forma de pago" value={certificado.formaDePago} />
    </BscDetailSection>
  );
}

export function Rendimiento({
  certificado,
}: {
  certificado: DetalleDeCertificado;
}): React.JSX.Element {
  const monto = (valor: number): string =>
    formatCurrency(valor, certificado.codigoMoneda);

  return (
    <BscDetailSection title="Rendimiento" icon="arrow-up" testID="rendimiento">
      <View style={styles.recuadroDeGanancia}>
        <Text style={styles.leyendaDeGanancia}>Intereses ganados</Text>
        <Text style={styles.montoDeGanancia}>
          {monto(certificado.interesesGanados)}
        </Text>
      </View>

      <View style={styles.respiro} />

      <BscDetailRow
        label="Intereses pagados"
        value={monto(certificado.interesesPagados)}
      />
      <BscDetailRow
        label="Intereses pendientes"
        // Nunca negativo: tras una renovación el core puede reportar más pagado
        // que ganado, y un pendiente en negativo no significa nada.
        value={monto(interesesPendientes(certificado))}
        valueColor={BscColors.primary}
      />
    </BscDetailSection>
  );
}

export function InformacionDelCertificado({
  certificado,
}: {
  certificado: DetalleDeCertificado;
}): React.JSX.Element {
  const vigente = estaVigente(certificado);

  return (
    <BscDetailSection
      title="Información del Certificado"
      icon="info"
      testID="informacion-del-certificado"
    >
      <BscDetailRow
        label="No. Certificado"
        value={certificado.numeroDeCertificado}
      />
      {certificado.fechaDeInicio === undefined ? null : (
        <BscDetailRow
          label="Fecha de inicio"
          value={certificado.fechaDeInicio}
        />
      )}
      {certificado.fechaDeVencimiento === undefined ? null : (
        <BscDetailRow
          label="Fecha de vencimiento"
          value={certificado.fechaDeVencimiento}
          valueColor={BscColors.warning}
        />
      )}
      <BscDetailRow
        label="Tasa de interés"
        value={`${certificado.tasaDeInteres}%`}
      />
      {certificado.tasaAnualEfectiva === undefined ? null : (
        <BscDetailRow
          label="Tasa anual efectiva"
          value={`${certificado.tasaAnualEfectiva}%`}
        />
      )}
      {certificado.nombreDelProducto === undefined ? null : (
        <BscDetailRow label="Producto" value={certificado.nombreDelProducto} />
      )}
      {certificado.fechaDeUltimaRenovacion === undefined ? null : (
        <BscDetailRow
          label="Última renovación"
          value={certificado.fechaDeUltimaRenovacion}
        />
      )}
      {certificado.cuentaDeAbono === undefined ? null : (
        <BscDetailRow
          label="Cuenta de abono"
          value={certificado.cuentaDeAbono}
        />
      )}
      <BscDetailRow
        label="Estado"
        value={vigente ? 'Activo' : 'Vencido'}
        valueColor={vigente ? BscColors.success : BscColors.warning}
      />
    </BscDetailSection>
  );
}

const styles = StyleSheet.create({
  centrado: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centroDelAnillo: {
    position: 'absolute',
    alignItems: 'center',
  },
  tasaGrande: {
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.secondary,
  },
  leyendaDeLaTasa: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  pastillaDeDias: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BscRadius.lg,
    backgroundColor: withAlpha(BscColors.secondary, 0.08),
  },
  textoDeDias: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.secondary,
  },
  respiro: {
    height: 16,
  },
  recuadroDeGanancia: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderRadius: BscRadius.sm,
    backgroundColor: withAlpha(BscColors.success, 0.05),
    borderWidth: 1,
    borderColor: withAlpha(BscColors.success, 0.2),
  },
  leyendaDeGanancia: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
    marginBottom: 4,
  },
  montoDeGanancia: {
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.success,
  },
});
