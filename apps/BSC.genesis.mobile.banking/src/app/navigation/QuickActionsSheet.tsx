import { StyleSheet, Text, View } from 'react-native';

import {
  BscBorderRadius,
  BscColors,
  BscIconTile,
  BscListRow,
  BscRowDivider,
  BscSheet,
  BscSpacing,
  BscTypography,
} from '@bsc/ui-native';
import type { BscIconName } from '@bsc/ui-native';

/**
 * Hoja de «¿Qué deseas hacer?».
 *
 * Portada de `showQuickActionsSheet` en `quick_actions.dart`. Se abre desde dos
 * sitios —el botón «Más» de las acciones rápidas y el diamante de la barra
 * inferior—, y por eso vive junto a la navegación y no dentro del dashboard.
 *
 * Los dos grupos y sus siete acciones se conservan con sus mismos textos: son
 * el índice de lo que la app sabe hacer, y reordenarlos o resumirlos cambiaría
 * lo que el cliente encuentra primero.
 */

export type DestinoRapido =
  | 'transferir'
  | 'pagar-tarjeta'
  | 'pagar-prestamo'
  | 'beneficiarios'
  | 'tasa-de-cambio'
  | 'comprobantes-fiscales'
  | 'oficial-de-cuenta';

interface Accion {
  destino: DestinoRapido;
  icono: BscIconName;
  titulo: string;
  descripcion: string;
}

interface Grupo {
  titulo: string;
  acciones: readonly Accion[];
}

const GRUPOS: readonly Grupo[] = [
  {
    titulo: 'Mover dinero',
    acciones: [
      {
        destino: 'transferir',
        icono: 'transfer',
        titulo: 'Transferir',
        descripcion: 'Entre tus cuentas o a terceros',
      },
      {
        destino: 'pagar-tarjeta',
        icono: 'card',
        titulo: 'Pagar tarjeta',
        descripcion: 'Mínimo, al corte u otro monto',
      },
      {
        destino: 'pagar-prestamo',
        icono: 'bank',
        titulo: 'Pagar préstamo',
        descripcion: 'Abona a tu cuota',
      },
      {
        destino: 'beneficiarios',
        icono: 'people',
        titulo: 'Beneficiarios',
        descripcion: 'Administra a quién le transfieres',
      },
    ],
  },
  {
    titulo: 'Consultar',
    acciones: [
      {
        destino: 'tasa-de-cambio',
        icono: 'exchange',
        titulo: 'Tasa de cambio',
        descripcion: 'Compra y venta del día',
      },
      {
        destino: 'comprobantes-fiscales',
        icono: 'receipt',
        titulo: 'Comprobantes fiscales',
        descripcion: 'NCF emitidos sobre tus cuentas',
      },
      {
        destino: 'oficial-de-cuenta',
        icono: 'headset',
        titulo: 'Mi oficial de cuenta',
        descripcion: 'Contacta a tu ejecutivo',
      },
    ],
  },
];

export interface QuickActionsSheetProps {
  visible: boolean;
  onCerrar: () => void;
  onElegir: (destino: DestinoRapido) => void;
}

export function QuickActionsSheet({
  visible,
  onCerrar,
  onElegir,
}: QuickActionsSheetProps): React.JSX.Element {
  return (
    <BscSheet
      visible={visible}
      title="¿Qué deseas hacer?"
      onClose={onCerrar}
      testID="hoja-acciones"
    >
      {GRUPOS.map(grupo => (
        <View key={grupo.titulo} style={styles.grupo}>
          <Text style={styles.tituloGrupo}>{grupo.titulo}</Text>

          <View style={styles.bloque}>
            {grupo.acciones.map((accion, indice) => (
              <View key={accion.destino}>
                {indice > 0 ? <BscRowDivider /> : null}
                <BscListRow
                  leading={
                    <BscIconTile
                      icon={accion.icono}
                      background={BscColors.surface}
                      size={38}
                      iconSize={19}
                    />
                  }
                  title={accion.titulo}
                  subtitle={accion.descripcion}
                  showChevron
                  onPress={() => onElegir(accion.destino)}
                  testID={`accion-rapida-${accion.destino}`}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  grupo: {
    marginBottom: BscSpacing.lg,
  },
  tituloGrupo: {
    ...BscTypography.titleMedium,
    marginBottom: BscSpacing.xs,
  },
  bloque: {
    backgroundColor: BscColors.surfaceVariant,
    borderRadius: BscBorderRadius.card,
  },
});
