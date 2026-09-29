import {parseBoldText} from '../parseBoldText';
import {MessageLinkType, MessageSegment} from './types';

// Enlaces markdown tipo `[label](url)`. Cubre tel:, mailto: y sitios web (http/https).
const MARKDOWN_LINK_PATTERN = /\[([^[\]]+)\]\(([^()]+)\)/g;

const getLinkType = (url: string): MessageLinkType => {
  if (url.startsWith('tel:')) {
    return 'tel';
  }
  if (url.startsWith('mailto:')) {
    return 'mailto';
  }
  return 'url';
};

const toTextSegments = (chunk: string): MessageSegment[] =>
  parseBoldText(chunk).map(({text, bold}) => ({kind: 'text', text, bold}));

/**
 * Parsea el contenido de un mensaje del bot detectando enlaces markdown `[label](url)`
 * (teléfono, correo o sitio web) y delega el resto del texto a `parseBoldText` para mantener
 * el soporte de negritas (`**texto**`) y saltos de línea (los respeta `<Text>` de RN nativamente).
 *
 * Para agregar una nueva variación (ej. otro identificador de enlace), solo hace falta sumar
 * un caso a `getLinkType` y su manejador de acción en `linkActions.ts` — el resto de los
 * segmentos (negritas, texto plano) sigue funcionando igual.
 */
export const parseMessageContent = (content: string): MessageSegment[] => {
  if (!content) {
    return [{kind: 'text', text: content, bold: false}];
  }

  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MARKDOWN_LINK_PATTERN.lastIndex = 0;
  while ((match = MARKDOWN_LINK_PATTERN.exec(content)) !== null) {
    const [fullMatch, label, url] = match;

    if (match.index > lastIndex) {
      segments.push(...toTextSegments(content.slice(lastIndex, match.index)));
    }

    segments.push({kind: 'link', linkType: getLinkType(url), label, url});
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    segments.push(...toTextSegments(content.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : [{kind: 'text', text: content, bold: false}];
};
