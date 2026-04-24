import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Switch, Alert, ActivityIndicator, Linking } from 'react-native';
import * as Keychain from 'react-native-keychain';
import authApi from '../Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { notificationService } from '../Services/NotificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { theme: Theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await authApi.DeleteAccount();
              if (response.data && response.data.success) {
                await notificationService.deleteFCMToken(); // Clear FCM token
                await Keychain.resetGenericPassword();
                navigation.replace('Login');
              } else {
                Alert.alert('Error', response.data?.message || 'Failed to delete account.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteFCMToken(); // Clear FCM token
              await Keychain.resetGenericPassword();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.replace('Login');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={Theme.colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => (navigation as any).navigate('ForgotPassword', { returnTo: 'Settings' })}>
            <Text style={styles.rowTitle}>Change Password</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowTitle}>Linked Accounts</Text>
            <Text style={styles.rowSubtitle}>Google connected</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme as any}
              trackColor={{ false: '#cbd5e1', true: Theme.colors.primary + '80' }}
              thumbColor={isDarkMode ? Theme.colors.primary : '#f8fafc'}
            />
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, { opacity: 0.5 }]}>
            <Text style={styles.rowTitle}>Language</Text>
            <Text style={styles.rowSubtitle}>English (US) Only</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WebViewScreen', { url: 'https://petzone.quantuver-wizards.site/terms', title: 'Terms of Service' })}
          >
            <Text style={styles.rowTitle}>Terms of Service</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WebViewScreen', { url: 'https://petzone.quantuver-wizards.site/privacy', title: 'Privacy Policy' })}
          >
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HelpCenter' as any)}>
            <Text style={styles.rowTitle}>Help Center & FAQ</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:support@petzone.com')}>
            <Text style={styles.rowTitle}>Contact Support</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.row} 
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Theme.colors.error} />
            ) : (
              <Text style={[styles.rowTitle, { color: Theme.colors.error }]}>Delete Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { marginTop: 24, marginBottom: 20 }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
              <Text style={[styles.rowTitle, { color: Theme.colors.primary, textAlign: 'center', flex: 1 }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  headerRight: { width: 40 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Theme.typography.fontFamily,
  },
  
  card: { backgroundColor: Theme.colors.white, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, minHeight: 60 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  rowSubtitle: { fontSize: 13, color: Theme.colors.textSecondary, fontWeight: '600', fontFamily: Theme.typography.fontFamily },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginLeft: 16 },
});
