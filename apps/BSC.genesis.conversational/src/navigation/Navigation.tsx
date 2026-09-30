import React, {useEffect, useRef} from 'react';
import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
  ChatScreen,
  LoginScreen,
  ProductsScreen,
  ProfileScreen,
  TransactionsScreen,
  ChooseDocumentScreen,
  CustomerDataConfirmOtpScreen,
  CompletedValidationScreen,
  SignDocumentScreen,
  CreateUserOnboardingScreen,
  ConfigureAuthBiometricScreen,
  ConfigureAuthPasskeyScreen,
  RegisterSecureDeviceScreen,
  ProofOfLifeScreen,
  WelcomeOnboardingScreen,
  AccessRecoveryOptionsScreen,
} from '@screens/index';
import {RootStackParamList} from '@/types/index';
import {useAuthStore} from '@store/auth.store';
import {AuthService} from '@services/index';
import {AccountIdentificationScreen} from '@screens/access-recovery/AccountIdentificationScreen';
import {ResetPasswordScreen} from '@screens/access-recovery/ResetPasswordScreen';
import {FacialVerificationScreen} from '@screens/access-recovery/FacialVerificationScreen';
import {UsernameRecoveryScreen} from '@screens/access-recovery/UsernameRecoveryScreen';
import {ConfirmOtpScreen} from '@screens/access-recovery/ConfirmOtpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Ref del navigator expuesto fuera de React para poder resetear el stack de navegación desde el
 * efecto de logout de este mismo componente (ver `useEffect` en `Navigation`).
 */
const navigationRef = createNavigationContainerRef<RootStackParamList>();

type ScreenConfig = {
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
  options?: NativeStackNavigationOptions;
};

const ONBOARDING_SCREEN_OPTIONS: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
};

/**
 * Rutas públicas: no requieren sesión activa. Incluye el login y todo el flujo de onboarding
 * (registro de un cliente nuevo), que se recorre antes de que exista una sesión autenticada.
 * Para agregar una ruta pública nueva, basta con sumarla a este arreglo.
 */
const PUBLIC_SCREENS: ScreenConfig[] = [
  {name: 'ChooseDocument', component: ChooseDocumentScreen, options: ONBOARDING_SCREEN_OPTIONS},
  {
    name: 'CustomerDataConfirmOtp',
    component: CustomerDataConfirmOtpScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'CompletedValidation',
    component: CompletedValidationScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {name: 'SignDocument', component: SignDocumentScreen, options: ONBOARDING_SCREEN_OPTIONS},
  {
    name: 'CreateUserOnboarding',
    component: CreateUserOnboardingScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'ConfigurePasskey',
    component: ConfigureAuthPasskeyScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'ConfigureAuthBiometric',
    component: ConfigureAuthBiometricScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'RegisterSecureDevice',
    component: RegisterSecureDeviceScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'ProofOfLife',
    component: ProofOfLifeScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'WelcomeOnboarding',
    component: WelcomeOnboardingScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'AccessRecovery',
    component: AccessRecoveryOptionsScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'AccountIdentification',
    component: AccountIdentificationScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'ResetPassword',
    component: ResetPasswordScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'FacialVerification',
    component: FacialVerificationScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'UsernameRecovery',
    component: UsernameRecoveryScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
  {
    name: 'ConfirmOtp',
    component: ConfirmOtpScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
];

/**
 * Rutas protegidas: requieren sesión activa (`isAuthenticated`). Para agregar una pantalla
 * nueva que deba exigir login, basta con sumarla a este arreglo; no hace falta tocar el switch
 * de más abajo. `Profile` se declara aparte porque necesita recibir `onLogout` como prop.
 *
 * `ConfigureAuthBiometric` se registra también acá (además de en `PUBLIC_SCREENS`): el login con
 * contraseña marca la sesión como autenticada antes de ofrecer activar la biometría, así que esa
 * pantalla debe existir en ambos stacks para seguir siendo alcanzable justo después de un login.
 */
const PROTECTED_SCREENS: ScreenConfig[] = [
  {name: 'Chat', component: ChatScreen},
  {name: 'Transactions', component: TransactionsScreen},
  {name: 'Products', component: ProductsScreen},
  {
    name: 'ConfigureAuthBiometric',
    component: ConfigureAuthBiometricScreen,
    options: ONBOARDING_SCREEN_OPTIONS,
  },
];

export const Navigation: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // El stack de navegación es una sola instancia compartida entre rutas públicas y protegidas
  // (sus screens solo cambian según `isAuthenticated`, no se remonta). Por eso la navegación tras
  // un cambio de `isAuthenticated` se maneja acá, de forma imperativa e incondicional, en vez de
  // dejar que cada pantalla que dispara el cambio reaccione con su propio efecto: una pantalla
  // pública (ej. 'WelcomeOnboarding') puede quedar desmontada por el propio cambio de stack en el
  // mismo ciclo de render en que se dispara, así que su efecto nunca llega a ejecutarse. 'Navigation'
  // es el único componente que no se desmonta en esa transición, así que es el lugar confiable
  // para resolver el destino final.
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    if (navigationRef.isReady()) {
      // React Navigation ya resuelve su propio fallback -en el mismo render en que cambian las
      // screens del Stack.Navigator- cuando ninguna ruta del historial existe en la lista nueva
      // (recalcula el estado y cae en la primera screen registrada). Si ese fallback ya aterrizó
      // en el destino correcto, resetear igual acá de todos modos remonta la pantalla dos veces
      // en el mismo cambio de `isAuthenticated` (p. ej. dispara `WebSocketService.connect()` dos
      // veces seguidas para 'Chat', una cancelando a la otra). Por eso el reset explícito es un
      // fallback correctivo, no incondicional: solo actúa si el destino no es ya el esperado.
      const currentRoute = navigationRef.getCurrentRoute()?.name;

      if (wasAuthenticatedRef.current && !isAuthenticated) {
        // Logout: 'ConfigureAuthBiometric' -presente en ambos stacks- se mantiene enfocada al
        // perder la sesión en vez de volver a 'Login', así que se resetea explícitamente.
        if (currentRoute !== 'Login') {
          navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
        }
      } else if (!wasAuthenticatedRef.current && isAuthenticated) {
        // Login/registro completado: sea cual sea la pantalla pública que marcó la sesión como
        // autenticada, el destino siempre es 'Chat'.
        if (currentRoute !== 'Chat') {
          navigationRef.reset({index: 0, routes: [{name: 'Chat'}]});
        }
      }
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            {PUBLIC_SCREENS.map(({name, component, options}) => (
              <Stack.Screen key={name} name={name} component={component} options={options} />
            ))}
          </>
        ) : (
          <>
            {PROTECTED_SCREENS.map(({name, component, options}) => (
              <Stack.Screen key={name} name={name} component={component} options={options} />
            ))}
            <Stack.Screen name="Profile">
              {() => <ProfileScreen onLogout={() => AuthService.logout()} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
