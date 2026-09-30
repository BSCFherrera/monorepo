import {WebSocketMessage, WebSocketConfig} from '@/types/index';
import {APP_CONFIG} from '@constants/config';
import SessionService from './session.service';
import {Platform} from 'react-native';

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Error) => void;
type ConnectionHandler = (isConnected: boolean) => void;

/**
 * Servicio de WebSocket para comunicación en tiempo real con el servidor IA
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private isConnecting = false;
  private shouldReconnect = true;
  private pendingMessages: WebSocketMessage[] = [];
  private connectionAttemptId = 0;

  constructor(config?: Partial<WebSocketConfig>) {
    const sourceUrl = config?.url || APP_CONFIG.WEBSOCKET_URL;
    const runtimeUrl = this.resolveRuntimeUrl(config?.url || APP_CONFIG.WEBSOCKET_URL);

    this.config = {
      url: runtimeUrl,
      reconnectInterval: config?.reconnectInterval || APP_CONFIG.WEBSOCKET_RECONNECT_INTERVAL,
      maxReconnectAttempts:
        config?.maxReconnectAttempts || APP_CONFIG.WEBSOCKET_MAX_RECONNECT_ATTEMPTS,
    };

    this.debugLog('Configuracion inicial de WebSocket', {
      platform: Platform.OS,
      sourceUrl,
      runtimeUrl,
      reconnectInterval: this.config.reconnectInterval,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
    });
  }

  private debugLog(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();

    if (context) {
      console.log(`[WebSocketService][${timestamp}] ${message}`, context);
      return;
    }

    console.log(`[WebSocketService][${timestamp}] ${message}`);
  }

  /**
   * Ajusta localhost en Android (el emulador alcanza la laptop por 10.0.2.2).
   *
   * El esquema se deja tal cual: el `URL` de React Native solo tiene getters, así que la
   * conversión http(s) -> ws(s) que se intentaba asignando `protocol`/`hostname` lanzaba y
   * nunca ocurrió. El WebSocket de React Native acepta http(s) igual que ws(s). Esta versión
   * devuelve exactamente lo mismo que la anterior, sin las asignaciones que TypeScript rechaza.
   */
  private resolveRuntimeUrl(url: string): string {
    const parsedUrl = new URL(url);
    const esHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    const esLocalhostEnAndroid = Platform.OS === 'android' && parsedUrl.hostname === 'localhost';

    if (esHttp || esLocalhostEnAndroid) {
      return Platform.OS === 'android' ? url.replace('localhost', '10.0.2.2') : url;
    }

    return parsedUrl.toString();
  }

  /**
   * Conectar al WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      this.debugLog('Se omite connect porque ya existe una conexion activa o en progreso', {
        readyState: this.ws?.readyState,
        isConnecting: this.isConnecting,
      });
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;
    this.connectionAttemptId++;

    const currentAttemptId = this.connectionAttemptId;
    const connectionUrl = this.buildConnectionUrl();

    this.debugLog('Intentando conectar WebSocket', {
      attemptId: currentAttemptId,
      url: connectionUrl,
      reconnectAttempts: this.reconnectAttempts,
      pendingMessages: this.pendingMessages.length,
    });

    try {
      this.ws = new WebSocket(connectionUrl);
      this.debugLog('Instancia WebSocket creada', {
        attemptId: currentAttemptId,
        readyState: this.ws.readyState,
      });

      this.setupEventHandlers(currentAttemptId);
    } catch (error) {
      this.handleError(new Error(`Failed to create WebSocket: ${error}`));
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private buildConnectionUrl(): string {
    const clientId = SessionService.getClientId();

    try {
      const parsedUrl = new URL(this.config.url);
      parsedUrl.searchParams.set('clientId', clientId);
      return parsedUrl.toString();
    } catch {
      const separator = this.config.url.includes('?') ? '&' : '?';
      return `${this.config.url}${separator}clientId=${encodeURIComponent(clientId)}`;
    }
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    this.debugLog('Desconectando WebSocket por solicitud del cliente', {
      hasSocket: Boolean(this.ws),
      readyState: this.ws?.readyState,
      pendingMessages: this.pendingMessages.length,
    });

    this.shouldReconnect = false;
    this.clearReconnectTimer();
    // Invalida cualquier intento de conexión en curso: si el socket que se cierra abajo dispara
    // sus eventos de forma tardía (después de este `disconnect`, incluso después de un `connect`
    // posterior), `setupEventHandlers` los descarta comparando este id en vez de reaccionar sobre
    // el socket "actual", que para entonces puede ser otro.
    this.connectionAttemptId++;

    if (this.ws) {
      // Desasocia los handlers nativos antes de cerrar: aunque el guard de `connectionAttemptId`
      // ya alcanza para ignorar eventos tardíos, esto evita que el socket viejo dispare cualquier
      // callback en absoluto.
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.notifyConnectionHandlers(false);
  }

  /**
   * Enviar mensaje al servidor
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.debugLog('Enviando mensaje por WebSocket', {
          type: message.type,
          action: message.action,
          requestId: message.requestId,
          queueSizeBeforeSend: this.pendingMessages.length,
        });
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        this.handleError(new Error(`Failed to send message: ${error}`));
        this.pendingMessages.push(message);
        this.debugLog('Fallo envio, mensaje agregado a cola', {
          queueSizeAfterPush: this.pendingMessages.length,
        });
      }
    } else {
      // Guardar mensaje para enviar cuando se reconecte
      this.pendingMessages.push(message);
      this.debugLog('Socket no abierto, mensaje agregado a cola y se fuerza reconnect', {
        readyState: this.ws?.readyState,
        queueSizeAfterPush: this.pendingMessages.length,
      });
      this.connect();
    }
  }

  /**
   * Registrar handler para mensajes recibidos
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Registrar handler para errores
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Registrar handler para cambios de conexión
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Obtener estado de conexión
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Configurar event handlers del WebSocket. Cada handler descarta el evento si `attemptId` ya
   * no coincide con `connectionAttemptId` (p. ej. porque se llamó `disconnect`/`connect` de
   * nuevo mientras este socket seguía abriéndose o cerrándose): sin este guard, un evento tardío
   * de un socket ya abandonado puede notificar como "desconectado" -o disparar un reconnect- a un
   * socket más nuevo que sí sigue activo, dando la impresión de dos conexiones pisándose entre sí.
   */
  private setupEventHandlers(attemptId: number): void {
    if (!this.ws) {return;}

    const isStale = () => attemptId !== this.connectionAttemptId;

    this.ws.onopen = () => {
      if (isStale()) {return;}

      this.debugLog('WebSocket conectado', {
        readyState: this.ws?.readyState,
        reconnectAttempts: this.reconnectAttempts,
        pendingMessages: this.pendingMessages.length,
      });

      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.notifyConnectionHandlers(true);
      this.sendPendingMessages();
    };

    this.ws.onmessage = event => {
      if (isStale()) {return;}

      try {
        this.debugLog('Mensaje recibido del WebSocket', {
          dataType: typeof event.data,
          rawLength: typeof event.data === 'string' ? event.data.length : undefined,
        });

        const rawMessage = JSON.parse(event.data);
        console.log('[WebSocketService] Objeto recibido:', rawMessage);

        const message: WebSocketMessage = {
          type: rawMessage.type || 'message',
          action: rawMessage.action,
          data: rawMessage.data ?? rawMessage,
          toolData: rawMessage.toolData,
          timestamp: rawMessage.timestamp || Date.now(),
          requestId: rawMessage.requestId,
        };

        this.debugLog('Mensaje parseado correctamente', {
          type: message.type,
          action: message.action,
          requestId: message.requestId,
        });

        this.notifyMessageHandlers(message);
      } catch (error) {
        this.debugLog('No se pudo parsear mensaje entrante', {
          error: `${error}`,
          rawData:
            typeof event.data === 'string'
              ? event.data.slice(0, 200)
              : '[payload no string recibido]',
        });
        this.handleError(new Error(`Failed to parse message: ${error}`));
      }
    };

    this.ws.onerror = (event: Event) => {
      if (isStale()) {return;}

      // En React Native, el evento onerror es un WebSocketErrorEvent; extraer el mensaje real
      const wsEvent = event as unknown as {message?: string; type?: string};
      const errorDetail = wsEvent.message ?? wsEvent.type ?? JSON.stringify(event);
      this.debugLog('Evento onerror de WebSocket', {
        readyState: this.ws?.readyState,
        error: errorDetail,
      });
      this.handleError(new Error(`WebSocket error: ${errorDetail}`));
    };

    this.ws.onclose = event => {
      if (isStale()) {return;}

      this.debugLog('WebSocket cerrado', {
        code: event.code,
        reason: event.reason,
        shouldReconnect: this.shouldReconnect,
        reconnectAttempts: this.reconnectAttempts,
      });

      this.isConnecting = false;
      this.notifyConnectionHandlers(false);

      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Programar reconexión
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.debugLog('Se alcanzo el maximo de reintentos de reconexion', {
        reconnectAttempts: this.reconnectAttempts,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
      });
      this.handleError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.clearReconnectTimer();
    this.reconnectAttempts++;

    this.debugLog('Programando reconexion', {
      reconnectAttempts: this.reconnectAttempts,
      reconnectIntervalMs: this.config.reconnectInterval,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  /**
   * Limpiar timer de reconexión
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      this.debugLog('Limpiando timer de reconexion');
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Enviar mensajes pendientes
   */
  private sendPendingMessages(): void {
    const initialQueueSize = this.pendingMessages.length;

    if (initialQueueSize > 0) {
      this.debugLog('Iniciando flush de cola de mensajes pendientes', {
        queueSize: initialQueueSize,
      });
    }

    while (this.pendingMessages.length > 0 && this.isConnected()) {
      const message = this.pendingMessages.shift();
      if (message) {
        this.send(message);
      }
    }

    if (initialQueueSize > 0) {
      this.debugLog('Flush de cola finalizado', {
        remainingQueueSize: this.pendingMessages.length,
      });
    }
  }

  /**
   * Notificar a los handlers de mensajes
   */
  private notifyMessageHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Notificar a los handlers de errores
   */
  private handleError(error: Error): void {
    this.debugLog('Error procesado por WebSocketService', {
      message: error.message,
      stack: error.stack,
    });

    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }

  /**
   * Notificar a los handlers de conexión
   */
  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }
}

// Exportar instancia singleton
export default new WebSocketService();
