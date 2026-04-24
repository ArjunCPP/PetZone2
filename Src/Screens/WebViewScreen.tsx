import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Text, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WebViewScreen'>;

export default function WebViewScreen({ route, navigation }: Props) {
  const { url, title } = route.params;
  const { theme: Theme } = useAppTheme();
  const [loading, setLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
    return true;
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Theme.colors.background }]}>
      <StatusBar barStyle={Theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={Theme.colors.background} />
      <View style={[styles.header, { borderBottomColor: Theme.colors.border, backgroundColor: Theme.colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}><Icon name="back" size={20} color={Theme.colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: Theme.colors.text, fontFamily: Theme.typography.fontFamily }]} numberOfLines={1}>{title || 'Web View'}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.content}>
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[StyleSheet.absoluteFill, styles.loadingContainer, { backgroundColor: Theme.colors.background }]}><ActivityIndicator size="large" color={Theme.colors.primary} /></View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
