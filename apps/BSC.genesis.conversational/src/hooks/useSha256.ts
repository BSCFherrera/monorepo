import {useCallback} from 'react';
import {sha256} from '@utils/index';

/**
 * Hook reutilizable para generar un hash SHA256 a partir de un string,
 * disponible en toda la app (ej. hashear un dato sensible antes de incluirlo en una petición).
 */
export const useSha256 = () => {
  const hashSha256 = useCallback((value: string): string => sha256(value), []);

  return {hashSha256};
};
