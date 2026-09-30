// Primero las traducciones: todo lo que se importe después ya puede usarlas.
import './src/i18n';

import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppRoot } from './src/app/AppRoot';
import { BscColors } from '@bsc/design-system';

/**
 * Punto de entrada.
 *
 * La orientacion queda bloqueada en vertical como en la app Flutter
 * (`main.dart` fija portraitUp y portraitDown); eso se configura en el
 * manifiesto de Android, no aqui.
 *
 * El tema oscuro existe en Flutter pero esta apagado (`ThemeMode.light`), y se
 * conserva esa decision hasta resolver P-12.1.
 */
function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.raiz}>
        <AppRoot />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: BscColors.background,
  },
});

export default App;
