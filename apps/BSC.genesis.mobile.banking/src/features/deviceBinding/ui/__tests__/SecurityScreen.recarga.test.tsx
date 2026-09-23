import { SafeAreaProvider } from 'react-native-safe-area-context';
import TestRenderer from 'react-test-renderer';

import { DeviceBindingState } from '../../../../core/security/signingOutcome';
import type { DeviceBindingService } from '../../domain/deviceBindingService';
import { SecurityScreen } from '../SecurityScreen';

/**
 * La pantalla de Seguridad tiene que volver a mirar el estado al recibir el
 * foco.
 *
 * **Nace de un defecto visto en el Pixel al cerrar V-06.** El cliente revoca su
 * teléfono desde «Mis dispositivos» —el banco lo confirma y la llave local se
 * borra—, pulsa atrás, y Seguridad sigue enseñando el interruptor encendido y
 * la ficha de la llave. Solo se corrige saliendo y volviendo a entrar.
 *
 * No es cosmético: es la pantalla donde el cliente comprueba **cómo se
 * autorizan sus operaciones**, y le está diciendo que autoriza con su huella
 * cuando el banco ya no reconoce el dispositivo. La siguiente operación le
 * pedirá un código sin explicación.
 *
 * La recarga se pide desde fuera, con `recargarEn`: el componente no conoce la
 * navegación —así se puede probar y así se previsualiza en el navegador— y el
 * navegador es quien sabe cuándo la pantalla recupera el foco.
 */

const servicio = (): DeviceBindingService => {
  const vinculo = {
    estado: jest.fn().mockResolvedValue(DeviceBindingState.NotEnrolled),
    seguridadDeLlave: jest.fn().mockResolvedValue(null),
    listarDispositivos: jest.fn().mockResolvedValue([]),
  };
  return vinculo as unknown as DeviceBindingService;
};

/*
  La cabecera pide los márgenes seguros del sistema, así que el árbol necesita
  su proveedor con medidas fijas: en pruebas no hay pantalla que medir.
*/
const conMarco = (
  vinculo: DeviceBindingService,
  recargarEn: number,
): React.JSX.Element => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 360, height: 800 },
      insets: { top: 24, left: 0, right: 0, bottom: 0 },
    }}
  >
    <SecurityScreen
      vinculo={vinculo}
      onBack={() => {}}
      onMisDispositivos={() => {}}
      onTokenSuave={() => {}}
      recargarEn={recargarEn}
    />
  </SafeAreaProvider>
);

const montar = (
  vinculo: DeviceBindingService,
  recargarEn: number,
): TestRenderer.ReactTestRenderer => {
  let arbol!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    arbol = TestRenderer.create(conMarco(vinculo, recargarEn));
  });
  return arbol;
};

describe('SecurityScreen', () => {
  it('vuelve a consultar el estado cuando cambia `recargarEn`', () => {
    const vinculo = servicio();
    const espia = vinculo.estado as unknown as jest.Mock;

    const arbol = montar(vinculo, 0);
    expect(espia).toHaveBeenCalledTimes(1);

    TestRenderer.act(() => {
      arbol.update(conMarco(vinculo, 1));
    });

    // La revocación ocurrió en otra pantalla: sin esta segunda consulta, la de
    // Seguridad seguiría enseñando el interruptor encendido.
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('no consulta de más si `recargarEn` no cambia', () => {
    const vinculo = servicio();
    const espia = vinculo.estado as unknown as jest.Mock;

    const arbol = montar(vinculo, 7);

    TestRenderer.act(() => {
      arbol.update(conMarco(vinculo, 7));
    });

    expect(espia).toHaveBeenCalledTimes(1);
  });
});
