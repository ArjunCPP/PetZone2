import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Keychain from 'react-native-keychain';
import authApi from '../Api';

import {
  GoogleSignin,
  statusCodes,
  SignInResponse,
} from '@react-native-google-signin/google-signin';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { DOG_HERO, PETZONE_LOGO } from '../Assets';
import { Icon } from '../Components/Icon';
import { Toast } from '../Components/Toast';
import { notificationService } from '../Services/NotificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

GoogleSignin.configure({
  webClientId: "994012216640-ve0joriqnoguem0nf9k4matthta1cutu.apps.googleusercontent.com",
  offlineAccess: true,
});

export default function LoginScreen({ navigation }: Props) {
  const { theme: Theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const validate = () => {
    let e: any = {};
    if (!email.trim() || !email.includes('@')) e.email = 'Valid email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.data.success) {
        const token = response.data.data.accessToken;
        await Keychain.setGenericPassword('token', token);
        await notificationService.getFCMToken(); // Fetch and register device FCM on login
        navigation.replace('MainTabs');
      } else {
        setErrors({ email: ' ', password: response.data.message || 'Invalid credentials' });
      }
    } catch (error: any) {
      setErrors({ email: ' ', password: error.response?.data?.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response: SignInResponse = await GoogleSignin.signIn();
      if (response.type !== 'success') return;

      const { idToken } = response.data;
      if (!idToken) throw new Error('Google ID Token missing');

      const authResponse = await authApi.authToken({ idToken });
      const accessToken = authResponse.data.data.accessToken;
      if (!accessToken) throw new Error('Failed to retrieve secure access token');
      await Keychain.setGenericPassword('token', accessToken);
      await notificationService.getFCMToken(); // Fetch and register FCM token
      navigation.replace('MainTabs');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in flow - silent
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showToast('Sign in is already in progress', 'error');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Required', 'Please update Google Play Services.');
      } else if (error.code === '10') {
        // '10' is the standard code for DEVELOPER_ERROR (SHA-1 mismatch or wrong configuration)
        Alert.alert('Configuration Error', 'Google Sign-In is not configured correctly for this build (Developer Error 10). Please check your SHA-1 fingerprints in Firebase/Google Console.');
      } else {
        showToast(error.message || 'Google Sign-In failed', 'error');
        console.error('Google Sign-In Error:', error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={Theme.colors.surface} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <View style={styles.headerTitleGroup}>
              <Image source={PETZONE_LOGO} style={styles.logoBox} resizeMode="contain" />
              <Text style={styles.headerTitle}>PawNest</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* ── Hero Image ── */}
          <View style={styles.heroWrapper}>
            <View style={styles.heroOverlay1} />
            <View style={styles.heroOverlay2} />
            <View style={styles.heroContainer}>
              <Image source={DOG_HERO} style={styles.heroImage} resizeMode="cover" />
            </View>
          </View>

          {/* ── Tagline ── */}
          <View style={styles.taglineContainer}>
            <Text style={styles.headline}>Book. Groom. Love.</Text>
            <Text style={styles.subtitle}>Sign in with your email or social account</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="hello@petzone.com"
                  placeholderTextColor={Theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setErrors({ ...errors, email: '' }); }}
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors({ ...errors, password: '' }); }}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "eye_off" : "eye"} size={20} color={Theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Reset Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Login</Text>
                  <Icon name="arrow_forward" size={18} color={Theme.colors.white} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, isSigningIn && styles.googleBtnDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isSigningIn}
              activeOpacity={0.85}
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color={Theme.colors.textSecondary} />
              ) : (
                <Icon name="google" size={20} />
              )}
              <Text style={styles.googleBtnText}>{isSigningIn ? 'Signing in…' : 'Login with Google'}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.registerLinkContainer} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerText}>New here? </Text>
              <Text style={styles.footerLinkBold}>Register New User</Text>
            </TouchableOpacity>
          </View>

          </View>
          <View style={styles.footerSpacer} />
        </ScrollView>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast({ ...toast, visible: false })}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 10,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSpacer: { width: 32 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#25bba2' },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  heroWrapper: {
    width: 130, aspectRatio: 1, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'visible', marginVertical: 10,
  },
  heroContainer: {
    width: '100%', height: '100%', borderRadius: 999,
    backgroundColor: Theme.colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%', borderRadius: 999 },
  heroOverlay1: {
    position: 'absolute', top: -25, right: -25,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Theme.colors.primary + '80',
  },
  heroOverlay2: {
    position: 'absolute', bottom: -15, left: -15,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Theme.colors.primary + '99',
  },
  taglineContainer: { alignItems: 'center', marginBottom: 20 },
  headline: {
    fontSize: 24, fontWeight: '900', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily, marginBottom: 4,
  },
  subtitle: {
    fontSize: 13, color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily,
  },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 12 },
  inputLabel: {
    fontSize: 13, fontWeight: '700', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily, marginBottom: 6, marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.default,
    borderWidth: 1.5, borderColor: Theme.colors.border, height: 50,
    paddingHorizontal: 16,
  },
  inputError: { borderColor: Theme.colors.error },
  input: {
    flex: 1, height: '100%', fontSize: 14, color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  errorText: {
    fontSize: 11, color: Theme.colors.error, marginTop: 4, marginLeft: 2,
    fontWeight: '600', fontFamily: Theme.typography.fontFamily,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16, paddingRight: 4 },
  forgotText: {
    color: Theme.colors.primary, fontWeight: '800', fontSize: 14,
    fontFamily: Theme.typography.fontFamily, textDecorationLine: 'underline',
  },
  loginBtn: {
    width: '100%', backgroundColor: Theme.colors.primary,
    borderRadius: Theme.roundness.default, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: {
    color: Theme.colors.white, fontSize: 16, fontWeight: '800',
    fontFamily: Theme.typography.fontFamily,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 12 },
  line: { flex: 1, height: 1.5, backgroundColor: Theme.colors.border },
  dividerText: { color: Theme.colors.textSecondary, fontSize: 13, fontWeight: '700', fontFamily: Theme.typography.fontFamily },
  googleBtn: {
    width: '100%', backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.default, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderWidth: 1.5, borderColor: Theme.colors.border,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleBtnText: { color: Theme.colors.text, fontSize: 16, fontWeight: '700', fontFamily: Theme.typography.fontFamily },
  footer: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  registerLinkContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  footerText: { fontSize: 14, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  footerLinkBold: { fontSize: 14, color: Theme.colors.primary, fontWeight: '800', textDecorationLine: 'underline', fontFamily: Theme.typography.fontFamily },
  footerSpacer: { height: 20 },
});