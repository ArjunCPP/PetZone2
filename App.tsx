/**
 * PetZone App – Root
 * Uses React Navigation with NavigationContainer + StackNavigation
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Theme } from './Src/theme';
import { ThemeProvider, useAppTheme } from './Src/ThemeContext';
import StackNavigation from './Src/Navigation/StackNavigation';
import { LocationProvider } from './Src/LocationContext';
import NetInfo1 from './Src/Components/NetInfo1';
import { notificationService } from './Src/Services/NotificationService';
import * as Keychain from 'react-native-keychain';
import authApi from './Src/Api';


const linking = {
  prefixes: [
    'pawnest://',
    'https://pawnest.com',
    'petzone://',
    'https://petzone.com',
    'https://petzone.quantuver-wizards.site'
  ],
  config: {
    screens: {
      ShopDetail: 'shop/:shopId',
    },
  },
};

function MainApp() {
  const { theme, isDarkMode } = useAppTheme();

  useEffect(() => {
    const initNotifications = async () => {
      console.log('\n\n=== 🚀 NOTIFICATION INIT START ===');

      // 1. Request permission + create notifee channel + clear existing
      const hasPermission = await notificationService.requestUserPermission();
      await notificationService.clearAllActiveNotifications();
      console.log('📋 Permission granted:', hasPermission);

      // 2. Get FCM token ONLY if user is logged in
      if (hasPermission) {
        try {
          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            const token = await notificationService.getFCMToken();
            if (token) {
              console.log('\n✅ FCM TOKEN (Loaded for authenticated user):', token);
              try {
                const res = await authApi.registerNotificationToken({ 
                  fcmToken: token, 
                  deviceType: Platform.OS 
                });
                console.log('✅ FCM Registration Success:', res.data);
              } catch (e: any) {
                console.error('❌ FCM Registration Failed:', e.response?.data || e.message);
              }
            } else {
              console.warn('❌ FCM Token is NULL — SERVICE_NOT_AVAILABLE or network issue');
            }
          } else {
            console.log('Firebase Notifications: User not logged in, skipping FCM token generation.');
          }
        } catch (error) {
          console.error('Keychain Access Error', error);
        }
      }

      console.log('=== 🚀 NOTIFICATION INIT DONE ===\n\n');
    };

    initNotifications();

    // 3. Setup foreground listener
    console.log('📡 Setting up foreground notification listener...');
    const unsubscribeForeground = notificationService.setupForegroundHandler();
    console.log('📡 Foreground listener ready.');

    return () => {
      unsubscribeForeground();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      <NavigationContainer linking={linking}>
        <StackNavigation />
      </NavigationContainer>
      <NetInfo1 />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocationProvider>
          <MainApp />
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
});
