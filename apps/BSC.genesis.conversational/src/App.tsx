import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './navigation';
import { DeviceInfoService, PushNotificationService } from '@services/index';
import { useAuthStore } from '@store/auth.store';
import { useSessionInactivityWatcher } from '@hooks/useSessionInactivityWatcher';
import { InactivityProvider } from './providers/InactivityProvider';
import '@i18n/i18n.config';
import { BscLoaderProvider } from '@bsc/design-system';

const App: React.FC = () => {
  const setDeviceInfo = useAuthStore(state => state.setDeviceInfo);

  useSessionInactivityWatcher();

  useEffect(() => {
    PushNotificationService.initialize();
    DeviceInfoService.buildDeviceInfo().then(setDeviceInfo);
  }, [setDeviceInfo]);

  return (
    <SafeAreaProvider>
      <BscLoaderProvider>
        {/* backgroundColor y translucent ya no existen en RN 0.87 (edge-to-edge). */}
        <StatusBar barStyle="dark-content" />
        <InactivityProvider>
          <Navigation />
        </InactivityProvider>
      </BscLoaderProvider>
    </SafeAreaProvider>
  );
};

export default App;
