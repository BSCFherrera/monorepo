export interface BoldTextSegment {
  text: string;
  bold: boolean;
}

// Non-greedy + dotAll (s) para negritas multilínea, unicode (u) para emojis/acentos como un solo code point.
const BOLD_PATTERN = /\*\*(.+?)\*\*/gsu;

/**
 * Convierte un string con delimitadores `**negrita**` en segmentos {text, bold}.
 * Si no hay delimitadores (caso normal del backend), devuelve un único segmento sin negrita.
 * Un `**` sin cierre se deja como texto literal, no rompe el parseo.
 */
export const parseBoldText = (content: string): BoldTextSegment[] => {
  if (!content || !content.includes('**')) {
    return [{text: content, bold: false}];
  }

  const segments: BoldTextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  BOLD_PATTERN.lastIndex = 0;
  while ((match = BOLD_PATTERN.exec(content)) !== null) {
    const [fullMatch, boldText] = match;

    if (!boldText) {
      continue;
    }

    if (match.index > lastIndex) {
      segments.push({text: content.slice(lastIndex, match.index), bold: false});
    }

    segments.push({text: boldText, bold: true});
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    segments.push({text: content.slice(lastIndex), bold: false});
  }

  return segments.length > 0 ? segments : [{text: content, bold: false}];
};
