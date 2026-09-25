import { type AlmacenDeIdioma } from '@bsc/i18n';

import { SecureKeys } from '../core/security/secureStorage';
import NativeSecureStorage from '../specs/NativeSecureStorage';

/**
 * Dónde se recuerda el idioma elegido: el almacén cifrado, que es el único
 * almacenamiento persistente de la app. No es un secreto, pero así no hace
 * falta otra dependencia nativa solo para una preferencia.
 */
export const almacenDeIdioma: AlmacenDeIdioma = {
  leer: () => NativeSecureStorage.getItem(SecureKeys.language),
  guardar: idioma => NativeSecureStorage.setItem(SecureKeys.language, idioma),
};
