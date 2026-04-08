import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Linking, Alert, ActivityIndicator, Modal, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { SHOP_DETAIL_INTERIOR, SHOP_DETAIL_LOGO } from '../Assets';
import { Icon, IconName } from '../Components/Icon';
import { Toast } from '../Components/Toast';
import authApi from '../Api';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ServiceDetailModal, Service as ServiceType } from '../Components/ServiceDetailModal';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopDetail'>;

export interface Service extends ServiceType {
  tenant: string;
}

const getServiceIcon = (category?: string): IconName => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('bath')) return 'shower';
  if (cat.includes('haircut')) return 'cut';
  if (cat.includes('nail')) return 'pets';
  return 'dog'; // Default fallback
};

const getAmenityEmoji = (amenity: string): string => {
  const a = amenity.toLowerCase();
  if (a.includes('wifi') || a.includes('wi-fi')) return '📶 ';
  if (a.includes('ac') || a.includes('air conditioned')) return '❄️ ';
  if (a.includes('parking')) return '🅿️ ';
  if (a.includes('photography')) return '📸 ';
  if (a.includes('cctv')) return '🛡️ ';
  if (a.includes('shampoo')) return '🧴 ';
  if (a.includes('lounge')) return '🛋️ ';
  return '✨ ';
};

const getBusinessStatus = (businessHours: any[]) => {
  if (!businessHours || businessHours.length === 0) return 'Open Today';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getDay()];
  const todayHours = businessHours.find((h: any) => h.day === today);

  if (!todayHours || todayHours.isClosed) return 'Closed Today';

  // Format "20:00" to "8:00 PM"
  const [hours, minutes] = todayHours.close.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const formattedClose = `${displayHours}${minutes !== 0 ? ':' + minutes : ''} ${ampm}`;

  return `Open until ${formattedClose}`;
};

