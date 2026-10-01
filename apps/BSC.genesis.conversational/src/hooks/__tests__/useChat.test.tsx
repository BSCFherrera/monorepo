import React from 'react';
import TestRenderer from 'react-test-renderer';
import {ConnectionStatus, WebSocketErrorKind} from '@/types/index';
import {useChat} from '../useChat';

/**
 * Cómo traduce `useChat` lo que pasa con el WebSocket a lo que ve el cliente: los
 * problemas de conectividad se comunican con `connectionStatus` y nunca se escriben en el
 * historial del chat.
 */

type Handler<T> = (value: T) => void;

const mockHandlers = {
  error: new Set<Handler<Error & {kind: WebSocketErrorKind}>>(),
  status: new Set<Handler<ConnectionStatus>>(),
  connection: new Set<Handler<boolean>>(),
  message: new Set<Handler<unknown>>(),
};

const subscribe =
  <T,>(set: Set<Handler<T>>) =>
  (handler: Handler<T>) => {
    set.add(handler);
    return () => set.delete(handler);
  };

jest.mock('@services/index', () => ({
  SessionService: {getClientId: () => 'CLIENTE'},
  WebSocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    retry: jest.fn(),
    getStatus: jest.fn(() => 'idle'),
    onError: (handler: Handler<Error & {kind: WebSocketErrorKind}>) =>
      subscribe(mockHandlers.error)(handler),
    onStatusChange: (handler: Handler<ConnectionStatus>) =>
      subscribe(mockHandlers.status)(handler),
    onConnectionChange: (handler: Handler<boolean>) =>
      subscribe(mockHandlers.connection)(handler),
    onMessage: (handler: Handler<unknown>) => subscribe(mockHandlers.message)(handler),
  },
}));

const {WebSocketService: mockService} = jest.requireMock('@services/index') as {
  WebSocketService: {retry: jest.Mock; send: jest.Mock};
};

let chat: ReturnType<typeof useChat>;

const Harness: React.FC = () => {
  chat = useChat();
  return null;
};

const emit = <T,>(set: Set<Handler<T>>, value: T) => {
  TestRenderer.act(() => {
    set.forEach(handler => handler(value));
  });
};

const wsError = (message: string, kind: WebSocketErrorKind) =>
  Object.assign(new Error(message), {kind});

describe('useChat — conectividad', () => {
  let renderer: TestRenderer.ReactTestRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    TestRenderer.act(() => {
      renderer = TestRenderer.create(<Harness />);
    });
  });

  afterEach(() => {
    TestRenderer.act(() => {
      renderer.unmount();
    });
    jest.restoreAllMocks();
  });

  it('un error de conexión no agrega ninguna burbuja al historial', () => {
    emit(mockHandlers.error, wsError('WebSocket error: Connection refused', 'connection'));
    emit(mockHandlers.error, wsError('Max reconnection attempts reached', 'connection'));
    emit(mockHandlers.error, wsError('Failed to send message: boom', 'send'));

    expect(chat.messages).toEqual([]);
  });

  it('expone el estado de la conexión y deja de mostrar "escribiendo" al reconectar', () => {
    emit(mockHandlers.connection, true);
    emit(mockHandlers.status, 'connected');
    TestRenderer.act(() => {
      chat.sendMessage('Hola');
    });
    expect(chat.isTyping).toBe(true);

    emit(mockHandlers.status, 'reconnecting');

    expect(chat.connectionStatus).toBe('reconnecting');
    expect(chat.isTyping).toBe(false);
    // Solo queda el mensaje del usuario: el corte no se escribió como burbuja.
    expect(chat.messages.map(message => message.sender)).toEqual(['user']);
  });

  it('tras agotar los reintentos expone failed y retryConnection vuelve a intentar', () => {
    emit(mockHandlers.status, 'failed');
    expect(chat.connectionStatus).toBe('failed');

    TestRenderer.act(() => {
      chat.retryConnection();
    });

    expect(mockService.retry).toHaveBeenCalledTimes(1);
  });

  it('un mensaje ilegible del servidor sigue mostrándose como burbuja de error', () => {
    emit(mockHandlers.error, wsError('Failed to parse message: SyntaxError', 'parse'));

    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0]).toMatchObject({sender: 'bot', type: 'error'});
  });
});
