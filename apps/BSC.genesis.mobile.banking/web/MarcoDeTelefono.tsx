import type { ReactNode } from 'react';

/**
 * Marco del tamaño del Pixel 10a, para que las medidas se lean como en el
 * teléfono.
 *
 * La app Flutter y la nueva se comparan en la misma pantalla, y una diferencia
 * de ancho basta para que dos diseños idénticos parezcan distintos: con 360
 * puntos de ancho el texto rompe línea donde rompe en el teléfono.
 */

/** Ancho lógico del Pixel 10a en puntos independientes de densidad. */
const ANCHO = 360;
/** Alto útil descontando la barra de estado y la de navegación del sistema. */
const ALTO = 800;

export function MarcoDeTelefono({
  children,
  desnudo = false,
}: {
  children: ReactNode;
  /**
   * Sin carcasa ni sombra, ocupando la ventana entera.
   *
   * Es lo que hace falta para capturar una hoja modal: en web las hojas se
   * dibujan fuera del marco, a lo ancho del documento, así que el documento
   * tiene que medir exactamente lo que mide el teléfono.
   */
  desnudo?: boolean;
}): React.JSX.Element {
  if (desnudo) {
    return <div style={{ ...pantalla, borderRadius: 0 }}>{children}</div>;
  }

  return (
    <div style={marco}>
      <div style={pantalla}>{children}</div>
    </div>
  );
}

const marco: React.CSSProperties = {
  width: ANCHO + 16,
  height: ALTO + 16,
  padding: 8,
  borderRadius: 36,
  background: '#0f2033',
  boxShadow: '0 24px 60px rgba(15, 32, 51, 0.28)',
};

const pantalla: React.CSSProperties = {
  width: ANCHO,
  height: ALTO,
  borderRadius: 28,
  overflow: 'hidden',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};
