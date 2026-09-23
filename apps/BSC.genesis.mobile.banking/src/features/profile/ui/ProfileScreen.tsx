import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BscCard,
  BscColors,
  BscGradientSurface,
  BscIcon,
  BscIconTile,
  BscListRow,
  BscPrimaryButton,
  BscRadius,
  BscRowDivider,
  BscSecondaryButton,
  BscSectionHeader,
  BscSheet,
  BscSpacing,
  type BscIconName,
  BscTextStyles,
} from '@bsc/ui-native';
import {
  estaActivo,
  iniciales,
  nombreCompleto,
  tieneOficial,
  type PerfilDeCliente,
} from '../../customer/data/customerContracts';
import type { CustomerRepository } from '../../customer/data/customerRepository';

/**
 * Perfil y ajustes.
 *
 * Portada de `profile_screen.dart`. La pantalla existe porque el original la
 * convirtió en la casa de la identidad, la seguridad y el soporte: antes esas
 * acciones solo vivían en el cajón lateral, donde el cliente no las encontraba.
 *
 * **Todo lo que se muestra viene del core.** El original lo dice en un
 * comentario y conviene conservarlo tal cual: aquí no se reporta ningún estado
 * que el backend no haya confirmado, y un campo que no llegó dice «No
 * disponible» en vez de inventarse un valor o dejar la fila en blanco.
 */

export interface ProfileScreenProps {
  repositorio: CustomerRepository;
  /** Código del cliente en sesión; sin él no hay perfil que pedir. */
  customerCode: string;
  /** Usuario con el que se inició sesión. No es el titular: son cosas distintas. */
  usuario?: string | undefined;
  /**
   * Versión de la aplicación, «1.2.0 (34)».
   *
   * Llega por propiedad y no se lee aquí: el original la saca de
   * `PackageInfo.fromPlatform()`, que es una dependencia nativa, y la versión
   * del porte ya se conoce en el arranque. Si no llega, el pie escribe solo el
   * nombre del banco, igual que hace el original mientras la carga.
   */
  version?: string | undefined;
  onOficialDeCuenta: () => void;
  onSeguridad: () => void;
  onTasaDeCambio: () => void;
  onBeneficiarios: () => void;
  onComprobantesFiscales: () => void;
  onCerrarSesion: () => void;
  onCerrarTodasLasSesiones: () => void;
  onActivity?: (() => void) | undefined;
}

