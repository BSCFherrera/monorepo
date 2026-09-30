import CryptoJS from 'crypto-js';
import {AuthApiResponse, AuthTokens, LoginPayload, LogoutApiResponse} from '@/types/index';

const MOCK_DELAY_MS = 1200;
const MOCK_ACCESS_TOKEN_TTL_SECONDS = 900;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Credenciales de prueba para simular un login exitoso (no hay backend de autenticación todavía)
export const MOCK_LOGIN_CREDENTIALS = {
  email: 'desarrollo@test11.com',
  password: 'test1234',
};

// Credenciales de prueba para simular un login con usuario bloqueado
export const MOCK_BLOCKED_LOGIN_CREDENTIALS = {
  email: 'bloqueado@test.com',
  password: 'test1234',
};

const base64UrlEncode = (value: Record<string, unknown>): string =>
  CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]+$/, '');

/**
 * Arma un JWT "de mentira" (header.payload.firma) con un `exp` real, para que
 * `jwt-decode` pueda leer la expiración igual que con un access token del backend.
 */
const buildMockAccessToken = (): string => {
  const header = base64UrlEncode({alg: 'HS256', typ: 'JWT'});
  const payload = base64UrlEncode({
    sub: 'mock-user',
    exp: Math.floor(Date.now() / 1000) + MOCK_ACCESS_TOKEN_TTL_SECONDS,
  });

  return `${header}.${payload}.mock-signature`;
};

const buildMockTokens = (): AuthTokens => ({
  accessToken: buildMockAccessToken(),
  refreshToken: `mock-refresh-${Date.now()}`,
  tokenType: 'Bearer',
  deviceId: 'd8035dd1-1e2a-4339-9b17-f49cfc016b79',
  biometricLivenessRequired: false,
});

export const AUTH_MOCK = {
  login: async ({email, password}: LoginPayload): Promise<AuthApiResponse> => {
    await delay(MOCK_DELAY_MS);

    const isBlockedUser =
      email.trim().toLowerCase() === MOCK_BLOCKED_LOGIN_CREDENTIALS.email &&
      password.trim() === MOCK_BLOCKED_LOGIN_CREDENTIALS.password;

    if (isBlockedUser) {
      return {
        isSucceded: false,
        code: 'USER_BLOCKED',
        message: 'Cuenta bloqueada temporalmente.',
        data: null,
      };
    }

    const isValid =
      email.trim().toLowerCase() === MOCK_LOGIN_CREDENTIALS.email &&
      password.trim() === MOCK_LOGIN_CREDENTIALS.password;

    if (!isValid) {
      return {
        isSucceded: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        data: null,
      };
    }

    return {
      isSucceded: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful.',
      data: buildMockTokens(),
    };
  },

  refresh: async (refreshToken: string): Promise<AuthApiResponse> => {
    await delay(MOCK_DELAY_MS / 2);

    if (!refreshToken) {
      return {
        isSucceded: false,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token inválido o expirado.',
        data: null,
      };
    }

    return {
      isSucceded: true,
      code: 'TOKEN_REFRESHED',
      message: 'Token refreshed successful.',
      data: buildMockTokens(),
    };
  },

  logout: async (): Promise<LogoutApiResponse> => {
    await delay(MOCK_DELAY_MS / 2);

    return {
      isSucceded: true,
      code: 'LOGOUT_SUCCESS',
      message: 'Logged out successfully.',
      data: null,
    };
  },
};
