/**
 * PetZone App – Root
 * Uses React Navigation with NavigationContainer + StackNavigation
 */

import React from 'react';
import { StatusBar, StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Theme } from './Src/theme';
import { ThemeProvider, useAppTheme } from './Src/ThemeContext';
import StackNavigation from './Src/Navigation/StackNavigation';
import { LocationProvider } from './Src/LocationContext';
import NetInfo1 from './Src/Components/NetInfo1';

// Silence warnings from third-party libraries
LogBox.ignoreLogs([
  'ProgressBarAndroid has been extracted',
  'SafeAreaView has been deprecated',
  'Clipboard has been extracted',
  'InteractionManager has been deprecated',
  'PushNotificationIOS has been extracted',
]);

const linking = {
  prefixes: [
    'pawnest://', 
    'https://pawnest.com', 
    'petzone://', 
    'https://petzone.com'
  ],
  config: {
    screens: {
      ShopDetail: 'shop/:shopId',
    },
  },
};

function MainApp() {
  const { theme, isDarkMode } = useAppTheme();
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
