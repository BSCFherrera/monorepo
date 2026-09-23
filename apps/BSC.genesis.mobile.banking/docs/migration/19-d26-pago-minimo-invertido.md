# D-26 · El pago mínimo de las tarjetas llega cambiado entre monedas

**Para:** el equipo del core y el de integración del bus App Connect
**De:** Fábrica Digital — migración de la app móvil
**Fecha:** 2026-09-18
**Estado:** el canal no lo compensa; se pide la corrección en el origen

---

## En una línea

El servicio que devuelve el listado de productos de un cliente entrega el pago
mínimo de las tarjetas de crédito **con las dos monedas intercambiadas**: el
importe en pesos aparece en el campo de dólares y viceversa. El servicio de
detalle de la misma tarjeta lo entrega bien.

## Qué se midió

Contra el ambiente de pruebas, cliente 80191, dos tarjetas distintas.

**Tarjeta `\*\***7147`\*\*

| Servicio                               | Campo `MinimumPaymentTcRd` | Campo `MinimumPaymentTcUs` |
| -------------------------------------- | -------------------------: | -------------------------: |
| `products/get-products-by-customer-id` |                     174.04 |                   2,311.41 |
| `products/details`                     |                   2,311.41 |                     174.04 |

**Tarjeta `\*\***7473`\*\* — aquí se ve solo, sin comparar con nada:

- El listado afirma un mínimo de **US$ 1,351.82** sobre un balance al corte en
  dólares de **US$ 122.34**. El mínimo sería **once veces** el saldo.
- El detalle coloca esa misma cifra en pesos, donde el corte es **RD$
  22,347.33**. Ahí el mínimo sale al **6 %**, que es la proporción habitual.

El detalle es coherente consigo mismo y el listado no. Por eso se da por cierto
el detalle, sin necesidad de preguntarle a nadie cuál de los dos vale.

## Dónde se rompe, y dónde no

Se recorrió el camino entero del dato, de arriba abajo:

| Capa                               | Qué hace con el dato                                                                                        | ¿Sospechosa? |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| App móvil (Flutter y React Native) | Lee `minimumPaymentTcRd` y `minimumPaymentTcUs` tal cual                                                    | No           |
| Portal en línea (Nuxt)             | Igual: los lee tal cual                                                                                     | No           |
| BFF `BSC.EnLinea.API`              | `ProductDto.GetProduct` copia `Minimum_payment_tc_rd` y `Minimum_payment_tc_us` **uno a uno**, sin tocarlos | No           |
| Bus App Connect                    | Mapea la respuesta del core a `CoreBankingProduct`                                                          | **Sí**       |
| Core — servicio de listado         | Origen de los dos importes                                                                                  | **Sí**       |
| Core — servicio de detalle         | Entrega los mismos dos importes, y bien                                                                     | No           |

El punto exacto del BFF, por si hace falta descartarlo sin volver a mirarlo:

```
src/BSC.EnLinea.Application/Products/DTOs/ProductDto.cs, líneas 43-44

    MinimumPaymentTcRd = model.Minimum_payment_tc_rd,
    MinimumPaymentTcUs = model.Minimum_payment_tc_us,
```

No hay ninguna otra asignación de esos dos campos en todo el BFF.

**Conclusión:** la inversión ocurre en el servicio de listado del core o en el
mapeo de ese servicio dentro del bus. Los tres canales están limpios, y el
servicio de detalle del propio core demuestra que el dato existe correcto.

## Qué ve hoy el cliente

1. **El dashboard** anuncia «Pago mínimo: RD$ 174.04» para la `****7147`, cuyo
   mínimo real en pesos son RD$ 2,311.41. Es la primera pantalla tras entrar.
2. **La pestaña de Pagos** lista la misma cifra.
3. **La pantalla de detalle de la tarjeta** y **el asistente de pagos** piden el
   servicio de detalle, así que enseñan RD$ 2,311.41.

Es decir, **dos cifras distintas para la misma tarjeta en la misma sesión**.

4. Hay un cuarto efecto, menos visible y por eso más incómodo: la sección «Para
   hoy» del dashboard decide **qué tarjetas listar** mirando si el mínimo en
   pesos es mayor que cero. Como ese campo trae el importe en dólares, **una
   tarjeta con pago mínimo en pesos pero sin mínimo en dólares no aparece en la
   lista de pendientes**. No es que enseñe una cifra equivocada: es que no
   avisa. El mismo comportamiento está en la app actual y en el portal, porque
   los tres leen el mismo campo.

## Qué se decidió en el canal

**No compensar.** El canal muestra lo que el bus entrega. Se valoró invertir la
cifra en la aplicación y se descartó por dos razones:

- Un ajuste así deja el defecto vivo en el origen, donde sigue afectando a
  cualquier otro consumidor del servicio.
- El día que el core se corrija, la aplicación pasará a enseñar el dato mal al
  revés, y nada avisará de ello.

También se valoró que el dashboard pidiera el detalle de cada tarjeta para
enseñar la cifra buena. Se descartó porque añade **una llamada por tarjeta** a
la pantalla de entrada, que es la que más veces se abre y la que marca la
primera impresión de la aplicación.

Queda en pie, de una decisión anterior, que **el asistente de pagos sí pide el
detalle** de la tarjeta que se va a pagar: ahí la cifra no se enseña, se cobra,
y pagar un importe equivocado tiene consecuencias distintas a leerlo.

## Qué se pide

1. Corregir el orden de los dos importes en el **servicio de listado de
   productos** del core, o en su mapeo dentro del bus, según dónde esté.
2. Confirmar en cuál de las dos capas estaba, para cerrar la traza.
3. Avisar cuando esté desplegado en pruebas: la app volverá a medir las dos
   tarjetas de arriba y se dará por cerrado D-26.

No hace falta ningún cambio en el BFF ni en los canales.
