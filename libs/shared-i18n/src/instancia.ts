import i18next, { type Resource, type ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { IDIOMA_POR_DEFECTO, IDIOMAS, type Idioma } from './idiomas';
import comunEs from './locales/es/common.json';

/** Los espacios de nombres de un idioma: `{ auth: {...}, pagos: {...} }`. */
export type Recursos = ResourceLanguage;

/** Lo que trae este paquete: los textos compartidos por todas las pantallas. */
const PROPIOS: Partial<Record<Idioma, Recursos>> = {
  es: { common: comunEs },
};

/**
 * Prepara las traducciones. Se llama **una vez, antes del primer render**, con
 * los textos de la app por idioma y espacio de nombres:
 *
 * ```ts
 * iniciarTraducciones({ es: { auth: authEs } });
 * ```
 *
 * Es síncrono a propósito (`initAsync: false`): los textos van dentro del
 * paquete, no se descargan, y así la primera pantalla ya sale traducida en vez
 * de mostrar las claves un instante.
 *
 * Llamarlo otra vez añade o reemplaza espacios de nombres sin reiniciar nada;
 * es lo que permite que cada paquete registre los suyos y que las pruebas
 * preparen solo lo que usan.
 */
export function iniciarTraducciones(
  recursosPorIdioma: Partial<Record<Idioma, Recursos>> = {},
): typeof i18next {
  const recursos: Resource = {};
  for (const idioma of Object.keys(IDIOMAS) as Idioma[]) {
    recursos[idioma] = { ...PROPIOS[idioma], ...recursosPorIdioma[idioma] };
  }

  if (i18next.isInitialized) {
    for (const [idioma, espacios] of Object.entries(recursos)) {
      for (const [espacio, textos] of Object.entries(espacios)) {
        i18next.addResourceBundle(idioma, espacio, textos, true, true);
      }
    }
    return i18next;
  }

  void i18next.use(initReactI18next).init({
    resources: recursos,
    lng: IDIOMA_POR_DEFECTO,
    // Lo que falte en un idioma se muestra en español, nunca como una clave.
    fallbackLng: IDIOMA_POR_DEFECTO,
    supportedLngs: Object.keys(IDIOMAS),
    defaultNS: 'common',
    ns: Object.keys(recursos[IDIOMA_POR_DEFECTO] ?? {}),
    initAsync: false,
    returnNull: false,
    // React ya escapa lo que pinta; escapar aquí también mostraría `&amp;`.
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return i18next;
}
