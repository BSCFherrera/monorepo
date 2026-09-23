import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  BscCard,
  BscColors,
  BscDetailRow,
  BscEmptyState,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPageHeader,
  BscPill,
  BscPrimaryButton,
  BscRadius,
  BscRowDivider,
  BscSectionHeader,
  BscSheet,
  BscSpacing,
  BscSpinner,
  type BscIconName,
} from '@bsc/ui-native';
import { buttonTokens } from '@bsc/ui-native';
import type { TwoFactorRepository } from '../../twoFactor/data/twoFactorRepository';
import {
  CATALOGOS_VACIOS,
  cuentaEnmascarada,
  nombreVisible,
  simboloDeMoneda,
  TipoDeBeneficiario,
  type Beneficiario,
  type CatalogosDeBeneficiario,
} from '../data/beneficiaryContracts';
import type { BeneficiaryRepository } from '../data/beneficiaryRepository';

import { AddBeneficiarySheet } from './AddBeneficiarySheet';

/**
 * Beneficiarios registrados, agrupados por a dónde va el dinero.
 *
 * Portada de `beneficiaries_screen.dart`. Los tres grupos, su orden y sus
 * iconos son los del original, y **un grupo vacío no se dibuja**: una sección
 * «Internacionales» con cero filas ocupa sitio y no dice nada.
 */

const GRUPOS: ReadonlyArray<{
  tipo: number;
  titulo: string;
  icono: BscIconName;
}> = [
  {
    tipo: TipoDeBeneficiario.BancoInterno,
    titulo: 'Cuentas BSC',
    icono: 'wallet',
  },
  {
    tipo: TipoDeBeneficiario.InterbancarioLocal,
    titulo: 'Otros bancos locales',
    icono: 'bank',
  },
  {
    tipo: TipoDeBeneficiario.Internacional,
    titulo: 'Internacionales',
    icono: 'globe',
  },
];

export interface BeneficiariesScreenProps {
  repositorio: BeneficiaryRepository;
  segundoFactor: TwoFactorRepository;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
  /**
   * Transferir a un beneficiario concreto.
   *
   * El original va a `/transfers?beneficiary=…&btype=…`: el beneficiario ya
   * dice a dónde va el dinero, así que el asistente se salta el selector de
   * destino y llega con el beneficiario puesto.
   */
  onTransferir?: ((beneficiario: Beneficiario) => void) | undefined;
}

export function BeneficiariesScreen({
  repositorio,
  segundoFactor,
  onBack,
  onActivity,
  onTransferir,
}: BeneficiariesScreenProps): React.JSX.Element {
  const [lista, setLista] = useState<Beneficiario[]>([]);
  const [catalogos, setCatalogos] =
    useState<CatalogosDeBeneficiario>(CATALOGOS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agregando, setAgregando] = useState(false);
  const [detalle, setDetalle] = useState<Beneficiario | null>(null);

  const cargar = useCallback(
    async (forzar = false): Promise<void> => {
      setError(null);

      try {
        setLista(await repositorio.listar());
      } catch {
        setError('No pudimos cargar tus beneficiarios.');
      }

      /*
        Los catálogos solo los necesita el formulario de alta. Que fallen no
        puede dejar en blanco la lista que el cliente vino a ver, así que van
        en su propio intento y su fallo no se reporta aquí.
      */
      try {
        setCatalogos(await repositorio.obtenerCatalogos({ forzar }));
      } catch {
        /* los selectores se degradan; la lista se mantiene */
      }
    },
    [repositorio],
  );

  useEffect(() => {
    let vigente = true;
    void (async () => {
      await cargar();
      if (vigente) setCargando(false);
    })();
    return () => {
      vigente = false;
    };
  }, [cargar]);

  const refrescar = useCallback((): void => {
    setRefrescando(true);
    void cargar(true).finally(() => setRefrescando(false));
  }, [cargar]);

  const hayAlguno = lista.length > 0;

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={refrescar}
            colors={[BscColors.primary]}
            tintColor={BscColors.primary}
          />
        }
      >
        <BscPageHeader
          title="Beneficiarios"
          subtitle="A quién puedes enviarle dinero"
          onBack={onBack}
        />

        <View style={styles.zonaAgregar}>
          <BscPrimaryButton
            label="Agregar beneficiario"
            leading={
              <BscIcon
                name="person-add"
                size={19}
                color={BscColors.textOnPrimary}
              />
            }
            onPress={() => {
              onActivity?.();
              setAgregando(true);
            }}
            testID="agregar-beneficiario"
          />
        </View>

        {cargando ? (
          <View style={styles.cargando}>
            <BscSpinner
              tamano="screenList"
              testID="beneficiarios-cargando"
            />
          </View>
        ) : error !== null ? (
          <BscEmptyState
            icon="cloud-off"
            title="No pudimos cargar tus beneficiarios"
            message={error}
            actionLabel="Reintentar"
            onAction={() => {
              setCargando(true);
              void cargar().finally(() => setCargando(false));
            }}
            testID="beneficiarios-error"
          />
        ) : !hayAlguno ? (
          <BscEmptyState
            icon="people"
            title="Aún no tienes beneficiarios"
            message="Agrega uno para transferirle sin escribir el número de cuenta cada vez."
            testID="beneficiarios-vacio"
          />
        ) : (
          GRUPOS.map(grupo => {
            const delGrupo = lista.filter(b => b.tipo === grupo.tipo);
            if (delGrupo.length === 0) return null;

            return (
              <Grupo
                key={grupo.tipo}
                titulo={grupo.titulo}
                icono={grupo.icono}
                beneficiarios={delGrupo}
                onAbrir={beneficiario => {
                  onActivity?.();
                  setDetalle(beneficiario);
                }}
              />
            );
          })
        )}
      </ScrollView>

      <AddBeneficiarySheet
        visible={agregando}
        catalogos={catalogos}
        repositorio={repositorio}
        segundoFactor={segundoFactor}
        onActivity={onActivity}
        onCerrar={creado => {
          setAgregando(false);
          if (creado) void cargar(true);
        }}
      />

      <DetalleDeBeneficiario
        beneficiario={detalle}
        onCerrar={() => setDetalle(null)}
        onTransferir={
          onTransferir === undefined
            ? undefined
            : beneficiario => {
                setDetalle(null);
                onTransferir(beneficiario);
              }
        }
      />
    </View>
  );
}

