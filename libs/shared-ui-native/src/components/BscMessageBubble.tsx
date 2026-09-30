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
  const outgoing = direction === 'outgoing';
  const content = children ?? message?.content;
  const timestamp = timestampLabel ?? formatTimestamp(message?.timestamp);

  return (
    <View style={[styles.wrapper, outgoing && styles.wrapperOutgoing]} testID={testID}>
      {message?.sender === undefined ? null : <Text style={styles.sender}>{message.sender}</Text>}
      <View style={[styles.bubble, outgoing ? styles.outgoing : styles.incoming]}>
        {typeof content === 'string' ? <Text style={styles.text}>{content}</Text> : content}
      </View>
      {timestamp === undefined ? null : <Text style={styles.timestamp}>{timestamp}</Text>}
    </View>
  );
}

function formatTimestamp(value: string | number | Date | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    gap: BscSpacing.xs,
  },
  wrapperOutgoing: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: BscSpacing.md,
    paddingVertical: BscSpacing.sm,
    borderRadius: BscRadius.md,
  },
  incoming: {
    backgroundColor: BscColors.surfaceMuted,
  },
  outgoing: {
    backgroundColor: BscColors.primarySoft,
  },
  text: {
    ...BscTextStyles['Body S/14 Regular'],
    color: BscColors.textPrimary,
  },
  sender: {
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  timestamp: {
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textTertiary,
    alignSelf: 'flex-end',
  },
});
