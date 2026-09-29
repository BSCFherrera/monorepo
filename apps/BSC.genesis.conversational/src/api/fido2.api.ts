import {request} from './client';
import type {TokenResponse} from './auth.api';

export interface Fido2RegisterOptionsPayload {
  email: string;
}

export interface Fido2RegisterCompletePayload {
  email: string;
  attestationResponse: unknown;
}

export interface Fido2RegisterCompleteResponse {
  credentialId: string;
}

export interface Fido2AuthOptionsPayload {
  email: string;
}

export interface Fido2AssertionPayload {
  email: string;
  assertionResponse: unknown;
}

export const fido2Api = {
  getRegisterOptions: (payload: Fido2RegisterOptionsPayload) =>
    request<any>('/fido2/register/options', {
      method: 'POST',
      body: payload,
    }),

  completeRegistration: (payload: Fido2RegisterCompletePayload) =>
    request<Fido2RegisterCompleteResponse>('/fido2/register/complete', {
      method: 'POST',
      body: payload,
    }),

  getAuthOptions: (payload: Fido2AuthOptionsPayload) =>
    request<any>('/fido2/authenticate/options', {
      method: 'POST',
      body: payload,
    }),

  authenticate: (payload: Fido2AssertionPayload) =>
    request<TokenResponse>('/oauth/token', {
      method: 'POST',
      body: payload,
    }),
};
