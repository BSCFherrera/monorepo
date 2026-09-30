import type { ReactNode } from 'react';

export interface MessageBubbleProps {
  children?: ReactNode;
  direction?: 'incoming' | 'outgoing';
  timestampLabel?: string;
  message?: {
    sender?: string;
    content?: ReactNode;
    timestamp?: string | number | Date;
  };
}

export interface TypingIndicatorProps {
  label?: string;
  animated?: boolean;
}
