import {
  cambiarIdioma,
  clavesDe,
  compararTraducciones,
  idiomaActual,
  iniciarTraducciones,
  nombreCortoDelMes,
  nombreDelMes,
  restaurarIdioma,
  t,
  textosVacios,
  type AlmacenDeIdioma,
} from '../index';

function almacen(inicial: string | null): AlmacenDeIdioma & { valor: string | null } {
  const a = {
    valor: inicial,
    leer: async () => a.valor,
    guardar: async (idioma: string) => {
      a.valor = idioma;
    },
  };
  return a;
}

describe('iniciarTraducciones', () => {
  beforeAll(() => {
    iniciarTraducciones({ es: { prueba: { saludo: 'Hola, {{nombre}}' } } });
  });

  it('traduce de inmediato, sin esperar a nada', () => {
    expect(t('prueba:saludo', { nombre: 'Ana' })).toBe('Hola, Ana');
  });

  it('trae los textos compartidos sin que la app los registre', () => {
    expect(t('common:biometria.cancelar')).toBe('Cancelar');
  });

  it('llamarlo otra vez añade espacios sin perder los anteriores', () => {
    iniciarTraducciones({ es: { otra: { texto: 'Otro' } } });
    expect(t('otra:texto')).toBe('Otro');
    expect(t('prueba:saludo', { nombre: 'Luis' })).toBe('Hola, Luis');
  });
});

describe('idioma elegido', () => {
  beforeAll(() => iniciarTraducciones());

  it('arranca en español', () => {
    expect(idiomaActual()).toBe('es');
  });

  it('un idioma guardado que no existe se ignora', async () => {
    await expect(restaurarIdioma(almacen('xx'))).resolves.toBe('es');
    expect(idiomaActual()).toBe('es');
  });

  it('un almacén que falla deja el idioma por defecto', async () => {
    const roto: AlmacenDeIdioma = {
      leer: async () => {
        throw new Error('sin acceso');
      },
      guardar: async () => undefined,
    };
    await expect(restaurarIdioma(roto)).resolves.toBe('es');
  });

  it('cambiar el idioma lo recuerda', async () => {
    const a = almacen(null);
    await cambiarIdioma('es', a);
    expect(a.valor).toBe('es');
  });
});

describe('calendario', () => {
  beforeAll(() => iniciarTraducciones());

  it('da los meses del idioma actual, de 0 a 11 como Date.getMonth()', () => {
    expect(nombreCortoDelMes(0)).toBe('ene');
    expect(nombreCortoDelMes(11)).toBe('dic');
    expect(nombreDelMes(8)).toBe('Septiembre');
  });

  it('un índice fuera de rango da vacío en vez de «undefined»', () => {
    expect(nombreCortoDelMes(12)).toBe('');
  });
});

describe('comparación de traducciones', () => {
  const es = { auth: { login: { titulo: 'Bienvenido', boton: 'Entrar' } } };

  it('lista las claves con su espacio de nombres', () => {
    expect(clavesDe(es)).toEqual(['auth:login.boton', 'auth:login.titulo']);
  });

  it('dice qué falta y qué sobra en la traducción', () => {
    const en = { auth: { login: { titulo: 'Welcome', viejo: 'Old' } } };
    expect(compararTraducciones(es, en)).toEqual({
      faltan: ['auth:login.boton'],
      sobran: ['auth:login.viejo'],
    });
  });

  it('encuentra textos vacíos', () => {
    expect(textosVacios({ auth: { a: 'x', b: ' ' } })).toEqual(['auth:b']);
  });
});
