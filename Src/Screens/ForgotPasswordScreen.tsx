import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { PETZONE_LOGO, DOG_HERO } from '../Assets';
import { Icon } from '../Components/Icon';
import { Toast } from '../Components/Toast';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const returnTo = route.params?.returnTo;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleReset = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });
      console.log('✅ Reset Password Request Response:', response.data);

      if (response.data?.success) {
        showToast('OTP sent to your email!', 'success');
        navigation.replace('ResetPassword', { email, returnTo });
      } else {
        showToast(response.data?.message || 'Failed to send OTP.', 'error');
      }
    } catch (err: any) {
      console.log('❌ Reset Password Request Error:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Failed to send reset link. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.staticContainer}>
          {/* ── Header ────────────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="back" size={24} color={Theme.colors.text} />
            </TouchableOpacity>
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

          <View style={styles.titleSection}>
            <Text style={styles.headline}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email address to get an OTP sent to your email.</Text>
          </View>

          {/* ── Form Fields ───────────────────────── */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor={Theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  editable={!loading}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* ── CTA Button ─────────────────── */}
            <TouchableOpacity
              style={[styles.resetBtn, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.resetBtnText}>Get OTP</Text>
                  <Icon name="arrow_forward" size={18} color={Theme.colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={() => { setToast(prev => ({ ...prev, visible: false })); }}
          />
          <View style={styles.footerSpacer} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.colors.surface },
  staticContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
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
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#25bba2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },

  // Hero
  heroWrapper: {
    width: 140, aspectRatio: 1, position: 'relative',
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
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 60,
    backgroundColor: Theme.colors.primary + '80',
  },
  heroOverlay2: {
    position: 'absolute', bottom: -20, left: -20,
    width: 80, height: 80, borderRadius: 50,
    backgroundColor: Theme.colors.primary + '99',
  },

  titleSection: { alignItems: 'center', marginBottom: 20 },
  headline: {
    fontSize: 26, fontWeight: '900', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  subtitle: {
    fontSize: 14, color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily, marginTop: 4,
    textAlign: 'center', paddingHorizontal: 10, lineHeight: 20,
  },
  formContainer: { width: '100%', marginBottom: 10 },
  inputWrapper: { width: '100%', marginBottom: 20 },
  inputLabel: {
    fontSize: 13, fontWeight: '700', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily, marginBottom: 4, marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.default,
    borderWidth: 1.5, borderColor: Theme.colors.border, height: 52,
    paddingHorizontal: 16,
  },
  inputContainerError: { borderColor: Theme.colors.error },
  input: {
    flex: 1, height: '100%', fontSize: 14, color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  errorText: {
    fontSize: 11, color: Theme.colors.error, marginTop: 4, marginLeft: 2,
    fontWeight: '600', fontFamily: Theme.typography.fontFamily,
  },
  resetBtn: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.roundness.default,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8, elevation: 4,
  },
  resetBtnText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Theme.typography.fontFamily,
  },
  footerSpacer: { height: 40 },
});
