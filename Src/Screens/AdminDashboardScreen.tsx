import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { ADMIN_DASHBOARD_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const stats = [
    { id: '1', label: 'Today Appointments', value: '12', color: Theme.colors.primary },
    { id: '2', label: 'New Bookings', value: '04', color: Theme.colors.secondary },
    { id: '3', label: 'Total Revenue', value: '₹5,400', color: '#10b981' },
    { id: '4', label: 'Pet Count', value: '08', color: '#f59e0b' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.badgeRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Live</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="notifications" size={20} color={Theme.colors.text} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Block */}
        <View style={styles.welcomeBlock}>
          <View style={styles.welcomeTextCol}>
            <Text style={styles.welcomeSubtitle}>Good Morning,</Text>
            <Text style={styles.welcomeTitle}>Paws & Claws Admin</Text>
          </View>
          <Image source={ADMIN_DASHBOARD_IMAGE} style={styles.dashImage} resizeMode="cover" />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionList}>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('TodaysAppointments')}
          >
            <View style={styles.actionIconWrapper}><Icon name="clock" size={24} color={Theme.colors.primary} /></View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Today's Appointments</Text>
              <Text style={styles.actionSubtitle}>View and manage bookings for today</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => navigation.navigate('BlockSlot')}
          >
            <View style={styles.actionIconWrapper}><Icon name="lock" size={24} color={Theme.colors.primary} /></View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Block Time Slots</Text>
              <Text style={styles.actionSubtitle}>Schedule shop maintenance or breaks</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionItem}
          >
            <View style={styles.actionIconWrapper}><Icon name="settings" size={24} color={Theme.colors.primary} /></View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Shop Settings</Text>
              <Text style={styles.actionSubtitle}>Update name, location or services</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* Logout Footer */}
      <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.logoutText}>Return to Customer App</Text>
      </TouchableOpacity>
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
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.text },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10b9811A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  onlineText: { fontSize: 10, fontWeight: '800', color: '#10b981', letterSpacing: 0.5 },
  notificationBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80', position: 'relative' },
  notificationIcon: { },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.secondary, borderWidth: 2, borderColor: Theme.colors.white },

  scrollContent: { padding: 16, paddingBottom: 100 },

  welcomeBlock: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, 
    padding: 24, borderRadius: 24, marginBottom: 24,
    borderWidth: 1, borderColor: Theme.colors.border
  },
  welcomeTextCol: { flex: 1 },
  welcomeSubtitle: { fontSize: 14, color: Theme.colors.textSecondary, fontWeight: '600' },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text, marginTop: 4 },
  dashImage: { width: 80, height: 80, borderRadius: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  statCard: { 
    width: '48%', backgroundColor: Theme.colors.white, padding: 16, 
    borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '700', color: Theme.colors.textSecondary, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 16 },

  actionList: { gap: 12 },
  actionItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, 
    padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border, gap: 16
  },
  actionIconWrapper: { width: 48, height: 48, borderRadius: 12, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  actionEmoji: { },
  actionTextCol: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },
  actionSubtitle: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  arrowIcon: { fontSize: 18, color: Theme.colors.textSecondary, fontWeight: '800' },

  logoutBtn: { 
    position: 'absolute', bottom: 32, left: 16, right: 16,
    backgroundColor: Theme.colors.text, height: 56, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  logoutText: { color: Theme.colors.white, fontSize: 15, fontWeight: '800' },
});
