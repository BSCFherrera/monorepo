import {
  avisoDeError,
  avisoDeExito,
  presentarAviso,
} from '../avisoDeSeguridad';

/**
 * Cómo se presenta el aviso de la pantalla de Seguridad.
 *
 * **Esta prueba nace de un defecto visto en el Pixel (V-01).** Al terminar el
 * enrolamiento, la pantalla enseñaba la banda roja «No se pudo completar» con
 * el texto «Dispositivo registrado. Ya puedes autorizar con tu rostro o
 * huella.» debajo: un éxito anunciado como un fallo. La causa era que el
 * estado guardaba solo la cadena del mensaje y la banda tenía el tono, el
 * icono y el título escritos a mano en el JSX, así que todo lo que pasara por
 * ahí salía en rojo.
 *
 * Lo que se fija aquí es que **el tono viaja con el mensaje**. La decisión
 * vive en una función pura y no en el componente a propósito: las pruebas de
 * componente exigen `@testing-library/react-native`, que es dependencia nueva
 * y está bloqueada por D-14, de modo que un acierto escrito dentro del JSX no
 * lo vigila nadie. Este defecto sobrevivió a 844 pruebas justamente por eso.
 */

describe('el aviso de la pantalla de Seguridad', () => {
  it('presenta un éxito en verde y sin el título de error', () => {
    const presentado = presentarAviso(
      avisoDeExito(
        'Dispositivo registrado. Ya puedes autorizar con tu huella.',
      ),
    );

    expect(presentado.tono).toBe('success');
    expect(presentado.titulo).not.toBe('No se pudo completar');
    expect(presentado.subtitulo).toBe(
      'Dispositivo registrado. Ya puedes autorizar con tu huella.',
    );
  });

  it('presenta un fallo en rojo y con el título de error', () => {
    const presentado = presentarAviso(
      avisoDeError('No pudimos crear la llave de seguridad en este teléfono.'),
    );

    expect(presentado.tono).toBe('danger');
    expect(presentado.titulo).toBe('No se pudo completar');
    expect(presentado.subtitulo).toBe(
      'No pudimos crear la llave de seguridad en este teléfono.',
    );
  });

  /*
    Los tres caminos que el defecto afectaba, cada uno por su lado. Se prueban
    por separado y no en un bucle porque el que se coló fue el primero: un
    bucle que recorriera «los mensajes de éxito» habría necesitado que alguien
    se diera cuenta de que ese mensaje era uno de ellos, que es exactamente lo
    que no ocurrió.
  */

  it('el enrolamiento completado es un éxito', () => {
    expect(
      presentarAviso(
        avisoDeExito(
          'Dispositivo registrado. Este teléfono ofrece una protección menor, ' +
            'así que algunas operaciones seguirán pidiendo código.',
        ),
      ).tono,
    ).toBe('success');
  });

  it('la firma desactivada es un éxito, aunque apague una protección', () => {
    expect(
      presentarAviso(avisoDeExito('Firma desactivada en este dispositivo.'))
        .tono,
    ).toBe('success');
  });

  it('el enrolamiento que no arranca es un fallo', () => {
    expect(
      presentarAviso(
        avisoDeError(
          'Este teléfono no puede proteger la llave de firma. Puedes seguir ' +
            'operando con el código de verificación.',
        ),
      ).tono,
    ).toBe('danger');
  });

  it('un icono acompaña siempre al tono, para quien no distingue los colores', () => {
    expect(presentarAviso(avisoDeExito('Listo.')).icono).not.toBe(
      presentarAviso(avisoDeError('Falló.')).icono,
    );
  });
});
