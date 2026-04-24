import React, { useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingFailed'>;

export default function BookingFailedScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { bookingId } = route.params;
  
  const handleBack = useCallback(() => {
    // For post-payment screens, always go back to Home screen to prevent stale state
    navigation.navigate('MainTabs');
    return true; 
  }, [navigation]);

  useEffect(() => {
    // Disable swipe back gesture on iOS
    navigation.setOptions({ gestureEnabled: false });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack, navigation]);

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

        <View style={styles.iconContainer}>
          <View style={styles.errorCircle}>
            <Icon name="close" size={48} color={Theme.colors.white} />
          </View>
        </View>

        <Text style={styles.errorTitle}>Payment Failed</Text>
        <Text style={styles.errorSubtitle}>
          Something went wrong while processing your payment. Your booking has not been confirmed yet.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Booking Reference</Text>
          <Text style={styles.infoValue}>{bookingId || '---'}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
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
  errorCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.error,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  errorTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, marginBottom: 12, textAlign: 'center' },
  errorSubtitle: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 30 },
  
  infoCard: {
    backgroundColor: Theme.colors.white,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 40,
  },
  infoLabel: { fontSize: 11, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '800', color: Theme.colors.text },

  buttonGroup: { width: '100%', gap: 15 },
  retryBtn: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
  
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
    paddingVertical: 10,
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
