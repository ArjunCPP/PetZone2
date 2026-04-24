import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { PAYMENT_ORDER_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';
import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import { RAZORPAY_CONFIG } from '../Constants/Config';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export default function PaymentScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { date, time, price, serviceTitle, shopName, bookingId } = route.params;
  const [loading, setLoading] = useState(false);

  const handleBack = useCallback(() => {
    // User preferred: Go back 2 steps to Time Slot Selection
    navigation.pop(2);
    return true;
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  const tax = 0;
  const total = price;

  const displayTime = useMemo(() => {
    try {
      if (!time) return '---';
      const d = new Date(time);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return time;
    }
  }, [time]);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1. First call paymentOrder API to get order details
      console.log("🚀 [PaymentOrder] Calling API for booking:", bookingId);
      const orderRes = await authApi.paymentOrder({ bookingId });
      console.log("✅ [PaymentOrder] Response:", JSON.stringify(orderRes.data, null, 2));

      if (!orderRes.data || !orderRes.data.success) {
        Alert.alert('Error', 'Unable to initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      const orderData = orderRes.data.data;
      // Handle different possible response structures
      const razorpayOrderId = orderData?.id || orderData?.orderId || orderData?.razorpayOrderId || (orderData?.order?.id);

      if (!razorpayOrderId) {
        console.error("❌ [PaymentOrder] Failed to find Order ID in response:", orderData);
        Alert.alert('Payment Error', 'Failed to initialize payment order. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: `Payment for ${serviceTitle}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3590/3590518.png',
        currency: 'INR',
        key: RAZORPAY_CONFIG.API_KEY,
        amount: total * 100,
        name: 'PawNest',
        order_id: razorpayOrderId, // Pass server-side order ID
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'PawNest User'
        },
        theme: { color: Theme.colors.primary }
      };

      console.log("💳 Opening Razorpay with OrderID:", razorpayOrderId);
      
      RazorpayCheckout.open(options).then(async (data: any) => {
        // Razorpay Success
        console.log("✅ Razorpay Success:", JSON.stringify(data, null, 2));
        
        // 3. Verify Payment
        const verifyPayload = {
          razorpayOrderId: data.razorpay_order_id || razorpayOrderId,
          razorpayPaymentId: data.razorpay_payment_id,
          razorpaySignature: data.razorpay_signature,
          bookingId: bookingId
        };
        
        console.log("📡 [PaymentVerify] Calling API with:", JSON.stringify(verifyPayload, null, 2));
        const verifyRes = await authApi.paymentVerify(verifyPayload);
        console.log("🏁 [PaymentVerify] Response:", JSON.stringify(verifyRes.data, null, 2));

        if (verifyRes.data && verifyRes.data.success) {
          // Keep loading true while navigating to prevent double taps
          navigation.navigate('BookingConfirmation', {
            shopId: route.params.shopId,
            shopName: shopName || 'PawNest Partner',
            serviceTitle: serviceTitle || 'Pet Grooming',
            date,
            time,
            amount: total,
            bookingId: data.razorpay_payment_id
          });
        } else {
          setLoading(false);
          Alert.alert('Payment Failed', 'We could not verify your payment. Please try again.');
        }
      }).catch(async (error: any) => {
        setLoading(false);
        // Razorpay Failure or Cancel
        console.log("❌ Razorpay Error:", JSON.stringify(error, null, 2));
        
        if (error.code === 2) {
          Alert.alert('Payment Cancelled', 'Transaction was cancelled by user.');
        } else {
          // Even on failure, we can call verify if we have data, 
          // but usually we just stay on the screen and show an error.
          Alert.alert('Payment Failed', 'Something went wrong while processing your payment. Please try again.');
        }
      });
    } catch (apiError: any) {
      setLoading(false);
      console.log('❌ Payment Step Error:', apiError.response?.data || apiError.message);
      Alert.alert('Error', 'Something went wrong during payment initialization.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header like other screens */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.iconBtn}
            disabled={loading}
          >
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Payment Details</Text>
        </View>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderSubtitle}>SERVICE DETAILS</Text>
            <Text style={styles.shopNameText}>{shopName || 'PawNest Partner'}</Text>
            <Text style={styles.serviceName}>{serviceTitle || 'Pet Grooming Service'}</Text>
            <View style={styles.dateTimeRow}>
              <Icon name="bookings" size={14} color={Theme.colors.textSecondary} />
              <Text style={styles.dateTimeText}>{date} • {displayTime}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>₹{price}</Text>
            </View>
          </View>
          <Image source={PAYMENT_ORDER_IMAGE} style={styles.orderImage} resizeMode="contain" />
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodList}>
          <View style={styles.razorpayCard}>
            <View style={styles.methodIconWrapper}>
              <Icon name="lock" size={20} color={Theme.colors.primary} />
            </View>
            <View style={styles.methodTextCol}>
              <Text style={styles.methodTitle}>Secure Payment via Razorpay</Text>
              <Text style={styles.methodDesc}>UPI, Credit/Debit Card, Net Banking</Text>
            </View>
            <View style={styles.selectionDot}>
               <View style={styles.innerDot} />
            </View>
          </View>
        </View>

        {/* Bill Details */}
        <Text style={styles.sectionTitle}>Bill Details</Text>
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Service Total</Text>
            <Text style={styles.billValue}>₹{price}.00</Text>
          </View>
          <View style={styles.dashedDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalKey}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{total}.00</Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payBtn, loading && { opacity: 0.8 }]} 
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Theme.colors.white} />
          ) : (
            <Text style={styles.payBtnText}>Confirm & Pay ₹{total}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs')}
          disabled={loading}
        >
          <Text style={[styles.cancelBtn, loading && { opacity: 0.5 }]}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', 
    backgroundColor: Theme.colors.primary + '1A' 
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  navRight: { width: 40 },

  scrollContent: { padding: 20, paddingBottom: 160 },

  orderCard: { 
    flexDirection: 'row', backgroundColor: Theme.colors.white, borderRadius: 20, padding: 20, 
    borderWidth: 1, borderColor: '#F0F0F0', gap: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
  },
  orderInfo: { flex: 1 },
  orderSubtitle: { fontSize: 11, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 1.5, marginBottom: 8 },
  shopNameText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary, marginBottom: 2 },
  serviceName: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, marginBottom: 6 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
  dateTimeText: { fontSize: 13, color: '#666', fontWeight: '600' },
  priceTag: { backgroundColor: Theme.colors.primary + '10', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  priceTagText: { color: Theme.colors.primary, fontSize: 15, fontWeight: '800' },
  orderImage: { width: 80, height: 80, borderRadius: 15 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginTop: 24, marginBottom: 12 },
  
  methodList: { gap: 15 },
  razorpayCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, padding: 18, 
    borderRadius: 20, borderWidth: 2, borderColor: Theme.colors.primary, gap: 15
  },
  methodIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: Theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
  methodTextCol: { flex: 1 },
  methodTitle: { fontSize: 15, fontWeight: '800', color: Theme.colors.text },
  methodDesc: { fontSize: 12, color: '#777', marginTop: 2 },
  selectionDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  innerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.colors.primary },

  billCard: { backgroundColor: Theme.colors.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billKey: { fontSize: 14, color: Theme.colors.textSecondary, fontWeight: '500' },
  billValue: { fontSize: 14, color: Theme.colors.text, fontWeight: '700' },
  dashedDivider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: Theme.colors.border, marginVertical: 8 },
  billTotalKey: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },
  billTotalValue: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: Theme.colors.white, padding: 20, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: '#F0F0F0' 
  },
  payBtn: { 
    backgroundColor: Theme.colors.primary, width: '100%', height: 60, 
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    marginBottom: 15
  },
  payBtnText: { color: Theme.colors.white, fontSize: 17, fontWeight: '800' },
  cancelBtn: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#999' },
});
