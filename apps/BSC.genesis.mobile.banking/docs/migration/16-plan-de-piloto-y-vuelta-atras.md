# Plan de piloto y de vuelta atrás

**Alcance:** `BSC.MobileAppRN`, Android · **Estado:** propuesta, pendiente de aprobación

---

## 0. La premisa que lo cambia todo

**La app Flutter nunca estuvo en producción.** No hay usuarios que migrar, no hay
datos en un teléfono que convertir, no hay una versión anterior que deje de
funcionar. Esto no es una migración con clientes encima: es **el primer
lanzamiento de la aplicación móvil del banco**, que da la casualidad de que tiene
un antecesor interno.

Conviene decirlo en voz alta porque cambia el plan entero. Un piloto aquí no
sirve para comparar dos versiones en manos de clientes; sirve para **descubrir lo
que las pruebas no descubren**: teléfonos distintos, redes distintas, gente que
usa la app de formas que nadie previó.

Y la vuelta atrás, por lo mismo, es barata: se deja de repartir la app. Nadie se
queda sin servicio, porque el canal que los clientes usan hoy —el portal— no se
toca.

---

## 1. Lo que tiene que estar cerrado antes de empezar

Nada de esto es trabajo de desarrollo. Son **cinco decisiones del banco**, y sin
las tres primeras no se puede ni generar el paquete que se repartiría.

|          | Qué falta                                          | Sin ello                                                                                                |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **D-03** | Custodia del almacén de claves de release          | No hay APK firmado. Un almacén perdido = no se puede volver a publicar **nunca**                        |
| **D-18** | La URL del backend por ambiente y cómo se inyecta  | El APK de release **no habla con ningún backend**: la URL está vacía a propósito                        |
| **D-02** | Las huellas SPKI del certificado y su rotación     | La app acepta el certificado de cualquier proxy corporativo                                             |
| **D-04** | Encender `Enforce` en el guardián de transacciones | Una operación sin autorización válida **se ejecuta igual**, y solo queda anotada                        |
| **D-01** | Corregir la huella del portal Nuxt                 | Encender `Enforce` con el portal sin corregir **rompe toda transferencia del portal que cruce monedas** |

**D-01 y D-04 van juntas y en ese orden.** Es la dependencia más fácil de pasar
por alto de todo el proyecto: el teléfono ya está alineado con el backend, el
portal no, y el interruptor que protege al teléfono es el mismo que rompe al
portal.

Además, antes del piloto hay que cerrar las verificaciones en dispositivo
(V-01…V-17 de [`13-pendientes.md`](./13-pendientes.md)). No son decisiones: es
trabajo de una tarde con el teléfono conectado.

---

## 2. Las tres fases

### Fase 0 — Interna · 2 semanas · ~15 personas

Fábrica Digital y Seguridad, con **cuentas reales de empleado**.

Es la primera vez que la app ve teléfonos que no son el Pixel de desarrollo. Lo
que se busca aquí no son defectos de negocio —esos ya los cubren 844 pruebas—
sino lo que solo aparece en hardware ajeno: teléfonos sin biometría registrada,
sin StrongBox, con Android 10, con la fuente del sistema al 130%, con poca
memoria.

**No se pasa de fase si:** falla un enrolamiento, una operación se ejecuta sin
autorización válida, o algo sensible aparece en `logcat`.

### Fase 1 — Piloto cerrado · 4 semanas · 50–100 clientes

Clientes reales invitados, elegidos con **criterios que se fijan por escrito
antes de invitar a nadie**: mezcla de productos (cuenta, tarjeta, préstamo),
mezcla de versiones de Android, y clientes que hoy usan el portal —para que
puedan comparar— junto a clientes que no.

Con límites operativos explícitos durante el piloto, que Riesgo debe fijar: un
tope por transferencia y un tope diario más bajos que los del portal. Un defecto
en una app nueva con tope alto es un incidente; con tope bajo es un aprendizaje.

**Qué se mide, y por qué esas cuatro:**

|                  | Señal                                       | Umbral para seguir               |
| ---------------- | ------------------------------------------- | -------------------------------- |
| **Enrolamiento** | % que completa el enrolamiento a la primera | ≥ 90%                            |
| **Autorización** | % de operaciones que la firma rechaza       | < 1%, y **cada una investigada** |
| **Estabilidad**  | sesiones sin fallo                          | ≥ 99,5%                          |
| **Soporte**      | tickets por cliente activo                  | menos que el portal              |

