import { transformSync } from '@babel/core';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const quitarConsole = require('../scripts/babel-quitar-console.js');

/**
 * El plugin que quita `console.*` del paquete de producción (T-07).
 *
 * Se prueba porque lo que hace es **invisible hasta que falla**: si dejara de
 * funcionar, la aplicación seguiría comportándose igual y los saldos volverían
 * a `logcat` sin que nadie lo notara. Y si borrara de más, rompería el paquete
 * de release sin tocar el de depuración, que es la peor forma de romper algo.
 */

const transformar = (codigo: string): string =>
  transformSync(codigo, {
    plugins: [quitarConsole],
    configFile: false,
    babelrc: false,
  })?.code ?? '';

describe('quita lo que puede filtrar', () => {
  it('borra console.log y sus parientes', () => {
    for (const metodo of ['log', 'info', 'warn', 'debug', 'table', 'trace']) {
      const salida = transformar(`console.${metodo}(respuesta);`);
      expect(salida).not.toContain(`console.${metodo}`);
    }
  });

  it('borra la llamada aunque el argumento sea un objeto entero', () => {
    // Es el caso real: `console.log(respuesta)` imprime saldos, números de
    // cuenta y el nombre del titular de una vez.
    const salida = transformar('console.log({ cuenta, saldo, titular });');
    expect(salida).not.toContain('console.log');
  });
});

describe('conserva lo que hace falta', () => {
  it('no toca console.error', () => {
    /*
      Es lo que un informe de fallos recoge cuando la aplicación revienta.
      Quitarlo mientras no exista la observabilidad con redacción sería cambiar
      una fuga por una ceguera.
    */
    expect(transformar('console.error("falló", causa);')).toContain(
      'console.error',
    );
  });

  it('no toca un objeto que solo se llame parecido', () => {
    // `miConsole.log` o `this.console.log` no son el `console` global.
    expect(transformar('miConsole.log(x);')).toContain('miConsole.log');
    expect(transformar('obj.console.log(x);')).toContain('console.log');
  });

  it('no toca el acceso dinámico', () => {
    // `console[metodo](x)` no se puede juzgar en compilación, así que se deja.
    expect(transformar('console[metodo](x);')).toContain('console[metodo]');
  });
});

describe('no rompe el código que lo rodea', () => {
  it('sobrevive en posición de expresión', () => {
    /*
      Borrar el nodo en vez de sustituirlo dejaba un hueco sintáctico aquí. Se
      sustituye por `void 0`, que es válido en cualquier posición.
    */
    const salida = transformar('const x = cond && console.log(y);');
    expect(salida).toContain('void 0');
    expect(() => transformar(salida)).not.toThrow();
  });

  it('sobrevive como cuerpo de una flecha', () => {
    const salida = transformar('const f = () => console.log(x);');
    expect(() => transformar(salida)).not.toThrow();
    expect(salida).not.toContain('console.log');
  });

  it('el argumento con efectos se pierde, y hay que saberlo', () => {
    /*
      `console.log(contador++)` deja de incrementar. Es el comportamiento de
      cualquier eliminador de registros y está bien —un efecto escondido en un
      argumento de registro es un defecto de por sí—, pero queda fijado aquí
      para que nadie lo descubra depurando en release.
    */
    const salida = transformar('console.log(contador++);');
    expect(salida).not.toContain('contador++');
  });
});
