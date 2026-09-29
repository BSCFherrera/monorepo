/** Tipo de enlace especial detectado dentro de un mensaje del bot. */
export type MessageLinkType = 'tel' | 'mailto' | 'url';

export interface MessageTextSegment {
  kind: 'text';
  text: string;
  bold: boolean;
}

export interface MessageLinkSegment {
  kind: 'link';
  linkType: MessageLinkType;
  /** Texto visible, ej. "809.726.1000" */
  label: string;
  /** Valor completo del enlace, ej. "tel:+18097261000" */
  url: string;
}

/**
 * Segmento genérico producido por `parseMessageContent`. Para sumar una nueva variación de
 * texto en la burbuja (ej. una mención `@usuario` o una lista), se agrega un nuevo `kind` acá
 * y su regla de detección correspondiente, sin tocar los segmentos existentes.
 */
export type MessageSegment = MessageTextSegment | MessageLinkSegment;
