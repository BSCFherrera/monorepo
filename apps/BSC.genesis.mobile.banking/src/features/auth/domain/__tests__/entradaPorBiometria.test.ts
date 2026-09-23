import type { SecureStorage } from '../../../../core/security/secureStorage';
import {
  activarEntradaPorBiometria,
  mensajeDeRechazo,
  MotivoDeRechazo,
  puedeEntrarConBiometria,
} from '../entradaPorBiometria';

/**
 * Regresión: **la entrada por biometría no funcionaba nunca.**
 *
 * Lo reportó el usuario tras intentarlo varias veces en el Pixel: la huella se
 * acepta —el diálogo del sistema confirma la identidad— y acto seguido la
 * pantalla responde «Tu sesión expiró». Siempre.
 *
 * La causa: el porte comprobaba el **token de acceso**, que dura minutos,
 * donde el original comprueba el **token de refresco**, que es el de larga
 * vida (`biometric_login_usecase.dart`: «Verify we still have a valid refresh
 * token»). Como el de acceso caduca enseguida, la condición fallaba
 * prácticamente siempre y el cliente se quedaba sin una de las dos formas de
 * entrar que la aplicación le ofrece.
 *
 * Es además un defecto que **no se ve en el navegador ni en una sesión recién
 * abierta**, que es donde se probaba: con el token de acceso fresco funciona.
 * Solo aparece al volver a la aplicación un rato después, que es como se usa
 * de verdad.
 */

type Almacen = Pick<SecureStorage, 'isBiometricEnabled' | 'getRefreshToken'>;

const almacen = (sobre: {
  biometria?: boolean;
  refresco?: string | null;
}): Almacen =>
  ({
    isBiometricEnabled: jest.fn().mockResolvedValue(sobre.biometria ?? true),
    getRefreshToken: jest
      .fn()
      .mockResolvedValue(sobre.refresco === undefined ? 'r-1' : sobre.refresco),
  } as unknown as Almacen);

describe('puedeEntrarConBiometria', () => {
  it('entra con el token de refresco, sin mirar el de acceso', async () => {
    // **Este es el caso del defecto**, y es además el caso normal: el token de
    // acceso dura minutos y el cliente vuelve a la app horas después.
    await expect(
      puedeEntrarConBiometria(almacen({ refresco: 'r-1' })),
    ).resolves.toEqual({ puedeEntrar: true });
  });

  it('no entra cuando no queda token de refresco', async () => {
    await expect(
      puedeEntrarConBiometria(almacen({ refresco: null })),
    ).resolves.toEqual({
      puedeEntrar: false,
      motivo: MotivoDeRechazo.SesionExpirada,
    });
  });

  it('trata la cadena vacía como que no hay token', async () => {
    await expect(
      puedeEntrarConBiometria(almacen({ refresco: '' })),
    ).resolves.toEqual({
      puedeEntrar: false,
      motivo: MotivoDeRechazo.SesionExpirada,
    });
  });

  it('no entra si el cliente nunca activó la biometría', async () => {
    await expect(
      puedeEntrarConBiometria(almacen({ biometria: false })),
    ).resolves.toEqual({
      puedeEntrar: false,
      motivo: MotivoDeRechazo.NoConfigurada,
    });
  });

  it('distingue los dos motivos, porque el cliente hace cosas distintas', () => {
    // «No está activada» se resuelve en Seguridad; «expiró» se resuelve
    // entrando con la contraseña. Un solo mensaje mandaría a la mitad de los
    // clientes al sitio equivocado.
    expect(mensajeDeRechazo(MotivoDeRechazo.NoConfigurada)).not.toBe(
      mensajeDeRechazo(MotivoDeRechazo.SesionExpirada),
    );
  });

  it('ni siquiera pregunta por el refresco si la biometría no está activada', async () => {
    const a = almacen({ biometria: false });

    await puedeEntrarConBiometria(a);

    expect(a.getRefreshToken).not.toHaveBeenCalled();
  });
});

/**
 * La segunda mitad del defecto, y la más grande: **la bandera no la escribía
 * nadie**.
 *
 * `setBiometricEnabled` está declarada en el almacén seguro del porte y en
 * `secure_storage.dart` del original, y **ninguna de las dos aplicaciones la
 * llama nunca**. Con la bandera siempre en falso, el caso de uso del original
 * devuelve «Autenticación biométrica no configurada» siempre. Es decir: la
 * pantalla de acceso lleva desde el principio ofreciendo un botón que no podía
 * funcionar, en las dos aplicaciones.
 */
describe('activarEntradaPorBiometria', () => {
  const almacenEscribible = (): Pick<SecureStorage, 'setBiometricEnabled'> =>
    ({
      setBiometricEnabled: jest.fn().mockResolvedValue(undefined),
    } as unknown as Pick<SecureStorage, 'setBiometricEnabled'>);

  it('la activa cuando el teléfono tiene biometría utilizable', async () => {
    const a = almacenEscribible();

    await activarEntradaPorBiometria(a, async () => true);

    expect(a.setBiometricEnabled).toHaveBeenCalledWith(true);
  });

  it('la apaga cuando el teléfono no la tiene', async () => {
    // No basta con «no activarla»: el cliente puede borrar sus huellas del
    // sistema después de haberla activado, y el botón tiene que dejar de
    // prometer lo que ya no puede cumplir.
    const a = almacenEscribible();

    await activarEntradaPorBiometria(a, async () => false);

    expect(a.setBiometricEnabled).toHaveBeenCalledWith(false);
  });
});
