import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { HOME_PET_SPA, SHOP_DETAIL_INTERIOR } from '../Assets';
import { Icon } from '../Components/Icon';

interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  expiry: string;
  discount: string;
  image: any;
  color: string;
}

const OFFERS: Offer[] = [
  { id: '1', title: 'First Grooming Deal', description: 'Get a flat discount on your first pet grooming session.', code: 'FIRSTPAW', expiry: '31 Oct 2026', discount: '30% OFF', image: HOME_PET_SPA, color: '#fef3c7' },
  { id: '2', title: 'Weekend Spa Special', description: 'Treat your furry friend to a full spa day at a special price.', code: 'SPA40', expiry: '15 Nov 2026', discount: '₹400 OFF', image: SHOP_DETAIL_INTERIOR, color: '#dcfce7' },
];

export default function OffersScreen() {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PawNest Offers</Text>
        <TouchableOpacity style={styles.historyBtn}>
          <Icon name="clock" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Featured Offer Banner */}
        <View style={styles.featuredOffer}>
          <Image source={HOME_PET_SPA} style={styles.featuredImage} resizeMode="cover" />
          <View style={styles.featuredOverlay}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>50% OFF</Text>
            </View>
            <Text style={styles.featuredTitle}>Mega Diwali Sale!</Text>
            <Text style={styles.featuredSubtitle}>Valid on all premium services</Text>
            <TouchableOpacity style={styles.claimBtn}>
              <Text style={styles.claimBtnText}>Claim Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Coupons</Text>

        <View style={styles.couponList}>
          {OFFERS.map(offer => (
            <View key={offer.id} style={[styles.couponCard, { backgroundColor: offer.color }]}>
              <View style={styles.couponLeft}>
                <Image source={offer.image} style={styles.couponImage} resizeMode="cover" />
              </View>
              <View style={styles.couponRight}>
                <View style={styles.couponHeader}>
                  <Text style={styles.couponTitle}>{offer.title}</Text>
                  <Text style={styles.couponDiscount}>{offer.discount}</Text>
                </View>
                <Text style={styles.couponDesc}>{offer.description}</Text>
                <View style={styles.couponFooter}>
                  <View style={styles.codeRow}>
                    <Text style={styles.codeLabel}>CODE:</Text>
                    <Text style={styles.codeText}>{offer.code}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyBtn}>
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.expiryText}>Expires on {offer.expiry}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Loyalty Program Section */}
        <View style={styles.loyaltyBlock}>
          <View style={styles.loyaltyIconWrapper}><Icon name="star" size={24} color={Theme.colors.secondary} /></View>
          <View style={styles.loyaltyTextCol}>
            <Text style={styles.loyaltyTitle}>Loyalty Program</Text>
            <Text style={styles.loyaltySubtitle}>Earn 10 points for every ₹100 spent</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join Now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  historyBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80' },
  historyIcon: { },

  scrollContent: { padding: 16, paddingBottom: 100 },

  featuredOffer: { height: 200, borderRadius: 24, overflow: 'hidden', position: 'relative', marginBottom: 24 },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 20, justifyContent: 'flex-end' },
  discountBadge: { backgroundColor: Theme.colors.secondary, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 8 },
  discountBadgeText: { color: Theme.colors.white, fontWeight: '800', fontSize: 12 },
  featuredTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.white },
  featuredSubtitle: { fontSize: 14, color: Theme.colors.white + 'CC', marginTop: 4, marginBottom: 16 },
  claimBtn: { backgroundColor: Theme.colors.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  claimBtnText: { color: Theme.colors.primary, fontWeight: '700', fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 16 },

  couponList: { gap: 16 },
  couponCard: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', minHeight: 140 },
  couponLeft: { width: 100 },
  couponImage: { width: '100%', height: '100%' },
  couponRight: { flex: 1, padding: 16, gap: 4 },
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  couponTitle: { fontSize: 15, fontWeight: '800', color: Theme.colors.text, flex: 1 },
  couponDiscount: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary, marginLeft: 8 },
  couponDesc: { fontSize: 12, color: Theme.colors.textSecondary, marginBottom: 8 },
  couponFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Theme.colors.white, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: Theme.colors.border },
  codeLabel: { fontSize: 9, fontWeight: '800', color: Theme.colors.textSecondary },
  codeText: { fontSize: 12, fontWeight: '800', color: Theme.colors.text },
  copyBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyBtnText: { color: Theme.colors.white, fontSize: 10, fontWeight: '800' },
  expiryText: { fontSize: 10, color: Theme.colors.textSecondary, marginTop: 4 },

  loyaltyBlock: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white, 
    padding: 20, borderRadius: 24, marginTop: 32,
    borderWidth: 1, borderColor: Theme.colors.border, gap: 16
  },
  loyaltyIconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: Theme.colors.secondary + '1A', alignItems: 'center', justifyContent: 'center' },
  loyaltyEmoji: { },
  loyaltyTextCol: { flex: 1 },
  loyaltyTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text },
  loyaltySubtitle: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  joinBtn: { backgroundColor: Theme.colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  joinBtnText: { color: Theme.colors.white, fontSize: 12, fontWeight: '800' },
});
