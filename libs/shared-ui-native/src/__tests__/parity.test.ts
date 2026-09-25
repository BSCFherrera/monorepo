

import { BscColors, BscGradients } from '../theme/colors';

describe('formato de los tokens', () => {
  it('todos los colores son hexadecimal de 6 dígitos', () => {
    for (const [nombre, valor] of Object.entries(BscColors)) {
      expect({ nombre, valido: /^#[0-9A-F]{6}$/i.test(valor) }).toEqual({
        nombre,
        valido: true,
      });
    }
  });

  it('ningún gradiente queda con un solo color', () => {
    for (const gradiente of Object.values(BscGradients)) {
      expect(gradiente.colors.length).toBeGreaterThanOrEqual(2);
    }
  });
});
