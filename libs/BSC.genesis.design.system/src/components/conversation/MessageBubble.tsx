import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { parseBoldText } from '../../utils/parseBoldText';
import { styles } from './styles';
import type { MessageBubbleProps } from './types';

export function MessageBubble({
  children,
  direction = 'incoming',
  timestampLabel,
  message,
}: MessageBubbleProps) {
  const legacyDirection = mapSenderToDirection(message?.sender);
  const resolvedDirection = legacyDirection ?? direction;
  const resolvedChildren = children ?? message?.content;
  const resolvedTimestamp = timestampLabel ?? formatTimestamp(message?.timestamp);
  const isOutgoing = resolvedDirection === 'outgoing';
  const segments = useMemo(
    () => (typeof resolvedChildren === 'string' ? parseBoldText(resolvedChildren) : null),
    [resolvedChildren],
  );

  return (
    <View style={[styles.bubbleContainer, isOutgoing ? styles.outgoingContainer : styles.incomingContainer]}>
      <View
        style={[
          styles.bubble,
          isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isOutgoing ? styles.outgoingText : styles.incomingText,
          ]}
        >
          {segments
            ? segments.map((seg, i) => (
                <Text key={i} style={seg.bold ? styles.boldText : undefined}>
                  {seg.text}
                </Text>
              ))
            : resolvedChildren}
        </Text>
        {resolvedTimestamp && (
          <Text
            style={[
              styles.timestamp,
              isOutgoing ? styles.outgoingTimestamp : styles.incomingTimestamp,
            ]}
          >
            {resolvedTimestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

function mapSenderToDirection(sender?: string): MessageBubbleProps['direction'] | undefined {
  switch (sender?.toLowerCase()) {
    case 'user':
    case 'me':
    case 'outgoing':
      return 'outgoing';
    case 'other':
    case 'bot':
    case 'assistant':
    case 'incoming':
      return 'incoming';
    default:
      return undefined;
  }
}

function formatTimestamp(timestamp?: string | number | Date) {
  if (timestamp == null) return undefined;
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
