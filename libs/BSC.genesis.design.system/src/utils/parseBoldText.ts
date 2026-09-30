export interface TextSegment {
  text: string;
  bold: boolean;
}

/**
 * Parse text containing **bold** markers into segments.
 * Pure function with no side effects.
 */
export function parseBoldText(input: string): TextSegment[] {
  const parts: TextSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: input.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    parts.push({ text: input.slice(lastIndex), bold: false });
  }

  return parts.length > 0 ? parts : [{ text: input, bold: false }];
}
