import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import type { Container } from './container';

/**
 * Dependencias de la aplicación, disponibles para cualquier pantalla.
 *
 * Existe por la navegación: React Navigation monta las pantallas por nombre,
 * así que no hay dónde pasarles el cliente HTTP ni las acciones de sesión por
 * propiedades sin encadenarlas por cada nivel del árbol.
 *
 * Es el equivalente de GetIt en la app Flutter —su contenedor de
 * inyección— con una diferencia deliberada: aquí **no hay un registro global
 * mutable**. El contenedor se construye una vez en la raíz y se entrega por
 * contexto, de modo que una prueba puede montar un árbol con otro contenedor
 * sin tocar estado compartido, y nada puede pedir una dependencia que la raíz
 * no haya provisto.
 */

export interface AppServices {
  contenedor: Container;
  /** Cierra la sesión y vuelve al acceso. */
  cerrarSesion: () => Promise<void>;
  /**
   * Invalida las sesiones abiertas en **todos** los dispositivos, incluida la
   * banca en línea, y vuelve al acceso.
   *
   * Es una acción distinta de `cerrarSesion` y no una variante suya: llama a
   * otro endpoint del backend y sus consecuencias alcanzan a equipos que el
   * cliente no tiene delante. El perfil ofrece las dos por separado, como el
   * original.
   */
  cerrarTodasLasSesiones: () => Promise<void>;
  /**
   * Marca actividad del usuario para el temporizador de inactividad.
   *
   * Hay que llamarlo desde los gestos de cada pantalla: el gestor de sesión no
   * puede verlos por su cuenta, y sin esto la sesión caduca con el cliente
   * usando la app.
   */
  registrarActividad: () => void;
}

const Contexto = createContext<AppServices | null>(null);

export function AppServicesProvider({
  servicios,
  children,
}: {
  servicios: AppServices;
  children: ReactNode;
}): React.JSX.Element {
  return <Contexto.Provider value={servicios}>{children}</Contexto.Provider>;
}

/**
 * Falla en vez de devolver `null` si no hay proveedor: una pantalla sin
 * dependencias no puede hacer nada útil, y descubrirlo en el sitio del error es
 * mucho más barato que perseguir un `undefined` tres capas más abajo.
 */
export function useAppServices(): AppServices {
  const servicios = useContext(Contexto);
  if (servicios === null) {
    throw new Error(
      'useAppServices se usó fuera de AppServicesProvider: la raíz de la app no montó el proveedor.',
    );
  }
  return servicios;
}
