import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@bsc/i18n';

import {
  BscColors,
  BscIcon,
  BscLogo,
  BscPrimaryButton,
  BscTextButton,
  BscTextField,
  BscRadius,
  BscSpacing,
  BscTextStyles,
  BscTypography,
  sheetMaxHeight,
  keyboardOverlap,
  withAlpha,
  FOOTNOTE_TEXT_STYLE,
  buttonTokens,
} from '@bsc/design-system';

import { useAuthStore } from '../authStore';
import fondoDeAcceso from '../assets/fondo-de-acceso.jpg';
import iconoAyuda from '../assets/icono-ayuda.png';
import iconoPuntosDeAtencion from '../assets/icono-puntos-de-atencion.png';
import iconoTasaDeCambio from '../assets/icono-tasa-de-cambio.png';

/**
 * Pantalla de acceso.
 *
 * Construida desde Figma: archivo «Onboarding | App BSC», marco
 * `SigninScreen/Default` (393 × 852).
 *
 * **La foto de fondo ya trae su velo.** `fondo-de-acceso.jpg` es la foto con la
 * capa oscura de Figma aplicada —negro al 45 % y un velo azul `#002465` del
 * 10 % arriba al 5 % abajo, medidos contra la referencia—. Es la misma imagen
 * que usan la pantalla de lanzamiento de iOS y Android y la de arranque, para
 * que el paso de una a otra no se note.
 *
 * **Figma solo dibuja el estado por defecto**: nadie recordado. Cuando el
 * teléfono sí recuerda a alguien se conserva el comportamiento de antes con los
 * mismos componentes: el botón principal entra con la biometría, el botón sin
 * superficie abre usuario y contraseña, y debajo se ofrece «Cambiar cuenta».
 *
 * El botón de biometría dice «Face ID» o «tu huella» según lo que el teléfono
 * tenga inscrito: en un Android sin reconocimiento facial fuerte, pedir «Face
 * ID» le pide al cliente algo que no puede hacer.
 *
 * **No hay acceso por PIN.** El banco decidió que la autenticación sea por
 * biometría y passkey.
 */

export interface LoginScreenProps {
  onLoginWithCredentials: (
    usuario: string,
    contrasena: string,
  ) => Promise<void>;
  onLoginWithBiometrics: () => Promise<void>;
  onOpenHelp?: () => void;
  onOpenExchangeRates?: () => void;
  onOpenServicePoints?: () => void;
  onForgetUser?: () => Promise<void>;
  onRegister?: () => void;
  /** Fecha del último acceso, tal como la guardó la sesión anterior. */
  ultimoAcceso?: string | undefined;
}

