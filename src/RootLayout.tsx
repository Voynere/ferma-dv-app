import React, { useEffect, useState } from 'react';
import {
  View,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  LogBox,
  StatusBar,
  StyleSheet
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { initializeDeepLinking } from './utils/deepLinking';

import HomeScreen from './pages/home';
import Navigation from './components/Navigation';
import WelcomeScreen from './components/WelcomeScreen';
import Profile from './pages/profile';
import Search from './pages/search';
import Favorite from './pages/favorite';
import Delivery from './pages/delivery';
import Contacts from './pages/contacts';
import Checkout from './pages/checkout';
import Cart from './pages/cart';
import Auth from './pages/auth';
import Notifications from './pages/notifications';
import CatalogScreen from './pages/catalog';
import NotFoundScreen from './pages/+not-found';
import CatalogDetails from "./pages/catalog/catalogDetails";
import Atribute from './pages/catalog/atributes/[atributeId]';
import ProductScreen from './pages/catalog/product/[productId]';
import OrderSuccess from './pages/orderSuccess';
import { navigationRef } from './components/Navigation';
import { setNavigationCallback } from './store/auth';
import CatalogItem from './pages/catalog/catalogItem';
import MinOrderBanner from './components/MinOrderBanner';
import useGlobalStore from './store';
import Alert from './ui/Alert';
import AddressModal from './ui/AddressModal';
import useAddressModalStore from './store/addressModal'; 

LogBox.ignoreAllLogs();

export type RootStackParamList = {
  welcome: undefined;
  home: undefined;
  catalog: undefined;
  catalogItem: { id: string };
  cartDetails: { id: string };
  atributes: { id: string };
  profile: undefined;
  search: undefined;
  favorite: undefined;
  delivery: undefined;
  contacts: undefined;
  checkout: undefined;
  cart: undefined;
  cartDetails: { id: string };
  auth: undefined;
  'not-found': undefined;
  product: { id: string };
  notifications: undefined;
  orderSuccess: { orderAmount?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

function RootLayout() {
  const [currentRoute, setCurrentRoute] = useState('welcome');
  const { isAuth, isDeliverySet, hideNavigation } = useGlobalStore();
  const { isOpen: isAddressModalOpen, closeModal: closeAddressModal } = useAddressModalStore();

  useEffect(() => {
    (async () => {
      try {
        const { default: NotificationService } = await import('./services/NotificationService');
        const { default: PushService } = await import('./services/PushService');
        NotificationService.initialize();
        PushService.setupListeners();
        PushService.init().catch((e: any) => console.log('[PushService] init error:', e));
        NotificationService.checkAndScheduleNotifications().catch((e: any) => console.log('[NS] schedule error:', e));
      } catch (e) {
        console.log('[RootLayout] service init failed:', e);
      }
    })();

    setNavigationCallback((route: string, reset?: boolean) => {
      if (navigationRef.current?.isReady()) {
        if (reset) {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: route as never }],
          });
        } else {
          navigationRef.current.navigate(route as never);
        }
      }
    });

    const cleanupDeepLinking = initializeDeepLinking()

    return () => {
      cleanupDeepLinking()
    }
  }, []);

  const onStateChange = (state: any) => {
    if (state) {
      const routeName = state.routes[state.index]?.name;
      setCurrentRoute(routeName);
    }
  };

  const isDeliveryRequired = isAuth && !isDeliverySet;
  const isAuthRequired = !isAuth;
  const showNavigation = currentRoute !== 'welcome' && 
                         currentRoute !== 'orderSuccess' &&
                         !(currentRoute === 'delivery' && isDeliveryRequired) &&
                         !(currentRoute === 'auth' && isAuthRequired);

  return (
    <SafeAreaProvider>
      <NavigationContainer 
        ref={navigationRef} 
        theme={CustomTheme} 
        onStateChange={onStateChange}
      >
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
          <View
            style={styles.keyboard}
          >
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#ffffff' },
              }} 
              initialRouteName="welcome"
            >
              <Stack.Screen name="welcome" component={WelcomeScreen} />
              <Stack.Screen name="home" component={HomeScreen} />
              <Stack.Screen name="profile" component={Profile} />
              <Stack.Screen name="search" component={Search} />
              <Stack.Screen name="favorite" component={Favorite} />
              <Stack.Screen name="delivery" component={Delivery} />
              <Stack.Screen name="contacts" component={Contacts} />
              <Stack.Screen name="checkout" component={Checkout} />
              <Stack.Screen name="cart" component={Cart} />
              <Stack.Screen name="auth" component={Auth} />
              <Stack.Screen name="catalog" component={CatalogScreen} />
              <Stack.Screen name="catalogItem" component={CatalogItem} />
              <Stack.Screen name="not-found" component={NotFoundScreen} />
              <Stack.Screen name="atributes" component={Atribute} />
              <Stack.Screen name="cartDetails" component={CatalogDetails} />
              <Stack.Screen name='product' component={ProductScreen} />
              <Stack.Screen name='notifications' component={Notifications} />
              <Stack.Screen name='orderSuccess' component={OrderSuccess} />
            </Stack.Navigator>
            {showNavigation && !hideNavigation && (
              <View style={styles.NavWrapper}>
                <MinOrderBanner currentRoute={currentRoute} />
                <Navigation />
              </View>
            )}
            <Alert />
            <AddressModal visible={isAddressModalOpen} onClose={closeAddressModal} />
          </View>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  NavWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 100,
  },
});
