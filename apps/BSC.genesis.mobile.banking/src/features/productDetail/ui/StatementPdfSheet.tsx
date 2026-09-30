import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BscBanner,
  BscColors,
  BscIcon,
  BscIconTile,
  BscRadius,
  BscSheet,
  BscSpacing,
  BscSpinner,
  withAlpha,
  BscTextStyles,
} from '@bsc/design-system';
import {
  entregaDePdf,
  hayEntregaDePdf,
} from '../../../core/files/statementFile';
import type { ProductDetailRepository } from '../data/productDetailRepository';
import { mensajeDeDescargaFallida } from '../data/mensajeDeDescarga';
import { nombreDelArchivoDeEstado } from '../data/statementPdf';
import { mesesConEstadoDeCuenta } from '../data/statementPeriods';

/**
 * Los estados de cuenta cerrados, para descargar en PDF.
 *
 * Portada de `StatementListSection` en `statement_list_section.dart`.
 *
 * El original la usa tanto para cuentas como para tarjetas —cambian el endpoint
 * y el nombre del archivo, no la lista—, y aquí se conserva igual: el mismo
 * componente sirve a las dos, de modo que cuando la vista de cuenta gane su
 * botón de estados no haya que escribir una segunda lista que acabaría
 * divergiendo.
 *
 * El PDF llega en base64 y lo entrega al teléfono el módulo nativo
 * `StatementFile`, que lo escribe en la caché y abre la hoja de compartir. En
 * la vista previa del navegador ese módulo no existe, y la hoja lo dice en vez
 * de fallar con un error de plataforma.
 */

type Descarga =
  | { tipo: 'quieta' }
  | { tipo: 'descargando'; indice: number }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo' };

export interface StatementPdfSheetProps {
  visible: boolean;
  repositorio: ProductDetailRepository;
  /** Qué producto es: cambia el endpoint y la raíz del nombre del archivo. */
  tipo: 'cuenta' | 'tarjeta';
  numeroDeProducto: string;
  codigoMoneda: number;
  /** Fecha de apertura, si se conoce: no se listan meses anteriores. */
  apertura?: Date | undefined;
  onClose: () => void;
  hoy?: Date;
}

