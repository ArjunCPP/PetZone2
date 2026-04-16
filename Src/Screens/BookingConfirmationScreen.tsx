import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { date, time, shopName, serviceTitle, bookingId, amount } = route.params;

  const handleBack = useCallback(() => {
    // For confirmation, always go back to Home screen to prevent returning to payment
    navigation.navigate('MainTabs');
    return true; 
  }, [navigation]);

  useEffect(() => {
    // Disable swipe back gesture on iOS
    navigation.setOptions({ gestureEnabled: false });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack, navigation]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeBtn} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color={Theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successCircle}>
            <Icon name="check" size={48} color={Theme.colors.white} />
          </View>
        </View>

        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your appointment has been successfully booked at {shopName || 'PawNest'}.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking Reference</Text>
            <Text style={styles.infoValue}>{bookingId || '---'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Scheduled Time</Text>
            <Text style={styles.infoValue}>{date} • {displayTime}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Service</Text>
            <Text style={styles.infoValue}>{serviceTitle || 'Pet Grooming'}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'BookingsTab' } as any)}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.historyBtn}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <Text style={styles.historyBtnText}>View Payment History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  container: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  
  iconContainer: { marginBottom: 30 },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  successTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, marginBottom: 12, textAlign: 'center' },
  successSubtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 15, marginBottom: 30 },
  
  infoCard: {
    backgroundColor: Theme.colors.white,
    padding: 20,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: { paddingVertical: 8 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '800', color: Theme.colors.text },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 4 },

  buttonGroup: { width: '100%', gap: 15 },
  primaryBtn: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
  
  historyBtn: {
    backgroundColor: Theme.colors.white,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  historyBtnText: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' },

  homeBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { color: Theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
  
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
});
