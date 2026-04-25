import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, LayoutAnimation, UIManager, Platform, Clipboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { HOME_PET_SPA } from '../Assets';
import { Icon } from '../Components/Icon';


import authApi from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import { BannerSkeleton } from '../Components/Skeleton';
import { Toast } from '../Components/Toast';

interface Offer {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  promoCode: string;
  endDate: string;
  discountPercentage?: number;
  discountType?: string;
  discountAmount?: number;
  images: any[];
}

export default function OffersScreen() {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const hasFetchedOffers = React.useRef(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchActiveOffers();
    }, [])
  );

  const fetchActiveOffers = async () => {
    try {
      if (!hasFetchedOffers.current) {
        setIsLoading(true);
      }
      const response = await authApi.activeOffers();
      if (response.data?.success) {
        setOffers(response.data.data);
      }
    } catch (error: any) {
      console.log('❌ Fetch active offers Error:', error.response?.data || error.message);
    } finally {
      hasFetchedOffers.current = true;
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDiscountText = (offer: Offer) => {
    if (offer.discountType === 'percentage' && offer.discountPercentage) {
      return `${offer.discountPercentage}% OFF`;
    }
    if (offer.discountAmount) {
      return `₹${offer.discountAmount} OFF`;
    }
    return '';
  };
  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    showToast(`Promo code ${code} copied to clipboard!`, 'success');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PawNest Offers</Text>
        <View style={styles.historyBtn}>
          <Icon name="clock" size={20} color={Theme.colors.text} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Dynamic Expandable Offer Cards */}
        {isLoading ? (
          <View style={{ gap: 24 }}>
            <BannerSkeleton />
            <BannerSkeleton />
          </View>
        ) : offers.length > 0 ? (
          offers.map((offer, index) => {
            const offerId = offer.id || offer._id || `fallback-${index}`;
            const isExpanded = expandedId === offerId;

            return (
              <View key={offerId + '-' + index} style={styles.offerCardContainer}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => toggleExpand(offerId)}>
                  <View style={styles.featuredOfferContent}>
                    <Image 
                      source={offer.images?.[0]?.url ? { uri: offer.images[0].url } : HOME_PET_SPA} 
                      style={styles.featuredImage} 
                      resizeMode="cover" 
                    />
                    <View style={styles.featuredOverlay}>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountBadgeText}>{getDiscountText(offer)}</Text>
                      </View>
                      <View style={styles.titleRow}>
                        <Text style={styles.featuredTitle}>{offer.title}</Text>
                        <View style={styles.expandIconBox}>
                           <Icon name="arrow_forward" size={14} color={Theme.colors.white} style={{ transform: [{ rotate: isExpanded ? '-90deg' : '90deg' }] }} />
                        </View>
                      </View>
                      {!isExpanded && (
                        <Text style={styles.featuredSubtitle} numberOfLines={1}>{offer.description}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedDetails}>
                    <Text style={styles.expandedDesc}>{offer.description}</Text>
                    
                    <View style={styles.expandedFooterRow}>
                      <Text style={styles.expiryTextExpanded}>Expires: {formatDate(offer.endDate)}</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.applyBtn} 
                      activeOpacity={0.8}
                      onPress={() => handleCopy(offer.promoCode)}
                    >
                      <Text style={styles.applyBtnText}>Tap to copy:  {offer.promoCode}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No active offers at the moment.</Text>
        )}



      </ScrollView>

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
  historyBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80' },
  historyIcon: { },

  scrollContent: { padding: 16, paddingBottom: 100 },

  emptyText: { textAlign: 'center', color: Theme.colors.textSecondary, marginTop: 40, fontSize: 16, fontWeight: '600' },

  offerCardContainer: { 
    backgroundColor: Theme.colors.white, 
    borderRadius: 24, 
    marginBottom: 24, 
    overflow: 'hidden',
    borderWidth: 1, 
    borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 
  },
  featuredOfferContent: { height: 200, position: 'relative' },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'flex-end' },
  discountBadge: { backgroundColor: Theme.colors.secondary, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 8 },
  discountBadgeText: { color: Theme.colors.white, fontWeight: '800', fontSize: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredTitle: { fontSize: 24, fontWeight: '800', color: Theme.colors.white, flex: 1 },
  expandIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  featuredSubtitle: { fontSize: 14, color: Theme.colors.white, marginTop: 4, opacity: 0.9, fontWeight: '500' },
  
  expandedDetails: { padding: 20, backgroundColor: Theme.colors.white },
  expandedDesc: { fontSize: 15, color: Theme.colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  expandedFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  codeBox: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: Theme.colors.primary },
  codeLabelExpanded: { fontSize: 9, fontWeight: '800', color: Theme.colors.primary, opacity: 0.8 },
  codeTextExpanded: { fontSize: 13, fontWeight: '800', color: Theme.colors.primary, marginTop: 2 },
  expiryTextExpanded: { fontSize: 12, fontWeight: '700', color: Theme.colors.error },
  applyBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  applyBtnText: { color: Theme.colors.white, fontSize: 15, fontWeight: '800' },

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
