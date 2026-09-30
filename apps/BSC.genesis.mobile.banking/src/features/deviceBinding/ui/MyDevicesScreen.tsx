import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatDateShort } from '@bsc/shared';

import {
  BscBanner,
  BscCard,
  BscColors,
  BscDetailRow,
  BscEmptyState,
  BscIcon,
  BscPageHeader,
  BscPill,
  BscPrimaryButton,
  BscSheet,
  BscSpacing,
  BscSpinner,
  BscTextButton,
  BscTextStyles,
  fontFamily,
} from '@bsc/design-system';
import { TEXTO_DE_LA_HOJA } from '../../../app/medidasDeLasOchoPantallas';
import {
  estaActivo,
  estaPendiente,
  etiquetaDeEstado,
  type DispositivoDeConfianza,
} from '../data/deviceContracts';
import type { DeviceBindingService } from '../domain/deviceBindingService';

/**
 * Los dispositivos que pueden operar en la cuenta del cliente.
 *
 * Portada de `my_devices_screen.dart`.
 *
 * **Poder ver y revocar es tan importante como poder enrolar.** Sin esta
 * pantalla, un cliente que sospecha de un dispositivo ajeno no tiene más salida
 * que llamar al banco y esperar; con ella lo saca él mismo en dos toques, que
 * es lo que importa cuando alguien acaba de perder el teléfono.
 */

export interface MyDevicesScreenProps {
  vinculo: DeviceBindingService;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
}

export function MyDevicesScreen({
  vinculo,
  onBack,
  onActivity,
}: MyDevicesScreenProps): React.JSX.Element {
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [dispositivos, setDispositivos] = useState<DispositivoDeConfianza[]>(
    [],
  );
  const [esteTelefono, setEsteTelefono] = useState<string | null>(null);
  const [porRevocar, setPorRevocar] = useState<DispositivoDeConfianza | null>(
    null,
  );
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    const lista = await vinculo.listarDispositivos();
    const id = await vinculo.deviceId();

    setDispositivos(lista);
    setEsteTelefono(id);
    setCargando(false);
    setRefrescando(false);
  }, [vinculo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const revocar = async (
    dispositivo: DispositivoDeConfianza,
  ): Promise<void> => {
    onActivity?.();
    setPorRevocar(null);

    const resultado = await vinculo.revocarDispositivo(dispositivo.deviceId);

    setAviso(
      resultado.exito
        ? `${dispositivo.nombre} fue revocado.`
        : resultado.mensaje,
    );

    await cargar();
  };

  return (
    <View style={estilosDeMisDispositivos.pantalla}>
      <BscPageHeader
        title="Mis dispositivos"
        subtitle="Los teléfonos que pueden operar en tu cuenta"
        onBack={onBack}
        testID="cabecera-mis-dispositivos"
      />

      {cargando ? (
        <View style={estilosDeMisDispositivos.centro}>
          <BscSpinner />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={estilosDeMisDispositivos.contenido}
          onScrollBeginDrag={onActivity}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              tintColor={BscColors.primary}
              colors={[BscColors.primary]}
              onRefresh={() => {
                setRefrescando(true);
                void cargar();
              }}
            />
          }
        >
          {aviso !== null ? (
            <>
              <BscBanner
                tone="info"
                icon="info"
                title="Listo"
                subtitle={aviso}
                testID="aviso-dispositivos"
              />
              <View style={estilosDeMisDispositivos.separacionMedia} />
            </>
          ) : null}

          {dispositivos.length === 0 ? (
            <>
              <View style={estilosDeMisDispositivos.separacionEnorme} />
              <BscEmptyState
                icon="devices"
                title="Sin dispositivos registrados"
                message={
                  'Activa la firma en Seguridad para registrar este teléfono y ' +
                  'autorizar tus operaciones sin código.'
                }
                testID="sin-dispositivos"
              />
            </>
          ) : (
            dispositivos.map((dispositivo, indice) => (
              <View key={dispositivo.deviceId || String(indice)}>
                {indice > 0 ? (
                  <View style={estilosDeMisDispositivos.separacionPequena} />
                ) : null}
                <TarjetaDeDispositivo
                  dispositivo={dispositivo}
                  esEsteTelefono={dispositivo.deviceId === esteTelefono}
                  onRevocar={() => {
                    onActivity?.();
                    setPorRevocar(dispositivo);
                  }}
                />
              </View>
            ))
          )}
        </ScrollView>
      )}

      <BscSheet
        visible={porRevocar !== null}
        title={porRevocar === null ? 'Revocar' : `Revocar ${porRevocar.nombre}`}
        onClose={() => setPorRevocar(null)}
        footer={
          <BscPrimaryButton
            label="Revocar dispositivo"
            onPress={() => {
              if (porRevocar !== null) void revocar(porRevocar);
            }}
            testID="confirmar-revocar"
          />
        }
      >
        <Text style={estilosDeMisDispositivos.textoHoja}>
          {porRevocar !== null && porRevocar.deviceId === esteTelefono
            ? 'Es el teléfono que estás usando. Al revocarlo dejarás de ' +
              'autorizar con tu rostro o huella y volverás al código de ' +
              'verificación.'
            : 'Ese dispositivo no podrá autorizar operaciones. Si vuelve a ' +
              'necesitarlo, tendrá que registrarse de nuevo.'}
        </Text>

        {porRevocar !== null && porRevocar.deviceId !== esteTelefono ? (
          <>
            <View style={estilosDeMisDispositivos.separacionMedia} />
            <BscBanner
              tone="warning"
              icon="warning"
              title="¿No reconoces este dispositivo?"
              subtitle="Revócalo y llámanos de inmediato para revisar tu cuenta."
            />
          </>
        ) : null}
      </BscSheet>
    </View>
  );
}

