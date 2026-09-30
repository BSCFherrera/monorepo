import React, {useCallback, useMemo, useState} from 'react';
import {StyleProp, StyleSheet, Text, TextStyle} from 'react-native';

import {ExternalLinkWarningModal} from '@components/Common/ExternalLinkWarningModal';
import {COLORS, FONT_WEIGHTS} from '@constants/theme';
import {
  callPhoneNumber,
  MessageLinkType,
  openExternalWebsite,
  parseMessageContent,
  sendEmail,
} from '@utils/messageContent';

interface MessageContentProps {
  content: string;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Renderiza el texto de un mensaje del chat interpretando sus variaciones: negritas, y enlaces
 * de teléfono, correo o sitio web (`[label](url)`). Es el punto único donde conviven todas las
 * reglas de formato de la burbuja — sumar una nueva variación implica extender
 * `parseMessageContent` y, si aplica, el switch de `handleLinkPress`.
 */
export const MessageContent: React.FC<MessageContentProps> = ({content, textStyle}) => {
  const segments = useMemo(() => parseMessageContent(content), [content]);
  const [pendingWebsiteUrl, setPendingWebsiteUrl] = useState<string | null>(null);

  const handleLinkPress = useCallback((linkType: MessageLinkType, label: string, url: string) => {
    switch (linkType) {
      case 'tel':
        callPhoneNumber(label, url);
        break;
      case 'mailto':
        sendEmail(url);
        break;
      case 'url':
        setPendingWebsiteUrl(url);
        break;
    }
  }, []);

  const handleConfirmWebsite = useCallback(() => {
    if (pendingWebsiteUrl) {
      openExternalWebsite(pendingWebsiteUrl);
    }
    setPendingWebsiteUrl(null);
  }, [pendingWebsiteUrl]);

  const handleCancelWebsite = useCallback(() => setPendingWebsiteUrl(null), []);

  return (
    <>
      <Text style={textStyle}>
        {segments.map((segment, index) => {
          if (segment.kind === 'link') {
            return (
              <Text
                key={index}
                style={LINK_STYLES[segment.linkType]}
                onPress={() => handleLinkPress(segment.linkType, segment.label, segment.url)}>
                {segment.label}
              </Text>
            );
          }
          return (
            <Text key={index} style={segment.bold && styles.boldText}>
              {segment.text}
            </Text>
          );
        })}
      </Text>

      <ExternalLinkWarningModal
        visible={pendingWebsiteUrl !== null}
        url={pendingWebsiteUrl ?? ''}
        onConfirm={handleConfirmWebsite}
        onCancel={handleCancelWebsite}
      />
    </>
  );
};

const styles = StyleSheet.create({
  boldText: {
    fontWeight: FONT_WEIGHTS.bold,
  },
  telLink: {
    fontWeight: FONT_WEIGHTS.bold,
    textDecorationLine: 'underline',
    color: COLORS.primaryDark,
  },
  mailtoLink: {
    fontWeight: FONT_WEIGHTS.bold,
    textDecorationLine: 'underline',
    color: COLORS.primaryDark,
  },
  urlLink: {
    fontWeight: FONT_WEIGHTS.bold,
    textDecorationLine: 'underline',
    color: COLORS.primary,
  },
});

const LINK_STYLES: Record<MessageLinkType, StyleProp<TextStyle>> = {
  tel: styles.telLink,
  mailto: styles.mailtoLink,
  url: styles.urlLink,
};
