import { useAuthStore, mensajeDeError } from '../authStore';
import type { Usuario } from '../data/authContracts';

const USUARIO: Usuario = {
  customerCode: '80191',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  fullName: 'Ana Pérez',
};

describe('estado de sesión', () => {
  beforeEach(() => {
    useAuthStore.setState({
      estado: 'desconocido',
      usuario: null,
      error: null,
      nombreRecordado: null,
      tieneRostro: false,
      biometriaDisponible: false,
    });
  });

  it('arranca sin saber si hay sesión', () => {
    // «Desconocido» no es lo mismo que «sin sesión»: al abrir la app hay que
    // comprobar el almacenamiento antes de mandar a nadie al login.
    expect(useAuthStore.getState().estado).toBe('desconocido');
  });

  it('autenticar deja al usuario dentro y sin error', () => {
    useAuthStore.getState().comenzarAutenticacion();
    useAuthStore.getState().autenticar(USUARIO);

    const estado = useAuthStore.getState();
    expect(estado.estado).toBe('autenticado');
    expect(estado.usuario?.fullName).toBe('Ana Pérez');
    expect(estado.error).toBeNull();
  });

  it('un fallo vuelve a «sin sesión», no se queda autenticando', () => {
    // Si se quedara en «autenticando», el botón giraría para siempre.
    useAuthStore.getState().comenzarAutenticacion();
    useAuthStore.getState().fallar('Usuario o contraseña incorrectos.');

    expect(useAuthStore.getState().estado).toBe('sin-sesion');
    expect(useAuthStore.getState().error).toBe(
      'Usuario o contraseña incorrectos.',
    );
  });

  it('comenzar a autenticar limpia el error anterior', () => {
    useAuthStore.getState().fallar('algo salió mal');
    useAuthStore.getState().comenzarAutenticacion();

    expect(useAuthStore.getState().error).toBeNull();
  });

  it('cerrar sesión borra el usuario de memoria', () => {
    useAuthStore.getState().autenticar(USUARIO);
    useAuthStore.getState().cerrarSesion();

    const estado = useAuthStore.getState();
    expect(estado.estado).toBe('sin-sesion');
    expect(estado.usuario).toBeNull();
  });

  it('el nombre recordado sobrevive al cierre de sesión', () => {
    // Es lo que permite saludar por su nombre en la pantalla de acceso.
    useAuthStore.getState().establecerRecordado('Ana Pérez');
    useAuthStore.getState().autenticar(USUARIO);
    useAuthStore.getState().cerrarSesion();

    expect(useAuthStore.getState().nombreRecordado).toBe('Ana Pérez');
  });

  it('registra qué biometría tiene el teléfono', () => {
    useAuthStore.getState().establecerCapacidadBiometrica(true, false);

    const estado = useAuthStore.getState();
    expect(estado.biometriaDisponible).toBe(true);
    expect(estado.tieneRostro).toBe(false);
  });
});

describe('mensajes de error', () => {
  it('no distingue usuario inexistente de contraseña incorrecta', () => {
    // Distinguirlos permitiría averiguar qué usuarios existen en el banco.
    expect(mensajeDeError({ response: { status: 401 } })).toBe(
      'Usuario o contraseña incorrectos.',
    );
    expect(mensajeDeError({ response: { status: 403 } })).toBe(
      'Usuario o contraseña incorrectos.',
    );
  });

  it('un usuario bloqueado sí se dice, porque el cliente debe actuar', () => {
    expect(mensajeDeError({ response: { status: 423 } })).toMatch(/bloqueado/);
  });

  it('un fallo del servidor no culpa al cliente', () => {
    expect(mensajeDeError({ response: { status: 500 } })).toMatch(
      /no está disponible/,
    );
    expect(mensajeDeError({ response: { status: 503 } })).toMatch(
      /no está disponible/,
    );
  });

  it('distingue el tiempo agotado de la falta de red', () => {
    // Son dos cosas distintas para el cliente: una se resuelve esperando y la
    // otra revisando su conexión.
    expect(mensajeDeError({ code: 'ECONNABORTED' })).toMatch(/tardó demasiado/);
    expect(mensajeDeError({ code: 'ERR_NETWORK' })).toMatch(
      /conexión a internet/,
    );
  });

  it('nunca filtra el detalle técnico', () => {
    const mensaje = mensajeDeError(
      new Error('Request failed with status code 418'),
    );

    expect(mensaje).not.toMatch(/418|status code|Error:/);
    expect(mensaje).toBe(
      'No pudimos completar la operación. Intenta de nuevo.',
    );
  });

  it('tolera cualquier cosa como causa', () => {
    for (const causa of [null, undefined, 'texto', 42, {}]) {
      expect(typeof mensajeDeError(causa)).toBe('string');
    }
  });
});
