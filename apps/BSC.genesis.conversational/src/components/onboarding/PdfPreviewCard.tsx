import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from '@react-native-vector-icons/feather';

import {BORDER_RADIUS, COLORS, DIMENSIONS, SHADOWS, SPACING} from '@constants/theme';

const PREVIEW_HEIGHT = 260;

interface PdfPreviewCardProps {
  /** URI local (file://) del documento a previsualizar */
  uri: string;
  /** Acción al presionar la tarjeta o el botón de expandir */
  onPress: () => void;
}

export const PdfPreviewCard: React.FC<PdfPreviewCardProps> = ({uri, onPress}) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
        <View style={styles.accentBar} />
        <Pdf
          source={{uri}}
          page={1}
          singlePage
          scrollEnabled={false}
          fitPolicy={0}
          style={styles.pdf}
          onError={error => console.warn('[PdfPreviewCard] Error al renderizar el PDF:', error)}
        />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.expandButton}>
        <Icon name="chevron-down" size={DIMENSIONS.iconSize.md} color={COLORS.backgroundLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    width: '100%',
    height: PREVIEW_HEIGHT,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  accentBar: {
    width: 4,
    backgroundColor: COLORS.primaryLight,
  },
  pdf: {
    flex: 1,
    height: PREVIEW_HEIGHT,
    backgroundColor: COLORS.backgroundLight,
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -SPACING.lg,
    ...SHADOWS.small,
  },
});
