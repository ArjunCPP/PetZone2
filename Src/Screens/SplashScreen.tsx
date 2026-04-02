import React, { useMemo,  useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { PETZONE_LOGO } from '../Assets';
import * as Keychain from 'react-native-keychain';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 2500;

export default function SplashScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  useEffect(() => {
    const checkUser = async () => {
      try {
        // ── Session Restoration (Secure) ──────────────────────────────
        const credentials = await Keychain.getGenericPassword();
        const hasToken = !!(credentials && credentials.password);

        setTimeout(() => {
          navigation.replace(hasToken ? 'MainTabs' : 'Login');
        }, SPLASH_DURATION_MS);
      } catch (error) {
        console.error('Session restoration failed:', error);
        setTimeout(() => navigation.replace('Login'), SPLASH_DURATION_MS);
      }
    };

    checkUser();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.container.backgroundColor} />

      <Image source={PETZONE_LOGO} style={styles.logoBox} resizeMode="contain" />

      <Text style={styles.tagline}>Book. Groom. Love.</Text>
    </View>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25bba2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#25bba2',
    marginBottom: 24,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  tagline: { fontSize: 16, color: Theme.colors.white, fontWeight: '500' },
});
