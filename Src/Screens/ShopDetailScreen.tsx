import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { SHOP_DETAIL_INTERIOR, SHOP_DETAIL_LOGO } from '../Assets';
import { Icon, IconName } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopDetail'>;

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: IconName;
}

const SERVICES: Service[] = [
  { id: '1', title: 'Bath & Dry', description: 'Full body wash & blow dry', price: 299, icon: 'shower' },
  { id: '2', title: 'Haircut', description: 'Styling and trim', price: 499, icon: 'cut' },
  { id: '3', title: 'Nail Trim', description: 'Smooth paw treatment', price: 150, icon: 'pets' },
  { id: '4', title: 'Full Grooming', description: 'All-in-one package', price: 899, icon: 'dog' },
];

export default function ShopDetailScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('4');

  const selectedService = SERVICES.find(s => s.id === selectedServiceId);
  const shopDetails = (route.params as any)?.shopDetails;

  const handleDirections = () => {
    if (!shopDetails?.location?.latitude || !shopDetails?.location?.longitude) {
      Alert.alert('Location Unavailable', 'Store location coordinates are not available.');
      return;
    }
    const { latitude, longitude } = shopDetails.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open Google Maps.');
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Top Nav */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Shop Details</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconBtn}><Icon name="share" size={20} color={Theme.colors.text} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Icon name="heart" size={20} color={Theme.colors.text} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={SHOP_DETAIL_INTERIOR} style={styles.heroImage} resizeMode="cover" />
        </View>

        {/* Shop Header Info */}
        <View style={styles.headerInfoContainer}>
          <View style={styles.logoContainer}>
            <Image source={shopDetails?.logo?.url ? { uri: shopDetails.logo.url } : SHOP_DETAIL_LOGO} style={styles.logoImage} resizeMode="cover" />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.shopName}>{shopDetails?.storeName || 'Paws & Claws Grooming'}</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color="#F4C430" />
              <Text style={styles.ratingText}>4.8 (200+ reviews)</Text>
            </View>
            <Text style={styles.shopMeta}>Premium Pet Spa • 5 years exp.</Text>
          </View>
        </View>

        {/* Location & Status Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationLeftRow}>
            <View style={styles.pinIconWrapper}><Icon name="location" size={18} color={Theme.colors.primary} /></View>
            <View style={styles.locationTextCol}>
              <Text style={styles.address1} numberOfLines={1}>
                {shopDetails?.address?.street ? `${shopDetails.address.street}, ${shopDetails.address.city || ''}` : '123 Pet Lane, Bangalore'}
              </Text>
              <Text style={styles.address2}>Open until 8:00 PM • Nearby</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
            <Text style={styles.directionsBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Professional pet grooming services focused on the comfort and well-being of your furry friends. We use organic shampoos and stress-free handling techniques. Our stylists are certified and love every pet like their own.
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>
          
          <View style={styles.servicesGrid}>
            {SERVICES.map(service => {
              const isSelected = selectedServiceId === service.id;
              return (
                <TouchableOpacity 
                  key={service.id} 
                  activeOpacity={0.8}
                  onPress={() => setSelectedServiceId(service.id)}
                  style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                >
                  <View style={[styles.serviceIconContainer, isSelected && styles.serviceIconContainerSelected]}>
                    <Icon name={service.icon} size={20} color={isSelected ? Theme.colors.white : Theme.colors.primary} />
                  </View>
                  <View style={styles.serviceBody}>
                    <View style={styles.serviceTitleRow}>
                      <Text style={[styles.serviceTitle, isSelected && styles.serviceTitleSelected]}>{service.title}</Text>
                      {isSelected && <Icon name="explore" size={14} color={Theme.colors.primary} />}
                    </View>
                    <Text style={styles.serviceDesc}>{service.description}</Text>
                    <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>₹{service.price}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesWrap}>
            <View style={styles.amenityBadge}><Text style={styles.amenityText}>📶 Free Wi-Fi</Text></View>
            <View style={styles.amenityBadge}><Text style={styles.amenityText}>❄️ Air Conditioned</Text></View>
            <View style={styles.amenityBadge}><Text style={styles.amenityText}>🅿️ Parking Available</Text></View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <View style={styles.ctaPriceCol}>
          <Text style={styles.ctaSubtext}>1 Service selected</Text>
          <Text style={styles.ctaPriceText}>₹{selectedService?.price || 0}</Text>
        </View>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('TimeSlotSelection', { 
            shopId: '1', 
            serviceTitle: selectedService?.title || '', 
            price: selectedService?.price || 0 
          })}
        >
          <Text style={styles.ctaBtnText}>Select Service to Continue</Text>
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
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  navIcon: { },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  
  heroContainer: { marginHorizontal: 16, marginTop: 12, height: 200, borderRadius: Theme.roundness.large, overflow: 'hidden', backgroundColor: Theme.colors.border },
  heroImage: { width: '100%', height: '100%' },

  headerInfoContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 16, alignItems: 'flex-start' },
  logoContainer: { 
    width: 96, height: 96, borderRadius: Theme.roundness.large, 
    borderWidth: 4, borderColor: Theme.colors.white, backgroundColor: Theme.colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    overflow: 'hidden'
  },
  logoImage: { width: '100%', height: '100%' },
  headerTextCol: { flex: 1, paddingTop: 4 },
  shopName: { fontSize: 24, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  starIcon: { },
  ratingText: { fontSize: 14, fontWeight: '600', color: Theme.colors.textSecondary },
  shopMeta: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary, marginTop: 4 },

  locationCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.large, borderWidth: 1, borderColor: Theme.colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  locationLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  pinIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  pinEmoji: { },
  locationTextCol: { flex: 1, gap: 2 },
  address1: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  address2: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  directionsBtn: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: Theme.colors.primary + '33' },
  directionsBtnText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },

  sectionContainer: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: 8 },
  seeAllText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },
  aboutText: { fontSize: 14, lineHeight: 22, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  serviceCard: { 
    width: '48%', backgroundColor: Theme.colors.white, padding: 16, borderRadius: Theme.roundness.large,
    borderWidth: 2, borderColor: Theme.colors.border 
  },
  serviceCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primary + '0A' },
  serviceIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  serviceIconContainerSelected: { backgroundColor: Theme.colors.primary, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  serviceIconEmoji: { },
  serviceBody: { gap: 4 },
  serviceTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  serviceTitleSelected: {},
  checkIcon: { },
  serviceDesc: { fontSize: 12, color: Theme.colors.textSecondary },
  servicePrice: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary, marginTop: 8 },
  servicePriceSelected: {},

  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  amenityBadge: { backgroundColor: Theme.colors.border + '80', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  amenityText: { fontSize: 12, fontWeight: '600', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  stickyCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.background + 'EB', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: Theme.colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 16
  },
  ctaPriceCol: { flex: 1, gap: 2 },
  ctaSubtext: { fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary },
  ctaPriceText: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  ctaButton: { flex: 2, backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: Theme.roundness.default, alignItems: 'center', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  ctaBtnText: { color: Theme.colors.white, fontSize: 14, fontWeight: '700', fontFamily: Theme.typography.fontFamily }
});
