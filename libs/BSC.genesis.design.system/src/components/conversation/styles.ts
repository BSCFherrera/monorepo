import { StyleSheet } from 'react-native';
import { tokens } from '../../tokens';

export const styles = StyleSheet.create({
  // MessageBubble
  bubbleContainer: {
    width: '100%',
    marginBottom: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
  },
  outgoingContainer: {
    alignItems: 'flex-end',
  },
  incomingContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
  },
  outgoingBubble: {
    backgroundColor: tokens.colors.outgoingBubble,
    borderBottomRightRadius: tokens.radii.xs,
  },
  incomingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEFF6',
    borderBottomLeftRadius: tokens.radii.xs,
  },
  bubbleText: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.regular,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: tokens.fontWeights.bold,
  },
  outgoingText: {
    color: tokens.colors.outgoingText,
  },
  incomingText: {
    color: tokens.colors.text,
  },
  timestamp: {
    fontSize: tokens.fontSizes.xs,
    marginTop: tokens.spacing.xs,
    fontWeight: tokens.fontWeights.regular,
  },
  outgoingTimestamp: {
    color: '#6F7D95',
    textAlign: 'right',
  },
  incomingTimestamp: {
    color: tokens.colors.textSecondary,
  },

  // TypingIndicator
  typingContainer: {
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 16,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    alignSelf: 'flex-start',
  },
  sphereWrap: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#95B8FF',
  },
  midRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#4D8DFF',
    borderTopColor: '#67E8F9',
    borderRightColor: '#22C55E',
  },
  core: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A66F7',
    borderWidth: 1,
    borderColor: '#7BB2FF',
  },
  spark: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7CF6D0',
    position: 'absolute',
  },
});
