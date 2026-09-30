import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles } from '../theme/typography';

export interface BscMessageBubbleProps {
  children?: React.ReactNode;
  direction?: 'incoming' | 'outgoing';
  timestampLabel?: string;
  message?: {
    sender?: string;
    content?: React.ReactNode;
    timestamp?: string | number | Date;
  };
  testID?: string;
}

export function BscMessageBubble({
  children,
  direction = 'incoming',
  timestampLabel,
  message,
  testID,
}: BscMessageBubbleProps): React.JSX.Element {
  const legacyDirection = mapSenderToDirection(message?.sender);
  const resolvedDirection = legacyDirection ?? direction;
  const outgoing = resolvedDirection === 'outgoing';
  const content = children ?? message?.content;
  const timestamp = timestampLabel ?? formatTimestamp(message?.timestamp);
  const segments = useMemo(
    () => (typeof content === 'string' ? parseBoldText(content) : null),
    [content],
  );

  return (
    <View style={[styles.wrapper, outgoing && styles.wrapperOutgoing]} testID={testID}>
      <View style={[styles.bubble, outgoing ? styles.outgoing : styles.incoming]}>
        <Text style={[styles.text, outgoing ? styles.outgoingText : styles.incomingText]}>
          {segments !== null
            ? segments.map((segment, index) => (
                <Text key={index} style={segment.bold ? styles.boldText : undefined}>
                  {segment.text}
                </Text>
              ))
            : content}
        </Text>
        {timestamp === undefined ? null : (
          <Text style={[styles.timestamp, outgoing ? styles.outgoingTimestamp : styles.incomingTimestamp]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
}

function formatTimestamp(value: string | number | Date | undefined): string | undefined {
  if (value === undefined) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapSenderToDirection(sender?: string): BscMessageBubbleProps['direction'] | undefined {
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

function parseBoldText(input: string): Array<{ text: string; bold: boolean }> {
  const parts = input.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map(part => {
    const bold = part.startsWith('**') && part.endsWith('**');
    return { text: bold ? part.slice(2, -2) : part, bold };
  });
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: BscSpacing.md,
    paddingHorizontal: BscSpacing.sm,
    alignItems: 'flex-start',
  },
  wrapperOutgoing: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    padding: BscSpacing.md,
    borderRadius: BscRadius.md,
  },
  incoming: {
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
    borderBottomLeftRadius: BscRadius.xs,
  },
  outgoing: {
    backgroundColor: BscColors.primaryLight,
    borderBottomRightRadius: BscRadius.xs,
  },
  text: {
    ...BscTextStyles['Body S/14 Regular'],
  },
  boldText: {
    ...BscTextStyles['Body S/14 Bold'],
  },
  incomingText: {
    color: BscColors.textPrimary,
  },
  outgoingText: {
    color: BscColors.textOnDark,
  },
  timestamp: {
    ...BscTextStyles['Caption/12 Regular'],
    marginTop: BscSpacing.xs,
  },
  incomingTimestamp: {
    color: BscColors.textSecondary,
  },
  outgoingTimestamp: {
    color: BscColors.textSecondary,
    textAlign: 'right',
  },
});
