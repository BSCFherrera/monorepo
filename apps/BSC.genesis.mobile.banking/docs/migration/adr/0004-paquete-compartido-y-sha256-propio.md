# ADR-0004 — Paquete compartido con el portal, y SHA-256 propio

**Estado:** ✅ Aceptado e implementado
**Fecha:** 2026-09-16
**Relacionado:** CT-02.1, T-15, oleada 0

---

## Contexto

El algoritmo que calcula la huella canónica de una operación monetaria existe hoy **tres veces**:

| Canal | Archivo |
|---|---|
| Backend | `BSC.EnLinea.Application/Common/Security/OperationFingerprint.cs` |
| Portal | `BSC.BSCEnLinea.FrontEnd/src/utils/operationFingerprint.ts` |
| App móvil | `BSC.MobileApp/lib/core/security/operation_fingerprint.dart` |

Los tres archivos se advierten mutuamente, en sus propios comentarios, de que un solo carácter de diferencia hace que el backend rechace la transacción. Eliminar una de esas tres copias es el beneficio concreto que justifica esta migración.

## Decisión 1 — El paquete compartido

Se crea `packages/bsc-shared`, consumido por la app React Native y —cuando se coordine con el equipo del portal— por el portal Nuxt. La versión Dart desaparece.

**Regla de admisión:** solo entra lógica **pura**. Si algo necesita `fetch`, `window`, almacenamiento o un módulo nativo, no pertenece al paquete. Es esa restricción la que permite que el mismo código corra en el teléfono y en el navegador.

Contenido inicial: `operationFingerprint`, `operationRisk`, `sha256`.

## Decisión 2 — SHA-256 escrito a mano, sin dependencias

Esta es la parte que merece explicación, porque «no reimplementes criptografía» es una regla sensata y aquí se está haciendo justamente eso.

**Lo que se reimplementa es un hash, no un secreto.** SHA-256 no tiene llave ni material sensible: es una función determinista y pública, con vectores de prueba oficiales. Una implementación incorrecta **no filtra nada**: produce un hash distinto, el backend rechaza la transacción, y el fallo es inmediato y visible. Esto no se parece en nada a implementar un cifrado o un generador de aleatoriedad, donde un error sí es silencioso y peligroso.

Tres razones concretas:

1. **React Native no tiene `crypto.subtle`.** El portal usa la Web Crypto del navegador; en Hermes no existe. El código compartido no puede depender de ella.
2. **Está en la ruta de la firma de transacciones.** Es el mismo argumento por el que el módulo de llaves se escribió a mano en Kotlin, tanto en Flutter como aquí: un paquete de npm comprometido en esta ruta sería un compromiso de la autorización (T-15).
3. **`crypto.subtle` es asíncrono.** Obliga a que toda la cadena de cálculo sea asíncrona sin ganar nada: aquí el mensaje son decenas de bytes, no megabytes.

### Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| `react-native-quick-crypto` | Dependencia nativa pesada en la ruta de la firma, para calcular un hash de 60 bytes |
| `js-sha256` u otra librería pequeña | Resuelve el problema técnico, pero añade una dependencia de terceros justo donde T-15 dice que no debe haberla. El código propio son ~120 líneas verificables |
| Añadir un método `sha256` al módulo nativo Kotlin | Obligaría a cruzar el puente y a duplicar el trabajo en Swift, para algo que no necesita hardware |

## Cómo se verifica que es correcto

No se acepta «parece correcto». Tres capas de verificación, todas automáticas:

1. **Vectores oficiales del estándar** — cadena vacía, `abc`, y el mensaje de 56 caracteres que cruza el borde de bloque.
2. **Contraste contra OpenSSL.** Las pruebas comparan el resultado con `node:crypto` para entradas arbitrarias: acentos, símbolos de tres bytes, emoji, suplentes sueltos, mensajes largos, y **todas las longitudes donde cambia el relleno** (0, 1, 54, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128). Node solo se usa en las pruebas; en el teléfono no existe.
3. **El vector compartido entre canales.** La prueba fija el hash `a455a04b…01ea` para una transferencia concreta — el mismo valor que afirma la prueba en Dart y que produce el backend en C#. Si esa prueba se pone en rojo, los canales dejaron de coincidir.

**Resultado: 62 pruebas, 100% de líneas, ramas y funciones** en el paquete completo.

## Un defecto que esto encontró

La prueba contra OpenSSL detectó una diferencia real que la revisión a ojo no habría visto: ante una cadena UTF-16 con un **suplente sin pareja**, la implementación inicial emitía el suplente crudo, mientras que `TextEncoder` —que es lo que usa el portal— lo sustituye por U+FFFD. Dos canales habrían calculado huellas distintas para el mismo dato, y el backend habría rechazado la transacción sin explicar por qué.

Se corrigió la implementación, no la prueba.

## Un desacuerdo preexistente que conviene registrar

Al portar el formato del monto se encontró que **la app Flutter y el portal no coinciden en los medios**. `toStringAsFixed(2)` de Dart devuelve `"1.00"` para `1.005`, porque el `double` más cercano a 1.005 es ligeramente menor. El portal corrige ese sesgo y devuelve `"1.01"`, que es lo que produce `decimal.ToString("F2")` en C#.

El portal es el que está en lo correcto, porque **el backend es quien decide si acepta la transacción**. La implementación compartida sigue al portal.

En la práctica nunca importó —un monto bancario no trae tres decimales— pero era una discrepancia latente entre canales, del mismo tipo que las que esta migración existe para eliminar.

## Consecuencias

- Queda **una implementación por lenguaje de plataforma** (C# y TypeScript) en vez de tres.
- El paquete se publica hacia el portal como trabajo de coordinación pendiente (D-08 en `05-target-architecture.md`): mientras no se resuelva, el portal sigue con su copia y el riesgo de desincronización persiste — reducido, no eliminado.
- Cualquier cambio a la huella obliga a coordinar el despliegue de los canales. El prefijo de versión `v1` existe precisamente para eso.
