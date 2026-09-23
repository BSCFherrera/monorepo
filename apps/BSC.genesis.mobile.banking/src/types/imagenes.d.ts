/**
 * Imágenes importadas desde el código (`import fondo from './fondo.jpg'`).
 *
 * Metro las resuelve a un número de recurso y elige sola la variante @2x o @3x
 * del teléfono; Vite, en la vista previa web, a una URL. Las dos cosas las
 * acepta `<Image source>`, así que para TypeScript son `ImageSourcePropType`.
 */
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';
  const imagen: ImageSourcePropType;
  export default imagen;
}

declare module '*.jpg' {
  import type { ImageSourcePropType } from 'react-native';
  const imagen: ImageSourcePropType;
  export default imagen;
}
