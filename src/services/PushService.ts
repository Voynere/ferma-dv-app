import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NotificationService from './NotificationService';
import { navigate } from '../components/Navigation';
import { version as APP_VERSION } from '../../package.json';

const WP_BASE = 'https://ferma-dv.ru';

class PushService {
  async init() {
    try {
      await this.requestPermissionAndGetToken();
      messaging().onTokenRefresh(async (token) => {
        try {
          await AsyncStorage.setItem('fcmToken', token);
          await this.registerTokenOnServer(token);
        } catch (e) {
          console.log('[FCM] token refresh error:', e);
        }
      });
    } catch (e) {
      console.log('[FCM] init error:', e);
    }
  }

  async requestAndroidNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  async requestPermissionAndGetToken() {
    await this.requestAndroidNotificationPermission();

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[FCM] permission not granted');
      return null;
    }

    const token = await messaging().getToken();

    if (token) {
      console.log('[FCM] token:', token);
      await AsyncStorage.setItem('fcmToken', token);
      await this.registerTokenOnServer(token);
    }

    return token;
  }

  async registerTokenOnServer(token: string) {
    try {
      const { default: useAuthStore } = await import('../store/auth');
      const { userData } = useAuthStore.getState();

      const payload = {
        token,
        platform: Platform.OS,
        phone: userData?.phoneNumber || '',
        app_version: APP_VERSION,
      };

      const response = await axios.post(
        `${WP_BASE}/wp-json/ferma/v1/push/register`,
        payload
      );

      console.log(
        '[FCM] token registered on server FULL:',
        JSON.stringify(response.data, null, 2)
      );

      return response.data;
    } catch (error: any) {
      console.log('[FCM] register token FULL error');
      console.log('message:', error?.message);
      console.log('status:', error?.response?.status);
      console.log('data:', error?.response?.data);
      console.log('headers:', error?.response?.headers);
      console.log('raw error:', error);
      return null;
    }
  }

  setupListeners() {
    try {
      messaging().onMessage(async (remoteMessage) => {
        if (remoteMessage.notification) {
          NotificationService.showLocalNotification(
            remoteMessage.notification.title || '',
            remoteMessage.notification.body || '',
            remoteMessage.data || {}
          );
        }
        if (remoteMessage.data?.action === 'order_delivered') {
          NotificationService.scheduleRepeatOrderReminders();
        }
      });

      messaging().onNotificationOpenedApp((remoteMessage) => {
        this.handlePushNavigation(remoteMessage?.data);
      });

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            this.handlePushNavigation(remoteMessage?.data);
          }
        })
        .catch((e: any) => console.log('[FCM] getInitialNotification error:', e));
    } catch (e) {
      console.log('[FCM] setupListeners error:', e);
    }
  }

  handlePushNavigation(data?: { [key: string]: string }) {
    if (!data) return;

    switch (data.screen) {
      case 'catalog':
        navigate('catalog');
        break;

      case 'cart':
        navigate('cart');
        break;

      case 'profile':
        navigate('profile');
        break;

      case 'delivery':
        navigate('delivery');
        break;

      case 'orderDetails':
      case 'history':
        navigate('profile');
        break;

      default:
        navigate('home');
        break;
    }
  }
}

export default new PushService();