function TarjetaDeDispositivo({
  dispositivo,
  esEsteTelefono,
  onRevocar,
}: {
  dispositivo: DispositivoDeConfianza;
  esEsteTelefono: boolean;
  onRevocar: () => void;
}): React.JSX.Element {
  const activo = estaActivo(dispositivo);

  return (
    <BscCard testID={`dispositivo-${dispositivo.deviceId}`}>
      <View style={estilosDeMisDispositivos.cabeceraTarjeta}>
        <BscIcon
          name={esEsteTelefono ? 'smartphone' : 'devices'}
          size={24}
          color={activo ? BscColors.primary : BscColors.textTertiary}
        />
        <View style={estilosDeMisDispositivos.separacionHorizontal} />

        <View style={estilosDeMisDispositivos.identidad}>
          <View style={estilosDeMisDispositivos.filaNombre}>
            <Text style={estilosDeMisDispositivos.nombre} numberOfLines={1}>
              {dispositivo.nombre}
            </Text>
            {esEsteTelefono ? (
              <>
                <View style={estilosDeMisDispositivos.separacionMinima} />
                <BscPill label="Este teléfono" />
              </>
            ) : null}
          </View>

          {dispositivo.sistemaOperativo !== null ? (
            <Text style={estilosDeMisDispositivos.sistema}>
              {dispositivo.sistemaOperativo}
            </Text>
          ) : null}
        </View>

        <Text
          style={[
            estilosDeMisDispositivos.estado,
            { color: colorDeEstado(dispositivo) },
          ]}
        >
          {etiquetaDeEstado(dispositivo)}
        </Text>
      </View>

      <View style={estilosDeMisDispositivos.separacionPequena} />
      {/*
        A todo el ancho, como el original: `my_devices_screen.dart` escribe
        `Divider(height: 1)` pelado, no `BscRowDivider`, que sangra 16 a cada
        lado para separar filas de una lista.
      */}
      <View style={estilosDeMisDispositivos.separadorDeBloque} />

      <BscDetailRow
        label="Último uso"
        value={
          dispositivo.ultimoUso === null
            ? 'Sin actividad'
            : formatDateShort(dispositivo.ultimoUso)
        }
      />

      {/*
        La fila solo aparece cuando el dato existe. Es lo que hacía que el
        defecto del original —leer `CreatedAt` donde el backend manda
        `RegisteredAt`— se viera como una tarjeta más corta y no como un error.
      */}
      {dispositivo.registradoEn !== null ? (
        <BscDetailRow
          label="Registrado"
          value={formatDateShort(dispositivo.registradoEn)}
        />
      ) : null}

      <View style={estilosDeMisDispositivos.separacionMinima} />

      <View style={estilosDeMisDispositivos.filaRevocar}>
        <BscTextButton
          label="Revocar"
          onPress={onRevocar}
          color={BscColors.error}
          leading={<BscIcon name="block" size={18} color={BscColors.error} />}
          testID={`revocar-${dispositivo.deviceId}`}
        />
      </View>
    </BscCard>
  );
}

function colorDeEstado(dispositivo: DispositivoDeConfianza): string {
  if (estaActivo(dispositivo)) return BscColors.success;
  if (estaPendiente(dispositivo)) return BscColors.warning;
  return BscColors.textTertiary;
}

export const estilosDeMisDispositivos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: {
    padding: BscSpacing.gutter,
    flexGrow: 1,
  },
  cabeceraTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identidad: {
    flex: 1,
  },
  filaNombre: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // `titleMedium` del original.
  nombre: {
    flexShrink: 1,
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },
  // 12.5 literal del widget Dart.
  sistema: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  estado: {
    ...BscTextStyles['Caption/12 SemiBold'],
  },
  filaRevocar: {
    alignItems: 'flex-start',
  },
  // El original no le pone tamaño: hereda `bodyMedium` del tema, que es 13.5
  // con interlínea 1.45. Un 14 a pelo se parece mucho y no es lo mismo.
  textoHoja: {
    fontFamily,
    fontSize: TEXTO_DE_LA_HOJA.tamano,
    lineHeight: TEXTO_DE_LA_HOJA.interlinea,
    color: BscColors.textSecondary,
  },
  separadorDeBloque: {
    height: 1,
    backgroundColor: BscColors.divider,
  },
  separacionHorizontal: { width: BscSpacing.sm },
  separacionMinima: { height: BscSpacing.xs, width: BscSpacing.xs },
  separacionPequena: { height: BscSpacing.sm },
  separacionMedia: { height: BscSpacing.md },
  separacionEnorme: { height: BscSpacing.xxl },
});
