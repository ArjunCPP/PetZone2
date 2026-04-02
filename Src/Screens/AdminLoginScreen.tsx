import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { ADMIN_LOGIN_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

export default function AdminLoginScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Mock login
    navigation.replace('AdminDashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <Image source={ADMIN_LOGIN_IMAGE} style={styles.heroImage} resizeMode="contain" />
            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.subtitle}>Sign in to manage your pet grooming business</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADMIN ID</Text>
              <TextInput 
                style={styles.input}
                value={adminId}
                onChangeText={setAdminId}
                placeholder="Enter unique Admin ID"
                placeholderTextColor={Theme.colors.textSecondary + '80'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput 
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor={Theme.colors.textSecondary + '80'}
              />
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Credentials?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Secure Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Protected by PetZone Enterprise Security</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { padding: 24, flexGrow: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: { },

  heroSection: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  heroImage: { width: 180, height: 180, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: Theme.colors.text },
  subtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  form: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 1 },
  input: { 
    backgroundColor: Theme.colors.white, borderRadius: 12, borderWidth: 1, 
    borderColor: Theme.colors.border, paddingHorizontal: 16, height: 56, 
    fontSize: 15, fontWeight: '600', color: Theme.colors.text 
  },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },

  loginBtn: { 
    backgroundColor: Theme.colors.text, height: 56, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  loginBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },

  footer: { marginTop: 'auto', paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '500' },
});
