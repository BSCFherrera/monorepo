import '../src/i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Preview } from './Preview';
import './fuentes.css';

/**
 * Punto de entrada de la vista previa en el navegador.
 *
 * Solo para desarrollo: sirve para comparar una pantalla contra la app Flutter
 * sin compilar el APK. Ver el encabezado de `vite.config.mts`.
 */
const contenedor = document.getElementById('raiz');
if (contenedor === null) throw new Error('Falta el contenedor #raiz');

createRoot(contenedor).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
