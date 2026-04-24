import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Switch, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { UPDATE_PROFILE_IMAGE, SHOP_DETAIL_LOGO } from '../Assets';
import { Icon, IconName } from '../Components/Icon';
import * as Keychain from 'react-native-keychain';
import authApi from '../Api';

// Use 'any' for Props since ProfileScreen is often used in both Tab and Stack context
type Props = any;

export default function ProfileScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasFetched = useRef(false);
  const animValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        if (!hasFetched.current) {
          setInitialLoad(true);
        }
        try {
          const response = await authApi.profile();
          console.log("Profile Data >>>>>", response.data);
          if (response.data?.success) {
            setUserData(response.data.data);
          }
        } catch (error: any) {
          console.log('❌ Profile API Error:', error.response?.data || error.message);
        } finally {
          if (!hasFetched.current) {
            setInitialLoad(false);
            hasFetched.current = true;
          }
        }
      };

      fetchProfile();
    }, [])
  );

  const menuItems: { id: string; title: string; subtitle: string; icon: IconName; route?: string }[] = [
    { id: '2', title: 'Saved Shops', subtitle: 'Your favorite grooming centers', icon: 'heart', route: 'SavedShops' },
    { id: '3', title: 'Transaction History', subtitle: 'View your transaction records', icon: 'offer', route: 'PaymentHistory' },
    { id: '7', title: 'Settings', subtitle: 'App preferences and notifications', icon: 'settings', route: 'Settings' },
    { id: '6', title: 'About PawNest', subtitle: 'App version & policies', icon: 'explore', route: 'About' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userMainRow}>
            {initialLoad ? (
              <Animated.View style={[styles.avatarSkeleton, { opacity: animValue }]} />
            ) : (
              <Image
                source={userData?.avatar?.url ? { uri: userData.avatar.url } : UPDATE_PROFILE_IMAGE}
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.userMeta}>
              {initialLoad ? (
                <>
                  <Animated.View style={[styles.textSkeleton, { opacity: animValue, width: '70%', height: 22, marginBottom: 8 }]} />
                  <Animated.View style={[styles.textSkeleton, { opacity: animValue, width: '50%', height: 14 }]} />
                </>
              ) : (
                <>
                  <Text style={styles.userName}>{userData?.name || 'Pet Lover'}</Text>
                  <Text style={styles.userEmail}>{userData?.email || 'No email provided'}</Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('UpdateProfile', { userData })}
            disabled={initialLoad}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Push Notifications</Text>
            <Text style={styles.toggleSubtitle}>Stay updated on your bookings</Text>
          </View>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={setIsNotificationsEnabled}
            trackColor={{ false: '#cbd5e1', true: Theme.colors.primary + '80' }}
            thumbColor={isNotificationsEnabled ? Theme.colors.primary : '#f8fafc'}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <View style={styles.menuIconWrapper}>
                <Icon name={item.icon} size={20} color={Theme.colors.primary} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Version 1.2.0 (Stable)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Theme.colors.white,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.border
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80' },
  settingsIcon: {},

  scrollContent: { padding: 16, paddingBottom: 120 },

  userCard: {
    backgroundColor: Theme.colors.primary, borderRadius: 24, padding: 24,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, marginBottom: 20
  },
  userMainRow: { flexDirection: 'row', gap: 20, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Theme.colors.white + '33' },
  avatarSkeleton: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.white + '4D', borderWidth: 4, borderColor: Theme.colors.white + '33' },
  userMeta: { flex: 1 },
  textSkeleton: { borderRadius: 4, backgroundColor: Theme.colors.white + '4D' },
  userName: { fontSize: 22, fontWeight: '800', color: Theme.colors.white },
  userEmail: { fontSize: 13, color: Theme.colors.white + 'CC', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumBadge: { backgroundColor: Theme.colors.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  premiumText: { fontSize: 10, fontWeight: '800', color: Theme.colors.white, letterSpacing: 0.5 },
  pointsText: { fontSize: 13, fontWeight: '700', color: Theme.colors.white },
  editBtn: {
    backgroundColor: Theme.colors.white + '26', height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.white + '4D'
  },
  editBtnText: { color: Theme.colors.white, fontSize: 14, fontWeight: '700' },

  toggleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white,
    padding: 16, paddingHorizontal: 20, borderRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Theme.colors.border
  },
  toggleTextCol: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.text },
  toggleSubtitle: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },

  menuList: { gap: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white,
    padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border, gap: 16
  },
  menuIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  menuEmoji: {},
  menuTextCol: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.text },
  menuSubtitle: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  arrowIcon: { fontSize: 18, color: Theme.colors.textSecondary, fontWeight: '800' },

  versionText: { textAlign: 'center', fontSize: 12, color: Theme.colors.textSecondary, marginTop: 24 },
});
