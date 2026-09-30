import React from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BankHeader} from '@components/BankHeader';
import {BottomTabParamList, RootStackParamList} from '@/types/index';
import {BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING} from '@constants/theme';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabsNavigationProp = BottomTabNavigationProp<BottomTabParamList>;

export const HomeScreen: React.FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const tabNavigation = useNavigation<TabsNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <BankHeader onProfilePress={() => rootNavigation.navigate('Profile')} />

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Hola, Jeison</Text>
          <Text style={styles.heroBody}>Gestiona tu banca diaria desde un solo lugar.</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => tabNavigation.navigate('Transactions')}>
            <Text style={styles.cardIcon}>▦</Text>
            <Text style={styles.cardTitle}>Consultar transacciones</Text>
            <Text style={styles.cardText}>Movimientos recientes y detalle por fecha.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => tabNavigation.navigate('Chat')}>
            <Text style={styles.cardIcon}>✦</Text>
            <Text style={styles.cardTitle}>Asistente principal</Text>
            <Text style={styles.cardText}>Solicita productos y resuelve dudas por chat.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => rootNavigation.navigate('Profile')}>
            <Text style={styles.cardIcon}>◉</Text>
            <Text style={styles.cardTitle}>Editar perfil</Text>
            <Text style={styles.cardText}>Actualiza tus datos y preferencias.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  heroBody: {
    color: '#DDE8FF',
    fontSize: FONT_SIZES.md,
  },
  grid: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E4EAF4',
  },
  cardIcon: {
    color: COLORS.primary,
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    color: '#131B29',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  cardText: {
    color: '#667085',
    fontSize: FONT_SIZES.sm,
  },
});
