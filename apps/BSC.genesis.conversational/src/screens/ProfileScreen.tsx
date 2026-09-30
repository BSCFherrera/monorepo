import React from 'react';
import {Alert, Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BankHeader, Button, HamburgerMenu, Input} from '@components/index';
import {COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS} from '@constants/theme';
import {useAuthStore} from '@store/auth.store';
import {formatDominicanPhone, formatFullName} from '@utils/helpers';
import {RootStackParamList} from '@/types/index';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({onLogout}) => {
  const navigation = useNavigation<RootNavigationProp>();
  const nombreCompleto = useAuthStore(state => state.user?.nombreCompleto);
  const emailPrincipal = useAuthStore(state => state.user?.emailPrincipal);
  const telefonos = useAuthStore(state => state.user?.telefonos);
  const primerTelefono = telefonos?.[0];

  const [name, setName] = React.useState(nombreCompleto ? formatFullName(nombreCompleto) : '');
  const [email, setEmail] = React.useState(emailPrincipal ? emailPrincipal.toLowerCase() : '');
  const [phone, setPhone] = React.useState(
    primerTelefono
      ? formatDominicanPhone(primerTelefono.codigoArea, primerTelefono.numeroTelefono)
      : '',
  );
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleSave = () => {
    Alert.alert('Perfil actualizado', 'Los cambios fueron guardados correctamente.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BankHeader
        title="Editar perfil"
        onMenuPress={() => setMenuVisible(true)}
        onNotificationPress={() =>
          navigation.navigate('Chat', {prefillMessage: 'Mostrar notificaciones.'})
        }
        onProfilePress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userCard}>
          <Image source={require('@assets/bsc-icon.png')} style={styles.avatar} />
          <Text style={styles.userName}>Perfil personal</Text>
          <Text style={styles.userEmail}>Mantén tus datos actualizados</Text>
        </View>

        <View style={styles.formCard}>
          <Input label="Nombre completo" value={name} onChangeText={setName} />
          <Input
            label="Correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input label="Telefono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Button
            title="Guardar cambios"
            onPress={handleSave}
            fullWidth
            style={styles.primaryButton}
          />
          <Button title="Volver" variant="outline" onPress={() => navigation.goBack()} fullWidth />
        </View>

        <View style={styles.logoutContainer}>
          <Button title="Cerrar sesion" variant="text" onPress={onLogout} fullWidth />
        </View>
      </ScrollView>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        currentRoute="Profile"
        onLogout={onLogout}
        onNavigate={routeName => navigation.navigate(routeName)}
        onOpenHistory={history =>
          navigation.navigate('Chat', {
            prefillMessage: `Abrir historial: ${history.title}`,
          })
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  content: {
    padding: SPACING.md,
  },
  userCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E7EDF7',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#152238',
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: '#667489',
  },
  formCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E7EDF7',
  },
  primaryButton: {
    marginBottom: SPACING.sm,
  },
  logoutContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
