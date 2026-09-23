import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Endpoints } from '../endpoints';

/**
 * Paridad contra el contrato real del backend.
 *
 * Esto es lo que P-03 pedía: en vez de deducir el contrato leyendo los
 * controladores de C#, se descarga el Swagger que el backend publica y **se
 * comprueba que cada ruta que la app usa exista de verdad**.
 *
 * La app Flutter llegó a tener constantes de rutas inexistentes: compilaban
 * perfectamente y fallaban en ejecución, cuando un cliente ya estaba dentro de
 * un flujo. El comentario de `api_endpoints.dart` lo dice: «solo paths que el
 * backend realmente expone pertenecen aquí; los que no existían fueron
 * removidos». Esta prueba es lo que impide que vuelvan a entrar.
 *
 * El archivo está versionado en `docs/migration/contratos/`, con la fecha de
 * descarga, para que la comprobación funcione sin el backend levantado.
 */

const RUTA_SWAGGER = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'docs',
  'migration',
  'contratos',
  'swagger-v1.json',
);

const disponible = existsSync(RUTA_SWAGGER);
const describeSiHaySwagger = disponible ? describe : describe.skip;

if (!disponible) {
  // eslint-disable-next-line no-console
  console.warn(
    '[paridad] No se encontró swagger-v1.json. La comparación se omite.',
  );
}

interface Swagger {
  paths: Record<string, Record<string, unknown>>;
}

/**
 * Las rutas del Swagger llevan la versión como plantilla
 * (`/api/v{version}/auth/login`); la app las usa resueltas (`/api/v1/...`).
 */
function rutasDelSwagger(): Map<string, string[]> {
  const spec = JSON.parse(readFileSync(RUTA_SWAGGER, 'utf8')) as Swagger;
  const mapa = new Map<string, string[]>();

  for (const [ruta, operaciones] of Object.entries(spec.paths)) {
    const resuelta = ruta.replace('{version}', '1');
    mapa.set(
      normalizar(resuelta),
      Object.keys(operaciones).map(m => m.toLowerCase()),
    );
  }

  return mapa;
}

/**
 * Normaliza una ruta para poder compararla.
 *
 * Dos diferencias de forma, ninguna de fondo:
 *
 *  - **Mayúsculas.** El Swagger publica el segmento del controlador tal como se
 *    llama la clase de C# (`/api/v1/Auth/login`), mientras los tres clientes lo
 *    escriben en minúscula (`/api/v1/auth/login`). ASP.NET enruta sin distinguir
 *    mayúsculas, así que las dos formas funcionan; conservar la minúscula
 *    mantiene la app alineada con el portal, que es la implementación de
 *    referencia.
 *  - **Parámetros de ruta**, que cada lado nombra a su manera.
 */
function normalizar(ruta: string): string {
  return ruta.replace(/\{[^}]+\}/g, '{id}').toLowerCase();
}

describeSiHaySwagger('paridad con el contrato publicado del backend', () => {
  const swagger = rutasDelSwagger();
  const normalizadas = new Set(swagger.keys());
  const metodosDe = (ruta: string): string[] =>
    swagger.get(normalizar(ruta)) ?? [];

  it('el contrato descargado tiene rutas', () => {
    expect(swagger.size).toBeGreaterThan(40);
  });

  it('TODA ruta que la app usa existe en el backend', () => {
    // Si esta prueba falla, hay una ruta que compilaría bien y fallaría en
    // ejecución, con un cliente ya metido en el flujo.
    const inexistentes = Object.entries(Endpoints)
      .filter(([, ruta]) => !normalizadas.has(normalizar(ruta)))
      .map(([nombre, ruta]) => `${nombre} → ${ruta}`);

    expect(inexistentes).toEqual([]);
  });

  it('la errata «retrive» del backend sigue ahí', () => {
    // Si el backend la corrigiera, esta prueba se pondría en rojo y nos
    // enteraríamos antes que el cliente.
    expect(normalizadas.has(Endpoints.ncfDetail)).toBe(true);
    expect(Endpoints.ncfDetail).toContain('/retrive');
  });

  it('las rutas de dispositivos existen con sus métodos', () => {
    // Son la base de la autorización de transacciones, así que se comprueban
    // una por una en vez de en bloque.
    for (const ruta of [
      Endpoints.deviceRegister,
      Endpoints.deviceVerify,
      Endpoints.deviceRegisterKey,
      Endpoints.deviceChallenge,
      Endpoints.deviceVerifySignature,
    ]) {
      expect({ ruta, metodos: metodosDe(ruta) }).toEqual({
        ruta,
        metodos: expect.arrayContaining(['post']),
      });
    }
  });

  it('el listado de dispositivos acepta GET y la revocación DELETE', () => {
    expect(metodosDe(Endpoints.devices)).toEqual(
      expect.arrayContaining(['get']),
    );

    expect(metodosDe(`${Endpoints.devices}/{id}`)).toEqual(
      expect.arrayContaining(['delete']),
    );
  });

  it('los endpoints que mueven dinero existen y son POST', () => {
    for (const ruta of [
      Endpoints.paymentExecutionTransfer,
      Endpoints.creditCardPayment,
      Endpoints.creditCardBeneficiaryPayment,
      Endpoints.loanPayment,
    ]) {
      expect({ ruta, metodos: metodosDe(ruta) }).toEqual({
        ruta,
        metodos: expect.arrayContaining(['post']),
      });
    }
  });

  it('los métodos que la app usa coinciden con los publicados', () => {
    // Un GET donde el backend espera POST devuelve 405, y el mensaje no dice
    // nada útil.
    const esperados: Array<[string, string]> = [
      [Endpoints.login, 'post'],
      [Endpoints.me, 'get'],
      [Endpoints.refreshToken, 'post'],
      [Endpoints.products, 'post'],
      [Endpoints.productDetails, 'get'],
      [Endpoints.accountTransactions, 'get'],
      [Endpoints.creditCardTransactions, 'get'],
      // El backend la publica como GET pese a que la ruta termine en
      // `/retrieve`. Se descubrió con esta misma prueba.
      [Endpoints.loanTransactions, 'get'],
      [Endpoints.sessionConfiguration, 'get'],
    ];

    const desajustes = esperados
      .filter(([ruta, metodo]) => !(metodosDe(ruta) ?? []).includes(metodo))
      .map(
        ([ruta, metodo]) =>
          `${metodo.toUpperCase()} ${ruta} — publica: ${
            metodosDe(ruta)?.join(', ') ?? 'la ruta no existe'
          }`,
      );

    expect(desajustes).toEqual([]);
  });
});
