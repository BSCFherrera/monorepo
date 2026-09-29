import CryptoJS from 'crypto-js';
import {
  PasskeyAuthenticationCompleteApiResponse,
  PasskeyAuthenticationCompleteRequest,
  PasskeyAuthenticationOptionsApiResponse,
  PasskeyAuthenticationOptionsRequest,
  PasskeyRegistrationCompleteApiResponse,
  PasskeyRegistrationCompleteRequest,
  PasskeyRegistrationOptionsApiResponse,
  PasskeyRegistrationOptionsRequest,
} from '@/types/index';

const MOCK_DELAY_MS = 800;
const MOCK_ACCESS_TOKEN_TTL_SECONDS = 900;

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const randomBase64Url = (byteLength: number): string =>
  CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(byteLength))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]+$/, '');

const base64UrlEncode = (value: Record<string, unknown>): string =>
  CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]+$/, '');

/**
 * Arma un JWT "de mentira" con un `exp` real (mismo criterio que `auth.mock.ts`), para que
 * `AuthService.persistTokens`/`isAccessTokenExpired` puedan decodificarlo sin lanzar.
 */
const buildMockAccessToken = (email: string): string => {
  const header = base64UrlEncode({alg: 'HS256', typ: 'JWT'});
  const payload = base64UrlEncode({
    sub: email,
    full_name: email.split('@')[0] || email,
    exp: Math.floor(Date.now() / 1000) + MOCK_ACCESS_TOKEN_TTL_SECONDS,
  });

  return `${header}.${payload}.mock-signature`;
};

export const FIDO2_MOCK = {
  getRegisterOptions: async ({
    email,
  }: PasskeyRegistrationOptionsRequest): Promise<PasskeyRegistrationOptionsApiResponse> => {
    await delay(MOCK_DELAY_MS);

    const username = email.split('@')[0] || email;

    return {
      isSucceded: true,
      code: 'FIDO2_OPTIONS_GENERATED',
      message: 'Passkey registration options generated successfully.',
      data: {
        rp: {
          id: 'https://bsc.com.do',
          name: 'User Authentication Service',
        },
        user: {
          name: username,
          id: randomBase64Url(16),
          displayName: username,
        },
        challenge: randomBase64Url(16),
        pubKeyCredParams: [
          {type: 'public-key', alg: -8},
          {type: 'public-key', alg: -7},
          {type: 'public-key', alg: -257},
          {type: 'public-key', alg: -37},
          {type: 'public-key', alg: -35},
          {type: 'public-key', alg: -258},
          {type: 'public-key', alg: -38},
          {type: 'public-key', alg: -36},
          {type: 'public-key', alg: -259},
          {type: 'public-key', alg: -39},
        ],
        timeout: 60000,
        attestation: 'none',
        attestationFormats: [],
        authenticatorSelection: {
          residentKey: 'preferred',
          requireResidentKey: false,
          userVerification: 'required',
        },
        hints: [],
        excludeCredentials: [],
      },
    };
  },

  completeRegistration: async ({
    attestationResponse,
  }: PasskeyRegistrationCompleteRequest): Promise<PasskeyRegistrationCompleteApiResponse> => {
    await delay(MOCK_DELAY_MS);

    return {
      isSucceded: true,
      code: 'PASSKEY_REGISTERED',
      message: 'Passkey registered successfully.',
      data: {
        credentialId: attestationResponse?.id || randomBase64Url(32),
      },
    };
  },

  getAuthenticateOptions: async ({
    email: _email,
  }: PasskeyAuthenticationOptionsRequest): Promise<PasskeyAuthenticationOptionsApiResponse> => {
    await delay(MOCK_DELAY_MS);

    return {
      isSucceded: true,
      code: 'FIDO2_ASSERTION_OPTIONS_GENERATED',
      message: 'Passkey authentication options generated successfully.',
      data: {
        challenge: randomBase64Url(16),
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials: [{type: 'public-key', id: randomBase64Url(32)}],
        userVerification: 'required',
      },
    };
  },

  completeAuthentication: async ({
    email,
  }: PasskeyAuthenticationCompleteRequest): Promise<PasskeyAuthenticationCompleteApiResponse> => {
    await delay(MOCK_DELAY_MS);

    return {
      isSucceded: true,
      code: 'FIDO2_AUTHENTICATION_SUCCESS',
      message: 'Passkey authentication successful.',
      data: {
        accessToken: buildMockAccessToken(email),
        refreshToken: `mock-refresh-${Date.now()}`,
        tokenType: 'Bearer',
        deviceId: 'd8035dd1-1e2a-4339-9b17-f49cfc016b79',
        biometricLivenessRequired: true,
      },
    };
  },
};
