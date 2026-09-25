# ADR-0002 — Certificate pinning y su rotación

**Estado:** 🟡 Propuesto
**Fecha:** 2026-09-16
**Relacionado:** T-03, P-11, oleada 9

---

## Contexto

`lib/core/network/certificate_pinner.dart` en la app Flutter es un método vacío: comprueba que no sea depuración ni web, y retorna. El cuerpo tiene un solo comentario, *«Native SSL pinning implementation for production»*, que nunca se escribió.

Consecuencia: **hoy cualquiera que pueda instalar una CA en el dispositivo —un proxy corporativo, un MDM, un atacante con acceso físico— puede leer y modificar todo el tráfico de la banca móvil.** Es el hallazgo abierto más grave del inventario.

Vale la pena entender **por qué** quedó sin implementar, porque la razón es la misma en todas partes: un pin mal gestionado deja a **todos** los clientes fuera el día que el certificado rota, y no hay forma de arreglarlo remotamente — hay que publicar una versión nueva y esperar a que la gente actualice. El miedo a ese modo de fallo es lo que convierte esta característica en un TODO permanente.

Este ADR existe para que la app nueva no repita esa historia: **no se aprueba el pinning sin su plan de rotación.**

## Opciones

### A. Pinning por certificado
Se fija el hash del certificado del servidor. Simple, y **rompe en cada renovación**, que en certificados modernos ocurre cada pocos meses. Rechazada.

### B. Pinning por clave pública (SPKI) — **recomendada**
Se fija el hash de la clave pública. Sobrevive a la renovación del certificado mientras se conserve el par de llaves, que es la práctica habitual. Es lo que recomienda OWASP.

### C. Pinning a la CA intermedia
Sobrevive a cambios de certificado y de clave, pero confía en todo lo que esa CA emita. Más débil. Aceptable como pin de respaldo.

### D. Sin pinning, solo TLS estándar
Es la situación actual de hecho. Rechazada para una aplicación bancaria.

## Decisión propuesta

**Pinning por SPKI (opción B), con al menos dos pines y un plan de rotación escrito antes de activarlo.**

| Elemento | Definición |
|---|---|
| Pin primario | SPKI de la clave en producción |
| Pin de respaldo | SPKI de la clave de reemplazo **ya generada y custodiada**, aún sin usar |
| Pin de emergencia | SPKI de la CA intermedia (opción C), como último recurso |
| Alcance | ❓ Depende de P-11: si la app habla con un API Gateway, el pin es el del gateway, no el del backend |
| Ambientes | Activo en producción y piloto. Desactivado en desarrollo, y el verificador de configuración comprueba que no se pueda desactivar en una compilación de release |
| Fallo de validación | La petición falla. **No hay modo permisivo**: un pinning que se puede saltar no es pinning |

## Plan de rotación — la parte que no se puede omitir

1. La clave de reemplazo se genera **antes** de que se necesite y su SPKI se publica en la app como pin de respaldo, desde la primera versión.
2. El día de la rotación, el servidor pasa a la clave de reemplazo. Las apps ya instaladas la aceptan porque su pin de respaldo ya la contemplaba.
3. La siguiente versión de la app promueve el respaldo a primario e introduce un respaldo nuevo.
4. **Nunca se rota a una clave cuyo pin no esté ya distribuido en las apps instaladas.**
5. Se mide el parque de versiones instaladas antes de cada rotación: si hay una versión sin el pin de respaldo, la rotación se pospone.

## Pruebas obligatorias antes del Gate D

- [ ] Conexión legítima con el pin primario: **funciona**.
- [ ] Proxy MITM con CA instalada en el dispositivo: **falla**.
- [ ] Servidor con la clave de respaldo: **funciona** (prueba de que la rotación no dejará a nadie fuera).
- [ ] Compilación de release con el pinning desactivado: **no compila**.
- [ ] Certificado vencido o inválido: **falla**.

La tercera prueba es la que realmente importa. Sin ella, el pin de respaldo es una suposición, y las suposiciones son lo que deja a los clientes fuera.

## Consecuencias

- Se requiere coordinación con la infraestructura del banco para obtener los SPKI y la clave de reemplazo custodiada.
- El equipo asume una obligación operativa permanente: nunca rotar sin verificar el parque instalado.
- Se cierra T-03, hoy el riesgo abierto más alto.
