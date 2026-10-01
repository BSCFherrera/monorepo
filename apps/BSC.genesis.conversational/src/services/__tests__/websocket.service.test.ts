import {WebSocketService, WebSocketServiceError} from '../websocket.service';
import {ConnectionStatus} from '@/types/index';

/**
 * Estado de la conexión del chat: lo que la pantalla necesita para decidir si
 * muestra «Reconectando…» o el aviso de que no se pudo conectar, sin tener que
 * interpretar mensajes de error.
 */

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onmessage: ((event: {data: unknown}) => void) | null = null;
  onerror: ((event: {message?: string}) => void) | null = null;
  onclose: ((event: {code: number; reason: string}) => void) | null = null;
  sent: string[] = [];

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
  }

  simulateOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  /** Lo que hace React Native cuando el servidor no responde: `error` y luego `close`. */
  simulateConnectionFailure() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onerror?.({message: 'Connection refused'});
    this.onclose?.({code: 1006, reason: ''});
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({data});
  }
}

const latestSocket = () => FakeWebSocket.instances[FakeWebSocket.instances.length - 1];

const RECONNECT_INTERVAL = 1000;
const MAX_ATTEMPTS = 2;

const createService = () => {
  const service = new WebSocketService({
    url: 'ws://chat.test/ws',
    reconnectInterval: RECONNECT_INTERVAL,
    maxReconnectAttempts: MAX_ATTEMPTS,
  });
  const statuses: ConnectionStatus[] = [];
  const errors: WebSocketServiceError[] = [];
  service.onStatusChange(status => statuses.push(status));
  service.onError(error => errors.push(error as WebSocketServiceError));
  return {service, statuses, errors};
};

describe('WebSocketService — estado de la conexión', () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    FakeWebSocket.instances = [];
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    globalThis.WebSocket = originalWebSocket;
  });

  it('pasa de connecting a connected cuando el socket abre', () => {
    const {service, statuses} = createService();

    expect(service.getStatus()).toBe('idle');

    service.connect();
    expect(service.getStatus()).toBe('connecting');

    latestSocket().simulateOpen();
    expect(service.getStatus()).toBe('connected');
    expect(statuses).toEqual(['connecting', 'connected']);
  });

  it('un corte de conexión se anuncia como reconnecting y los errores llegan como kind "connection"', () => {
    const {service, errors} = createService();

    service.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateConnectionFailure();

    expect(service.getStatus()).toBe('reconnecting');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every(error => error.kind === 'connection')).toBe(true);

    // El reintento programado crea un socket nuevo y sigue en reconnecting hasta que abra.
    jest.advanceTimersByTime(RECONNECT_INTERVAL);
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(service.getStatus()).toBe('reconnecting');

    latestSocket().simulateOpen();
    expect(service.getStatus()).toBe('connected');
  });

  it('agotados los reintentos queda en failed y deja de intentar por su cuenta', () => {
    const {service, statuses, errors} = createService();

    service.connect();
    latestSocket().simulateConnectionFailure();

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      jest.advanceTimersByTime(RECONNECT_INTERVAL);
      latestSocket().simulateConnectionFailure();
    }

    expect(service.getStatus()).toBe('failed');
    expect(statuses[statuses.length - 1]).toBe('failed');
    expect(errors[errors.length - 1]?.kind).toBe('connection');

    const socketsBefore = FakeWebSocket.instances.length;
    jest.advanceTimersByTime(RECONNECT_INTERVAL * 10);
    expect(FakeWebSocket.instances).toHaveLength(socketsBefore);
  });

  it('retry tras failed reinicia el ciclo completo de reintentos', () => {
    const {service} = createService();

    service.connect();
    latestSocket().simulateConnectionFailure();
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      jest.advanceTimersByTime(RECONNECT_INTERVAL);
      latestSocket().simulateConnectionFailure();
    }
    expect(service.getStatus()).toBe('failed');

    service.retry();
    expect(service.getStatus()).toBe('connecting');

    // Con el contador reiniciado, un nuevo fallo vuelve a reintentar en lugar de rendirse.
    latestSocket().simulateConnectionFailure();
    expect(service.getStatus()).toBe('reconnecting');

    jest.advanceTimersByTime(RECONNECT_INTERVAL);
    latestSocket().simulateOpen();
    expect(service.getStatus()).toBe('connected');
  });

  it('disconnect vuelve a idle y no programa reconexiones', () => {
    const {service} = createService();

    service.connect();
    latestSocket().simulateOpen();
    service.disconnect();

    expect(service.getStatus()).toBe('idle');
    jest.advanceTimersByTime(RECONNECT_INTERVAL * 10);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('un mensaje ilegible es un error kind "parse" y no cambia el estado de la conexión', () => {
    const {service, errors} = createService();

    service.connect();
    latestSocket().simulateOpen();
    latestSocket().simulateMessage('{no es json');

    expect(service.getStatus()).toBe('connected');
    expect(errors.map(error => error.kind)).toEqual(['parse']);
  });

  it('onStatusChange devuelve una función que cancela la suscripción', () => {
    const service = new WebSocketService({url: 'ws://chat.test/ws'});
    const handler = jest.fn();
    const unsubscribe = service.onStatusChange(handler);

    unsubscribe();
    service.connect();

    expect(handler).not.toHaveBeenCalled();
  });
});
