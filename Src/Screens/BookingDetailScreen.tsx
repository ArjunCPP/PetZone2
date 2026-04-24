import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, ActivityIndicator, BackHandler, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { SHOP_DETAIL_LOGO } from '../Assets';
import { Skeleton } from '../Components/Skeleton';
import authApi from '../Api';
import { Toast } from '../Components/Toast';
import { CancelModal } from '../Components/CancelModal';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

const CANCELLATION_POLICY = "• Before 2 hours: Full Refund\n• 1 to 2 hours: 75% Refund\n• Within 1 hour: No Refund";

export default function BookingDetailScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { bookingData } = route.params;
  const [loading, setLoading] = React.useState(true);
  const [cancelling, setCancelling] = React.useState(false);
  const [toast, setToast] = React.useState({ visible: false, message: '', type: 'info' as 'info' | 'success' | 'error' });
  const [confirmVisible, setConfirmVisible] = React.useState(false);

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

  React.useEffect(() => {
    // Artificial delay for premium skeleton feel
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Format date and time
  const scheduledDate = new Date(bookingData.scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const status = bookingData.status?.toUpperCase() || 'PENDING';
  const isUpcoming = status === 'PENDING' || status === 'CONFIRMED' || status === 'UPCOMING';
  const statusLabel = isUpcoming ? 'Upcoming' : status === 'COMPLETED' ? 'Completed' : 'Cancelled';



  const handleCancel = () => {
    setConfirmVisible(true);
  };

  const handleDirections = () => {
    if (!bookingData.tenant?.location?.latitude || !bookingData.tenant?.location?.longitude) {
      Alert.alert('Location Unavailable', 'Store location coordinates are not available.');
      return;
    }
    const { latitude, longitude } = bookingData.tenant.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Google Maps.');
      }
    });
  };

  const executeCancel = async () => {
    setConfirmVisible(false);
    try {
      setCancelling(true);
      console.log("Booking ID:", bookingData._id || bookingData.id);
      const response = await authApi.cancelBookinng(bookingData._id || bookingData.id);
      if (response.data?.success) {
        setToast({ visible: true, message: 'Booking cancelled successfully!', type: 'success' });
        // Navigate back after a short delay to show the toast
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        setToast({ visible: true, message: response.data?.message || 'Failed to cancel booking', type: 'error' });
      }
    } catch (error) {
      console.log("Error cancelling booking:", error);
      setToast({ visible: true, message: 'An error occurred while cancelling', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {loading ? (
          <View>
            <View style={styles.statusSection}>
              <Skeleton width={100} height={24} borderRadius={20} />
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Skeleton width={60} height={60} borderRadius={12} />
                <View style={styles.shopInfo}>
                  <Skeleton width="70%" height={20} borderRadius={4} />
                  <Skeleton width="40%" height={14} borderRadius={4} />
                </View>
              </View>
            </View>
            <Skeleton width={150} height={14} borderRadius={4} style={{ marginBottom: 12, marginTop: 10 }} />
            <View style={styles.card}>
              {[1, 2, 3].map((i) => (
                <View key={i}>
                  <View style={styles.infoRow}>
                    <Skeleton width={100} height={16} borderRadius={4} />
                    <Skeleton width={120} height={16} borderRadius={4} />
                  </View>
                  {i < 3 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Status Badge Top */}
            <View style={styles.statusSection}>
              <View style={[styles.statusBadge, styles[`status${statusLabel}`]]}>
                <Text style={styles.statusText}>{statusLabel.toUpperCase()}</Text>
              </View>
            </View>

            {/* Shop Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={bookingData.tenant?.logo?.url ? { uri: bookingData.tenant.logo.url } : SHOP_DETAIL_LOGO}
                  style={styles.shopLogo}
                  resizeMode="cover"
                />
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>{bookingData.tenant?.storeName || 'PawNest Shop'}</Text>
                  <Text style={styles.shopLocation} numberOfLines={2}>
                    {bookingData.tenant?.address?.street ? `${bookingData.tenant.address.street}, ${bookingData.tenant.address.city || ''}` : typeof bookingData.tenant?.address === 'string' ? bookingData.tenant.address : 'Premium Pet Care'}
                  </Text>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: Theme.colors.border, marginVertical: 12 }} />
              <TouchableOpacity style={styles.directionsBtnContainer} onPress={handleDirections}>
                <Icon name="location" size={18} color={Theme.colors.primary} />
                <Text style={styles.directionsBtnText}>Get Directions</Text>
              </TouchableOpacity>
            </View>

            {/* Booking Info Section */}
            <Text style={styles.sectionTitle}>SERVICE INFORMATION</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="tag" size={18} color={Theme.colors.primary} />
                  <Text style={styles.infoLabel}>Service</Text>
                </View>
                <Text style={styles.infoValue}>{bookingData.serviceDetails?.title || 'Pet Grooming'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="bookings" size={18} color={Theme.colors.primary} />
                  <Text style={styles.infoLabel}>Date & Time</Text>
                </View>
                <Text style={styles.infoValue}>{dateStr} • {timeStr}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="clock" size={18} color={Theme.colors.primary} />
                  <Text style={styles.infoLabel}>Duration</Text>
                </View>
                <Text style={styles.infoValue}>{bookingData.serviceDetails?.durationMinutes || 60} Minutes</Text>
              </View>
            </View>

            {/* Pet Section if available */}
            {bookingData.pet && (
              <>
                <Text style={styles.sectionTitle}>PET DETAILS</Text>
                <View style={styles.card}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon name="profile" size={18} color={Theme.colors.primary} />
                      <Text style={styles.infoLabel}>Pet Name</Text>
                    </View>
                    <Text style={styles.infoValue}>{bookingData.pet.name}</Text>
                  </View>
                </View>
              </>
            )}

            {/* Payment Section */}
            <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
            <View style={[styles.card, styles.paymentCard]}>
              <View style={styles.infoRow}>
                <Text style={styles.paymentLabel}>Service Amount</Text>
                <Text style={styles.paymentValue}>₹{bookingData.totalAmount || bookingData.serviceDetails?.price || '0'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={[styles.paymentLabel, styles.totalLabel]}>Total Paid</Text>
                <Text style={[styles.paymentValue, styles.totalValue]}>₹{bookingData.totalAmount || bookingData.serviceDetails?.price || '0'}</Text>
              </View>
            </View>

            {/* Refund Section for Cancelled Bookings */}
            {statusLabel === 'Cancelled' && bookingData.refund && (
              <>
                <Text style={styles.sectionTitle}>REFUND INFORMATION</Text>
                <View style={[styles.card, { backgroundColor: '#F8F9FA' }]}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon name="tag" size={18} color={Theme.colors.primary} />
                      <Text style={styles.infoLabel}>Refund Status</Text>
                    </View>
                    <Text style={[styles.infoValue, { color: bookingData.refund.refundStatus === 'Processed' ? '#10b981' : Theme.colors.primary }]}>
                      {bookingData.refund.refundStatus || 'Pending'}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <Icon name="clock" size={18} color={Theme.colors.primary} />
                      <Text style={styles.infoLabel}>Refund Amount</Text>
                    </View>
                    <Text style={styles.infoValue}>₹{bookingData.refund.refundAmount || 0} ({bookingData.refund.refundPercentage || 0}%)</Text>
                  </View>
                </View>
              </>
            )}

            {/* Notes Section */}
            {bookingData.notes && bookingData.notes !== 'No special instructions' && (
              <>
                <Text style={styles.sectionTitle}>SPECIAL INSTRUCTIONS</Text>
                <View style={styles.card}>
                  <Text style={styles.notesText}>{bookingData.notes}</Text>
                </View>
              </>
            )}
          </>
        )}

        {statusLabel === 'Upcoming' && !loading && (
          <TouchableOpacity
            style={[
              styles.cancelBtn,
              cancelling && { opacity: 0.6 }
            ]}
            onPress={() => handleCancel()}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#f43f5e" />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <CancelModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={executeCancel}
        title="Cancel Booking?"
        message={`Are you sure you want to cancel your booking at ${bookingData?.tenant?.storeName || 'the store'} on ${dateStr} at ${timeStr}?`}
        policyInfo={CANCELLATION_POLICY}
        onOpenPolicy={(url, title) => navigation.navigate('WebViewScreen', { url, title })}
      />
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  headerRight: { width: 40 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

  statusSection: { alignItems: 'center', marginBottom: 20 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusUpcoming: { backgroundColor: Theme.colors.primary + '1A' },
  statusCompleted: { backgroundColor: '#10b9811A' },
  statusCancelled: { backgroundColor: '#f43f5e1A' },
  statusText: { fontSize: 12, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 0.5 },

  card: { backgroundColor: Theme.colors.white, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopLogo: { width: 60, height: 60, borderRadius: 12, backgroundColor: Theme.colors.primary + '1A' },
  shopInfo: { flex: 1, gap: 4 },
  shopName: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  shopLocation: { fontSize: 13, color: Theme.colors.textSecondary, fontWeight: '600' },

  directionsBtnContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 4, paddingTop: 4 },
  directionsBtnText: { fontSize: 14, fontWeight: '700', color: Theme.colors.primary },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: Theme.colors.textSecondary, marginBottom: 10, marginLeft: 4, letterSpacing: 1 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: Theme.colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },

  divider: { height: 1, backgroundColor: Theme.colors.border },

  paymentCard: { backgroundColor: Theme.colors.surface },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: Theme.colors.textSecondary },
  paymentValue: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  totalLabel: { color: Theme.colors.text, fontSize: 16, fontWeight: '800' },
  totalValue: { color: Theme.colors.primary, fontSize: 20, fontWeight: '900' },

  notesText: { fontSize: 14, color: Theme.colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },

  cancelBtn: {
    marginHorizontal: 4, height: 54, borderRadius: 16, borderWidth: 1, borderColor: '#f43f5e',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#f43f5e1A', marginTop: 10
  },
  cancelBtnText: { color: '#f43f5e', fontSize: 16, fontWeight: '800' }
});