El de autorización es el importante. Un rechazo de firma no es ruido: o el
cliente está siendo atacado, o **nuestro cálculo de huella diverge del del
backend**, que es exactamente el defecto que D-01 describe en el portal. Cada
rechazo se mira uno a uno, no en agregado.

⚠️ **Hoy no hay forma de medir nada de esto.** No hay telemetría, no hay
reporte de fallos, y el backend solo anota en su bitácora. Elegir la herramienta
y qué se le manda es trabajo previo al piloto, y toca privacidad: lo que se mande
fuera del banco tiene que pasar por Cumplimiento (F-07).

### Fase 2 — Apertura gradual

Despliegue escalonado de Play Console —5%, 20%, 50%, 100%—, con al menos una
semana entre escalones y sin subir de escalón mientras haya un incidente abierto.

El escalonado de Play **no es instantáneo al revés**: detenerlo impide nuevas
instalaciones, pero quien ya la tiene se la queda (§3).

---

## 3. Vuelta atrás

**Lo primero, y es una limitación real, no un detalle:** en Android **no se puede
desinstalar una app a distancia**. Detener el despliegue impide nuevas
instalaciones; los teléfonos que ya la tienen siguen teniéndola. Cualquier plan
que dependa de «quitar la app» es un plan que no funciona.

Por eso la vuelta atrás se apoya en el **servidor**, que sí está bajo control.

| Nivel                        | Cómo                                                       | En cuánto                                                   | Qué consigue                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Detener el reparto**    | Play Console: parar el escalonado                          | minutos                                                     | Deja de crecer. No arregla a quien ya la tiene                                                                                                             |
| **2. Publicar un arreglo**   | Versión nueva por el escalonado                            | **horas o días** — la revisión de Play no se puede acelerar | El arreglo de verdad, pero lento                                                                                                                           |
| **3. Cortar por el backend** | Revocar los dispositivos enrolados, o negar el canal móvil | **minutos**                                                 | La app queda inservible **para todos a la vez**, tengan la versión que tengan                                                                              |
| **4. Apagar `Enforce`**      | Configuración del guardián                                 | minutos                                                     | Solo si el defecto está en la autorización misma. **Deja de proteger las operaciones**: es el último recurso, y se decide con Seguridad, nunca en caliente |

**El nivel 3 es el que de verdad da seguridad**, y hay que reconocer que es el
menos probado: existe el endpoint de revocación, y no se ha ejercitado nunca
contra un parque de dispositivos. Hay que probarlo en la fase 0.

### Quién decide, y sin reunión

Un plan de vuelta atrás que exige convocar a alguien no es un plan de vuelta
atrás. Por eso: **el responsable técnico de guardia puede ejecutar los niveles 1
y 3 por su cuenta y avisar después.** Los niveles 2 y 4 exigen a Seguridad.

Los tres casos que disparan el nivel 3 sin consultar a nadie:

1. Una operación ejecutada **sin** autorización válida.
2. Datos de un cliente visibles para otro.
3. Cualquier indicio de que la firma del dispositivo se puede eludir.

### Lo que no hace falta revertir

No hay migración de datos, así que **no hay nada que deshacer en la base**. Los
dispositivos enrolados sobreviven a una versión nueva; revocarlos obliga a
enrolar de nuevo, que es una molestia para el cliente, no una pérdida.

⚠️ **Sin probar:** que una actualización de la app **conserve** el enrolamiento.
Si la llave del Keystore se invalidara al actualizar, todos los clientes tendrían
que enrolarse otra vez y parecería una caída. Hay que verificarlo en la fase 0,
instalando una versión sobre otra con un dispositivo ya enrolado.

---

## 4. Lo que este plan da por supuesto

Y conviene que alguien lo confirme o lo desmienta, porque si alguna de estas
cuatro es falsa el plan cambia:

1. Que el canal de distribución es **Google Play**. Si fuera reparto interno
   —MDM, APK directo—, el escalonado y la vuelta atrás son otros.
2. Que **iOS no entra** en el piloto (P-13). No hay ni un módulo nativo escrito.
3. Que el backend y TokenBSC aguantan la carga. **Nadie lo ha medido.**
4. Que el portal sigue disponible durante todo el piloto, que es lo que hace
   barata la vuelta atrás.
