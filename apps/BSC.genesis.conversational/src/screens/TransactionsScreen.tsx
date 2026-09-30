import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BankHeader, HamburgerMenu} from '@components/index';
import {Transaction} from '@/types/index';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS} from '@constants/theme';
import {RootStackParamList} from '@/types/index';
import {formatCurrency, formatDate} from '@utils/helpers';
import {AuthService} from '@services/index';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getStatusStyle = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return styles.status_completed;
    case 'pending':
      return styles.status_pending;
    case 'failed':
      return styles.status_failed;
    case 'cancelled':
      return styles.status_cancelled;
    default:
      return styles.status_pending;
  }
};

// Datos de ejemplo
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'transfer',
    amount: 1500.0,
    currency: 'DOP',
    date: new Date(2026, 4, 17),
    status: 'completed',
    fromAccount: '****1234',
    toAccount: '****5678',
    description: 'Transferencia a Juan Pérez',
  },
  {
    id: '2',
    type: 'payment',
    amount: 350.5,
    currency: 'DOP',
    date: new Date(2026, 4, 16),
    status: 'completed',
    fromAccount: '****1234',
    description: 'Pago de servicio eléctrico',
  },
  {
    id: '3',
    type: 'deposit',
    amount: 5000.0,
    currency: 'DOP',
    date: new Date(2026, 4, 15),
    status: 'completed',
    fromAccount: '****1234',
    description: 'Depósito en efectivo',
  },
];

export const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);

  const renderTransaction = ({item}: {item: Transaction}) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {item.type === 'transfer' ? '→' : item.type === 'payment' ? '💳' : '↓'}
        </Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.transactionAmountText,
            item.type === 'deposit' ? styles.amountPositive : styles.amountNegative,
          ]}>
          {item.type === 'deposit' ? '+' : '-'}
          {formatCurrency(item.amount, item.currency)}
        </Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Completada' : 'Pendiente'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BankHeader
        title="Consulta de transacciones"
        onMenuPress={() => setMenuVisible(true)}
        onNotificationPress={() =>
          navigation.navigate('Chat', {prefillMessage: 'Mostrar notificaciones.'})
        }
        onProfilePress={() => navigation.navigate('Profile')}
      />
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Este mes</Text>
          <Text style={styles.summaryValue}>RD$ 45,220.00</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Salidas</Text>
          <Text style={styles.summaryValue}>RD$ 18,430.00</Text>
        </View>
      </View>
      <FlatList
        data={MOCK_TRANSACTIONS}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay transacciones disponibles</Text>
          </View>
        }
      />

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentRoute="Transactions"
        onNavigate={routeName => navigation.navigate(routeName)}
        onOpenHistory={history =>
          navigation.navigate('Chat', {
            prefillMessage: `Abrir historial: ${history.title}`,
          })
        }
        onLogout={() => AuthService.logout()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5EBF5',
    padding: SPACING.md,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#6E7C94',
  },
  summaryValue: {
    marginTop: SPACING.xs,
    color: '#1A2438',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  list: {
    padding: SPACING.md,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionIconText: {
    fontSize: FONT_SIZES.title,
  },
  transactionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmountText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  amountPositive: {
    color: COLORS.success,
  },
  amountNegative: {
    color: '#1A2438',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  status_completed: {
    backgroundColor: COLORS.success,
  },
  status_pending: {
    backgroundColor: COLORS.warning,
  },
  status_failed: {
    backgroundColor: COLORS.error,
  },
  status_cancelled: {
    backgroundColor: COLORS.textDisabled,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
