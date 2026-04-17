import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { IconName } from '../Components/Icon';

const NOTIFICATIONS_STORAGE_KEY = '@firebase_notifications';
const UNREAD_COUNT_KEY = '@firebase_notifications_unread';
const CHANNEL_ID = 'pawnest_default';

// Lazily import notifee so the app doesn't crash if it's not yet installed
let notifee: any = null;
let AndroidImportance: any = null;
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  AndroidImportance = notifeeModule.AndroidImportance;
} catch {
  console.warn('Notifee not installed. Run: npm install @notifee/react-native && npx react-native run-android');
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  icon: IconName;
  color: string;
  timestamp: number;
}

/**
 * Creates the Android notification channel required for Android 8+.
 * Safe to call multiple times — Android ignores duplicate channel creation.
 */
export const createNotificationChannel = async () => {
  if (!notifee) return;
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'PawNest Notifications',
      importance: AndroidImportance?.HIGH ?? 4,
      vibration: true,
      sound: 'default',
    });
  } catch (e) {
    console.warn('Notifee: Failed to create channel', e);
  }
};

/**
 * Displays a visible push notification banner using notifee.
 * Works in both foreground and background.
 */
export const displayNotification = async (remoteMessage: any) => {
  if (!notifee) return;
  try {
    const title = remoteMessage.notification?.title || 'PawNest';
    const body = remoteMessage.notification?.body || 'You have a new message.';

    await notifee.displayNotification({
      id: remoteMessage.messageId || Date.now().toString(),
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_notification',
        importance: AndroidImportance?.HIGH ?? 4,
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.warn('Notifee: Failed to display notification', e);
  }
};

class NotificationService {
  private get messaging() {
    return getMessaging();
  }

  /**
   * Saves an incoming remote message to AsyncStorage
   */
  async saveNotification(remoteMessage: any) {
    try {
      const existingData = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications: AppNotification[] = existingData ? JSON.parse(existingData) : [];

      // Check if this exact message is already saved (deduplication)
      if (remoteMessage.messageId && notifications.some(n => n.id.includes(remoteMessage.messageId))) {
        console.log('Firebase Notifications: Message already saved, skipping duplicate.');
        return;
      }

      const newNotification: AppNotification = {
        id: (remoteMessage.messageId || Date.now().toString()) + '-' + Math.round(Math.random() * 1000000),
        title: remoteMessage.notification?.title || 'New Notification',
        message: remoteMessage.notification?.body || 'You have a new message.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: remoteMessage.data?.type || 'general',
        icon: (remoteMessage.data?.icon as IconName) || 'notifications',
        color: remoteMessage.data?.color || '#25bba2',
        timestamp: Date.now(),
      };

      const updatedNotifications = [newNotification, ...notifications];
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      // Increment unread count
      const currentUnread = await this.getUnreadCount();
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, String(currentUnread + 1));
      console.log('Firebase Notifications: Saved new notification securely.');
    } catch (error) {
      console.error('Firebase Notifications: Error saving notification', error);
    }
  }

  /**
   * Retrieves all notifications from AsyncStorage
   */
  async getNotifications(): Promise<AppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Firebase Notifications: Error fetching notifications', error);
    }
    return [];
  }

  /**
   * Clear all stored notifications
   */
  async clearNotifications() {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      await AsyncStorage.removeItem(UNREAD_COUNT_KEY);
      console.log('Firebase Notifications: Cleared all notifications.');
    } catch (error) {
      console.error('Firebase Notifications: Error clearing notifications', error);
    }
  }

  /**
   * Get the current unread notification count (for the badge)
   */
  async getUnreadCount(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Mark all notifications as read (clears the badge)
   */
  async markAllRead() {
    try {
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, '0');
    } catch (error) {
      console.error('Firebase Notifications: Error marking as read', error);
    }
  }

  /**
   * Request permission for notifications (required for iOS & Android 13+)
   */
  async requestUserPermission() {
    try {
      if (notifee) {
        await notifee.requestPermission();
      }

      // Create the Android notification channel first
      await createNotificationChannel();

      const authStatus = await requestPermission(this.messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Firebase Notifications: Authorization status enabled:', authStatus);
      }
      return enabled;
    } catch (error) {
      console.error('Firebase Notifications: Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Retrieve the Firebase Cloud Messaging Token
   */
  async getFCMToken() {
    try {
      const token = await getToken(this.messaging);
      console.log('\n\n--- 🔔 FIREBASE FCM TOKEN ---');
      console.log(token);
      console.log('----------------------------\n\n');
      return token;
    } catch (error) {
      console.error('Firebase Notifications: Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Delete the FCM token (use when user logs out)
   */
  async deleteFCMToken() {
    try {
      await this.messaging.deleteToken();
      console.log('Firebase Notifications: FCM Token deleted on logout.');
    } catch (error) {
      console.error('Firebase Notifications: Failed to delete FCM token:', error);
    }
  }

  /**
   * Listen to token refresh events
   */
  onTokenRefresh(callback: (token: string) => void) {
    return onTokenRefresh(this.messaging, callback);
  }

  /**
   * Sets up a foreground message handler.
   * Firebase does NOT auto-display notifications in foreground — notifee does it.
   */
  setupForegroundHandler() {
    return onMessage(this.messaging, async remoteMessage => {
      console.log('\n\n=== 🔔 FOREGROUND NOTIFICATION HIT ===');
      console.log('MessageId   :', remoteMessage.messageId);
      console.log('Title       :', remoteMessage.notification?.title);
      console.log('Body        :', remoteMessage.notification?.body);
      console.log('Data        :', JSON.stringify(remoteMessage.data));
      console.log('From        :', remoteMessage.from);
      console.log('SentTime    :', new Date(remoteMessage.sentTime || 0).toISOString());
      console.log('Full payload:', JSON.stringify(remoteMessage, null, 2));
      console.log('======================================\n\n');
      await this.saveNotification(remoteMessage);
      await displayNotification(remoteMessage);
    });
  }
}

export const notificationService = new NotificationService();


