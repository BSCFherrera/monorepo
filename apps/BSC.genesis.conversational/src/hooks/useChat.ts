import {useEffect, useState, useRef, useCallback} from 'react';
import {SessionService, WebSocketService} from '@services/index';
import {
  ChatOption,
  Clarification,
  ConnectionStatus,
  Message,
  WebSocketErrorKind,
  WebSocketMessage,
} from '@/types/index';
import {WS_ACTIONS} from '@constants/config';

const createInitialMessages = (): Message[] => [];
const createConversationId = (clientId: string) => `mobile-${clientId}-${Date.now()}`;

const normalizeOptions = (rawOptions: unknown): ChatOption[] => {
  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions.reduce<ChatOption[]>((acc, option) => {
      if (!option || typeof option !== 'object') {
        return acc;
      }

      const candidate = option as {
        ref?: unknown;
        label?: unknown;
        product_type?: unknown;
        currency?: unknown;
      };

      const ref =
        typeof candidate.ref === 'string' || typeof candidate.ref === 'number'
          ? String(candidate.ref)
          : '';
      const label = typeof candidate.label === 'string' ? candidate.label : ref;

      if (!ref || !label) {
        return acc;
      }

      acc.push({
        ref,
        label,
        product_type: typeof candidate.product_type === 'string' ? candidate.product_type : undefined,
        currency: typeof candidate.currency === 'string' ? candidate.currency : undefined,
      });

      return acc;
    }, []);
};

const normalizeClarifications = (rawClarifications: unknown): Clarification[] => {
  if (!Array.isArray(rawClarifications)) {
    return [];
  }

  return rawClarifications.filter(
    clarification => Boolean(clarification) && typeof clarification === 'object',
  ) as Clarification[];
};

/**
 * Hook personalizado para gestionar el chat con el asistente IA
 */
export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(createInitialMessages());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    WebSocketService.getStatus(),
  );
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef(createConversationId(SessionService.getClientId()));

  useEffect(() => {
    const handleMessage = (wsMessage: WebSocketMessage) => {
      if (wsMessage.action !== 'bot_response' && wsMessage.type !== 'message') {
        return;
      }

      const payload = wsMessage.data || {};
      const botReply = payload.content?.trim() || payload.message?.trim() || '';
      const options = normalizeOptions(payload.options ?? wsMessage.toolData?.options);
      const clarifications = normalizeClarifications(
        payload.clarifications ?? wsMessage.toolData?.clarifications,
      );

      if (!botReply) {
        return;
      }

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        content: botReply,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          conversationId: payload.conversation_id || payload.conversationId || undefined,
          intent: payload.intent,
          intentCategory: payload.intent_category,
          isTransactional: payload.is_transactional,
          executionAllowed: payload.execution_allowed,
          requiresAuthentication: payload.requires_authentication,
          requiresConfirmation: payload.requires_confirmation,
          handoffRequired: payload.handoff_required,
          riskLevel: payload.risk_level,
          nextAction: payload.next_action,
          latencyMs: payload.latency_ms,
          options,
          clarifications,
        },
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setError(null);
    };

    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };

    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);

      // Sin conexión la respuesta pendiente ya no va a llegar por este socket: se quita el
      // "escribiendo" y la pantalla muestra el aviso de reconexión en su lugar.
      if (status === 'reconnecting' || status === 'failed') {
        setIsTyping(false);
      }
    };

    const handleError = (err: Error & {kind?: WebSocketErrorKind}) => {
      setError(err.message);

      // Los problemas de conectividad (caídas, reintentos, envíos fallidos que quedan en
      // cola) se comunican con `connectionStatus`, fuera del historial: escribirlos como
      // burbuja alteraría la conversación. El servicio ya los registra en su log.
      if (err.kind !== 'parse') {
        return;
      }

      console.error('WebSocket error:', err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          content: err.message,
          sender: 'bot',
          timestamp: new Date(),
          type: 'error',
        },
      ]);
    };

    WebSocketService.connect();
    const unsubscribeMessage = WebSocketService.onMessage(handleMessage);
    const unsubscribeConnection = WebSocketService.onConnectionChange(handleConnectionChange);
    const unsubscribeError = WebSocketService.onError(handleError);
    const unsubscribeStatus = WebSocketService.onStatusChange(handleStatusChange);

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      unsubscribeError();
      unsubscribeStatus();
      WebSocketService.disconnect();
    };
  }, []);

  /**
   * Agregar mensaje del bot programáticamente
   */
  /**
   * Enviar mensaje del usuario. `viaVoice` es opcional: solo se envía el flag
   * en `data.metadata` cuando el texto proviene del reconocimiento de voz
   */
  const sendMessage = useCallback((content: string, viaVoice?: boolean) => {
    if (!content.trim()) {
      return;
    }

    const trimmedContent = content.trim();
    const normalizedClientId = SessionService.getClientId();

    if (!conversationIdRef.current.startsWith(`mobile-${normalizedClientId}-`)) {
      conversationIdRef.current = createConversationId(normalizedClientId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedContent,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    if (isConnected) {
      const data: {message: string; metadata?: {voice_input: true}} = {
        message: trimmedContent,
      };

      if (viaVoice) {
        data.metadata = {voice_input: true};
      }

      const wsMessage: WebSocketMessage = {
        type: 'message',
        action: WS_ACTIONS.SEND_MESSAGE,
        clientId: normalizedClientId,
        data,
        timestamp: Date.now(),
        requestId: userMessage.id,
      };

      WebSocketService.send(wsMessage);
      return;
    }

    setIsTyping(false);
    setError('No hay conexion al WebSocket configurado.');
    WebSocketService.connect();
  }, [isConnected]);

  /**
   * Limpiar historial de mensajes
   */
  const clearMessages = useCallback(() => {
    setMessages(createInitialMessages());
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reintentar la conexión a pedido del usuario (tras agotarse los reintentos automáticos)
   */
  const retryConnection = useCallback(() => {
    WebSocketService.retry();
  }, []);

  return {
    messages,
    isConnected,
    connectionStatus,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    clearError,
    retryConnection,
  };
};
