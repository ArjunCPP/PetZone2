import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { Toast } from '../Components/Toast';

import { useAppTheme } from '../ThemeContext';
import { PETZONE_LOGO } from '../Assets';
import { Icon } from '../Components/Icon';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { email, returnTo } = route.params || {};
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const validateForm = () => {
    let newErrors: any = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

    if (!otp || otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Must include uppercase, lowercase, number and special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      email,
      code: otp,
      newPassword: password
    };

    try {
      const response = await authApi.resetPassword(payload);
      if (response.data.success) {
        showToast('Password reset successfully!', 'success');
        setTimeout(() => {
          if (returnTo) {
            navigation.replace(returnTo as any);
          } else {
            navigation.replace('Login');
          }
        }, 1500);
      } else {
        showToast(response.data.message || 'Failed to reset password', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error occurred while resetting password.', 'error');
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
              <Text style={styles.headerTitle}>PetZone</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.headline}>New Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>
          </View>

          {/* ── Form Fields ───────────────────────── */}
          <View style={styles.formContainer}>
            <InputGroup
              label="Verification Code (OTP)"
              value={otp}
              onChangeText={(v: string) => { setOtp(v); setErrors({ ...errors, otp: '' }); }}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              error={errors.otp}
              styles={styles}
              Theme={Theme}
            />
            <InputGroup
              label="New Password"
              value={password}
              onChangeText={(v: string) => { setPassword(v); setErrors({ ...errors, password: '' }); }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye_off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              styles={styles}
              Theme={Theme}
            />
            <InputGroup
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(v: string) => { setConfirmPassword(v); setErrors({ ...errors, confirmPassword: '' }); }}
              placeholder="••••••••"
              secureTextEntry
              error={errors.confirmPassword}
              styles={styles}
              Theme={Theme}
            />

            {/* ── CTA Button ─────────────────── */}
            <TouchableOpacity
              style={[styles.resetBtn, loading && { opacity: 0.7 }]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.resetBtnText}>Change Password</Text>
                  <Icon name="arrow_forward" size={18} color={Theme.colors.white} />
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
          <View style={styles.footerSpacer} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputGroup({ label, rightIcon, onRightIconPress, error, styles, Theme, ...props }: any) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Theme.colors.textSecondary}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconBtn}>
            <Icon name={rightIcon} size={20} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.colors.surface },
  staticContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 20,
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
  titleSection: { alignItems: 'center', marginBottom: 20, width: '100%' },
  headline: {
    fontSize: 26, fontWeight: '900', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  subtitle: {
    fontSize: 14, color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily, marginTop: 4,
    textAlign: 'center',
  },
  formContainer: { width: '100%', marginBottom: 10 },
  inputWrapper: { width: '100%', marginBottom: 16 },
  inputLabel: {
    fontSize: 13, fontWeight: '700', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily, marginBottom: 6, marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.default,
    borderWidth: 1.5, borderColor: Theme.colors.border, height: 52,
    paddingHorizontal: 16,
  },
  inputContainerError: { borderColor: Theme.colors.error, borderWidth: 1.5 },
  input: {
    flex: 1, height: '100%', fontSize: 14, color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  iconBtn: { padding: 2, marginLeft: 6 },
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
  errorText: {
    fontSize: 11, color: Theme.colors.error, marginTop: 4, marginLeft: 2,
    fontWeight: '600', fontFamily: Theme.typography.fontFamily,
  },
  footerSpacer: { height: 40 },
});
