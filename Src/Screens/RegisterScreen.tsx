import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { Toast } from '../Components/Toast';

import { useAppTheme } from '../ThemeContext';
import { PETZONE_LOGO } from '../Assets';
import { Icon } from '../Components/Icon';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Must include uppercase, lowercase, number and special character';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const payload = { name, email, password, phone };

    try {
      const response = await authApi.register(payload);
      console.log('✅ Registration success:', response.data);

      if (response.data.success) {
        navigation.replace('Otp', { phone, email });
      }
    } catch (error: any) {
      const res = error.response?.data;
      const apiErrors: any = {};

      if (res) {
        console.log('❌ Registration API Error:', JSON.stringify(res, null, 2));
        const messages = Array.isArray(res.message) ? res.message : [res.message];
        messages.forEach((msg: string) => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('email')) apiErrors.email = msg;
          else if (lowerMsg.includes('phone')) apiErrors.phone = msg;
          else if (lowerMsg.includes('password')) apiErrors.password = msg;
          else if (lowerMsg.includes('name')) apiErrors.name = msg;
          else apiErrors.general = msg;
        });
        setErrors(apiErrors);
        if (apiErrors.general) showToast(apiErrors.general, 'error');
      } else {
        showToast('Network Error: Please check your connection.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
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

          <View style={styles.titleSection}>
            <Text style={styles.headline}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community of pet lovers</Text>
          </View>

          <View style={styles.formContainer}>
            <InputGroup
              label="Full Name"
              value={name}
              onChangeText={(v: string) => { setName(v); setErrors({ ...errors, name: '' }); }}
              placeholder="John Doe"
              error={errors.name}
              styles={styles}
              Theme={Theme}
              editable={!loading}
            />
            <InputGroup
              label="Email Address"
              value={email}
              onChangeText={(v: string) => { setEmail(v); setErrors({ ...errors, email: '' }); }}
              placeholder="john@example.com"
              keyboardType="email-address"
              error={errors.email}
              styles={styles}
              Theme={Theme}
              editable={!loading}
            />
            <InputGroup
              label="Phone Number"
              value={phone}
              onChangeText={(v: string) => { setPhone(v); setErrors({ ...errors, phone: '' }); }}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              error={errors.phone}
              styles={styles}
              Theme={Theme}
              editable={!loading}
            />
            <InputGroup
              label="Password"
              value={password}
              onChangeText={(v: string) => { setPassword(v); setErrors({ ...errors, password: '' }); }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'eye_off' : 'eye'}
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              styles={styles}
              Theme={Theme}
              editable={!loading}
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
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>Create Account</Text>
                  <Icon name="arrow_forward" size={18} color={Theme.colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
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

function InputGroup({ label, rightIcon, onRightIconPress, error, styles, Theme, ...props }: any) {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Theme.colors.textSecondary}
          cursorColor={Theme.colors.primary}
          selectionColor={Theme.colors.primary + '40'}
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
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
  titleSection: { alignItems: 'center', marginBottom: 20 },
  headline: {
    fontSize: 26, fontWeight: '900', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  subtitle: {
    fontSize: 14, color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily, marginTop: 4,
  },
  formContainer: { width: '100%', marginBottom: 12 },
  inputWrapper: { width: '100%', marginBottom: 16 },
  inputLabel: {
    fontSize: 13, fontWeight: '700', color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily, marginBottom: 6, marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.default,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerError: { borderColor: Theme.colors.error, borderWidth: 1.5 },
  input: {
    flex: 1, height: '100%', fontSize: 14, color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  iconBtn: { padding: 2, marginLeft: 6 },
  registerBtn: {
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
  registerBtnText: {
    color: Theme.colors.white, fontSize: 16, fontWeight: '800',
    fontFamily: Theme.typography.fontFamily,
  },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  footerText: { fontSize: 14, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  footerLink: {
    fontSize: 14, color: Theme.colors.primary, fontWeight: '800',
    textDecorationLine: 'underline', fontFamily: Theme.typography.fontFamily,
  },
  errorText: {
    fontSize: 11, color: Theme.colors.error, marginTop: 4, marginLeft: 2,
    fontWeight: '600', fontFamily: Theme.typography.fontFamily,
  },
  footerSpacer: { height: 40 },
});
