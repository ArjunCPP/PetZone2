import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { SHOP_DETAIL_LOGO } from '../Assets';
import { Icon } from '../Components/Icon';
import authApi from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import { BookingCardSkeleton } from '../Components/Skeleton';
import { Toast } from '../Components/Toast';
import { CancelModal } from '../Components/CancelModal';

interface Booking {
  id: string;
  shopName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const CANCELLATION_POLICY = "• Before 2 hours: Full Refund\n• 1 to 2 hours: 75% Refund\n• Within 1 hour: No Refund";

export default function MyBookingsScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'History'>('Upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const fetchBookings = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await authApi.myBookings();
      console.log("My Bookings API Response:", response.data);

      if (response.data?.success) {
        // Handle double nested data if response.data.data is an object containing data: []
        const rawData = response.data.data;
        const bookingsList = Array.isArray(rawData) ? rawData : (rawData?.data && Array.isArray(rawData.data) ? rawData.data : []);
        setBookings(bookingsList);
        console.log("Bookings List:", bookingsList);
      }
    } catch (error) {
      console.log("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = (booking: any) => {
    setSelectedBooking(booking);
    setConfirmVisible(true);
  };

  const executeCancel = async () => {
    if (!selectedBooking) return;

    setConfirmVisible(false);
    try {
      setLoading(true);
      const bookingId = selectedBooking._id || selectedBooking.id;
      const response = await authApi.cancelBookinng(bookingId);
      if (response.data?.success) {
        setToast({ visible: true, message: 'Booking cancelled successfully!', type: 'success' });
        fetchBookings();
      } else {
        setToast({ visible: true, message: response.data?.message || 'Failed to cancel booking', type: 'error' });
      }
    } catch (error) {
      console.log("Error cancelling booking:", error);
      setToast({ visible: true, message: 'An error occurred while cancelling', type: 'error' });
    } finally {
      setLoading(false);
      setSelectedBooking(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = () => fetchBookings(true);

  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    let filtered = bookings.filter(b => {
      const status = b.status?.toUpperCase();
      const isUpcoming = status === 'UPCOMING' || status === 'CONFIRMED' || status === 'PENDING';
      return activeTab === 'Upcoming' ? isUpcoming : !isUpcoming;
    });

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime();
      const dateB = new Date(b.scheduledAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [bookings, activeTab, sortOrder]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerRight} />
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

      {/* Sort Filter */}
      <View style={styles.sortFilterContainer}>
        <Text style={styles.filterLabel}>Sort by Date:</Text>
        <TouchableOpacity
          style={styles.sortToggle}
          onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
        >
          <Text style={styles.sortText}>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</Text>
          <Icon
            name="chevron_down"
            size={14}
            color={Theme.colors.primary}
            style={{ transform: [{ rotate: sortOrder === 'newest' ? '0deg' : '180deg' }] }}
          />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {[1, 2, 3, 4].map((i) => <BookingCardSkeleton key={i} />)}
        </ScrollView>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Theme.colors.primary]} />
          }
          renderItem={({ item }) => {
            const status = item.status?.toUpperCase() || 'PENDING';
            const isUpcoming = status === 'PENDING' || status === 'CONFIRMED' || status === 'UPCOMING';
            const statusLabel = isUpcoming ? 'Upcoming' : status === 'COMPLETED' ? 'Completed' : 'Cancelled';

            // Format date and time from scheduledAt
            const scheduledDate = new Date(item.scheduledAt);
            const dateStr = scheduledDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });


            return (
              <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetail', { bookingData: item })}
              >
                <View style={styles.cardHeader}>
                  <Image
                    source={item.tenant?.logo?.url ? { uri: item.tenant.logo.url } : SHOP_DETAIL_LOGO}
                    style={styles.shopLogo}
                    resizeMode="cover"
                  />
                  <View style={styles.shopInfo}>
                    <Text style={styles.shopName} numberOfLines={1}>{item.tenant?.storeName || 'PawNest Shop'}</Text>
                    <Text style={styles.serviceName} numberOfLines={1}>{item.serviceDetails?.title || 'Pet Grooming'}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status${statusLabel}`]]}>
                    <Text style={styles.statusText}>{statusLabel.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View style={styles.dateTimeRow}>
                    <Icon name="bookings" size={14} color={Theme.colors.textSecondary} />
                    <Text style={styles.footerText}>{dateStr} • {timeStr}</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Icon name="clock" size={12} color={Theme.colors.primary} />
                    <Text style={styles.durationText}>{item.serviceDetails?.durationMinutes || 60} Mins</Text>
                  </View>
                </View>

                {/* Refund Status for Cancelled Bookings */}
                {statusLabel === 'Cancelled' && item.refund && (
                  <View style={styles.refundRow}>
                    <View style={styles.refundInfo}>
                      <Text style={styles.refundLabel}>Refund Status: </Text>
                      <Text style={[styles.refundValue, { color: item.refund.refundStatus === 'Processed' ? '#10b981' : Theme.colors.primary }]}>
                        {item.refund.refundStatus || 'Pending'}
                      </Text>
                    </View>
                    <View style={styles.refundAmount}>
                      <Text style={styles.refundPercentage}>{item.refund.refundPercentage || 0}%</Text>
                      <Text style={styles.refundPrice}>₹{item.refund.refundAmount || 0}</Text>
                    </View>
                  </View>
                )}

                {statusLabel === 'Upcoming' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.cancelBookingBtn}
                      onPress={() => handleCancel(item)}
                    >
                      <Text style={styles.cancelBookingText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="bookings" size={80} color={Theme.colors.border} />
          <Text style={styles.emptyTitle}>No bookings found</Text>
          <Text style={styles.emptySubtitle}>You haven't made any bookings yet.</Text>
        </View>
      )}

      <CancelModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={executeCancel}
        title="Cancel Booking?"
        message={`Are you sure you want to cancel your booking at ${selectedBooking?.tenant?.storeName || 'the store'}?`}
        policyInfo={CANCELLATION_POLICY}
        onOpenPolicy={(url, title) => navigation.navigate('WebViewScreen', { url, title })}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
  filterIcon: {},

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
  footerIcon: {},
  footerText: { fontSize: 13, fontWeight: '700', color: Theme.colors.text },
  priceText: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  rescheduleBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  rescheduleText: { color: Theme.colors.white, fontSize: 13, fontWeight: '700' },
  cancelBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#f43f5e', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#f43f5e', fontSize: 13, fontWeight: '700' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  emptySubtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Theme.colors.textSecondary, fontWeight: '600' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  durationText: { fontSize: 13, fontWeight: '800', color: Theme.colors.primary },
  headerRight: { width: 40 },
  sortFilterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 12 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border },
  sortText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },
  cancelBookingBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#f43f5e', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f43f5e1A' },
  cancelBookingText: { color: '#f43f5e', fontSize: 13, fontWeight: '800' },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingHorizontal: 4
  },
  refundInfo: { flexDirection: 'row', alignItems: 'center' },
  refundLabel: { fontSize: 13, fontWeight: '600', color: Theme.colors.textSecondary },
  refundValue: { fontSize: 13, fontWeight: '800' },
  refundAmount: { alignItems: 'flex-end' },
  refundPrice: { fontSize: 14, fontWeight: '800', color: Theme.colors.text },
  refundPercentage: { fontSize: 10, fontWeight: '700', color: Theme.colors.textSecondary },
});
