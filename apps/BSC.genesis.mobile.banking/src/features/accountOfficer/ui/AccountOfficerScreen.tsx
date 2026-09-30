import { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BscColors,
  BscGradientSurface,
  BscIcon,
  BscPrimaryButton,
  BscRadius,
  BscShadows,
  BscSpinner,
  withAlpha,
  type BscIconName,
  BscTextStyles,
} from '@bsc/design-system';
import type { CustomerRepository } from '../../customer/data/customerRepository';
import {
  CARGO_DEL_OFICIAL,
  numeroParaMarcar,
  oficialDelPerfil,
  SIN_OFICIAL_ASIGNADO,
  type OficialDeCuenta,
} from '../data/accountOfficer';

/**
 * Mi Oficial de Cuenta.
 *
 * Portada de `account_officer_screen.dart`. El oficial se deriva del perfil del
 * titular, que ya lo trae: **no hay una segunda consulta**, y el propio
 * repositorio del original explica por qué se quitó la que había.
 *
 * Las medidas son las literales del widget —el círculo de 96, el punto de 22
 * con su borde blanco de 3, el recuadro de icono de 44 y el sangrado de 74 del
 * separador—, no las del sistema de diseño: esta pantalla las escribe a mano.
 */

export interface AccountOfficerScreenProps {
  repositorio: CustomerRepository;
  customerCode: string;
  onBack: () => void;
  onActivity?: (() => void) | undefined;
  /** Inyectable para poder probar el marcado sin abrir nada. */
  abrirEnlace?: ((url: string) => void) | undefined;
}

type Estado =
  | { fase: 'cargando' }
  | { fase: 'listo'; oficial: OficialDeCuenta }
  | { fase: 'error'; mensaje: string };

