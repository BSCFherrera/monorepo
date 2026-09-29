import React from 'react';
import {Modal, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import Icon from '@react-native-vector-icons/feather';

import {COLORS, DIMENSIONS, SPACING} from '@constants/theme';

interface PdfFullScreenViewerProps {
  /** Controla la visibilidad del visor */
  visible: boolean;
  /** URI local (file://) del documento a visualizar */
  uri: string;
  /** Función para cerrar el visor y regresar a la pantalla anterior */
  onClose: () => void;
}

export const PdfFullScreenViewer: React.FC<PdfFullScreenViewerProps> = ({visible, uri, onClose}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.backButton}>
            <Icon name="arrow-left" size={DIMENSIONS.iconSize.md} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {visible && (
          <Pdf
            source={{uri}}
            enablePaging
            style={styles.pdf}
            onError={error => console.warn('[PdfFullScreenViewer] Error al renderizar el PDF:', error)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});