export default function ShopDetailScreen({ route, navigation }: Props) {
  console.log("Route Params", route.params);
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDetailService, setSelectedDetailService] = useState<Service | null>(null);

  // Handle both nested shopDetails and direct params for flexibility
  const shopDetailsFromParams = (route.params as any)?.shopDetails;
  const shopDetails = shopDetailsFromParams || route.params;
  const selectedService = services.find(s => s.id === selectedServiceId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const fetchServices = async () => {
    const tenantId = shopDetails?.id || shopDetails?._id;
    if (!tenantId) return;

    try {
      setIsServicesLoading(true);
      const response = await authApi.servicestenant(tenantId);
      console.log("Services", response.data);
      if (response.data && response.data.success) {
        const rawServices = response.data?.data?.data || response.data?.data || [];
        const mappedServices: Service[] = rawServices.map((s: any) => ({
          id: s._id || s.id,
          title: s.name || 'Untitled Service',
          description: s.description || '',
          price: s.basePrice || 0,
          category: s.category,
          icon: getServiceIcon(s.category),
          durationMinutes: s.durationMinutes,
          applicableSpecies: s.applicableSpecies,
          pricingType: s.pricingType,
          tenant: s.tenant
        }));
        setServices(mappedServices);
        // Default to first service if none selected
        if (mappedServices.length > 0 && !selectedServiceId) {
          setSelectedServiceId(mappedServices[0].id);
        }
      }
    } catch (error: any) {
      console.log("Error fetching services", error);
    } finally {
      setIsServicesLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [shopDetails?.id, shopDetails?._id])
  );

  const handleSaveTenant = async () => {
    const tenantId = shopDetails?.id || shopDetails?._id;
    if (!tenantId) return;

    console.log("Tenant ID", tenantId);
    try {
      setIsSaving(true);
      const response = await authApi.saveTenant(tenantId);
      if (response.data && response.data.success) {
        showToast('Shop saved successfully!', 'success');
      } else {
        showToast(response.data?.message || 'Failed to save shop', 'error');
      }
    } catch (error: any) {
      console.log("Error in saving shop", error);
      showToast(error.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleOpenDetails = (service: Service) => {
    setSelectedDetailService(service);
    setIsModalVisible(true);
  };

  const handleBookFromModal = () => {
    if (selectedDetailService) {
      setSelectedServiceId(selectedDetailService.id);
      setIsModalVisible(false);
    }
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
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleSaveTenant}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <Icon name="heart" size={20} color={Theme.colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={shopDetails?.coverImage?.url ? { uri: shopDetails.coverImage.url } : SHOP_DETAIL_INTERIOR} style={styles.heroImage} resizeMode="cover" />
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
            {shopDetails?.subscriptionPlan && (
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionLabel}>Status</Text>
                <Text style={styles.subscriptionValue}>{shopDetails.subscriptionPlan.toUpperCase()}</Text>
              </View>
            )}
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
              <Text style={styles.address2}>
                {getBusinessStatus(shopDetails?.businessHours)} • Nearby
              </Text>
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
            {shopDetails?.description || 'No description available for this shop.'}
          </Text>
        </View>

        {/* Services Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>

          <View style={styles.servicesGrid}>
            {isServicesLoading ? (
              <View style={styles.loaderCenter}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={styles.loaderText}>Finding services...</Text>
              </View>
            ) : services.length === 0 ? (
              <View style={styles.loaderCenter}>
                <Text style={styles.loaderText}>No services available for this shop.</Text>
              </View>
            ) : (
              services.map(service => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      console.log("Setting Selected Service ID:", service.id, "Title:", service.title);
                      setSelectedServiceId(service.id);
                    }}
                    style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                  >
                    <TouchableOpacity
                      onPress={() => handleOpenDetails(service)}
                      style={styles.absInfoBtn}
                      activeOpacity={0.7}
                    >
                      <Icon name="offer" size={14} color={Theme.colors.primary} />
                    </TouchableOpacity>

                    {isSelected && (
                      <View style={styles.fixedCheckmark}>
                        <Icon name="check" size={8} color={Theme.colors.white} />
                      </View>
                    )}

                    <View style={[styles.serviceIconContainer, isSelected && styles.serviceIconContainerSelected]}>
                      <Icon name={service.icon} size={20} color={isSelected ? Theme.colors.white : Theme.colors.primary} />
                    </View>
                    <View style={styles.serviceBody}>
                      <View style={styles.serviceTitleRow}>
                        <Text style={[styles.serviceTitle, isSelected && styles.serviceTitleSelected]} numberOfLines={1}>{service.title}</Text>
                      </View>
                      <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text>
                      <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>₹{service.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Amenities */}
        {shopDetails?.amenities && shopDetails?.amenities.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesWrap}>
              {shopDetails.amenities.map((item: string, index: number) => (
                <View key={index} style={styles.amenityBadge}>
                  <Text style={styles.amenityText}>{getAmenityEmoji(item)}{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}


        {/* Contact Details Section */}
        {(shopDetails?.phone || shopDetails?.email || shopDetails?.ownerName) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Contact & Info</Text>
            <View style={styles.contactCard}>
              {shopDetails?.ownerName && (
                <View style={styles.contactRow}>
                  <View style={styles.contactIconCircle}>
                    <Icon name="profile" size={16} color={Theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.contactLabel}>Owner</Text>
                    <Text style={styles.contactValue}>{shopDetails.ownerName}</Text>
                  </View>
                </View>
              )}
              {shopDetails?.phone && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`tel:${shopDetails.phone}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconCircle}>
                    <Icon name="notifications" size={16} color={Theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.contactLabel}>Phone Number</Text>
                    <Text style={[styles.contactValue, { color: Theme.colors.primary }]}>{shopDetails.phone}</Text>
                  </View>
                </TouchableOpacity>
              )}
              {shopDetails?.email && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`mailto:${shopDetails.email}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconCircle}>
                    <Icon name="offer" size={16} color={Theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.contactLabel}>Email Address</Text>
                    <Text style={[styles.contactValue, { color: Theme.colors.primary }]}>{shopDetails.email}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <View style={styles.ctaPriceCol}>
          <Text style={styles.ctaSubtext}>1 Service selected</Text>
          <Text style={styles.ctaPriceText}>₹{selectedService?.price || 0}</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, !selectedService && { opacity: 0.5 }]}
          disabled={!selectedService}
        onPress={() => {
          console.log("Navigating with Selected Service:", selectedService);
          navigation.navigate('TimeSlotSelection', {
            shopId: shopDetails?.id || shopDetails?._id || '1',
            shopName: shopDetails?.storeName || shopDetails?.name || shopDetails?.shopName || 'Shop Details',
            tenant: selectedService?.tenant || shopDetails?.id || shopDetails?._id || '1',
            serviceDetails: selectedService?.id || '',
            serviceTitle: selectedService?.title || '',
            price: selectedService?.price || 0,
            businessHours: shopDetails?.businessHours
          });
        }}
        >
          <Text style={styles.ctaBtnText}>{selectedService ? 'Select Service to Continue' : 'Please select a service'}</Text>
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        service={selectedDetailService}
        onBook={handleBookFromModal}
      />
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
  navIcon: {},
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
  shopName: { fontSize: 22, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, lineHeight: 26 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  starIcon: {},
  ratingText: { fontSize: 13, fontWeight: '600', color: Theme.colors.textSecondary },
  planBadge: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  planText: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 0.5 },
  shopMeta: { fontSize: 13, fontWeight: '600', color: Theme.colors.primary, marginTop: 4 },
  subscriptionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6, backgroundColor: Theme.colors.primary + '0D', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  subscriptionLabel: { fontSize: 9, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  subscriptionValue: { fontSize: 9, fontWeight: '900', color: Theme.colors.primary },

  locationCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.large, borderWidth: 1, borderColor: Theme.colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  locationLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  pinIconWrapper: { width: 40, height: 40, borderRadius: 8, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  pinEmoji: {},
  locationTextCol: { flex: 1, gap: 2 },
  address1: { fontSize: 13, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  address2: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  directionsBtn: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  directionsBtnText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },

  sectionContainer: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: 8 },
  seeAllText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },
  aboutText: { fontSize: 14, lineHeight: 22, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },

  contactCard: { backgroundColor: Theme.colors.white, borderRadius: 12, padding: 16, gap: 16, marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '45%' },
  contactIconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.primary + '0D', alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 9, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactValue: { fontSize: 13, fontWeight: '700', color: Theme.colors.text, marginTop: 1, fontFamily: Theme.typography.fontFamily },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  serviceCard: {
    width: '48.5%', backgroundColor: Theme.colors.white, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  serviceCardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }]
  },
  serviceIconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.border },
  serviceIconContainerSelected: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  serviceBody: { gap: 2 },
  serviceTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  serviceTitle: { fontSize: 13, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  serviceTitleSelected: { color: Theme.colors.primary },
  absInfoBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', zIndex: 2, borderWidth: 1, borderColor: Theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  fixedCheckmark: { position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  serviceDesc: { fontSize: 11, color: Theme.colors.textSecondary, lineHeight: 15, height: 30 },
  servicePrice: { fontSize: 15, fontWeight: '800', color: Theme.colors.text, marginTop: 4 },
  servicePriceSelected: { color: Theme.colors.primary },

  loaderCenter: { flex: 1, paddingVertical: 40, alignItems: 'center', justifyContent: 'center', width: '100%' },
  loaderText: { marginTop: 8, fontSize: 13, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },

  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  amenityBadge: { backgroundColor: Theme.colors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border },
  amenityText: { fontSize: 11, fontWeight: '600', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
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
