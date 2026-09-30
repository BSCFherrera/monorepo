import {PermissionsAndroid, Platform} from 'react-native';

class PushNotificationService {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.requestPermission();
    this.initialized = true;
  }

  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }
}

export default new PushNotificationService();
