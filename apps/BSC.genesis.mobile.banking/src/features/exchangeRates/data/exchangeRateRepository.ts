import type { AxiosInstance } from 'axios';

import { Endpoints } from '../../../core/network/endpoints';

import { parseTasas, type TasaDeCambio } from './exchangeRateContracts';

/**
 * Habla con `/currency-exchange/rates`.
 *
 * Portado de `exchange_rate_remote_datasource.dart`.
 *
 * **Un fallo aquí sí se propaga**, al revés que en las comisiones de una
 * transferencia. Allí un cero informativo era preferible a impedir la
 * operación; aquí la pantalla entera es la consulta, y enseñar una tabla vacía
 * como si el banco no tuviera tasas sería mentir. El original hace lo mismo: su
 * bloc tiene un estado de error con botón de reintentar.
 *
 * ⚠️ **El backend solo devuelve dólar y euro.** `GetCurrencyExchangeListQuery`
 * filtra por `CurrencyExchangeISOCode`, así que aunque el core mande más
 * monedas la app nunca las verá. Es decisión del backend y no se toca (P-03).
 */
export class ExchangeRateRepository {
  constructor(private readonly http: AxiosInstance) {}

  async tasas(): Promise<TasaDeCambio[]> {
    const respuesta = await this.http.get(Endpoints.exchangeRateList);
    return parseTasas(respuesta.data);
  }
}
