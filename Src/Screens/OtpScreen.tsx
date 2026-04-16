import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ActivityIndicator, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import OtpInput from '../Components/OtpInput';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { PETZONE_LOGO } from '../Assets';
import authApi from '../Api';
import { Toast } from '../Components/Toast';
import * as Keychain from 'react-native-keychain';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

export default function OtpScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { email, returnTo } = route.params || {};
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (secondsLeft === 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setSecondsLeft(RESEND_SECONDS);
    setCanResend(false);

    try {
      showToast('Resending verification code...');
      const response = await authApi.verificationCode({ email });
      if (response.data.success) {
        showToast('Verification code resent successfully!');
      } else {
        showToast(response.data.message || 'Resend failed', 'error');
      }
    } catch (error: any) {
      showToast('Failed to resend OTP. Please try again.', 'error');
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      const response = await authApi.verifyEmail({ email, code });
      if (response.data.success) {
        if (returnTo) {
          navigation.navigate('ResetPassword', { email: email as string, returnTo });
        } else {
          const token = response.data.data.accessToken;
          await Keychain.setGenericPassword('token', token);
          navigation.replace('MainTabs');
        }
      } else {
        showToast(response.data.message || 'Verification failed', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = (email || '').replace(/^(.)(.*)(.@.*)$/, (_: string, a: string, b: string, c: string) => a + b.replace(/./g, '*') + c);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
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

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Icon name="notifications" size={40} color={Theme.colors.primary} />
            </View>
          </View>

          <Text style={styles.headline}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to <Text style={styles.phoneHighlight}>{maskedEmail}</Text>
          </Text>

          <View style={styles.otpWrapper}>
            <OtpInput length={OTP_LENGTH} value={otp} onChange={setOtp} />
          </View>

          <View style={styles.timerContainer}>
            {!canResend ? (
              <View style={styles.timerRow}>
                <Icon name="clock" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.resendText}>
                  Resend in <Text style={styles.timerHighlight}>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend} style={styles.timerRow}>
                <Text style={styles.resendActive}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.white} />
            ) : (
              <>
                <Text style={styles.verifyBtnText}>Verify OTP</Text>
                <Icon name="arrow_forward" size={20} color={Theme.colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

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
  safeArea: { flex: 1, backgroundColor: Theme.colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
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
  headerSpacer: { width: 32 },
  logoBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#25bba2' },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, alignItems: 'center' },
  iconWrapper: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Theme.colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center'
  },
  headline: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Theme.colors.textSecondary, textAlign: 'center', fontFamily: Theme.typography.fontFamily, marginBottom: 32, paddingHorizontal: 16 },
  phoneHighlight: { fontWeight: '700', color: Theme.colors.text },
  otpWrapper: { marginBottom: 32 },
  timerContainer: { marginBottom: 32, alignItems: 'center', height: 40, justifyContent: 'center' },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendText: { fontSize: 14, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily, fontWeight: '500' },
  timerHighlight: { color: Theme.colors.primary, fontWeight: '700' },
  resendActive: { fontSize: 14, color: Theme.colors.primary, fontWeight: '700', fontFamily: Theme.typography.fontFamily },
  verifyBtn: {
    width: '100%', backgroundColor: Theme.colors.primary,
    borderRadius: Theme.roundness.default, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  verifyBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800', fontFamily: Theme.typography.fontFamily },
});