export function LoginScreen({
  onLoginWithCredentials,
  onLoginWithBiometrics,
  onOpenHelp,
  onOpenExchangeRates,
  onOpenServicePoints,
  onForgetUser,
  onRegister,
  ultimoAcceso,
}: LoginScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('auth');

  const estado = useAuthStore(s => s.estado);
  const error = useAuthStore(s => s.error);
  const nombreRecordado = useAuthStore(s => s.nombreRecordado);
  const tieneRostro = useAuthStore(s => s.tieneRostro);
  const biometriaDisponible = useAuthStore(s => s.biometriaDisponible);
  const limpiarError = useAuthStore(s => s.limpiarError);

  const [hojaAbierta, setHojaAbierta] = useState(false);

  const cargando = estado === 'autenticando';
  const conocido = nombreRecordado !== null && nombreRecordado !== '';
  const primerNombre = conocido
    ? (nombreRecordado ?? '').split(' ')[0] ?? ''
    : '';
  const conBiometria = conocido && biometriaDisponible;

  const abrirCredenciales = useCallback(() => {
    limpiarError();
    setHojaAbierta(true);
  }, [limpiarError]);

  return (
    <View style={styles.fondo} testID="login">
      <Image source={fondoDeAcceso} resizeMode="cover" style={styles.foto} />
      <View
        style={[
          styles.contenedor,
          {
            paddingTop: insets.top + MEDIDAS.logoBajoLaBarra,
            paddingBottom: insets.bottom + MEDIDAS.accionesSobreElBorde,
          },
        ]}
      >
        <View style={styles.logo}>
          <BscLogo height={MEDIDAS.altoDelLogo} />
        </View>

        <View style={styles.espacioSuperior} />

        {/* ─── Bienvenida ─────────────────────────────────────────────── */}
        <Text style={styles.titulo} accessibilityRole="header">
          {t('login.title')}
        </Text>
        <Text style={styles.lema}>{t('login.tagline')}</Text>
        {conocido && ultimoAcceso !== undefined ? (
          <Text style={styles.ultimoAcceso}>
            {t('login.lastAccess', { date: ultimoAcceso })}
          </Text>
        ) : null}

        {/* ─── Acciones ───────────────────────────────────────────────── */}
        <View style={styles.acciones}>
          {error !== null && !hojaAbierta ? (
            <Text style={styles.error} testID="login-error">
              {error}
            </Text>
          ) : null}

          {conBiometria ? (
            <BscPrimaryButton
              size="lg"
              label={tieneRostro ? t('login.signInWithFaceId') : t('login.signInWithFingerprint')}
              leading={
                <BscIcon
                  name={tieneRostro ? 'face' : 'fingerprint'}
                  size={20}
                  color={BscColors.textOnPrimary}
                />
              }
              loading={cargando}
              onPress={onLoginWithBiometrics}
              testID="login-biometrico"
            />
          ) : (
            <BscPrimaryButton
              size="lg"
              label={t('login.signIn')}
              loading={cargando}
              onPress={abrirCredenciales}
              testID="login-credenciales"
            />
          )}

          <View style={styles.entreBotones} />

          {conBiometria ? (
            <BscTextButton
              size="md"
              label={t('login.useCredentials')}
              color={BscColors.textOnDark}
              disabled={cargando}
              onPress={abrirCredenciales}
              testID="login-credenciales"
            />
          ) : conocido ? null : (
            <BscTextButton
              size="md"
              label={t('login.register')}
              color={BscColors.textOnDark}
              onPress={onRegister}
              testID="login-registro"
            />
          )}

          {conocido ? (
            <BscTextButton
              size="md"
              label={t('login.switchAccount', { name: primerNombre })}
              color={BscColors.textOnDark}
              disabled={cargando}
              onPress={() => {
                void onForgetUser?.();
              }}
              testID="login-olvidar"
            />
          ) : null}
        </View>

        <View style={styles.espacioInferior} />

        {/* ─── Accesos sin sesión ─────────────────────────────────────── */}
        <View style={styles.filaDeAccesos}>
          <AccesoRapido
            icono={iconoTasaDeCambio}
            etiqueta={t('shortcuts.exchangeRates')}
            onPress={onOpenExchangeRates}
            testID="login-tasa-de-cambio"
          />
          <AccesoRapido
            icono={iconoPuntosDeAtencion}
            etiqueta={t('shortcuts.servicePoints')}
            onPress={onOpenServicePoints}
            testID="login-puntos-de-atencion"
          />
          <AccesoRapido
            icono={iconoAyuda}
            etiqueta={t('shortcuts.help')}
            onPress={onOpenHelp}
            testID="login-ayuda"
          />
        </View>
      </View>

      <HojaDeCredenciales
        visible={hojaAbierta}
        cargando={cargando}
        error={hojaAbierta ? error : null}
        onCerrar={() => setHojaAbierta(false)}
        onEnviar={onLoginWithCredentials}
      />
    </View>
  );
}

/**
 * Medidas del marco de Figma que no son de la escala de espaciado.
 *
 * Los dos huecos grandes —entre el logotipo y la bienvenida, y entre los
 * botones y los accesos— **no** son fijos: en Figma miden 234 y 115 sobre 852
 * de alto, y aquí se reparten en esa misma proporción (2 a 1) el espacio que
 * sobre en cada teléfono.
 */
const MEDIDAS = {
  /** Del borde inferior de la barra de estado al logotipo. */
  logoBajoLaBarra: 25,
  altoDelLogo: 64,
  /** De la bienvenida al botón principal. */
  bienvenidaABotones: 48,
  /** De los accesos al borde inferior seguro. */
  accionesSobreElBorde: 10,
  /** El cuadro de cada acceso: 60 × 60, radio 12, icono de 28. */
  cuadroDeAcceso: 60,
  iconoDeAcceso: 28,
} as const;

/**
 * Un acceso de la fila inferior (`QuickAction` en Figma).
 *
 * El cuadro es negro con un filo claro casi invisible: en Figma son dos
 * rellenos (`#E6E6E6` al 70 % y `#333333` al 30 %) que, sobre el fondo, se ven
 * como se reproducen aquí —medido contra la referencia—.
 */
