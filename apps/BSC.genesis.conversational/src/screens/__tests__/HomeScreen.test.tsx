import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import {HomeScreen} from '../HomeScreen';
import {AuthService, BiometricService} from '@services/index';

/**
 * `useTranslation` se mockea para no depender de la inicialización real de
 * i18next en el entorno de pruebas: devuelve la clave tal cual (con sus
 * valores de interpolación concatenados), suficiente para armar el árbol sin
 * reventar y para distinguir "Hola, {{name}}" de "home.title" en los tests.
 */
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

jest.mock('@react-native-vector-icons/feather', () => 'Icon');

/**
 * Los mocks se arman enteramente DENTRO del factory: `jest.mock` se hoistea
 * sobre cualquier `const` del archivo, así que una variable externa referida
 * desde el factory no está inicializada todavía cuando `@services/index` se
 * resuelve (lo dispara el propio `import {HomeScreen}` de arriba). Los tests
 * ajustan cada mock importando `AuthService`/`BiometricService` tal como los
 * ve `HomeScreen` y casteándolos a `jest.Mock`.
 */
jest.mock('@services/index', () => {
  class MockAuthApiError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }

  return {
    AuthApiError: MockAuthApiError,
    AuthService: {
      isPasskeySupported: jest.fn(() => false),
      isBiometricLoginEnabled: jest.fn().mockResolvedValue(false),
      getBiometricLoginUser: jest.fn().mockResolvedValue(null),
      getPasskeyRegisteredUser: jest.fn().mockResolvedValue(null),
      getRememberedFirstName: jest.fn().mockResolvedValue(null),
      login: jest.fn(),
      loginWithBiometrics: jest.fn(),
    },
    BiometricService: {
      checkAvailability: jest.fn().mockResolvedValue({available: false}),
    },
  };
});

jest.mock('@hooks/usePasskeyAuthentication', () => ({
  usePasskeyAuthentication: () => ({
    isAuthenticating: false,
    authenticateWithPasskey: jest.fn(),
  }),
}));

jest.mock('@hooks/useLoginPostAuthNavigation', () => ({
  useLoginPostAuthNavigation: () => ({
    proceedAfterLogin: jest.fn(),
  }),
}));

const mockIsPasskeySupported = AuthService.isPasskeySupported as jest.Mock;
const mockIsBiometricLoginEnabled = AuthService.isBiometricLoginEnabled as jest.Mock;
const mockGetBiometricLoginUser = AuthService.getBiometricLoginUser as jest.Mock;
const mockGetPasskeyRegisteredUser = AuthService.getPasskeyRegisteredUser as jest.Mock;
const mockGetRememberedFirstName = AuthService.getRememberedFirstName as jest.Mock;
const mockCheckAvailability = BiometricService.checkAvailability as jest.Mock;

/**
 * React 19 difiere el trabajo de render al scheduler nativo (vía
 * `setImmediate`), así que `TestRenderer.create` por sí solo no basta: hace
 * falta envolverlo en `act(async () => {...})` para que la rama diferida
 * (incluidos los `useEffect` que cargan los accesos guardados) termine de
 * correr antes de inspeccionar el árbol.
 */
async function renderizar(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<HomeScreen />);
  });
  return renderer;
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockIsPasskeySupported.mockReturnValue(false);
    mockIsBiometricLoginEnabled.mockResolvedValue(false);
    mockGetBiometricLoginUser.mockResolvedValue(null);
    mockGetPasskeyRegisteredUser.mockResolvedValue(null);
    mockGetRememberedFirstName.mockResolvedValue(null);
    mockCheckAvailability.mockResolvedValue({available: false});
  });

  it('arma la pantalla de inicio sin ningún acceso recordado', async () => {
    const renderer = await renderizar();
    const raiz = renderer.root;

    expect(raiz.findByProps({testID: 'inicio'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-credenciales'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-registro'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-recuperar-acceso'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-tasa-de-cambio'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-puntos-de-atencion'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-ayuda'})).toBeTruthy();
    expect(() => raiz.findByProps({testID: 'inicio-biometrico'})).toThrow();
    expect(() => raiz.findByProps({testID: 'inicio-passkey'})).toThrow();
  });

  it('abre la hoja de credenciales con el usuario vacío al presionar "Iniciar sesión"', async () => {
    const renderer = await renderizar();

    await act(async () => {
      renderer.root.findByProps({testID: 'inicio-credenciales'}).props.onPress();
    });

    expect(renderer.root.findByProps({testID: 'campo-usuario'}).props.value).toBe('');
    expect(renderer.root.findByProps({testID: 'campo-contrasena'})).toBeTruthy();
  });

  it('muestra Face ID y Passkey cuando hay un acceso biométrico y un passkey recordados', async () => {
    mockIsPasskeySupported.mockReturnValue(true);
    mockIsBiometricLoginEnabled.mockResolvedValue(true);
    mockGetBiometricLoginUser.mockResolvedValue('carlos@test.com');
    mockGetPasskeyRegisteredUser.mockResolvedValue('carlos@test.com');
    mockGetRememberedFirstName.mockResolvedValue('Carlos');
    mockCheckAvailability.mockResolvedValue({available: true, biometryType: 'FaceID'});

    const renderer = await renderizar();
    const raiz = renderer.root;

    expect(raiz.findByProps({testID: 'inicio-biometrico'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-passkey'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-credenciales'})).toBeTruthy();
    expect(raiz.findByProps({testID: 'inicio-olvidar'})).toBeTruthy();
    expect(() => raiz.findByProps({testID: 'inicio-registro'})).toThrow();
  });

  it('abre la hoja de credenciales con el correo recordado prellenado', async () => {
    mockIsBiometricLoginEnabled.mockResolvedValue(true);
    mockGetBiometricLoginUser.mockResolvedValue('carlos@test.com');

    const renderer = await renderizar();

    await act(async () => {
      renderer.root.findByProps({testID: 'inicio-credenciales'}).props.onPress();
    });

    expect(renderer.root.findByProps({testID: 'campo-usuario'}).props.value).toBe(
      'carlos@test.com',
    );
  });
});
