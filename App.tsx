/**
 * PetZone App – Root
 * Uses React Navigation with NavigationContainer + StackNavigation
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Theme } from './Src/theme';
import { ThemeProvider, useAppTheme } from './Src/ThemeContext';
import StackNavigation from './Src/Navigation/StackNavigation';
import NetInfo1 from './Src/Components/NetInfo1';

function MainApp() {
  const { theme, isDarkMode } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent={true} />
      <NavigationContainer>
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
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
});
