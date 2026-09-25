import type { AxiosInstance } from 'axios';

import { AuthRepository } from '../authRepository';
import type { SecureStorage } from '../../../../core/security/secureStorage';

/** Doble mínimo del almacenamiento: solo lo que el repositorio usa. */
function almacenFalso() {
  const datos = new Map<string, string>();

  return {
    datos,
    saveAccessToken: jest.fn(async (t: string) => {
      datos.set('acceso', t);
    }),
    saveRefreshToken: jest.fn(async (t: string) => {
      datos.set('refresco', t);
    }),
    saveTokenExpiry: jest.fn(async (t: string) => {
      datos.set('vence', t);
    }),
    saveLastUserName: jest.fn(async (t: string) => {
      datos.set('nombre', t);
    }),
    getLastUserName: jest.fn(async () => datos.get('nombre') ?? null),
    clearSession: jest.fn(async () => {
      datos.delete('acceso');
      datos.delete('refresco');
      datos.delete('vence');
    }),
  };
}

const RESPUESTA_LOGIN = {
  data: {
    AccessToken: 'acceso-1',
    RefreshToken: 'refresco-1',
    ExpiresAt: '2026-09-16T12:00:00Z',
    User: {
      CustomerCode: '80191',
      FirstName: 'Ana',
      LastName: 'Pérez',
      Email: 'ana@example.com',
    },
  },
};

function construir(respuestas: { post?: jest.Mock; get?: jest.Mock } = {}) {
  const almacen = almacenFalso();
  const http = {
    post: respuestas.post ?? jest.fn(async () => RESPUESTA_LOGIN),
    get: respuestas.get ?? jest.fn(async () => ({ data: {} })),
  } as unknown as AxiosInstance;

  return {
    almacen,
    http,
    repo: new AuthRepository(http, almacen as unknown as SecureStorage),
  };
}

describe('AuthRepository — inicio de sesión', () => {
  it('envía usuario, contraseña y canal', async () => {
    const { repo, http } = construir();

    await repo.login('ana', 'clave-de-ejemplo');

    expect(http.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      username: 'ana',
      password: 'clave-de-ejemplo',
      channel: '2',
    });
  });

  it('guarda el par de tokens y el vencimiento', async () => {
    const { repo, almacen } = construir();

    await repo.login('ana', 'clave-de-ejemplo');

    expect(almacen.saveAccessToken).toHaveBeenCalledWith('acceso-1');
    expect(almacen.saveRefreshToken).toHaveBeenCalledWith('refresco-1');
    expect(almacen.saveTokenExpiry).toHaveBeenCalledWith(
      '2026-09-16T12:00:00Z',
    );
  });

  it('recuerda el nombre para saludar en el próximo acceso', async () => {
    const { repo, almacen } = construir();

    await repo.login('ana', 'clave-de-ejemplo');

    expect(almacen.saveLastUserName).toHaveBeenCalledWith('Ana Pérez');
    expect(await repo.getRememberedUserName()).toBe('Ana Pérez');
  });

  it('una respuesta sin token de acceso no guarda nada', async () => {
    const { repo, almacen } = construir({
      post: jest.fn(async () => ({ data: { RefreshToken: 'x' } })),
    });

    await expect(repo.login('ana', 'mala')).rejects.toThrow(/token de acceso/);
    expect(almacen.saveAccessToken).not.toHaveBeenCalled();
  });

  it('propaga el fallo del servidor tal cual', async () => {
    const { repo } = construir({
      post: jest.fn(async () => {
        throw new Error('401 no autorizado');
      }),
    });

    await expect(repo.login('ana', 'mala')).rejects.toThrow(
      '401 no autorizado',
    );
  });
});

describe('AuthRepository — cierre de sesión', () => {
  it('avisa al servidor y limpia el estado local', async () => {
    const { repo, almacen, http } = construir();

    await repo.logout();

    expect(http.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    expect(almacen.clearSession).toHaveBeenCalled();
  });

  it('limpia el estado local aunque el servidor falle', async () => {
    // Si no lo hiciera, el cliente creería haber salido sin haber salido. El
    // servidor invalidará el token por su cuenta al vencer.
    const { repo, almacen } = construir({
      post: jest.fn(async () => {
        throw new Error('sin red');
      }),
    });

    await expect(repo.logout()).resolves.toBeUndefined();
    expect(almacen.clearSession).toHaveBeenCalled();
  });

  it('el cierre en todos los dispositivos se comporta igual', async () => {
    const { repo, almacen, http } = construir();

    await repo.logoutAll();

    expect(http.post).toHaveBeenCalledWith('/api/v1/auth/logout-all');
    expect(almacen.clearSession).toHaveBeenCalled();
  });
});

describe('AuthRepository — usuario actual', () => {
  it('relee el usuario desde el servidor', async () => {
    const { repo, http } = construir({
      get: jest.fn(async () => ({
        data: {
          CustomerCode: '80191',
          FirstName: 'Ana',
          LastName: 'Pérez',
          Email: 'a@b.do',
        },
      })),
    });

    const usuario = await repo.getCurrentUser();

    expect(http.get).toHaveBeenCalledWith('/api/v1/auth/me');
    expect(usuario.fullName).toBe('Ana Pérez');
  });
});