// ─── Grupo ──────────────────────────────────────────────────────────────────

function Grupo({
  titulo,
  icono,
  beneficiarios,
  onAbrir,
}: {
  titulo: string;
  icono: BscIconName;
  beneficiarios: Beneficiario[];
  onAbrir: (beneficiario: Beneficiario) => void;
}): React.JSX.Element {
  return (
    <View>
      <BscSectionHeader
        title={titulo}
        trailingText={String(beneficiarios.length)}
        style={styles.encabezado}
      />
      <View style={styles.margenLateral}>
        <BscCard style={styles.tarjeta}>
          {beneficiarios.map((beneficiario, indice) => (
            <View key={beneficiario.id}>
              {indice > 0 ? <BscRowDivider /> : null}
              <BscListRow
                leading={<BscIconTile icon={icono} />}
                title={nombreVisible(beneficiario)}
                subtitle={[
                  cuentaEnmascarada(beneficiario),
                  ...(beneficiario.banco !== undefined
                    ? [beneficiario.banco]
                    : []),
                ].join(' · ')}
                trailing={<BscPill label={simboloDeMoneda(beneficiario)} />}
                onPress={() => onAbrir(beneficiario)}
                testID={`beneficiario-${beneficiario.id}`}
              />
            </View>
          ))}
        </BscCard>
      </View>
    </View>
  );
}

// ─── Hoja de detalle ────────────────────────────────────────────────────────

function DetalleDeBeneficiario({
  beneficiario,
  onCerrar,
  onTransferir,
}: {
  beneficiario: Beneficiario | null;
  onCerrar: () => void;
  onTransferir?: ((beneficiario: Beneficiario) => void) | undefined;
}): React.JSX.Element {
  // La hoja se monta siempre y se enseña o no: desmontarla en medio de la
  // animación de cierre la hace desaparecer de golpe.
  const visible = beneficiario !== null;

  return (
    <BscSheet
      visible={visible}
      title={beneficiario === null ? '' : nombreVisible(beneficiario)}
      onClose={onCerrar}
      footer={
        beneficiario !== null && onTransferir !== undefined ? (
          <BscPrimaryButton
            label="Transferir a este beneficiario"
            trailing={
              <BscIcon
                name="arrow-forward"
                size={buttonTokens.iconTrailing}
              />
            }
            onPress={() => onTransferir(beneficiario)}
            testID="transferir-a-beneficiario"
          />
        ) : undefined
      }
      testID="detalle-beneficiario"
    >
      {beneficiario === null ? null : (
        <View style={styles.fichaDetalle}>
          <BscDetailRow label="Beneficiario" value={beneficiario.nombre} />
          <BscDetailRow label="Cuenta" value={beneficiario.numeroDeCuenta} />
          {beneficiario.tipoDeCuenta !== '' ? (
            <BscDetailRow
              label="Tipo de cuenta"
              value={beneficiario.tipoDeCuenta}
            />
          ) : null}
          {beneficiario.banco !== undefined ? (
            <BscDetailRow label="Banco" value={beneficiario.banco} />
          ) : null}
          <BscDetailRow label="Moneda" value={simboloDeMoneda(beneficiario)} />
          {beneficiario.documentoNumero !== undefined ? (
            <BscDetailRow
              label="Documento"
              value={beneficiario.documentoNumero}
            />
          ) : null}
        </View>
      )}
    </BscSheet>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    paddingBottom: BscSpacing.xxl,
  },
  zonaAgregar: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.md,
  },
  cargando: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  encabezado: {
    paddingHorizontal: BscSpacing.gutter,
    marginTop: BscSpacing.lg,
  },
  margenLateral: {
    paddingHorizontal: BscSpacing.gutter,
  },
  tarjeta: {
    padding: 0,
  },
  fichaDetalle: {
    paddingHorizontal: BscSpacing.md,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surfaceVariant,
  },
});

export type { Beneficiario };
