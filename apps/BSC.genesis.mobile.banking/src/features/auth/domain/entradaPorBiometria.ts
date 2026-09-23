import { t } from '@bsc/i18n';

import type { SecureStorage } from '../../../core/security/secureStorage';

/**
 * Si la entrada por biometría puede seguir adelante.
 *
 * **Esto no es un detalle interno: decide si el cliente puede entrar.** La
 * biometría verifica *quién* es, pero no obtiene credenciales nuevas del
 * banco; lo único que puede hacer es reanudar la sesión que ya había. La
 * pregunta, entonces, es **qué token hace falta que siga guardado**, y ahí el
 * porte se equivocaba de token.
 *
 * Miraba el **token de acceso**, que vive minutos: en cuanto caducaba —es
 * decir, casi siempre— la pantalla respondía «Tu sesión expiró» aunque el
 * banco todavía reconociera al cliente. El resultado es el que el usuario
 * describió: *nunca* se entra con la huella.
 *
 * Lo correcto, y lo que hace el original —`biometric_login_usecase.dart`,
 * «Verify we still have a valid refresh token»—, es mirar el **token de
 * refresco**, que es el de larga vida. Con él, el interceptor renueva el de
 * acceso en la primera petición y la sesión continúa.
 *
 * **Y había una segunda mitad, más grande.** El interruptor
 * `setBiometricEnabled` **no se llamaba en ningún sitio**: ni en el porte ni en
 * la app Flutter, donde está declarado en `secure_storage.dart` y no lo invoca
 * nadie. Con la bandera siempre en falso, `BiometricLoginUseCase` del original
 * devuelve «Autenticación biométrica no configurada» **siempre**, así que la
 * entrada por huella no funcionó nunca en ninguna de las dos aplicaciones, y
 * la pantalla de acceso lleva desde el principio ofreciendo un botón que no
 * podía llevar a ninguna parte.
 *
 * Aquí se completa: `activarEntradaPorBiometria` se llama tras un inicio de
 * sesión con credenciales aceptado, que es el único momento en que el cliente
 * está autenticado **y** hay tokens que guardar. Es lo que la bandera pedía a
 * gritos y nadie escribió.
 */
export enum MotivoDeRechazo {
  /** El cliente nunca activó la entrada por biometría. */
  NoConfigurada = 'no-configurada',
  /** No queda token de refresco: la sesión ya no se puede reanudar. */
  SesionExpirada = 'sesion-expirada',
}

export interface ResultadoDeEntrada {
  puedeEntrar: boolean;
  motivo?: MotivoDeRechazo;
}

/**
 * El mensaje para el cliente, en el idioma actual. Es una función y no una
 * tabla fija porque el texto depende del idioma elegido en el momento.
 */
export function mensajeDeRechazo(motivo: MotivoDeRechazo): string {
  return motivo === MotivoDeRechazo.NoConfigurada
    ? t('auth:biometrics.notConfigured')
    : t('auth:biometrics.sessionExpired');
}

/**
 * Deja la entrada por huella lista para la próxima vez.
 *
 * Se llama **después** de que el servidor aceptó las credenciales, nunca al
 * intentarlo: activarla antes dejaría el teléfono ofreciendo entrar por huella
 * a quien falló la contraseña.
 *
 * Si el teléfono no tiene biometría utilizable, la bandera se apaga en vez de
 * quedarse como estaba: un cliente puede borrar sus huellas del sistema, y
 * entonces el botón tiene que dejar de prometer lo que ya no puede cumplir.
 */
export async function activarEntradaPorBiometria(
  almacen: Pick<SecureStorage, 'setBiometricEnabled'>,
  hayBiometria: () => Promise<boolean>,
): Promise<void> {
  await almacen.setBiometricEnabled(await hayBiometria());
}

/**
 * Se consulta **antes** de pedir la huella, no después.
 *
 * Pedirle el dedo al cliente para después decirle que su sesión expiró es
 * hacerle trabajar para nada, y además le hace creer que la huella falló.
 */
export async function puedeEntrarConBiometria(
  almacen: Pick<SecureStorage, 'isBiometricEnabled' | 'getRefreshToken'>,
): Promise<ResultadoDeEntrada> {
  if (!(await almacen.isBiometricEnabled())) {
    return { puedeEntrar: false, motivo: MotivoDeRechazo.NoConfigurada };
  }

  const refresco = await almacen.getRefreshToken();
  if (refresco === null || refresco === '') {
    return { puedeEntrar: false, motivo: MotivoDeRechazo.SesionExpirada };
  }

  return { puedeEntrar: true };
}
