import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { PAYMENT_ORDER_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export default function PaymentScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { date, time, price } = route.params;
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');

  const tax = 45;
  const total = price + tax;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderSubtitle}>ORDER SUMMARY</Text>
            <Text style={styles.shopName}>Paws & Claws Grooming</Text>
            <Text style={styles.serviceName}>Full Grooming Service</Text>
            <View style={styles.dateTimeRow}>
              <Icon name="bookings" size={12} color={Theme.colors.textSecondary} />
              <Text style={styles.dateTimeText}>{date} • {time}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>₹{price}</Text>
            </View>
          </View>
          <Image source={PAYMENT_ORDER_IMAGE} style={styles.orderImage} resizeMode="cover" />
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.methodList}>
          
          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'upi' && styles.methodItemSelected]} 
            onPress={() => setPaymentMethod('upi')}
          >
            <View style={styles.methodIconWrapper}><Icon name="profile" size={20} color={Theme.colors.text} /></View>
            <View style={styles.methodTextCol}>
              <Text style={styles.methodTitle}>UPI (GPay, PhonePe, Paytm)</Text>
              <Text style={styles.methodDesc}>Pay instantly using any UPI app</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'upi' && styles.radioSelected]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'card' && styles.methodItemSelected]} 
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.methodIconWrapper}><Icon name="bookings" size={20} color={Theme.colors.text} /></View>
            <View style={styles.methodTextCol}>
              <Text style={styles.methodTitle}>Credit / Debit Card</Text>
              <Text style={styles.methodDesc}>Visa, Mastercard, RuPay</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioSelected]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodItem, paymentMethod === 'cash' && styles.methodItemSelected]} 
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.methodIconWrapper}><Icon name="offer" size={20} color={Theme.colors.text} /></View>
            <View style={styles.methodTextCol}>
              <Text style={styles.methodTitle}>Cash on Service</Text>
              <Text style={styles.methodDesc}>Pay directly at the salon after grooming</Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'cash' && styles.radioSelected]} />
          </TouchableOpacity>

        </View>

        {/* Bill Details */}
        <Text style={styles.sectionTitle}>Bill Details</Text>
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Service Total</Text>
            <Text style={styles.billValue}>₹{price}.00</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Taxes & Fees</Text>
            <Text style={styles.billValue}>₹{tax}.00</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Discount</Text>
            <Text style={[styles.billValue, { color: Theme.colors.primary }]}>- ₹0.00</Text>
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
          style={styles.payBtn} 
          onPress={() => navigation.navigate('BookingConfirmation', { shopId: route.params.shopId, date, time })}
        >
          <Text style={styles.payBtnText}>Confirm & Pay ₹{total}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: { },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Theme.colors.text, paddingRight: 40 },

  scrollContent: { padding: 16, paddingBottom: 140 },

  orderCard: { 
    flexDirection: 'row', backgroundColor: Theme.colors.white, borderRadius: 16, padding: 16, 
    borderWidth: 1, borderColor: Theme.colors.border, gap: 12, alignItems: 'center'
  },
  orderInfo: { flex: 1 },
  orderSubtitle: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 1, marginBottom: 4 },
  shopName: { fontSize: 16, fontWeight: '700', color: Theme.colors.text },
  serviceName: { fontSize: 14, color: Theme.colors.textSecondary, marginBottom: 8 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  calendarIcon: { },
  dateTimeText: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '600' },
  priceTag: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  priceTagText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '800' },
  orderImage: { width: 88, height: 88, borderRadius: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginTop: 24, marginBottom: 12 },
  
  methodList: { gap: 12 },
  methodItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, padding: 16, 
    borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border, gap: 12
  },
  methodItemSelected: { borderColor: Theme.colors.primary, borderWidth: 2 },
  methodIconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: Theme.colors.border + '80', alignItems: 'center', justifyContent: 'center' },
  methodEmoji: { },
  methodTextCol: { flex: 1 },
  methodTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  methodDesc: { fontSize: 12, color: Theme.colors.textSecondary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Theme.colors.border },
  radioSelected: { borderColor: Theme.colors.primary, borderWidth: 6 },

  billCard: { backgroundColor: Theme.colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billKey: { fontSize: 14, color: Theme.colors.textSecondary, fontWeight: '500' },
  billValue: { fontSize: 14, color: Theme.colors.text, fontWeight: '700' },
  dashedDivider: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: Theme.colors.border, marginVertical: 8 },
  billTotalKey: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },
  billTotalValue: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: Theme.colors.white, padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Theme.colors.border 
  },
  payBtn: { 
    backgroundColor: Theme.colors.secondary, width: '100%', height: 56, 
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    marginBottom: 12
  },
  payBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
  cancelBtn: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: Theme.colors.textSecondary },
});