export function AccountOfficerScreen({
  repositorio,
  customerCode,
  onBack,
  onActivity,
  abrirEnlace,
}: AccountOfficerScreenProps): React.JSX.Element {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado({ fase: 'cargando' });

    void (async () => {
      try {
        const perfil = await repositorio.obtenerPerfil(customerCode);
        if (!vigente) return;

        const oficial = oficialDelPerfil(perfil);
        setEstado(
          oficial === null
            ? { fase: 'error', mensaje: SIN_OFICIAL_ASIGNADO }
            : { fase: 'listo', oficial },
        );
      } catch {
        if (vigente) {
          setEstado({
            fase: 'error',
            mensaje: 'No se pudo obtener la información del oficial.',
          });
        }
      }
    })();

    return () => {
      vigente = false;
    };
  }, [repositorio, customerCode, intento]);

  const abrir = useCallback(
    (url: string) => {
      onActivity?.();
      if (abrirEnlace !== undefined) {
        abrirEnlace(url);
        return;
      }
      // `Linking` es del núcleo de React Native: cubre lo que el original hace
      // con `url_launcher` sin sumar una dependencia.
      void Linking.openURL(url).catch(() => {
        // No hay marcador ni cliente de correo. Callar es lo que hace el
        // original, que solo abre si `canLaunchUrl` dice que sí.
      });
    },
    [abrirEnlace, onActivity],
  );

  if (estado.fase === 'cargando') {
    return (
      <View style={styles.pantalla}>
        <Cabecera onBack={onBack} />
        <View style={styles.centro}>
          <BscSpinner testID="oficial-cargando" />
        </View>
      </View>
    );
  }

  if (estado.fase === 'error') {
    return (
      <View style={styles.pantalla}>
        <Cabecera onBack={onBack} />
        <View style={styles.centro}>
          <View style={styles.zonaError}>
            <BscIcon name="error" size={56} color={BscColors.error} />
            <Text style={styles.textoError}>{estado.mensaje}</Text>
            <BscPrimaryButton
              label="Reintentar"
              leading={
                <BscIcon
                  name="refresh"
                  size={19}
                  color={BscColors.textOnPrimary}
                />
              }
              onPress={() => setIntento(n => n + 1)}
              style={styles.botonReintentar}
              testID="oficial-reintentar"
            />
          </View>
        </View>
      </View>
    );
  }

  const { oficial } = estado;

  return (
    <View style={styles.pantalla}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Cabecera onBack={onBack} oficial={oficial} />

        <View style={styles.cuerpo}>
          <EtiquetaDeSeccion texto="Información del oficial" />
          <View style={styles.separacion12} />
          <FichaDeDato
            icono="badge"
            color={BscColors.primary}
            etiqueta="Oficial Asignado"
            valor={oficial.nombre}
          />

          {/* El original deja un hueco de 12 aquí y otro de 12 dentro del
              condicional de la sucursal: entre las dos fichas hay 24. */}
          <View style={styles.separacion12} />
          {oficial.sucursal !== undefined ? (
            <>
              <View style={styles.separacion12} />
              <FichaDeDato
                icono="location"
                color={BscColors.secondary}
                etiqueta="Sucursal"
                valor={oficial.sucursal}
              />
            </>
          ) : null}

          <View style={styles.separacion28} />
          <EtiquetaDeSeccion texto="Información de contacto" />
          <View style={styles.separacion12} />
          <FichaDeContacto oficial={oficial} onAbrir={abrir} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Cabecera ───────────────────────────────────────────────────────────────

function Cabecera({
  onBack,
  oficial,
}: {
  onBack: () => void;
  oficial?: OficialDeCuenta;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <BscGradientSurface style={[styles.heroe, { paddingTop: insets.top }]}>
      <View style={styles.barra}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={12}
          style={styles.volver}
          testID="oficial-volver"
        >
          <BscIcon name="chevron-left" size={20} color={BscColors.textOnDark} />
        </Pressable>
        <Text style={styles.tituloBarra}>Mi Oficial de Cuenta</Text>
        <View style={styles.volver} />
      </View>

      {oficial !== undefined ? (
        <View style={styles.retrato}>
          <View style={styles.circulo}>
            <BscIcon name="headset" size={48} color={BscColors.primary} />
            {/* El punto verde de disponibilidad, pegado abajo a la derecha. */}
            <View style={styles.puntoEnLinea} />
          </View>

          <Text style={styles.nombre}>{oficial.nombre}</Text>
          <Text style={styles.cargo}>{CARGO_DEL_OFICIAL}</Text>

          <View style={styles.pildora}>
            {/*
              El original declara este punto como `_PulseDot`, un widget con su
              propio `AnimationController` que repite en bucle… y cuyo `builder`
              **no usa el valor de la animación**: dibuja siempre el mismo
              círculo. El latido no existe, solo el temporizador que lo mueve.
              Aquí se porta el punto tal como se ve, sin la animación muerta.
            */}
            <View style={styles.puntoPildora} />
            <Text style={styles.textoPildora}>Disponible</Text>
          </View>
        </View>
      ) : null}
    </BscGradientSurface>
  );
}

// ─── Piezas ─────────────────────────────────────────────────────────────────

function EtiquetaDeSeccion({ texto }: { texto: string }): React.JSX.Element {
  return <Text style={styles.etiquetaSeccion}>{texto.toUpperCase()}</Text>;
}

function FichaDeDato({
  icono,
  color,
  etiqueta,
  valor,
}: {
  icono: BscIconName;
  color: string;
  etiqueta: string;
  valor: string;
}): React.JSX.Element {
  return (
    <View style={styles.ficha}>
      <View
        style={[styles.recuadro, { backgroundColor: withAlpha(color, 0.1) }]}
      >
        <BscIcon name={icono} size={22} color={color} />
      </View>
      <View style={styles.textoFicha}>
        <Text style={styles.etiquetaFicha}>{etiqueta}</Text>
        <Text style={styles.valorFicha}>{valor}</Text>
      </View>
    </View>
  );
}

/**
 * La tarjeta de contacto, con una fila por cada dato que llegó.
 *
 * El original construye la lista en orden —oficina, móvil, correo— y solo
 * intercala el separador si ya hay algo encima, de modo que no aparece una
 * línea colgando sobre la primera fila.
 */
function FichaDeContacto({
  oficial,
  onAbrir,
}: {
  oficial: OficialDeCuenta;
  onAbrir: (url: string) => void;
}): React.JSX.Element {
  const filas: React.JSX.Element[] = [];

  const agregar = (fila: React.JSX.Element): void => {
    if (filas.length > 0) {
      filas.push(
        <View
          key={`sep-${String(filas.length)}`}
          style={styles.separadorFila}
        />,
      );
    }
    filas.push(fila);
  };

  if (oficial.telefono !== undefined) {
    agregar(
      <FilaDeContacto
        key="oficina"
        icono="phone"
        color={BscColors.primary}
        etiqueta="Oficina"
        valor={oficial.telefono}
        onPress={() =>
          onAbrir(`tel:${numeroParaMarcar(oficial.telefono ?? '')}`)
        }
        testID="oficial-telefono"
      />,
    );
  }

  if (oficial.celular !== undefined) {
    agregar(
      <FilaDeContacto
        key="movil"
        icono="smartphone"
        color={BscColors.secondary}
        etiqueta="No. Móvil"
        valor={oficial.celular}
        onPress={() =>
          onAbrir(`tel:${numeroParaMarcar(oficial.celular ?? '')}`)
        }
        testID="oficial-celular"
      />,
    );
  }

  if (oficial.email !== undefined) {
    agregar(
      <FilaDeContacto
        key="correo"
        icono="mail"
        /* El original pinta esta fila con `BscColors.accent`, que su propio
           archivo de color declara obsoleto y define como `secondary`. */
        color={BscColors.secondary}
        etiqueta="Email"
        valor={oficial.email}
        onPress={() => onAbrir(`mailto:${oficial.email ?? ''}`)}
        testID="oficial-correo"
      />,
    );
  }

  if (filas.length === 0) {
    return (
      <View style={styles.sinContacto}>
        <Text style={styles.textoSinContacto}>
          No hay información de contacto disponible
        </Text>
      </View>
    );
  }

  return <View style={styles.tarjetaContacto}>{filas}</View>;
}

function FilaDeContacto({
  icono,
  color,
  etiqueta,
  valor,
  onPress,
  testID,
}: {
  icono: BscIconName;
  color: string;
  etiqueta: string;
  valor: string;
  onPress: () => void;
  testID: string;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${etiqueta} ${valor}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filaContacto,
        pressed && styles.filaPresionada,
      ]}
      testID={testID}
    >
      <View
        style={[styles.recuadro, { backgroundColor: withAlpha(color, 0.1) }]}
      >
        <BscIcon name={icono} size={22} color={color} />
      </View>
      <View style={styles.textoFicha}>
        <Text style={styles.etiquetaFicha}>{etiqueta}</Text>
        <Text style={[styles.valorContacto, { color }]} numberOfLines={1}>
          {valor}
        </Text>
      </View>
      <BscIcon name="chevron-right" size={22} color={BscColors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroe: {
    borderBottomLeftRadius: BscRadius.sheet,
    borderBottomRightRadius: BscRadius.sheet,
  },
  barra: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  volver: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloBarra: {
    flex: 1,
    textAlign: 'center',
    color: BscColors.textOnDark,
    ...BscTextStyles['Body L/18 SemiBold'],
  },

  retrato: {
    alignItems: 'center',
    // `SizedBox(height: 8)` entre la barra y el círculo.
    paddingTop: 8,
    paddingBottom: 28,
  },
  circulo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: BscColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...BscShadows.card,
  },
  puntoEnLinea: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BscColors.success,
    borderWidth: 3,
    borderColor: BscColors.surface,
  },
  nombre: {
    marginTop: 16,
    paddingHorizontal: 24,
    ...BscTextStyles['Title XS/24 Bold'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  cargo: {
    marginTop: 6,
    ...BscTextStyles['Body S/14 Regular'],
    color: 'rgba(255, 255, 255, 0.85)',
  },
  pildora: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BscRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  puntoPildora: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: BscColors.success,
  },
  textoPildora: {
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.textOnDark,
  },

  // `SliverPadding(20, 20, 20, 32)` del original.
  cuerpo: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  separacion12: { height: 12 },
  separacion28: { height: 28 },

  etiquetaSeccion: {
    paddingLeft: 4,
    ...BscTextStyles['Caption/12 Bold'],
    letterSpacing: 1.2,
    color: BscColors.textSecondary,
  },

  ficha: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    ...BscShadows.card,
  },
  recuadro: {
    width: 44,
    height: 44,
    borderRadius: BscRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoFicha: {
    flex: 1,
    marginLeft: 14,
  },
  etiquetaFicha: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  valorFicha: {
    marginTop: 4,
    ...BscTextStyles['Body MD/16 SemiBold'],
    color: BscColors.textPrimary,
  },

  tarjetaContacto: {
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    ...BscShadows.card,
  },
  filaContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filaPresionada: {
    backgroundColor: BscColors.surfaceVariant,
  },
  valorContacto: {
    marginTop: 2,
    ...BscTextStyles['Body MD/16 SemiBold'],
  },
  // El separador arranca a 74 para alinearse con el texto, no con el icono.
  separadorFila: {
    height: 1,
    marginLeft: 74,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  sinContacto: {
    padding: 20,
    borderRadius: BscRadius.md,
    backgroundColor: BscColors.surface,
    alignItems: 'center',
  },
  textoSinContacto: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },

  zonaError: {
    alignItems: 'center',
    padding: 32,
  },
  textoError: {
    marginTop: 16,
    textAlign: 'center',
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textSecondary,
  },
  botonReintentar: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
});
