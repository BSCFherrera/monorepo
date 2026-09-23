import axios from 'axios';

import {
  parseLoginResponse,
  parseCurrentUser,
} from '../../../features/auth/data/authContracts';
import {
  agruparProductos,
  parseRespuestaProductos,
} from '../../../features/dashboard/data/productContracts';
import { calcularResumen } from '../../../features/dashboard/data/balanceSummary';
import { parsePerfilDeCliente } from '../../../features/customer/data/customerContracts';
import { extraerMovimientos } from '../../../features/productDetail/data/transactionContracts';
import { Endpoints } from '../endpoints';

/**
 * Pruebas de contrato **contra el backend real**.
 *
 * Todo lo demás en esta suite usa fixtures: sirven para probar los bordes, pero
 * no prueban que el backend devuelva lo que creemos. Esto sí. Es la diferencia
 * entre «mi parser maneja esta forma» y «mi parser maneja la forma que el
 * servidor manda hoy».
 *
 * **Las credenciales no están en el repositorio.** Se leen de variables de
 * entorno, y sin ellas la suite se omite entera. Escribir un usuario y una
 * contraseña en un archivo versionado es exactamente lo que el modelo de
 * amenazas prohíbe (T-10), por más que sea un ambiente de prueba.
 *
 * Para ejecutarlas, con el backend levantado:
 *
 *     $env:BSC_TEST_URL  = "http://localhost:5000"
 *     $env:BSC_TEST_USER = "<usuario>"
 *     $env:BSC_TEST_PASS = "<contraseña>"
 *     npx jest contratoEnVivo
 */

const URL = process.env.BSC_TEST_URL;
const USUARIO = process.env.BSC_TEST_USER;
const CLAVE = process.env.BSC_TEST_PASS;

const hayCredenciales =
  URL !== undefined && USUARIO !== undefined && CLAVE !== undefined;

const describeEnVivo = hayCredenciales ? describe : describe.skip;

if (!hayCredenciales) {
  // eslint-disable-next-line no-console
  console.warn(
    '[contrato] Sin BSC_TEST_URL / BSC_TEST_USER / BSC_TEST_PASS: ' +
      'las pruebas contra el backend real se omiten.',
  );
}

describeEnVivo('contrato contra el backend real', () => {
  const http = axios.create({
    baseURL: URL,
    timeout: 30_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Channel': 'MobileBanking',
      'X-Channel-Type': '2',
    },
  });

  let token = '';
  let customerCode = '';

  // Iniciar sesión una sola vez: cada login consume recursos del ambiente y
  // ensucia la bitácora de accesos del cliente de prueba.
  beforeAll(async () => {
    const respuesta = await http.post(Endpoints.login, {
      username: USUARIO,
      password: CLAVE,
      channel: '2',
    });

    const resultado = parseLoginResponse(respuesta.data);
    token = resultado.accessToken;
    customerCode = resultado.user.customerCode;

    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, 60_000);

  it('el login devuelve lo que el parser espera', () => {
    expect(token).not.toBe('');
    expect(customerCode).not.toBe('');
  });

  it('/auth/me devuelve el usuario en la forma esperada', async () => {
    const respuesta = await http.get(Endpoints.me);
    const usuario = parseCurrentUser(respuesta.data);

    expect(usuario.customerCode).toBe(customerCode);
    expect(usuario.fullName).not.toBe('');
  });

  it('el perfil del cliente se interpreta sin perder campos', async () => {
    const respuesta = await http.post(Endpoints.customerProfile, {
      customerCode,
    });
    const perfil = parsePerfilDeCliente(respuesta.data);

    expect(perfil.customerCode).not.toBe('');
  });

  it('la lista de productos se interpreta y agrupa', async () => {
    const respuesta = await http.post(Endpoints.products, { productType: '' });
    const datos = parseRespuestaProductos(respuesta.data);

    // El core devuelve fallos de negocio dentro de un HTTP 200.
    expect(datos.codigoResultado).toBe(0);
    expect(datos.productos.length).toBeGreaterThan(0);

    const agrupados = agruparProductos(datos.productos);

    // Si esto falla, hay categorías nuevas que la app no conoce. No es un error
    // —se muestran igual— pero conviene enterarse.
    if (agrupados.desconocidos.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        '[contrato] Categorías desconocidas: ' +
          [...new Set(agrupados.desconocidos.map(p => p.categoria))].join(', '),
      );
    }

    expect(
      agrupados.cuentas.length +
        agrupados.tarjetas.length +
        agrupados.prestamos.length +
        agrupados.certificados.length +
        agrupados.desconocidos.length,
    ).toBe(datos.productos.length);
  }, 60_000);

  it('el resumen patrimonial se calcula con datos reales', async () => {
    const respuesta = await http.post(Endpoints.products, { productType: '' });
    const agrupados = agruparProductos(
      parseRespuestaProductos(respuesta.data).productos,
    );

    const resumen = calcularResumen(agrupados);

    // Lo que importa no es el número, que cambia, sino que sea un número: un
    // NaN aquí dejaría el saldo del dashboard en blanco.
    expect(Number.isFinite(resumen.patrimonioNetoPesos)).toBe(true);
    expect(Number.isFinite(resumen.activosPesos)).toBe(true);
  }, 60_000);

  it('los movimientos de una cuenta real se interpretan', async () => {
    const respuestaProductos = await http.post(Endpoints.products, {
      productType: '',
    });
    const agrupados = agruparProductos(
      parseRespuestaProductos(respuestaProductos.data).productos,
    );

    const cuenta = agrupados.cuentas[0];
    if (cuenta === undefined) {
      // eslint-disable-next-line no-console
      console.warn('[contrato] El cliente de prueba no tiene cuentas.');
      return;
    }

    const hoy = new Date();
    const hace30 = new Date(hoy);
    hace30.setDate(hace30.getDate() - 30);
    const dmy = (f: Date): string =>
      `${String(f.getDate()).padStart(2, '0')}/${String(
        f.getMonth() + 1,
      ).padStart(2, '0')}/${f.getFullYear()}`;

    try {
      const respuesta = await http.get(Endpoints.accountTransactions, {
        params: {
          accountNumber: cuenta.identificacion,
          startDate: dmy(hace30),
          endDate: dmy(hoy),
        },
      });

      const movimientos = extraerMovimientos(respuesta.data);

      // Cada movimiento tiene que quedar con monto numérico y tipo definido: un
      // NaN o un tipo ausente muestra un cargo como un depósito.
      for (const movimiento of movimientos) {
        expect(Number.isFinite(movimiento.monto)).toBe(true);
        expect(['D', 'C']).toContain(movimiento.tipo);
      }
    } catch (causa) {
      const estado = (causa as { response?: { status?: number } }).response
        ?.status;
      // Un período sin movimientos llega como error; no es un fallo del parser.
      expect([400, 404]).toContain(estado);
    }
  }, 60_000);

  it('la política de sesión del backend se puede leer', async () => {
    const respuesta = await http.get(Endpoints.sessionConfiguration);
    expect(respuesta.status).toBe(200);
  });
});
