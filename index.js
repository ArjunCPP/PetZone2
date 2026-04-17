/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

console.log('--- 🚀 APP BUNDLE STARTING ---');

const _origWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('This method is deprecated') || msg.includes('namespaced API')) return;
  _origWarn(...args);
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const messaging = require('@react-native-firebase/messaging').default;

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('\n\n=== 🔔 BACKGROUND NOTIFICATION HIT ===');
  console.log('MessageId   :', remoteMessage.messageId);
  console.log('Title       :', remoteMessage.notification?.title);
  console.log('Body        :', remoteMessage.notification?.body);
  console.log('Data        :', JSON.stringify(remoteMessage.data));
  console.log('From        :', remoteMessage.from);
  console.log('SentTime    :', new Date(remoteMessage.sentTime || 0).toISOString());
  console.log('Full payload:', JSON.stringify(remoteMessage, null, 2));
  console.log('======================================\n\n');

  const NOTIFICATIONS_KEY = '@firebase_notifications';
  const UNREAD_COUNT_KEY = '@firebase_notifications_unread';

  // 1. Display notification banner via notifee
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const notifeeModule = require('@notifee/react-native');
    const notifee = notifeeModule.default;
    const AndroidImportance = notifeeModule.AndroidImportance;

    await notifee.createChannel({
      id: 'pawnest_default',
      name: 'PawNest Notifications',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });

    await notifee.displayNotification({
      id: remoteMessage.messageId || String(Date.now()),
      title: remoteMessage.notification?.title || 'PawNest',
      body: remoteMessage.notification?.body || 'You have a new message.',
      android: {
        channelId: 'pawnest_default',
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // notifee not installed — Firebase auto-displays from notification payload
  }

  // 2. Save to AsyncStorage for the in-app list + increment badge count
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    const existingData = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    const notifications = existingData ? JSON.parse(existingData) : [];

    if (remoteMessage.messageId && notifications.some((n: any) => n.id.includes(remoteMessage.messageId))) {
      return; // Skip duplicate
    }

    const newNotification = {
      id: (remoteMessage.messageId || String(Date.now())) + '-' + Math.round(Math.random() * 1000000),
      title: remoteMessage.notification?.title || 'New Notification',
      message: remoteMessage.notification?.body || 'You have a new message.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: remoteMessage.data?.type || 'general',
      icon: remoteMessage.data?.icon || 'notifications',
      color: remoteMessage.data?.color || '#25bba2',
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify([newNotification, ...notifications])
    );

    const currentVal = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
    const currentCount = currentVal ? parseInt(currentVal, 10) : 0;
    await AsyncStorage.setItem(UNREAD_COUNT_KEY, String(currentCount + 1));
  } catch (err) {
    console.error('Background handler: Failed to save notification', err);
  }
});

// Restore original console.warn globally now that initialization is over
console.warn = _origWarn;
// ─────────────────────────────────────────────────────────────────────────────

AppRegistry.registerComponent(appName, () => App);
