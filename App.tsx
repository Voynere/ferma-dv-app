import React, { useEffect, useRef } from 'react';
import { Appearance, AppState, AppStateStatus } from 'react-native';
import RootLayout from './src/RootLayout';
import NotificationService from './src/services/NotificationService';
import PushService from './src/services/PushService';
import useProfileStore from './src/store/profile';
import useCartStore from './src/store/cart';

Appearance.setColorScheme('light');

export default function App() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    async function initialize() {
      try {
        NotificationService.initialize();
        await NotificationService.requestPermissions();

        await PushService.init();
        PushService.setupListeners();

        await NotificationService.updateLastActivityDate();
        await NotificationService.checkAndScheduleNotifications();

        await useProfileStore.getState().checkBirthdayBonusOnLaunch();
      } catch (error) {
        console.log('Init error:', error);
      }
    }

    initialize();

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prev = appState.current;
      appState.current = nextState;

      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        const { cartList } = useCartStore.getState();
        if (cartList.length > 0) {
          NotificationService.scheduleQuickAbandonedCartNotification();
        }
      } else if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        NotificationService.cancelQuickAbandonedCartNotification();
      }
    });

    return () => subscription.remove();
  }, []);

  return <RootLayout />;
}