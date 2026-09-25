import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { restaurarIdioma, t } from '@bsc/i18n';
import { marcaDeUltimoAcceso } from '@bsc/shared';

import NativeBiometric from '../specs/NativeBiometric';
import { aplicarPoliticaDelBanco } from '../core/security/politicaDeSesion';
import { LoginScreen } from '../features/auth/ui/LoginScreen';
import { mensajeDeError, useAuthStore } from '../features/auth/authStore';
import {
  activarEntradaPorBiometria,
  mensajeDeRechazo,
  MotivoDeRechazo,
  puedeEntrarConBiometria,
} from '../features/auth/domain/entradaPorBiometria';

import { almacenDeIdioma } from '../i18n';

import { AppServicesProvider, type AppServices } from './AppContext';
import { HojaDeAvisoDeSesion } from './HojaDeAvisoDeSesion';
import { PantallaDeArranque } from './PantallaDeArranque';
import { appConfig } from './config';
import { createContainer, type Container } from './container';
import { RootNavigator } from './navigation/RootNavigator';

/**
 * Borra de memoria todo lo que describe al cliente que se va.
 *
 * Sin esto, quien entrara después en el mismo teléfono vería durante unos
 * segundos el nombre, el correo y los beneficiarios del anterior. Nada de eso
 * toca disco —los tokens sí, y de eso se ocupa `clearSession`—, pero la
 * aplicación puede seguir viva entre una sesión y la siguiente.
 */
function olvidarCachesDeCliente(contenedor: Container): void {
  contenedor.customer.limpiar();
  contenedor.beneficiaries.limpiar();
}

/**
 * Da la sesión por iniciada.
 *
 * Además de arrancar el temporizador de inactividad **pide la política al
 * banco**, que es el `_loadPolicy()` de `session_guard.dart`. El porte no lo
 * hacía: tenía `applyPolicy` y nadie lo llamaba, así que usaba siempre los diez
 * minutos por defecto aunque seguridad configurara otra cosa.
 *
 * La llamada **no se espera a propósito**. Exige token, así que va después de
 * marcar la sesión, y si falla la aplicación se queda con sus valores por
 * defecto y el cliente entra igual: hacerle esperar por un número de
 * configuración sería cobrarle un viaje de red por algo que no va a notar.
 */
function darSesionPorIniciada(contenedor: Container): void {
  contenedor.session.markAuthenticated();
  void aplicarPoliticaDelBanco(contenedor.sessionPolicy, contenedor.session);
}

/**
 * Raíz de la aplicación: decide qué se ve según el estado de la sesión.
 *
 * Cumple el papel de la guarda `_authGuard` de `routes.dart`: sin sesión, la
 * única pantalla alcanzable es el acceso; con sesión, el acceso no es
 * alcanzable. La diferencia es que aquí la guarda es estructural —las pantallas
 * protegidas ni siquiera se montan— en vez de una redirección, que es más
 * difícil de saltarse por accidente.
 *
 * La navegación de la app autenticada vive en `RootNavigator`; aquí solo se
 * decide entre acceso y aplicación. Esa separación es la que hace que la
 * guarda no se pueda saltar desde dentro del navegador.
 */
