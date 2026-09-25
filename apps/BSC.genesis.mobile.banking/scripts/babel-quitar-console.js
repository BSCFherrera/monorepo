/**
 * Quita las llamadas a `console.*` del paquete de producción (T-07).
 *
 * **Por qué importa en una banca.** Todo lo que pasa por `console` queda en
 * `logcat`, que cualquier aplicación con permiso de lectura de registros —o
 * cualquiera con el teléfono y un cable— puede leer. Un `console.log` de la
 * respuesta de un endpoint de productos imprime saldos, números de cuenta y el
 * nombre del titular. No hace falta que alguien lo haya escrito a propósito:
 * basta un `console.log(respuesta)` olvidado en una depuración.
 *
 * **Por qué está escrito a mano y no es `babel-plugin-transform-remove-console`.**
 * La regla del proyecto es que cada dependencia se justifica o se escala, y que
 * cuando la alternativa es un módulo propio corto y auditable, ese es el
 * camino. Esto son treinta líneas que cualquiera puede leer entero, en la ruta
 * que decide qué sale del teléfono. El paquete de npm hace lo mismo con una
 * superficie de cadena de suministro que aquí no se justifica.
 *
 * **Qué se conserva y por qué.** `console.error` se mantiene: es lo que un
 * informe de fallos recoge cuando la aplicación revienta, y perderlo dejaría a
 * soporte sin nada que mirar. La observabilidad con redacción de PII (T-14) es
 * lo que debe sustituirlo, y mientras no exista, quitarlo sería cambiar una
 * fuga por una ceguera.
 */

/** Lo que se borra. `error` no está, a propósito. */
const METODOS = new Set([
  'log',
  'info',
  'warn',
  'debug',
  'trace',
  'table',
  'dir',
  'time',
  'timeEnd',
  'group',
  'groupEnd',
  'count',
  'assert',
]);

module.exports = function quitarConsole() {
  return {
    name: 'bsc-quitar-console',
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee;

        if (
          callee.type !== 'MemberExpression' ||
          callee.computed ||
          callee.object.type !== 'Identifier' ||
          callee.object.name !== 'console' ||
          callee.property.type !== 'Identifier' ||
          !METODOS.has(callee.property.name)
        ) {
          return;
        }

        /*
          Se sustituye por `void 0` en vez de borrar el nodo. Borrarlo rompe
          cuando la llamada está en posición de expresión —`const x = cond &&
          console.log(y)`— o es el cuerpo de una flecha: quedaría un hueco
          sintáctico. `void 0` es válido en cualquier posición y el minificador
          lo elimina después.
        */
        path.replaceWith({ type: 'UnaryExpression', operator: 'void', prefix: true,
          argument: { type: 'NumericLiteral', value: 0 } });
      },
    },
  };
};
