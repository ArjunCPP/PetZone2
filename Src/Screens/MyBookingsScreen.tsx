import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { SHOP_DETAIL_LOGO } from '../Assets';
import { Icon } from '../Components/Icon';

interface Booking {
  id: string;
  shopName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const BOOKINGS: Booking[] = [
  { id: '1', shopName: 'Paws & Claws Grooming', service: 'Full Grooming & Spa', date: '24 Oct 2026', time: '11:00 AM', price: 899, status: 'Upcoming' },
  { id: '2', shopName: 'Pet Spa Indiranagar', service: 'Bath & Dry', date: '15 Oct 2026', time: '02:30 PM', price: 299, status: 'Completed' },
  { id: '3', shopName: 'Sniff & Scruff', service: 'Nail Trim', date: '10 Oct 2026', time: '10:00 AM', price: 150, status: 'Cancelled' },
];

export default function MyBookingsScreen() {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'History'>('Upcoming');

  const filteredBookings = BOOKINGS.filter(b => 
    activeTab === 'Upcoming' ? b.status === 'Upcoming' : b.status !== 'Upcoming'
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="search" size={20} color={Theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]} 
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'History' && styles.activeTab]} 
          onPress={() => setActiveTab('History')}
        >
          <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Image source={SHOP_DETAIL_LOGO} style={styles.shopLogo} resizeMode="contain" />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{item.shopName}</Text>
                  <Text style={styles.serviceName}>{item.service}</Text>
                </View>
                <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardFooter}>
                <View style={styles.dateTimeRow}>
                  <Icon name="bookings" size={14} color={Theme.colors.textSecondary} />
                  <Text style={styles.footerText}>{item.date} • {item.time}</Text>
                </View>
                <Text style={styles.priceText}>₹{item.price}</Text>
              </View>

              {item.status === 'Upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rescheduleBtn}>
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="bookings" size={80} color={Theme.colors.border} />
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySubtitle}>You haven't made any bookings yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.white
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Theme.colors.text },
  filterBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80' },
  filterIcon: { },

  tabsContainer: { flexDirection: 'row', padding: 8, marginHorizontal: 16, marginTop: 16, backgroundColor: Theme.colors.border + '80', borderRadius: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: Theme.colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary },
  activeTabText: { color: Theme.colors.primary },

  listContent: { padding: 16, paddingBottom: 100 },
  bookingCard: { 
    backgroundColor: Theme.colors.white, borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopLogo: { width: 56, height: 56, borderRadius: 12, backgroundColor: Theme.colors.primary + '1A' },
  shopInfo: { flex: 1, gap: 4 },
  shopName: { fontSize: 15, fontWeight: '800', color: Theme.colors.text },
  serviceName: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '600' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusUpcoming: { backgroundColor: Theme.colors.primary + '1A' },
  statusCompleted: { backgroundColor: '#10b9811A' },
  statusCancelled: { backgroundColor: '#f43f5e1A' },
  statusText: { fontSize: 9, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 0.5 },

  cardDivider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerIcon: { },
  footerText: { fontSize: 13, fontWeight: '700', color: Theme.colors.text },
  priceText: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  rescheduleBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  rescheduleText: { color: Theme.colors.white, fontSize: 13, fontWeight: '700' },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#f43f5e', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#f43f5e', fontSize: 13, fontWeight: '700' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  emptySubtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
});