export function AppRoot(): React.JSX.Element {
  const estado = useAuthStore(s => s.estado);
  const comenzarAutenticacion = useAuthStore(s => s.comenzarAutenticacion);
  const autenticar = useAuthStore(s => s.autenticar);
  const fallar = useAuthStore(s => s.fallar);
  const cerrarSesionEnEstado = useAuthStore(s => s.cerrarSesion);
  const establecerRecordado = useAuthStore(s => s.establecerRecordado);

  /*
    «Último acceso: hoy, 3:44 p.m.» y la versión al pie, que son los dos
    detalles de la pantalla de entrada que faltaban de la oleada 1. El texto de
    la marca se guarda ya formateado, como en el original: solo existe para
    enseñarlo, no se compara ni se ordena.
  */
  const [ultimoAcceso, setUltimoAcceso] = useState<string | null>(null);
  const establecerCapacidad = useAuthStore(
    s => s.establecerCapacidadBiometrica,
  );

  const [listo, setListo] = useState(false);

  /**
   * El aviso de que la sesión está por cerrarse.
   *
   * `SessionManager` ya lo anunciaba con `onWarning` y **nadie escuchaba**, así
   * que la sesión se bloqueaba de golpe. Los milisegundos se congelan al
   * aparecer el aviso: la hoja los va descontando por su cuenta y no hace falta
   * volver a preguntarle al gestor cada segundo.
   */
  const [avisoDeSesion, setAvisoDeSesion] = useState<number | null>(null);

  /**
   * El contenedor se construye una sola vez. Reconstruirlo crearía un gestor de
   * sesión nuevo con temporizadores propios mientras el anterior sigue vivo.
   */
  const contenedorRef = useRef<Container | null>(null);
  if (contenedorRef.current === null) {
    contenedorRef.current = createContainer({
      baseURL: appConfig.baseURL,
      /*
        Un refresco que el servidor rechaza termina la sesión igual que una
        inactividad, y por el mismo camino: el original conecta las dos al mismo
        `_endSession`. Se limpia en local y no se avisa al servidor, que es
        quien acaba de rechazar el token.
      */
      onSessionExpired: () => {
        void contenedorRef.current?.session.clearSession();
        cerrarSesionEnEstado();
      },
    });
  }
  const contenedor = contenedorRef.current;

  // ─── Arranque ───────────────────────────────────────────────────────────

  useEffect(() => {
    let vigente = true;

    const preparar = async (): Promise<void> => {
      const [recordado, acceso, disponible, rostro] =
        await Promise.all([
          contenedor.auth.getRememberedUserName(),
          contenedor.storage.getLastAccess(),
          NativeBiometric.isAvailable().catch(() => false),
          NativeBiometric.hasFaceUnlock().catch(() => false),
          // El idioma que eligió el cliente, antes de enseñar la primera
          // pantalla. Nunca falla: sin preferencia legible queda el español.
          restaurarIdioma(almacenDeIdioma),
        ]);

      if (!vigente) return;

      establecerRecordado(recordado);
      setUltimoAcceso(acceso);
      establecerCapacidad(disponible, rostro);

      // Hay token guardado, pero eso no basta: puede estar vencido. Se
      // comprueba contra el servidor antes de dar la sesión por buena, porque
      // mostrar un dashboard que falla en cada llamada es peor que pedir
      // credenciales.
      const token = await contenedor.storage.getAccessToken();
      if (token !== null && token !== '') {
        try {
          const usuario = await contenedor.auth.getCurrentUser();
          if (vigente) {
            autenticar(usuario);
            darSesionPorIniciada(contenedor);
          }
        } catch {
          if (vigente) cerrarSesionEnEstado();
        }
      } else if (vigente) {
        cerrarSesionEnEstado();
      }

      if (vigente) setListo(true);
    };

    void preparar();

    return () => {
      vigente = false;
    };
  }, [
    contenedor,
    autenticar,
    cerrarSesionEnEstado,
    establecerRecordado,
    establecerCapacidad,
  ]);

  // ─── Sesión: inactividad y segundo plano ────────────────────────────────

  useEffect(() => {
    contenedor.session.initialize({
      onWarning: () => {
        setAvisoDeSesion(contenedor.session.timeRemainingMs);
      },
      /*
        Cualquier toque rescata la sesión, y con ella se retira el aviso: es lo
        que hace `recordActivity`, y el original se comporta igual.
      */
      onWarningResolved: () => {
        setAvisoDeSesion(null);
      },
      onSessionExpired: () => {
        /*
          **Sin avisar al servidor.** Una sesión que caduca por inactividad no
          es un cierre de sesión: el cliente no pidió salir, dejó el teléfono.
          `auth.logout()` hace `POST /auth/logout`, que invalida el token de
          refresco en la base de datos del backend, y con él la única forma de
          volver a entrar con la huella. El original tampoco la hace: dispara
          `SessionExpired`, que solo limpia en local. Ver `finDeSesion.ts`.
        */
        setAvisoDeSesion(null);
        void contenedor.session.lockSession();
        cerrarSesionEnEstado();
      },
    });

    const suscripcion = AppState.addEventListener('change', siguiente => {
      // `AppState` de React Native no tiene los mismos estados que el ciclo de
      // vida de Flutter; la traducción se hace aquí, en el borde.
      contenedor.session.handleAppStateChange(
        siguiente === 'active'
          ? 'active'
          : siguiente === 'inactive'
          ? 'inactive'
          : 'background',
      );
    });

    return () => {
      suscripcion.remove();
      contenedor.session.dispose();
    };
  }, [contenedor, cerrarSesionEnEstado]);

  // ─── Acciones ───────────────────────────────────────────────────────────

  /**
   * «Cambiar cuenta»: deja de saludar por su nombre a quien ya no es el dueño
   * del teléfono.
   *
   * Borra el nombre **y la marca de acceso**. Dejar la marca enseñaría «Último
   * acceso: hoy, 3:44 p.m.» junto a un saludo genérico, que no significa nada.
   */
  const olvidarUsuario = useCallback(async (): Promise<void> => {
    await contenedor.storage.clearLastUser();
    establecerRecordado(null);
    setUltimoAcceso(null);
  }, [contenedor, establecerRecordado]);

  const entrarConCredenciales = useCallback(
    async (usuario: string, contrasena: string): Promise<void> => {
      comenzarAutenticacion();
      try {
        const resultado = await contenedor.auth.login(usuario, contrasena);
        autenticar(resultado.user);
        darSesionPorIniciada(contenedor);
        establecerRecordado(resultado.user.fullName);

        /*
          El nombre y la marca de acceso se guardan **después** de que el
          servidor aceptó las credenciales, nunca antes: escribirlos al intentar
          haría que la pantalla saludara por su nombre a quien falló la
          contraseña, que es exactamente la pista que no hay que dar.
        */
        const marca = marcaDeUltimoAcceso(new Date());
        await contenedor.storage.saveLastUserName(resultado.user.fullName);
        await contenedor.storage.saveLastAccess(marca);
        setUltimoAcceso(marca);

        /*
          Y aquí se deja lista la entrada por huella para la próxima vez.

          Esta llamada **faltaba en las dos aplicaciones**: `setBiometricEnabled`
          está declarada en el almacén seguro del porte y en
          `secure_storage.dart` del original, y nadie la invocaba nunca. Con la
          bandera siempre en falso, la pantalla de acceso llevaba desde el
          principio ofreciendo un botón que no podía funcionar.

          No se propaga el fallo: que no se pueda anotar la preferencia no es
          motivo para deshacer un inicio de sesión que el banco ya aceptó.
        */
        try {
          await activarEntradaPorBiometria(contenedor.storage, () =>
            NativeBiometric.isAvailable(),
          );
        } catch {
          // La próxima entrada pedirá usuario y contraseña, que es el camino
          // que el cliente acaba de recorrer.
        }
      } catch (causa) {
        fallar(mensajeDeError(causa));
      }
    },
    [
      contenedor,
      comenzarAutenticacion,
      autenticar,
      fallar,
      establecerRecordado,
    ],
  );

  /**
   * Entrada por biometría.
   *
   * ⚠️ **Verifica identidad pero no obtiene credenciales nuevas.** Solo puede
   * reanudar la sesión que ya había; si esa sesión no se puede reanudar, no
   * queda más que pedir usuario y contraseña. El original tiene el mismo
   * límite, y resolverlo de verdad exige un mecanismo del lado del servidor
   * —passkey, justamente— que el backend hoy no expone.
   *
   * **Lo que sí estaba mal era qué token se miraba.** El porte comprobaba el
   * de acceso, que vive minutos, así que la entrada por huella fallaba casi
   * siempre con «Tu sesión expiró» aunque el banco siguiera reconociendo al
   * cliente — y no se notaba en el navegador ni recién iniciada la sesión, que
   * es donde se probaba. El que decide es el **de refresco**, como en
   * `biometric_login_usecase.dart`; con él, el interceptor renueva el de
   * acceso en la primera petición. Ver `entradaPorBiometria.ts`.
   */
  const entrarConBiometria = useCallback(async (): Promise<void> => {
    comenzarAutenticacion();

    try {
      /*
        Se pregunta **antes** de pedir la huella. Al revés, el cliente pone el
        dedo para que le digan que no puede entrar, y además parece que la
        huella falló cuando lo que falta es la sesión.
      */
      const permiso = await puedeEntrarConBiometria(contenedor.storage);
      if (!permiso.puedeEntrar) {
        fallar(
          mensajeDeRechazo(permiso.motivo ?? MotivoDeRechazo.SesionExpirada),
        );
        return;
      }

      const verificado = await NativeBiometric.authenticate(
        t('auth:biometrics.reason'),
        t('common:biometria.titulo'),
        t('common:biometria.cancelar'),
      );

      if (!verificado) {
        fallar(t('auth:biometrics.notCompleted'));
        return;
      }

      const usuario = await contenedor.auth.getCurrentUser();
      autenticar(usuario);
      darSesionPorIniciada(contenedor);
    } catch (causa) {
      fallar(mensajeDeError(causa));
    }
  }, [contenedor, comenzarAutenticacion, autenticar, fallar]);

  const cerrarSesion = useCallback(async (): Promise<void> => {
    await contenedor.auth.logout();
    await contenedor.session.clearSession();
    // Sin esto, el siguiente cliente que entrara en el mismo teléfono vería el
    // nombre y el correo del anterior mientras su propio perfil carga.
    olvidarCachesDeCliente(contenedor);
    cerrarSesionEnEstado();
  }, [contenedor, cerrarSesionEnEstado]);

  const cerrarTodasLasSesiones = useCallback(async (): Promise<void> => {
    await contenedor.auth.logoutAll();
    await contenedor.session.clearSession();
    olvidarCachesDeCliente(contenedor);
    cerrarSesionEnEstado();
  }, [contenedor, cerrarSesionEnEstado]);

  const registrarActividad = useCallback(() => {
    contenedor.session.recordActivity();
  }, [contenedor]);

  /**
   * Dependencias que las pantallas reciben por contexto.
   *
   * Se memoiza porque su identidad viaja por el árbol de navegación: si
   * cambiara en cada render, todas las pantallas montadas se volverían a
   * dibujar en cada latido del temporizador de sesión.
   */
  const servicios: AppServices = useMemo(
    () => ({
      contenedor,
      cerrarSesion,
      cerrarTodasLasSesiones,
      registrarActividad,
    }),
    [contenedor, cerrarSesion, cerrarTodasLasSesiones, registrarActividad],
  );

  // ─── Render ─────────────────────────────────────────────────────────────

  if (!listo || estado === 'desconocido') {
    return <PantallaDeArranque />;
  }

  if (estado === 'autenticado') {
    return (
      <AppServicesProvider servicios={servicios}>
        <RootNavigator />
        <HojaDeAvisoDeSesion
          visible={avisoDeSesion !== null}
          msRestantes={avisoDeSesion ?? 0}
          onSeguir={() => {
            contenedor.session.extend();
            setAvisoDeSesion(null);
          }}
          onCerrar={() => setAvisoDeSesion(null)}
        />
      </AppServicesProvider>
    );
  }

  return (
    <LoginScreen
      onLoginWithCredentials={entrarConCredenciales}
      onLoginWithBiometrics={entrarConBiometria}
      ultimoAcceso={ultimoAcceso ?? undefined}
      onForgetUser={olvidarUsuario}
    />
  );
}