export function ProfileScreen({
  repositorio,
  customerCode,
  usuario,
  version,
  onOficialDeCuenta,
  onSeguridad,
  onTasaDeCambio,
  onBeneficiarios,
  onComprobantesFiscales,
  onCerrarSesion,
  onCerrarTodasLasSesiones,
  onActivity,
}: ProfileScreenProps): React.JSX.Element {
  const [perfil, setPerfil] = useState<PerfilDeCliente | null>(
    () => repositorio.enMemoria,
  );
  const [cargando, setCargando] = useState(repositorio.enMemoria === null);
  const [hoja, setHoja] = useState<'ninguna' | 'salir' | 'salir-todos'>(
    'ninguna',
  );

  useEffect(() => {
    let vigente = true;

    void (async () => {
      try {
        const leido = await repositorio.obtenerPerfil(customerCode);
        if (vigente) setPerfil(leido);
      } catch {
        // El perfil no llegó. La pantalla sigue en pie con lo que sí se sabe
        // —el usuario de la sesión y las acciones— en vez de quedarse en un
        // error que dejaría al cliente sin poder ni cerrar sesión.
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, [repositorio, customerCode]);

  const tocar = useCallback(
    (accion: () => void) => () => {
      onActivity?.();
      accion();
    },
    [onActivity],
  );

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Cabecera
          nombre={perfil === null ? '' : nombreCompleto(perfil)}
          iniciales={perfil === null ? 'BS' : iniciales(perfil)}
          email={perfil?.email ?? ''}
          customerCode={perfil?.customerCode ?? ''}
          activo={perfil === null ? undefined : estaActivo(perfil)}
          cargando={cargando}
        />

        <Grupo titulo="Datos del cliente">
          <FilaDeDato
            icono="badge"
            titulo="Nombre registrado"
            valor={perfil === null ? undefined : nombreCompleto(perfil)}
          />
          <BscRowDivider />
          <FilaDeDato icono="mail" titulo="Correo" valor={perfil?.email} />
          <BscRowDivider />
          <FilaDeDato
            icono="phone"
            titulo="Teléfono"
            valor={perfil?.telefono}
          />
          <BscRowDivider />
          <FilaDeDato
            icono="smartphone"
            titulo="Móvil"
            valor={perfil?.celular}
          />
          <BscRowDivider />
          <FilaDeDato
            icono="location"
            titulo="Sucursal"
            valor={perfil?.sucursal}
          />
        </Grupo>

        {/* El bloque solo aparece si el core confirmó un oficial. */}
        {perfil !== null && tieneOficial(perfil) ? (
          <Grupo titulo="Mi oficial de cuenta">
            <BscListRow
              leading={<BscIconTile icon="headset" size={38} iconSize={19} />}
              title={(perfil.oficialNombre ?? '').trim()}
              subtitle={perfil.sucursal}
              showChevron
              onPress={tocar(onOficialDeCuenta)}
              testID="perfil-oficial"
            />
          </Grupo>
        ) : null}

        <Grupo titulo="Sesión">
          <FilaDeDato
            icono="person"
            titulo="Usuario"
            valor={
              usuario !== undefined && usuario !== '' ? usuario : undefined
            }
          />
          <BscRowDivider />
          <BscListRow
            leading={
              <BscIconTile icon="shield-check" size={38} iconSize={19} />
            }
            title="Seguridad"
            subtitle="Biometría, dispositivos y token"
            showChevron
            onPress={tocar(onSeguridad)}
          />
          <BscRowDivider />
          <BscListRow
            leading={<BscIconTile icon="exchange" size={38} iconSize={19} />}
            title="Tasa de cambio"
            showChevron
            onPress={tocar(onTasaDeCambio)}
          />
          <BscRowDivider />
          <BscListRow
            leading={<BscIconTile icon="people" size={38} iconSize={19} />}
            title="Beneficiarios"
            showChevron
            onPress={tocar(onBeneficiarios)}
          />
          <BscRowDivider />
          <BscListRow
            leading={<BscIconTile icon="receipt" size={38} iconSize={19} />}
            title="Comprobantes fiscales"
            showChevron
            onPress={tocar(onComprobantesFiscales)}
          />
          <BscRowDivider />
          <BscListRow
            leading={
              <BscIconTile
                icon="devices"
                color={BscColors.error}
                size={38}
                iconSize={19}
              />
            }
            title="Cerrar sesión en todos los dispositivos"
            subtitle="Invalida las sesiones abiertas en otros equipos"
            showChevron
            onPress={tocar(() => setHoja('salir-todos'))}
            testID="perfil-salir-todos"
          />
        </Grupo>

        <View style={styles.zonaSalir}>
          <BscSecondaryButton
            label="Cerrar sesión"
            leading={
              <BscIcon name="logout" size={19} color={BscColors.primary} />
            }
            onPress={tocar(() => setHoja('salir'))}
            testID="perfil-salir"
          />
        </View>

        <Text style={styles.pie}>
          {version === undefined
            ? 'Banco Santa Cruz'
            : `Banco Santa Cruz · Versión ${version}`}
        </Text>
      </ScrollView>

      <BscSheet
        visible={hoja === 'salir'}
        title="¿Cerrar sesión?"
        onClose={() => setHoja('ninguna')}
        footer={
          <View style={styles.botonesHoja}>
            <View style={styles.mitad}>
              <BscSecondaryButton
                label="Cancelar"
                onPress={() => setHoja('ninguna')}
              />
            </View>
            <View style={styles.mitad}>
              <BscPrimaryButton
                label="Cerrar sesión"
                color={BscColors.error}
                onPress={() => {
                  setHoja('ninguna');
                  onCerrarSesion();
                }}
                testID="confirmar-salir"
              />
            </View>
          </View>
        }
      >
        <Text style={styles.textoHoja}>
          Tu sesión se cerrará en este dispositivo. Podrás volver a entrar con
          biometría o con tu usuario y contraseña.
        </Text>
      </BscSheet>

      <BscSheet
        visible={hoja === 'salir-todos'}
        title="¿Cerrar todas las sesiones?"
        onClose={() => setHoja('ninguna')}
        footer={
          <View style={styles.botonesHoja}>
            <View style={styles.mitad}>
              <BscSecondaryButton
                label="Cancelar"
                onPress={() => setHoja('ninguna')}
              />
            </View>
            <View style={styles.mitad}>
              <BscPrimaryButton
                label="Cerrar todas"
                color={BscColors.error}
                onPress={() => {
                  setHoja('ninguna');
                  onCerrarTodasLasSesiones();
                }}
                testID="confirmar-salir-todos"
              />
            </View>
          </View>
        }
      >
        <Text style={styles.textoHoja}>
          Se cerrarán las sesiones activas en este y en cualquier otro
          dispositivo, incluida la banca en línea.
        </Text>
      </BscSheet>
    </View>
  );
}

// ─── Cabecera ───────────────────────────────────────────────────────────────

function Cabecera({
  nombre,
  iniciales: letras,
  email,
  customerCode,
  activo,
  cargando,
}: {
  nombre: string;
  iniciales: string;
  email: string;
  customerCode: string;
  activo: boolean | undefined;
  cargando: boolean;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <BscGradientSurface
      style={[styles.cabecera, { paddingTop: insets.top + BscSpacing.lg }]}
    >
      <View style={styles.avatar}>
        <Text style={styles.letras}>{letras}</Text>
      </View>

      <Text style={styles.nombre}>
        {nombre.trim() !== '' ? nombre : cargando ? 'Cargando…' : 'Cliente'}
      </Text>

      {email !== '' ? <Text style={styles.email}>{email}</Text> : null}

      {customerCode.trim() !== '' ? (
        <View style={styles.chip}>
          <Text style={styles.textoChip}>Cliente {customerCode}</Text>

          {/* El punto de estado solo aparece cuando el core lo confirmó: un
              cliente «activo» por omisión sería una afirmación inventada. */}
          {activo !== undefined ? (
            <>
              <View
                style={[
                  styles.punto,
                  {
                    backgroundColor: activo
                      ? BscColors.onBrandPositive
                      : BscColors.onBrandNegative,
                  },
                ]}
              />
              <Text style={styles.textoEstado}>
                {activo ? 'Activo' : 'Inactivo'}
              </Text>
            </>
          ) : null}
        </View>
      ) : null}

      {/*
        Sin indicador de carga: el original no lo tiene. `profile_screen.dart`
        enseña «Cargando…» en el sitio del nombre y nada más, y eso ya se hace
        arriba. Un círculo girando debajo era de más.
      */}
    </BscGradientSurface>
  );
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View>
      {/* El encabezado del original trae su propio margen —20 arriba, 20 a los
          lados, 12 abajo—; el del sistema de diseño solo lleva el de abajo. */}
      <BscSectionHeader title={titulo} style={styles.encabezado} />
      <View style={styles.margenLateral}>
        <BscCard style={styles.tarjeta}>{children}</BscCard>
      </View>
    </View>
  );
}

/**
 * Fila de etiqueta y valor que **dice cuándo el core no mandó nada**.
 *
 * Portada de `_row`. Es la decisión que separa esta pantalla de una que miente:
 * un campo ausente se declara «No disponible» en vez de quedar en blanco, que
 * el cliente leería como que el banco no tiene su teléfono.
 */
function FilaDeDato({
  icono,
  titulo,
  valor,
}: {
  icono: BscIconName;
  titulo: string;
  valor: string | undefined;
}): React.JSX.Element {
  const hayValor = valor !== undefined && valor.trim() !== '';

  return (
    <BscListRow
      leading={<BscIconTile icon={icono} size={38} iconSize={19} />}
      title={titulo}
      subtitle={hayValor ? valor.trim() : 'No disponible'}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  contenido: {
    paddingBottom: 100,
  },

  // Medidas literales del `_Header` original.
  cabecera: {
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
    alignItems: 'center',
    paddingHorizontal: BscSpacing.gutter,
    paddingBottom: BscSpacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letras: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Title XS/24 Bold'],
  },
  nombre: {
    marginTop: BscSpacing.sm,
    color: BscColors.textOnDark,
    ...BscTextStyles['Subtitle/20 Bold'],
    textAlign: 'center',
  },
  email: {
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.78)',
    ...BscTextStyles['Body S/14 Regular'],
  },
  chip: {
    marginTop: BscSpacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BscRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  textoChip: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Caption/12 SemiBold'],
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  textoEstado: {
    marginLeft: 5,
    color: 'rgba(255, 255, 255, 0.85)',
    ...BscTextStyles['Caption/12 Medium'],
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

  zonaSalir: {
    paddingHorizontal: BscSpacing.gutter,
    paddingTop: BscSpacing.xl,
    paddingBottom: BscSpacing.sm,
  },
  pie: {
    paddingHorizontal: BscSpacing.gutter,
    textAlign: 'center',
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
  },

  botonesHoja: {
    flexDirection: 'row',
    gap: BscSpacing.sm,
  },
  mitad: {
    flex: 1,
  },
  textoHoja: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
});
