import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { CONFIRMATION_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { date, time } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <View style={styles.content}>
        
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={40} color={Theme.colors.white} />
          </View>
          <View style={styles.pawPattern}>
            <Icon name="pets" size={24} color={Theme.colors.primary} style={{ opacity: 0.1 }} />
            <Icon name="pets" size={24} color={Theme.colors.primary} style={{ opacity: 0.1 }} />
            <Icon name="pets" size={24} color={Theme.colors.primary} style={{ opacity: 0.1 }} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your pet is going to look amazing!</Text>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Image source={CONFIRMATION_IMAGE} style={styles.cardHero} resizeMode="cover" />
          <View style={styles.cardBody}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.shopName}>Paws & Claws Grooming</Text>
                <Text style={styles.shopAddr}>Downtown District, NYC</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>CONFIRMED</Text>
              </View>
            </View>

            <View style={styles.detailsList}>
              <View style={styles.detailItem}>
                <View style={styles.itemIconWrapper}><Icon name="cut" size={18} color={Theme.colors.primary} /></View>
                <View>
                  <Text style={styles.itemLabel}>Service</Text>
                  <Text style={styles.itemValue}>Full Grooming & Spa Package</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.itemIconWrapper}><Icon name="bookings" size={18} color={Theme.colors.primary} /></View>
                <View>
                  <Text style={styles.itemLabel}>Date & Time</Text>
                  <Text style={styles.itemValue}>{date} • {time}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <View style={styles.itemIconWrapper}><Icon name="offer" size={18} color={Theme.colors.primary} /></View>
                <View>
                  <Text style={styles.itemLabel}>Booking ID</Text>
                  <Text style={styles.itemValue}>#PB12345</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.secondaryBtnText}>Go Home</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: { },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  backBtnPlaceholder: { width: 40 },

  content: { flex: 1, padding: 16 },

  successBanner: { 
    alignItems: 'center', paddingVertical: 32, borderRadius: 24, 
    backgroundColor: Theme.colors.primary + '0D', marginBottom: 24, position: 'relative', overflow: 'hidden'
  },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  checkIcon: { },
  pawPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', opacity: 0.1 },
  pawEmoji: { },
  successTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, textAlign: 'center' },
  successSubtitle: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginTop: 4, textAlign: 'center' },

  detailsCard: { 
    backgroundColor: Theme.colors.white, borderRadius: 20, 
    borderWidth: 1, borderColor: Theme.colors.primary + '1A', overflow: 'hidden', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 
  },
  cardHero: { width: '100%', height: 160 },
  cardBody: { padding: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  shopName: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  shopAddr: { fontSize: 12, color: Theme.colors.textSecondary },
  statusBadge: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 0.5 },

  detailsList: { gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIconWrapper: { width: 40, height: 40, borderRadius: 10, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  itemEmoji: { },
  itemLabel: { fontSize: 10, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemValue: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },

  actions: { gap: 12, marginTop: 'auto', marginBottom: 16 },
  primaryBtn: { backgroundColor: Theme.colors.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  primaryBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
  secondaryBtn: { backgroundColor: Theme.colors.primary + '1A', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: Theme.colors.primary, fontSize: 16, fontWeight: '800' },
});
