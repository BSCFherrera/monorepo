import {request} from './client';

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<RegisterResponse>('/auth/register', {method: 'POST', body: payload}),

  login: (payload: LoginPayload) =>
    request<TokenResponse>('/auth/login', {method: 'POST', body: payload}),

  getUsers: (token: string) =>
    request<User[]>('/auth/users', {token}),
};