function AccesoRapido({
  icono,
  etiqueta,
  onPress,
  testID,
}: {
  icono: ImageSourcePropType;
  etiqueta: string;
  onPress?: (() => void) | undefined;
  testID: string;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: onPress === undefined }}
      onPress={onPress}
      style={({ pressed }) => [styles.acceso, pressed && styles.accesoPresionado]}
      testID={testID}
    >
      <View style={styles.cuadroDeAcceso}>
        <Image source={icono} style={styles.iconoDeAcceso} />
      </View>
      <Text style={styles.etiquetaDeAcceso} numberOfLines={1}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

/**
 * Hoja de usuario y contraseña.
 *
 * Es una hoja y no una pantalla propia porque en el diseño de Flutter las
 * credenciales son una alternativa a la biometría, no un paso anterior. Sacarla
 * a otra pantalla haría parecer que hay dos flujos distintos.
 */
function HojaDeCredenciales({
  visible,
  cargando,
  error,
  onCerrar,
  onEnviar,
}: {
  visible: boolean;
  cargando: boolean;
  error: string | null;
  onCerrar: () => void;
  onEnviar: (usuario: string, contrasena: string) => Promise<void>;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('auth');
  const { height: altoDeLaVentana } = useWindowDimensions();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [tocado, setTocado] = useState(false);

  /**
   * Alto del teclado, medido directamente.
   *
   * `KeyboardAvoidingView` **no funciona aquí**, y conviene saber por qué: un
   * `Modal` transparente en Android crea su propia ventana, y esa ventana no
   * recibe los márgenes del teclado aunque el manifiesto declare
   * `adjustResize`. El resultado es que el teclado tapa la hoja entera y el
   * cliente escribe a ciegas — se vio probando en el Pixel; en el emulador y en
   * las pruebas automáticas no se manifiesta.
   */
  const [alturaTeclado, setAlturaTeclado] = useState(0);

  useEffect(() => {
    const alAbrir = Keyboard.addListener('keyboardDidShow', evento => {
      setAlturaTeclado(evento.endCoordinates.height);
    });
    const alCerrar = Keyboard.addListener('keyboardDidHide', () => {
      setAlturaTeclado(0);
    });

    return () => {
      alAbrir.remove();
      alCerrar.remove();
    };
  }, []);

  /**
   * Lo que el teclado tapa de verdad: lo que React Native reporta **más la
   * barra de navegación**, porque el modal se dibuja sobre la pantalla entera
   * y `keyboardDidShow` mide contra la ventana, que no la incluye. Medido en
   * el Pixel; el detalle está en `altoDeLaHoja.ts`.
   */
  const tapadoPorElTeclado = keyboardOverlap({
    reportedHeight: alturaTeclado,
    bottomInset: insets.bottom,
  });

  const altoMaximo = sheetMaxHeight({
    windowHeight: altoDeLaVentana,
    keyboardHeight: tapadoPorElTeclado,
  });

  const usuarioVacio = tocado && usuario.trim() === '';
  const contrasenaVacia = tocado && contrasena === '';
  const puedeEnviar = usuario.trim() !== '' && contrasena !== '' && !cargando;

  const enviar = useCallback(() => {
    setTocado(true);
    if (usuario.trim() === '' || contrasena === '') return;
    void onEnviar(usuario.trim(), contrasena);
  }, [usuario, contrasena, onEnviar]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCerrar}
    >
      <View style={styles.fondoModal}>
        <Pressable style={styles.zonaCierre} onPress={onCerrar} />

        <View style={{ paddingBottom: tapadoPorElTeclado }}>
          <View
            style={[
              styles.hoja,
              /*
                El tope de alto no puede ser un porcentaje de la pantalla: React
                Native no lo recorta con el espacio que le queda al padre, así
                que con el teclado abierto la hoja se salía por abajo y el botón
                «Entrar» quedaba fuera. Lo reportó el usuario desde el Pixel.
                Ver `altoDeLaHoja.ts`.
              */
              Number.isFinite(altoMaximo) ? { maxHeight: altoMaximo } : null,
              {
                paddingBottom:
                  BscSpacing.lg + (alturaTeclado > 0 ? 0 : insets.bottom),
              },
            ]}
          >
            <View style={styles.asa} />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.tituloHoja}>{t('credentials.title')}</Text>

              <BscTextField
                label={t('credentials.username.label')}
                value={usuario}
                onChangeText={setUsuario}
                placeholder={t('credentials.username.placeholder')}
                error={usuarioVacio ? t('credentials.username.required') : undefined}
                editable={!cargando}
                testID="campo-usuario"
              />

              <BscTextField
                label={t('credentials.password.label')}
                value={contrasena}
                onChangeText={setContrasena}
                placeholder={t('credentials.password.placeholder')}
                secure
                error={contrasenaVacia ? t('credentials.password.required') : undefined}
                editable={!cargando}
                onSubmitEditing={enviar}
                testID="campo-contrasena"
              />

              {error !== null ? (
                <Text style={styles.errorHoja} testID="hoja-error">
                  {error}
                </Text>
              ) : null}

              <BscPrimaryButton
                label={t('credentials.continue')}
                loading={cargando}
                onPress={puedeEnviar ? enviar : undefined}
                trailing={
                  <BscIcon
                    name="arrow-forward"
                    size={buttonTokens.iconTrailing}
                  />
                }
                testID="hoja-entrar"
              />

              {/*
                El aviso antifraude del original, que el porte no tenía.
                `login_screen.dart` lo pasa como `footnote` de su `BscSheet`; la
                hoja de acceso del porte está hecha a mano, así que se dibuja
                aquí con el mismo estilo que usa la hoja compartida.
              */}
              <Text style={styles.notaAlPie}>{t('credentials.fraudNotice')}</Text>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  notaAlPie: FOOTNOTE_TEXT_STYLE,
  fondo: {
    flex: 1,
    // Mientras la imagen se decodifica se ve este color, que es el promedio de
    // la foto con su velo: así no hay destello claro al abrir.
    backgroundColor: '#1A1718',
  },
  /**
   * La foto a pantalla completa. El ancho y el alto van explícitos porque una
   * imagen importada trae los suyos (393 × 852, los del archivo) y le ganan a
   * los desplazamientos de `absoluteFill`: sin esto, en un teléfono más grande
   * que el marco de Figma quedaba una franja sin foto a la derecha y abajo.
   */
  foto: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  contenedor: {
    flex: 1,
    paddingHorizontal: BscSpacing.gutter,
  },
  logo: {
    alignItems: 'center',
  },
  espacioSuperior: {
    flex: 2,
  },
  titulo: {
    ...BscTextStyles['Title L/48 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  lema: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  ultimoAcceso: {
    ...BscTextStyles['Caption/12 Regular'],
    color: withAlpha('#FFFFFF', 0.75),
    textAlign: 'center',
    marginTop: BscSpacing.xs,
  },
  acciones: {
    marginTop: MEDIDAS.bienvenidaABotones,
  },
  entreBotones: {
    height: BscSpacing.sm,
  },
  error: {
    ...BscTextStyles['Body S/14 Medium'],
    color: BscColors.onBrandNegative,
    textAlign: 'center',
    marginBottom: BscSpacing.sm,
  },
  espacioInferior: {
    flex: 1,
    minHeight: BscSpacing.xl,
  },
  filaDeAccesos: {
    flexDirection: 'row',
  },
  acceso: {
    flex: 1,
    alignItems: 'center',
    gap: BscSpacing.xxs,
  },
  accesoPresionado: {
    opacity: 0.7,
  },
  cuadroDeAcceso: {
    width: MEDIDAS.cuadroDeAcceso,
    height: MEDIDAS.cuadroDeAcceso,
    borderRadius: BscRadius.sm,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#E6E6E624',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoDeAcceso: {
    width: MEDIDAS.iconoDeAcceso,
    height: MEDIDAS.iconoDeAcceso,
  },
  etiquetaDeAcceso: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textOnDark,
    textAlign: 'center',
  },
  fondoModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: withAlpha('#0F2033', 0.45),
  },
  zonaCierre: {
    flex: 1,
  },
  // Sin `maxHeight` aquí: lo calcula `altoDeLaHoja.ts`, porque depende del
  // teclado. El 0,90 que había escrito a mano tampoco era el del original,
  // que usa 0,92.
  hoja: {
    backgroundColor: BscColors.surface,
    borderTopLeftRadius: BscRadius.sheet,
    borderTopRightRadius: BscRadius.sheet,
    paddingHorizontal: BscSpacing.lg,
    paddingTop: BscSpacing.sm,
  },
  asa: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: BscColors.border,
    marginBottom: BscSpacing.md,
  },
  tituloHoja: {
    ...BscTypography.headlineSmall,
    marginBottom: BscSpacing.md,
  },
  errorHoja: {
    ...BscTypography.bodyMedium,
    color: BscColors.error,
    marginBottom: BscSpacing.xs,
  },
});
