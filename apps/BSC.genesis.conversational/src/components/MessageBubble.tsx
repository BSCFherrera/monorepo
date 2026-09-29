import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Message} from '@/types/index';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS} from '@constants/theme';
import {formatTime} from '@utils/helpers';
import {MessageContent} from './MessageContent';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({message}) => {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <MessageContent
          content={message.content}
          textStyle={[styles.messageText, isUser ? styles.userText : styles.botText]}
        />
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
    width: '100%',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  userBubble: {
    backgroundColor: '#EAF0FF',
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  botBubble: {
    backgroundColor: COLORS.botMessage,
    borderWidth: 1,
    borderColor: '#EBEFF6',
    borderBottomLeftRadius: BORDER_RADIUS.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  userText: {
    color: '#1B2340',
  },
  botText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    fontWeight: FONT_WEIGHTS.regular,
  },
  userTimestamp: {
    color: '#6F7D95',
    textAlign: 'right',
  },
  botTimestamp: {
    color: COLORS.textSecondary,
  },
});
