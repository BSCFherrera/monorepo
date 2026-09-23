import { NivelDeRiesgo } from '../../../../core/security/operationRisk';
import {
  authorized,
  failed,
  type SigningOutcome,
} from '../../../../core/security/signingOutcome';
import {
  autorizarOperacion,
  MotivoDelCodigo,
  type PasosDeAutorizacion,
} from '../authorizeOperation';

/**
 * Un banco de pruebas de la compuerta, sin teléfono y sin interfaz.
 *
 * Registra qué se llamó y con qué motivo: la política de seguridad se comprueba
 * mirando **qué caminos se recorren**, no solo el resultado.
 */
function pasos(opciones: {
  puedeFirmar?: boolean;
  firma?: SigningOutcome;
  codigo?: string | null;
}): PasosDeAutorizacion & {
  firmoAlguienVez: () => boolean;
  motivoDelCodigo: () => MotivoDelCodigo | null;
  pidioCodigo: () => boolean;
} {
  let firmo = false;
  let motivo: MotivoDelCodigo | null = null;
  let pidio = false;

  return {
    puedeFirmar: async () => opciones.puedeFirmar ?? true,
    firmar: async () => {
      firmo = true;
      return opciones.firma ?? authorized('auth-firma');
    },
    pedirCodigo: async razon => {
      pidio = true;
      motivo = razon;
      return opciones.codigo === undefined ? 'auth-codigo' : opciones.codigo;
    },
    firmoAlguienVez: () => firmo,
    motivoDelCodigo: () => motivo,
    pidioCodigo: () => pidio,
  };
}

describe('operación cotidiana con dispositivo enrolado', () => {
  it('se autoriza con la firma y sin código', async () => {
    // Es la ganancia de experiencia de todo el proyecto: el cliente pone el
    // dedo y no teclea nada.
    const banco = pasos({ firma: authorized('auth-firma') });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Cotidiana, banco);

    expect(resultado.autorizacionId).toBe('auth-firma');
    expect(banco.pidioCodigo()).toBe(false);
  });

  it('si el cliente CANCELA la biometría no se le ofrece un código', async () => {
    /*
      Es la regla de seguridad más importante de este archivo. Ofrecerle el
      código entrenaría al cliente a esquivar la verificación que acaba de
      rechazar, y entonces la biometría dejaría de proteger nada: bastaría con
      cancelarla para llegar a un camino más débil.
    */
    const banco = pasos({
      firma: failed(
        'Verificación cancelada. No autorizamos la operación.',
        false,
      ),
    });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Cotidiana, banco);

    expect(resultado.autorizacionId).toBeNull();
    expect(banco.pidioCodigo()).toBe(false);
    expect(resultado.aviso).toContain('cancelada');
  });

  it('un fallo del dispositivo sí cae al código', async () => {
    // La llave invalidada o un reto que no llegó son problemas del teléfono,
    // no decisiones del cliente.
    const banco = pasos({
      firma: failed('La biometría de este teléfono cambió.', true),
    });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Cotidiana, banco);

    expect(resultado.autorizacionId).toBe('auth-codigo');
    expect(banco.motivoDelCodigo()).toBe(MotivoDelCodigo.TrasFalloDeFirma);
    expect(resultado.aviso).toContain('biometría');
  });

  it('si el código tampoco se completa, no hay autorización', async () => {
    const banco = pasos({
      firma: failed('Falló la firma.', true),
      codigo: null,
    });

    expect(
      (await autorizarOperacion(NivelDeRiesgo.Cotidiana, banco)).autorizacionId,
    ).toBeNull();
  });
});

describe('operación cotidiana sin dispositivo enrolado', () => {
  it('el código es la vía legítima, y no se intenta firmar', async () => {
    const banco = pasos({ puedeFirmar: false });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Cotidiana, banco);

    expect(resultado.autorizacionId).toBe('auth-codigo');
    expect(banco.firmoAlguienVez()).toBe(false);
    expect(banco.motivoDelCodigo()).toBe(MotivoDelCodigo.UnicaVia);
  });
});

describe('operación de alto riesgo', () => {
  it('con dispositivo enrolado pide la firma Y el código', async () => {
    // La firma sola no alcanza, y el código solo tampoco: el segundo canal es
    // lo que impide que un teléfono comprometido se baste solo.
    const banco = pasos({ firma: authorized('auth-firma') });

    await autorizarOperacion(NivelDeRiesgo.Elevado, banco);

    expect(banco.firmoAlguienVez()).toBe(true);
    expect(banco.pidioCodigo()).toBe(true);
    expect(banco.motivoDelCodigo()).toBe(MotivoDelCodigo.VerificacionAdicional);
  });

  it('se queda con la autorización del código, no con la de la firma', async () => {
    // Es la más reciente y la que el backend va a consumir.
    const banco = pasos({
      firma: authorized('auth-firma'),
      codigo: 'auth-codigo',
    });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Elevado, banco);

    expect(resultado.autorizacionId).toBe('auth-codigo');
  });

  it('una biometría cancelada detiene la operación también aquí', async () => {
    const banco = pasos({
      firma: failed('Verificación cancelada.', false),
    });

    const resultado = await autorizarOperacion(NivelDeRiesgo.Elevado, banco);

    expect(resultado.autorizacionId).toBeNull();
    expect(banco.pidioCodigo()).toBe(false);
  });

  it('sin dispositivo enrolado se autoriza con el código', async () => {
    const banco = pasos({ puedeFirmar: false });

    expect(
      (await autorizarOperacion(NivelDeRiesgo.Elevado, banco)).autorizacionId,
    ).toBe('auth-codigo');
  });
});

describe('consulta', () => {
  it('no se autoriza nada, y no se molesta al cliente', async () => {
    // Llegar aquí con una consulta es un error de quien llama; emitir una
    // autorización que nadie pidió sería peor que detenerse.
    const banco = pasos({});

    const resultado = await autorizarOperacion(NivelDeRiesgo.Consulta, banco);

    expect(resultado.autorizacionId).toBeNull();
    expect(banco.firmoAlguienVez()).toBe(false);
    expect(banco.pidioCodigo()).toBe(false);
  });
});
