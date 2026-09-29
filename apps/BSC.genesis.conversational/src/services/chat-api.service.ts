import {APP_CONFIG} from '@constants/config';
import {ChatApiRequest, ChatApiResponse} from '@/types/index';

class ChatApiService {
  async sendMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT);

    try {
      const response = await fetch(APP_CONFIG.CHAT_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: request.question,
          top_k: request.topK ?? APP_CONFIG.CHAT_API_TOP_K,
          conversation_id: request.conversationId,
          client_id: request.clientId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`El endpoint respondio ${response.status}: ${errorBody || 'sin detalle'}`);
      }

      const payload = (await response.json()) as ChatApiResponse;
      return this.normalizeResponse(payload);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La consulta al asistente excedio el tiempo de espera.');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private normalizeResponse(payload: ChatApiResponse): ChatApiResponse {
    const reply = payload.reply?.trim() || payload.content?.trim() || payload.message?.trim() || '';

    if (!reply) {
      throw new Error('El asistente no devolvio una respuesta util.');
    }

    return {
      ...payload,
      reply,
    };
  }
}

export default new ChatApiService();
