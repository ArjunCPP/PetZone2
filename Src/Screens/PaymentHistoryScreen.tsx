import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, ActivityIndicator, FlatList, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import authApi from '../Api';
import { TransactionCardSkeleton } from '../Components/Skeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentHistory'>;

interface Tenant {
  _id: string;
  storeName: string;
  id: string;
}

interface Booking {
  _id: string;
  tenant: string;
  user: string;
  pet: string;
  serviceDetails: string;
  staff: string;
  scheduledAt: string;
  endsAt: string;
  status: string;
  notes: string;
}

interface PaymentItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  payoutStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
  tenant: Tenant;
  booking: Booking;
}

export default function PaymentHistoryScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await authApi.paymentHistory();
      console.log("Transaction History", res.data);
      if (res.data && res.data.success) {
        // Sort by date: Newest (Last) to Oldest (First)
        const sortedPayments = (res.data.data?.data || []).sort((a: PaymentItem, b: PaymentItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPayments(sortedPayments);
      }
    } catch (error) {
      console.log('Error fetching transactions:', error);
    } finally {
      // Small delay for better UX layout transition
      setTimeout(() => setLoading(false), 800);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const value = amount / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' • ' + date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
      case 'success':
        return { label: 'SUCCESS', color: '#00B341', bg: '#E6F9EE' };
      case 'failed':
        return { label: 'FAILED', color: '#EF4444', bg: '#FEECEC' };
      case 'pending':
      case 'created':
        return { label: 'PENDING', color: '#F97316', bg: '#FFF4E5' };
      default:
        return { label: status.toUpperCase(), color: Theme.colors.textSecondary, bg: Theme.colors.border };
    }
  };

  const renderPaymentItem = ({ item }: { item: PaymentItem }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.paymentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.storeInfo}>
            <View style={styles.storeIconBg}>
              <Icon name="pets" size={18} color={Theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.storeName} numberOfLines={1}>
                {item.tenant?.storeName || 'PawNest Store'}
              </Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{item.razorpayPaymentId || item._id.slice(-12).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>#{item.booking?._id?.slice(-8).toUpperCase() || '---'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.amountContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.amountText}>{formatCurrency(item.amount, item.currency)}</Text>
          </View>
          <TouchableOpacity style={styles.receiptBtn}>
            <Icon name="chevron_right" size={16} color={Theme.colors.primary} />
            <Text style={styles.receiptText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.listHeader}>Recent Transactions</Text>
          {[1, 2, 3, 4, 5].map((i) => (
            <TransactionCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="bookings" size={40} color={Theme.colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptySubtitle}>Your transaction history will appear here once you make a booking.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={styles.listHeader}>Recent Transactions</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Theme.colors.background,
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  headerRight: { width: 44 },

  listHeader: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 16, paddingHorizontal: 4 },
  listContent: { padding: 20, paddingBottom: 40 },
  
  paymentCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  storeIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: Theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  storeName: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 4 },
  dateText: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '500' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 4, marginBottom: 16 },

  cardBody: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: Theme.colors.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: 13, color: Theme.colors.text, fontWeight: '600' },

  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: Theme.colors.border + '50' 
  },
  amountContainer: { flex: 1 },
  totalLabel: { fontSize: 11, color: Theme.colors.textSecondary, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  amountText: { fontSize: 18, fontWeight: '800', color: Theme.colors.primary },
  
  receiptBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Theme.colors.primary + '10', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 10 
  },
  receiptText: { fontSize: 13, fontWeight: '700', color: Theme.colors.primary, marginLeft: 6 },

  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: 16, fontSize: 15, color: Theme.colors.textSecondary, fontWeight: '600' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.border + '30', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
