import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform, PermissionsAndroid, Linking, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  private isInitialized = false;

  constructor() {
    // Не инициализируем сразу, ждем явного вызова
  }

  initialize = () => {
    if (this.isInitialized) {
      console.log('NotificationService already initialized');
      return;
    }

    console.log('Initializing NotificationService...');
    this.configure();
    this.createDefaultChannel();
    this.isInitialized = true;
    console.log('NotificationService initialized');
  };

  configure = () => {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        if (notification.userInteraction) {
          console.log('Notification tapped:', notification.data);
          if (notification.data?.promoCode) {
            console.log('Promo code:', notification.data.promoCode);
          }
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err) {
        console.error('Registration error:', err.message, err);
      },

      permissions: {
        alert: true,
        badge: false,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: false,
    });
  };

  createDefaultChannel = () => {
    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "Default channel",
        channelDescription: "A default channel for notifications",
        playSound: true,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  };

  scheduleBirthdayNotification = async (birthDate: string) => {
    try {
      if (!birthDate) return;

      const [day, month] = birthDate.split('.');
      if (!day || !month) return;

      const now = new Date();
      const isToday =
        now.getDate() === parseInt(day) && now.getMonth() + 1 === parseInt(month);

      PushNotification.cancelLocalNotification('2001');

      if (isToday) {
        const todayKey = `birthdayNotifSent_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`
        const alreadySent = await AsyncStorage.getItem(todayKey)
        if (alreadySent) {
          console.log('ℹ️ Birthday notification already sent today');
          return;
        }
        await AsyncStorage.setItem(todayKey, '1')
        PushNotification.localNotification({
          id: '2001',
          channelId: 'default-channel-id',
          title: '🎉 С Днём Рождения!',
          message: 'Поздравляем вас с днём рождения! Вам начислено 300 бонусов — порадуйте себя! 🎂',
          playSound: true,
          soundName: 'default',
          vibrate: true,
        });
        console.log('✅ Birthday notification sent immediately (today is birthday)');
      } else {
        // Планируем на следующий день рождения
        const nextBirthday = new Date(now.getFullYear(), parseInt(month) - 1, parseInt(day), 10, 0, 0);
        if (nextBirthday < now) {
          nextBirthday.setFullYear(now.getFullYear() + 1);
        }
        PushNotification.localNotificationSchedule({
          id: '2001',
          channelId: 'default-channel-id',
          title: '🎉 С Днём Рождения!',
          message: 'Поздравляем вас с днём рождения! Вам начислено 300 бонусов — порадуйте себя! 🎂',
          date: nextBirthday,
          allowWhileIdle: true,
          playSound: true,
          soundName: 'default',
          vibrate: true,
        });
        console.log('✅ Birthday notification scheduled for:', nextBirthday.toLocaleDateString());
      }
    } catch (error) {
      console.error('❌ Failed to schedule birthday notification:', error);
    }
  };

  checkLongAbsenceNotification = async () => {
    try {
      const lastOpenStr = await AsyncStorage.getItem('lastAppOpenDate');

      if (lastOpenStr) {
        const lastOpen = new Date(lastOpenStr);
        const now = new Date();
        const daysSinceLastOpen = Math.floor((now.getTime() - lastOpen.getTime()) / (1000 * 60 * 60 * 24));

        console.log('📊 Days since last app open:', daysSinceLastOpen);

        if (daysSinceLastOpen >= 7) {
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: '🍽️ Давно не виделись!',
            message: 'Скучали по вам! Загляните — на складе свежие фермерские продукты 😊',
            playSound: true,
            soundName: 'default',
            vibrate: true,
          });
          console.log('✅ Long absence notification sent (', daysSinceLastOpen, 'days since last open)');
        }
      }

      await AsyncStorage.setItem('lastAppOpenDate', new Date().toISOString());
    } catch (error) {
      console.error('❌ Failed to check long absence:', error);
    }
  };

  scheduleInactiveUserNotification = async (promoCode: string = 'WELCOME20') => {
    try {
      const lastActivityDate = await this.getLastActivityDate();
      const now = new Date();
      
      if (lastActivityDate) {
        const daysSinceLastActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log('📊 Days since last activity:', daysSinceLastActivity);

        if (daysSinceLastActivity >= 14) {
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: '💝 Мы скучаем по вам!',
            message: `Вы не заходили уже 2 недели! Используйте промокод ${promoCode} для скидки! 🎁`,
            playSound: true,
            soundName: 'default',
            vibrate: true,
            userInfo: { promoCode },
          });
          console.log('✅ Inactive user notification sent with promo:', promoCode);
        } else {
          console.log('ℹ️ No inactive reminder needed - user was active recently');
        }
      } else {
        console.log('ℹ️ No last activity date found');
      }
    } catch (error) {
      console.error('❌ Failed to send inactive user notification:', error);
    }
  };

  startMinuteNotifications = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '1001' as any });
    } catch {}

    PushNotification.localNotificationSchedule({
      id: 1001,
      channelId: 'default-channel-id',
      title: 'Напоминание',
      message: 'Это локальное уведомление раз в минуту',
      allowWhileIdle: false,
      date: new Date(Date.now() + 60 * 1000),
      repeatType: 'minute',
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });

    console.log('Scheduled repeating notification every minute');
  };

  stopMinuteNotifications = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '1001' as any });
      console.log('Cancelled repeating minute notification');
    } catch (e) {
      console.log('Error cancelling minute notification', e);
    }
  };

  private getLastOrderDate = async (): Promise<Date | null> => {
    try {
      const lastOrderDateStr = await AsyncStorage.getItem('lastOrderDate');
      return lastOrderDateStr ? new Date(lastOrderDateStr) : null;
    } catch {
      return null;
    }
  };

  private getLastActivityDate = async (): Promise<Date | null> => {
    try {
      const lastActivityDateStr = await AsyncStorage.getItem('lastActivityDate');
      return lastActivityDateStr ? new Date(lastActivityDateStr) : null;
    } catch {
      return null;
    }
  };

  updateLastOrderDate = async () => {
    try {
      await AsyncStorage.setItem('lastOrderDate', new Date().toISOString());
      console.log('✅ Last order date updated');
    } catch (error) {
      console.error('❌ Failed to update last order date:', error);
    }
  };

  updateLastActivityDate = async () => {
    try {
      await AsyncStorage.setItem('lastActivityDate', new Date().toISOString());
    } catch (error) {
      console.error('❌ Failed to update last activity date:', error);
    }
  };

  checkAndScheduleNotifications = async () => {
    try {
      console.log('🔔 Checking and scheduling notifications...');

      const profileData = await AsyncStorage.getItem('profileData');
      if (profileData) {
        const { dateBirth } = JSON.parse(profileData);
        if (dateBirth) {
          await this.scheduleBirthdayNotification(dateBirth);
        } else {
          console.log('ℹ️ No birth date found in profile');
        }
      } else {
        console.log('ℹ️ No profile data found');
      }

      await this.checkLongAbsenceNotification();

      const promoCode = await AsyncStorage.getItem('currentPromoCode');
      await this.scheduleInactiveUserNotification(promoCode || 'WELCOME20');
      
      console.log('✅ All notifications checked and scheduled');
    } catch (error) {
      console.error('❌ Failed to schedule notifications:', error);
    }
  };

  runAllTestNotifications = async () => {
    if (Platform.OS === 'android' && (Platform.Version as number) >= 31) {
      try {
        const hasExact = await PermissionsAndroid.check(
          'android.permission.SCHEDULE_EXACT_ALARM' as any
        );
        if (!hasExact) {
          await Linking.sendIntent(
            'android.settings.REQUEST_SCHEDULE_EXACT_ALARM',
            [{ key: 'package', value: 'com.fermancli' }]
          );
          return;
        }
      } catch (e) {
        console.log('Exact alarm check error:', e);
      }
    }

    const delays = [15, 20, 25, 30];
    delays.forEach((sec, i) => {
      PushNotification.localNotificationSchedule({
        id: String(3000 + i),
        channelId: 'default-channel-id',
        title: `🧪 Тест #${i + 1}`,
        message: `Тестовое уведомление через ${sec} сек`,
        date: new Date(Date.now() + sec * 1000),
        allowWhileIdle: false,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      });
    });
    console.log('🧪 Test notifications scheduled: 15/20/25/30s');
  };

  scheduleQuickAbandonedCartNotification = () => {
    try {
      this.cancelQuickAbandonedCartNotification();
      PushNotification.localNotificationSchedule({
        id: '4000',
        channelId: 'default-channel-id',
        title: '🛒 Вы забыли что-то в корзине!',
        message: 'Товары ждут вас — оформите заказ прямо сейчас.',
        date: new Date(Date.now() + 29 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'cart' },
      });
      console.log('✅ Quick abandoned cart notification scheduled: 29s');
    } catch (error) {
      console.error('❌ Failed to schedule quick abandoned cart notification:', error);
    }
  };

  cancelQuickAbandonedCartNotification = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '4000' as any });
    } catch {}
  };

  scheduleAbandonedCartNotification = () => {
    try {
      this.cancelAbandonedCartNotification();

      const now = Date.now();

      PushNotification.localNotificationSchedule({
        id: '4001',
        channelId: 'default-channel-id',
        title: '🛒 Товары ждут вас!',
        message: 'Вы оставили товары в корзине — они ещё в наличии. Оформите заказ!',
        date: new Date(now + 2 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'cart' },
      });

      PushNotification.localNotificationSchedule({
        id: '4002',
        channelId: 'default-channel-id',
        title: '⏰ Пока кто-то не купил!',
        message: 'Ваша корзина ждёт уже целый день. Успейте оформить заказ раньше других!',
        date: new Date(now + 24 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'cart' },
      });

      PushNotification.localNotificationSchedule({
        id: '4003',
        channelId: 'default-channel-id',
        title: '🔔 Последний шанс!',
        message: 'Товары сохранятся в корзине ещё совсем недолго — поторопитесь с заказом!',
        date: new Date(now + 72 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'cart' },
      });

      console.log('✅ Abandoned cart notifications scheduled: 2h / 24h / 72h');
    } catch (error) {
      console.error('❌ Failed to schedule abandoned cart notifications:', error);
    }
  };

  cancelAbandonedCartNotification = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '4000' as any });
      PushNotification.cancelLocalNotifications({ id: '4001' as any });
      PushNotification.cancelLocalNotifications({ id: '4002' as any });
      PushNotification.cancelLocalNotifications({ id: '4003' as any });
      console.log('✅ Abandoned cart notifications cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel abandoned cart notifications:', error);
    }
  };

  scheduleBirthdayBonusReminders = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '2002' as any });
      PushNotification.cancelLocalNotifications({ id: '2003' as any });

      const now = Date.now();

      PushNotification.localNotificationSchedule({
        id: '2002',
        channelId: 'default-channel-id',
        title: '🎂 Бонусы ко дню рождения!',
        message: 'Не забудьте потратить 300 подарочных бонусов — осталось 2 дня!',
        date: new Date(now + 24 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'catalog' },
      });

      PushNotification.localNotificationSchedule({
        id: '2003',
        channelId: 'default-channel-id',
        title: '⚡ Последний день бонусов!',
        message: 'Завтра сгорят ваши 300 бонусов ко дню рождения — успейте заказать!',
        date: new Date(now + 48 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'catalog' },
      });

      console.log('✅ Birthday bonus reminders scheduled: 24h / 48h');
    } catch (error) {
      console.error('❌ Failed to schedule birthday bonus reminders:', error);
    }
  };

  showLocalNotification = (title: string, body: string, data: Record<string, any> = {}) => {
    try {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        title,
        message: body,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: data,
      });
    } catch (error) {
      console.error('❌ Failed to show local notification:', error);
    }
  };

  scheduleRepeatOrderReminders = () => {
    try {
      this.cancelRepeatOrderReminders();
      const now = Date.now();

      PushNotification.localNotificationSchedule({
        id: '5001',
        channelId: 'default-channel-id',
        title: '🛍️ Пора пополнить запасы?',
        message: 'Прошло 10 дней с вашего последнего заказа — возможно, пришло время заказать снова!',
        date: new Date(now + 10 * 24 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'catalog' },
      });

      PushNotification.localNotificationSchedule({
        id: '5002',
        channelId: 'default-channel-id',
        title: '🥩 Свежие продукты ждут вас!',
        message: 'Уже 20 дней без заказа — загляните в каталог, много свежего!',
        date: new Date(now + 20 * 24 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'catalog' },
      });

      console.log('✅ Repeat order reminders scheduled: 10d / 20d');
    } catch (error) {
      console.error('❌ Failed to schedule repeat order reminders:', error);
    }
  };

  cancelRepeatOrderReminders = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '5001' as any });
      PushNotification.cancelLocalNotifications({ id: '5002' as any });
    } catch {}
  };

  scheduleNewUserReminder = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '6001' as any });

      PushNotification.localNotificationSchedule({
        id: '6001',
        channelId: 'default-channel-id',
        title: '👋 Попробуйте сделать первый заказ!',
        message: 'Вы зарегистрировались 3 дня назад — самое время попробовать фермерские продукты с доставкой!',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        vibrate: true,
        userInfo: { screen: 'catalog' },
      });

      console.log('✅ New user reminder scheduled: 3d');
    } catch (error) {
      console.error('❌ Failed to schedule new user reminder:', error);
    }
  };

  cancelNewUserReminder = () => {
    try {
      PushNotification.cancelLocalNotifications({ id: '6001' as any });
    } catch {}
  };

  cancelAllNotifications = () => {
    try {
      PushNotification.cancelAllLocalNotifications();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  };

  requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const apiLevel = Platform.Version as number;
        
        if (apiLevel >= 33) {
          const has = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any
          );
          if (!has) {
            const res = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any,
              {
                title: 'Разрешение на уведомления',
                message: 'Приложению нужно разрешение, чтобы отправлять уведомления.',
                buttonPositive: 'OK',
              }
            );
            console.log('POST_NOTIFICATIONS result:', res);
          }
        }

        if (apiLevel >= 31) {
          try {
            const hasExact = await PermissionsAndroid.check(
              'android.permission.SCHEDULE_EXACT_ALARM' as any
            );
            console.log('SCHEDULE_EXACT_ALARM permission:', hasExact);

            if (!hasExact) {
              console.warn('No exact alarm permission');
            }
          } catch (error) {
            console.log('Could not check/open exact alarm permission:', error);
          }
        }

        return true;
      }

      const res = await PushNotification.requestPermissions(['alert', 'badge', 'sound'] as any);
      console.log('iOS notification permission result:', res);
      return res;
    } catch (err) {
      console.error('Permissions request error:', err);
      return false;
    }
  };
}

export default new NotificationService();