export function StatementPdfSheet({
  visible,
  repositorio,
  tipo,
  numeroDeProducto,
  codigoMoneda,
  apertura,
  onClose,
  hoy,
}: StatementPdfSheetProps): React.JSX.Element {
  const meses = useMemo(
    () => mesesConEstadoDeCuenta({ hoy: hoy ?? new Date(), apertura }),
    [hoy, apertura],
  );
  const [descarga, setDescarga] = useState<Descarga>({ tipo: 'quieta' });

  const sePuedeDescargar = hayEntregaDePdf();

  const descargar = async (indice: number): Promise<void> => {
    // Una segunda descarga mientras corre la primera pediría dos PDF al core y
    // abriría dos hojas de compartir encadenadas.
    if (descarga.tipo === 'descargando') return;

    const mes = meses[indice];
    if (mes === undefined) return;

    setDescarga({ tipo: 'descargando', indice });

    try {
      const base64 =
        tipo === 'tarjeta'
          ? await repositorio.obtenerPdfDeEstadoDeTarjeta({
              numeroDeTarjeta: numeroDeProducto,
              codigoMoneda,
              mes: mes.mes,
              anio: mes.anio,
            })
          : await repositorio.obtenerPdfDeEstadoDeCuenta({
              numeroDeCuenta: numeroDeProducto,
              desde: mes.desde,
              hasta: mes.hasta,
            });

      if (base64 === undefined) {
        // El core respondió sin documento. Guardar la respuesta igual dejaría
        // en el teléfono un archivo que ningún lector abre.
        setDescarga({
          tipo: 'error',
          mensaje: `No hay estado de cuenta disponible para ${mes.etiqueta}.`,
        });
        return;
      }

      await entregaDePdf.guardarYCompartir(
        base64,
        nombreDelArchivoDeEstado({
          tipo,
          numeroDeProducto,
          mes: mes.mes,
          anio: mes.anio,
        }),
      );

      setDescarga({ tipo: 'listo' });
    } catch (causa) {
      /*
        Un mes sin movimientos no responde: la petición agota los treinta
        segundos y cae. Decir «Intenta de nuevo» ahí invita a repetir lo mismo
        con el mismo resultado, así que el mensaje distingue el banco que no
        contestó del banco que contestó que no.
      */
      setDescarga({
        tipo: 'error',
        mensaje: mensajeDeDescargaFallida(causa, mes.etiqueta),
      });
    }
  };

  return (
    <BscSheet
      visible={visible}
      title="Estados de Cuenta"
      onClose={onClose}
      testID="hoja-de-pdf"
    >
      <Text style={styles.leyenda}>Estados de cuenta cerrados, en PDF.</Text>

      {!sePuedeDescargar ? (
        <View style={styles.aviso}>
          <BscBanner
            tone="neutral"
            icon="info"
            title="Descarga no disponible aquí"
            subtitle="El estado de cuenta se descarga desde la aplicación en el teléfono."
            testID="sin-descarga"
          />
        </View>
      ) : null}

      {descarga.tipo === 'error' ? (
        <View style={styles.aviso}>
          <BscBanner
            tone="danger"
            icon="warning"
            title="No se pudo descargar"
            subtitle={descarga.mensaje}
            testID="error-de-descarga"
          />
        </View>
      ) : null}

      {descarga.tipo === 'listo' ? (
        <View style={styles.aviso}>
          <BscBanner
            tone="success"
            icon="check-circle"
            title="Estado de cuenta descargado"
            testID="descarga-lista"
          />
        </View>
      ) : null}

      <View style={styles.lista}>
        {meses.map((mes, indice) => {
          const descargandoEste =
            descarga.tipo === 'descargando' && descarga.indice === indice;

          return (
            <Pressable
              key={`${mes.anio}-${mes.mes}`}
              accessibilityRole="button"
              accessibilityLabel={`Descargar ${mes.etiqueta}`}
              disabled={descarga.tipo === 'descargando' || !sePuedeDescargar}
              onPress={() => {
                void descargar(indice);
              }}
              style={({ pressed }) => [
                styles.fila,
                pressed ? styles.filaPresionada : null,
                sePuedeDescargar ? null : styles.filaApagada,
              ]}
              testID={`estado-${mes.anio}-${mes.mes}`}
            >
              <BscIconTile
                icon="pdf"
                background={withAlpha(BscColors.primary, 0.08)}
                size={40}
                iconSize={20}
              />

              <View style={styles.textos}>
                <Text style={styles.mes}>{mes.etiqueta}</Text>
                {/*
                  Mientras se prepara, la fila lo dice. Treinta segundos de
                  rueda girando sin una palabra se leen como que la aplicación
                  se colgó, y este es justo el caso que más tarda.
                */}
                <Text style={styles.rango}>
                  {descargandoEste ? 'Preparando el documento…' : mes.rango}
                </Text>
              </View>

              {descargandoEste ? (
                <BscSpinner tamano="inRow" />
              ) : (
                <View style={styles.boton}>
                  <BscIcon
                    name="download"
                    size={20}
                    color={BscColors.primary}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  leyenda: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  aviso: {
    marginTop: BscSpacing.sm,
  },
  lista: {
    marginTop: BscSpacing.sm,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: 14,
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surface,
  },
  filaPresionada: {
    backgroundColor: BscColors.surfaceVariant,
  },
  filaApagada: {
    opacity: 0.55,
  },
  textos: {
    flex: 1,
  },
  mes: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  rango: {
    marginTop: 2,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  boton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BscRadius.xs,
    backgroundColor: withAlpha(BscColors.primary, 0.1),
  },
});
