import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BankHeader, Button, HamburgerMenu} from '@components/index';
import {BankProduct} from '@/types/index';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS} from '@constants/theme';
import {RootStackParamList} from '@/types/index';
import {formatCurrency} from '@utils/helpers';
import {AuthService} from '@services/index';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const getStatusStyle = (status: BankProduct['status']) => {
  switch (status) {
    case 'active':
      return styles.status_active;
    case 'pending':
      return styles.status_pending;
    case 'rejected':
      return styles.status_rejected;
    default:
      return styles.status_pending;
  }
};

// Datos de ejemplo
const MOCK_PRODUCTS: BankProduct[] = [
  {
    id: '1',
    type: 'savings_account',
    name: 'Cuenta de Ahorros',
    description: 'Caja de Ahorros en Bolivianos',
    status: 'active',
    balance: 15750.5,
  },
  {
    id: '2',
    type: 'credit_card',
    name: 'Tarjeta de Crédito Visa',
    description: 'Visa Platinum',
    status: 'active',
    balance: 2340.0,
    creditLimit: 10000.0,
  },
  {
    id: '3',
    type: 'loan',
    name: 'Préstamo Personal',
    description: 'Préstamo de consumo',
    status: 'pending',
    balance: 25000.0,
    interestRate: 12.5,
  },
];

export const ProductsScreen: React.FC = () => {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);

  const getProductIcon = (type: BankProduct['type']): string => {
    switch (type) {
      case 'savings_account':
        return '💰';
      case 'credit_card':
        return '💳';
      case 'loan':
        return '📊';
      case 'investment':
        return '📈';
      default:
        return '📄';
    }
  };

  const renderProduct = ({item}: {item: BankProduct}) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        rootNavigation.navigate('Chat', {
          prefillMessage: `Quiero solicitar ${item.name}.`,
        })
      }>
      <View style={styles.productHeader}>
        <Text style={styles.productIcon}>{getProductIcon(item.type)}</Text>
        <View style={styles.productHeaderText}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription}>{item.description}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status === 'active' ? 'Activo' : 'Pendiente'}</Text>
        </View>
      </View>
      <View style={styles.productBody}>
        {item.balance !== undefined && (
          <View style={styles.productInfo}>
            <Text style={styles.productInfoLabel}>
              {item.type === 'credit_card' ? 'Saldo usado:' : 'Saldo:'}
            </Text>
            <Text style={styles.productInfoValue}>{formatCurrency(item.balance)}</Text>
          </View>
        )}
        {item.creditLimit !== undefined && (
          <View style={styles.productInfo}>
            <Text style={styles.productInfoLabel}>Límite de crédito:</Text>
            <Text style={styles.productInfoValue}>{formatCurrency(item.creditLimit)}</Text>
          </View>
        )}
        {item.interestRate !== undefined && (
          <View style={styles.productInfo}>
            <Text style={styles.productInfoLabel}>Tasa de interés:</Text>
            <Text style={styles.productInfoValue}>{item.interestRate}% anual</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BankHeader
        title="Productos"
        onMenuPress={() => setMenuVisible(true)}
        onNotificationPress={() =>
          rootNavigation.navigate('Chat', {prefillMessage: 'Mostrar notificaciones.'})
        }
        onProfilePress={() => rootNavigation.navigate('Profile')}
      />
      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Solicitudes por chat</Text>
        <Text style={styles.noticeText}>
          Todos los productos se solicitan desde el Asistente para guiarte paso a paso.
        </Text>
      </View>
      <FlatList
        data={MOCK_PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tienes productos activos</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <Button
          title="Solicitar producto en el chat"
          fullWidth
          onPress={() =>
            rootNavigation.navigate('Chat', {
              prefillMessage: 'Quiero solicitar un producto nuevo.',
            })
          }
        />
      </View>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentRoute="Products"
        onNavigate={routeName => rootNavigation.navigate(routeName)}
        onOpenHistory={history =>
          rootNavigation.navigate('Chat', {
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
  noticeCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#DDE8F9',
    backgroundColor: '#F2F7FF',
    padding: SPACING.md,
  },
  noticeTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  noticeText: {
    color: '#5F6E85',
  },
  list: {
    padding: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E7EDF6',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  productHeaderText: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.xs,
  },
  status_active: {
    backgroundColor: COLORS.success,
  },
  status_pending: {
    backgroundColor: COLORS.warning,
  },
  status_rejected: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.medium,
  },
  productBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  productInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productInfoValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
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
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
