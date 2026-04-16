import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, StatusBar, Linking, Alert, ActivityIndicator, Modal, Dimensions, Platform, Animated, Share, BackHandler, LayoutAnimation } from 'react-native';
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
import { ConfirmModal } from '../Components/ConfirmModal';
import { Skeleton } from '../Components/Skeleton';
import { ServiceDetailModal, Service as ServiceType } from '../Components/ServiceDetailModal';
import { ReviewModal } from '../Components/ReviewModal';
import { ServicesSection } from '../Components/ShopDetail/ServicesSection';
import { ReviewsSection } from '../Components/ShopDetail/ReviewsSection';
import { ContactSection } from '../Components/ShopDetail/ContactSection';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopDetail'>;

export interface Service extends ServiceType {
  tenant?: string;
}

const getServiceIcon = (category?: string): IconName => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('bath')) return 'shower';
  if (cat.includes('hair') || cat.includes('cut')) return 'cut';
  if (cat.includes('groom')) return 'pets';
  return 'pets';
};

const getAmenityEmoji = (amenity: string) => {
  const a = amenity.toLowerCase();
  if (a.includes('wifi')) return '📶';
  if (a.includes('park')) return '🅿️';
  if (a.includes('ac') || a.includes('air')) return '❄️';
  if (a.includes('coffee') || a.includes('tea')) return '☕';
  if (a.includes('water')) return '🚰';
  if (a.includes('wait') || a.includes('lounge')) return '🛋️';
  if (a.includes('play')) return '🎾';
  if (a.includes('tv')) return '📺';
  if (a.includes('pet')) return '🐕';
  if (a.includes('card') || a.includes('pay')) return '💳';
  if (a.includes('cctv')) return '🛡️';
  if (a.includes('shampoo')) return '🧴';
  return '✨';
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

  // Review States
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedReviewForModal, setSelectedReviewForModal] = useState<any>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [reviewIdToDelete, setReviewIdToDelete] = useState<string | null>(null);

  // Handle both nested shopDetails and direct params for flexibility
  const shopDetailsFromParams = (route.params as any)?.shopDetails;
  const [shopDetails, setShopDetails] = useState<any>(shopDetailsFromParams || null);
  const [isShopLoading, setIsShopLoading] = useState(!shopDetailsFromParams);

  const shopId = route.params?.shopId || shopDetailsFromParams?._id || shopDetailsFromParams?.id;
  const currentShop = shopDetails || route.params;
  const selectedService = services.find(s => s.id === selectedServiceId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const fetchServices = async () => {
    const tenantId = shopId;
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

  const fetchShopDetails = async (silent = false) => {
    if (!shopId) return;
    try {
      if (!silent) setIsShopLoading(true);
      const response = await authApi.tenantDetail(shopId);
      if (response.data && response.data.success) {
        setShopDetails(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching shop details:", error);
      showToast('Error loading shop details', 'error');
    } finally {
      if (!silent) setIsShopLoading(false);
    }
  };

  const userReviewRow = currentUser ? reviews.find(r => r.user && (r.user._id === currentUser._id || r.user.id === currentUser.id || r.user._id === currentUser.id)) : null;

  const fetchReviews = async () => {
    if (!shopId) return;
    try {
      setIsReviewsLoading(true);
      console.log("Shop ID", shopId);
      const response = await authApi.shopReviews(shopId);
      console.log("Reviews", response.data);
      if (response.data && response.data.success) {
        // The API returns reviews in response.data.data.data
        const reviewsArray = response.data.data?.data || response.data.data || [];
        setReviews(Array.isArray(reviewsArray) ? reviewsArray : []);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.profile();
      if (response.data && response.data.success) {
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!shopDetails) {
        fetchShopDetails();
      }
      fetchServices();
      fetchReviews();
      fetchCurrentUser();
    }, [shopId])
  );

  const handleToggleSave = async () => {
    const tenantId = shopId;
    if (!tenantId) return;

    const isCurrentlySaved = currentShop?.isBookmarked;

    try {
      setIsSaving(true);
      const response = isCurrentlySaved
        ? await authApi.deleteSaveTenant(tenantId)
        : await authApi.saveTenant(tenantId);

      if (response.data && response.data.success) {
        showToast(isCurrentlySaved ? 'Shop removed from favorites' : 'Shop saved to favorites!', 'success');
        // Update local state to reflect the change
        if (shopDetailsFromParams) {
          // If we came from params, updating local shopDetails will work
          setShopDetails((prev: any) => prev ? { ...prev, isBookmarked: !isCurrentlySaved } : prev);
        } else {
          // Fallback update
          setShopDetails((prev: any) => prev ? { ...prev, isBookmarked: !isCurrentlySaved } : { isBookmarked: !isCurrentlySaved });
        }
      } else {
        showToast(response.data?.message || 'Action failed', 'error');
      }
    } catch (error: any) {
      console.log("Error in toggling saved shop", error);
      showToast(error.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const webUrl = `https://pawnest.com/shop/${shopId}`;
      const deepLink = `pawnest://shop/${shopId}`;
      const result = await Share.share({
        message: `Check out ${currentShop?.storeName || 'this pet shop'} on PawNest!\n\nOpen in App: ${deepLink}\nWeb Link: ${webUrl}`,
        url: webUrl,
      });
    } catch (error: any) {
      Alert.alert('Sharing Error', error.message);
    }
  };

  const handleDirections = () => {
    if (!currentShop?.location?.latitude || !currentShop?.location?.longitude) {
      Alert.alert('Location Unavailable', 'Store location coordinates are not available.');
      return;
    }
    const { latitude, longitude } = currentShop.location;
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

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
    return true;
  }, [navigation]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  const handleBookFromModal = () => {
    if (selectedDetailService) {
      setSelectedServiceId(selectedDetailService.id);
      setIsModalVisible(false);
    }
  };

  const ServiceCardSkeleton = () => {
    const pulseAnim = useMemo(() => new Animated.Value(0.4), []);

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [pulseAnim]);

    return (
      <View style={styles.serviceCard}>
        <Animated.View style={[styles.serviceIconContainer, { backgroundColor: '#E1E4E8', borderColor: '#E1E4E8', opacity: pulseAnim }]} />
        <View style={{ gap: 6 }}>
          <Animated.View style={{ width: '70%', height: 14, backgroundColor: '#E1E4E8', borderRadius: 4, opacity: pulseAnim }} />
          <Animated.View style={{ width: '100%', height: 10, backgroundColor: '#E1E4E8', borderRadius: 4, opacity: pulseAnim }} />
          <Animated.View style={{ width: '100%', height: 10, backgroundColor: '#E1E4E8', borderRadius: 4, opacity: pulseAnim }} />
          <Animated.View style={{ width: '40%', height: 18, backgroundColor: '#E1E4E8', borderRadius: 4, marginTop: 4, opacity: pulseAnim }} />
        </View>
      </View>
    );
  };

  const handleAddReview = async (rating: number, comment: string) => {
    if (!shopId) return;
    try {
      console.log("Shop ID", shopId);
      console.log("Rating", rating);
      console.log("Comment", comment);

      let response;
      if (userReviewRow) {
        response = await authApi.updateReview(userReviewRow._id || userReviewRow.id, { rating, comment });
      } else {
        response = await authApi.addReviewNormal(shopId, { rating, comment });
      }

      if (response.data && response.data.success) {
        console.log("Review submitted successfully!", response.data);
        showToast(userReviewRow ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');
        fetchReviews(); // Refresh list
        fetchShopDetails(true); // Refresh average rating silently
      } else {
        console.log("Failed to submit review", response.data);
        showToast(response.data?.message || 'Failed to submit review', 'error');
      }
    } catch (error: any) {
      console.log("Error adding review:", error);
      showToast(error.response?.data?.message || 'Error submitting review', 'error');
      throw error;
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviewIdToDelete(reviewId);
    setIsDeleteModalVisible(true);
  };

  const actuallyDeleteReview = async () => {
    if (!reviewIdToDelete) return;
    try {
      setIsReviewsLoading(true);
      const response = await authApi.deleteReview(reviewIdToDelete);
      if (response.data && response.data.success) {
        showToast('Review deleted successfully!', 'success');
        fetchReviews();
        fetchShopDetails(true);
      } else {
        showToast(response.data?.message || 'Failed to delete review', 'error');
      }
    } catch (error: any) {
      console.log("Error deleting review:", error);
      showToast(error.response?.data?.message || 'Error deleting review', 'error');
    } finally {
      setIsReviewsLoading(false);
      setIsDeleteModalVisible(false);
      setReviewIdToDelete(null);
    }
  };

  const toggleReviews = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllReviews(!showAllReviews);
  };

  const renderRatingStars = (rating: number, size = 12) => {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Icon key={s} name="star" size={size} color={s <= rating ? "#F4C430" : "#E0E0E0"} />
        ))}
      </View>
    );
  };

  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollSolid, setScrollSolid] = useState(false);
  const navBarAnim = useRef(new Animated.Value(0)).current;

  // Header Animation Logic (only transform/opacity — compatible with useNativeDriver:true)
  const headerScale = scrollY.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: [0, 0, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const solid = value > 230;
      if (solid !== scrollSolid) {
        setScrollSolid(solid);
        if (solid) {
          // Reset to 0 first so the come-in animation always plays from start
          navBarAnim.setValue(0);
        }
        Animated.timing(navBarAnim, {
          toValue: solid ? 1 : 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      }
    });
    return () => scrollY.removeListener(id);
  }, [scrollSolid]);


  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 1. BACKGROUND HERO IMAGE (Parallax) */}
      {isShopLoading ? (
        <View style={styles.parallaxHero}>
          <Skeleton width="100%" height={300} borderRadius={0} />
        </View>
      ) : (
        <Animated.View style={[
          styles.parallaxHero,
          {
            transform: [
              { translateY: headerTranslateY },
              { scale: headerScale }
            ],
            opacity: headerOpacity,
          }
        ]}>
          <Image
            source={currentShop?.coverImage?.url ? { uri: currentShop.coverImage.url } : SHOP_DETAIL_INTERIOR}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* 2. FIXED NAV BAR */}
      <View style={[
        styles.navBar,
        {
          paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 20) + 10,
          backgroundColor: scrollSolid ? Theme.colors.white : 'transparent',
          borderBottomWidth: scrollSolid ? 1 : 0,
          borderBottomColor: Theme.colors.border,
          elevation: scrollSolid ? 4 : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: scrollSolid ? 0.08 : 0,
          shadowRadius: 8,
        }
      ]}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Animated.Text
            style={[
              styles.navTitle,
              {
                opacity: navBarAnim,
                transform: [{ translateY: navBarAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
              }
            ]}
            numberOfLines={1}
          >
            {currentShop?.storeName || 'Shop Details'}
          </Animated.Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={[styles.iconBtn, { marginRight: 8 }]} onPress={handleShare}>
            <Icon name="share" size={18} color={Theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : (
              <Icon
                name={currentShop?.isBookmarked ? "heart_filled" : "heart"}
                size={20}
                color={currentShop?.isBookmarked ? Theme.colors.primary : Theme.colors.text}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 260 }]} // Space for the background hero
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {isShopLoading ? (
          <View style={{ paddingBottom: 100 }}>
            {/* Header Skeleton */}
            <View style={[styles.headerInfoContainer, { marginTop: -60 }]}>
              <Skeleton width={96} height={96} borderRadius={24} style={{ borderWidth: 4, borderColor: Theme.colors.white }} />
              <View style={[styles.headerTextCol, { marginLeft: 16 }]}>
                <Skeleton width={200} height={28} borderRadius={4} />
                <Skeleton width={120} height={18} borderRadius={4} style={{ marginTop: 8 }} />
              </View>
            </View>

            {/* Address Skeleton */}
            <View style={styles.locationCard}>
              <Skeleton width="100%" height={64} borderRadius={16} />
            </View>

            {/* About Skeleton */}
            <View style={styles.sectionContainer}>
              <Skeleton width={100} height={20} borderRadius={4} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={60} borderRadius={12} />
            </View>

            {/* Services Skeleton Grid */}
            <View style={styles.sectionContainer}>
              <Skeleton width={120} height={22} borderRadius={4} style={{ marginBottom: 20 }} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={(Dimensions.get('window').width - 52) / 2} height={130} borderRadius={20} />
                ))}
              </View>
            </View>

            {/* Amenities Skeleton */}
            <View style={styles.sectionContainer}>
              <Skeleton width={110} height={20} borderRadius={4} style={{ marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width={80} height={36} borderRadius={14} />
                ))}
              </View>
            </View>

            {/* Reviews Skeleton */}
            <View style={styles.sectionContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <Skeleton width={100} height={22} borderRadius={4} />
                <Skeleton width={60} height={16} borderRadius={4} />
              </View>
              <Skeleton width="100%" height={140} borderRadius={24} style={{ marginBottom: 20 }} />
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Skeleton width={280} height={130} borderRadius={24} />
                <Skeleton width={280} height={130} borderRadius={24} />
              </View>
            </View>

            {/* Contact Skeleton */}
            <View style={styles.sectionContainer}>
              <Skeleton width={130} height={22} borderRadius={4} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={120} borderRadius={24} />
            </View>
          </View>
        ) : (
          <View style={styles.contentCard}>
            {/* Shop Header Info */}
            <View style={styles.headerInfoContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={currentShop?.logo?.url ? { uri: currentShop.logo.url } : SHOP_DETAIL_LOGO}
                  style={styles.logoImage}
                />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.shopName} numberOfLines={2}>{currentShop?.storeName || 'Paws & Claws Grooming'}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{currentShop?.averageRating || '0.0'} ({currentShop?.totalReviews || '0'} reviews)</Text>
                  {currentShop?.subscriptionPlan && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planText}>{currentShop.subscriptionPlan.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.shopMeta}>Pet Services</Text>
              </View>
            </View>

            {/* Address Row */}
            <TouchableOpacity
              style={styles.locationCard}
              onPress={handleDirections}
            >
              <View style={styles.locationLeftRow}>
                <View style={styles.pinIconWrapper}>
                  <Icon name="location" size={20} color={Theme.colors.primary} />
                </View>
                <View style={styles.locationTextCol}>
                  <Text style={styles.address1} numberOfLines={1}>{currentShop?.address?.street || 'No address'}</Text>
                  <Text style={styles.address2} numberOfLines={1}>
                    {currentShop?.address?.city || 'Bangalore'}
                  </Text>
                </View>
              </View>
              <View style={styles.directionsBtn}>
                <Text style={styles.directionsBtnText}>Directions</Text>
              </View>
            </TouchableOpacity>

            {/* About Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{currentShop?.description || 'Serving your pets with love and care.'}</Text>
            </View>

            <ServicesSection
              isLoading={isServicesLoading}
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
              onOpenDetails={handleOpenDetails}
              styles={styles}
            />

            {/* Amenities Section */}
            {(currentShop?.amenities && currentShop.amenities.length > 0) && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesWrap}>
                  {currentShop.amenities.map((item: string, idx: number) => (
                    <View key={idx} style={styles.amenityBadge}>
                      <Text style={styles.amenityText}>
                        {getAmenityEmoji(item)} {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <ReviewsSection
              isLoading={isReviewsLoading}
              reviews={reviews}
              currentShop={currentShop}
              currentUser={currentUser}
              onRateNow={() => setIsReviewModalVisible(true)}
              onDeleteReview={handleDeleteReview}
              onSelectReview={setSelectedReviewForModal}
              renderRatingStars={renderRatingStars}
              styles={styles}
            />

            <ContactSection
              currentShop={currentShop}
              styles={styles}
            />
          </View>
        )}
      </Animated.ScrollView>

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
            navigation.navigate('TimeSlotSelection', {
              shopId: currentShop?.id || currentShop?._id || shopId,
              shopName: currentShop?.storeName || '',
              tenant: currentShop?.id || currentShop?._id || shopId,
              serviceDetails: selectedService?.id || '',
              serviceTitle: selectedService?.title || '',
              price: selectedService?.price || 0,
              businessHours: currentShop?.businessHours,
              applicableSpecies: selectedService?.applicableSpecies,
            });
          }}
        >
          <Text style={styles.ctaBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ServiceDetailModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        service={selectedDetailService}
        onBook={handleBookFromModal}
      />
      <ReviewModal
        visible={isReviewModalVisible}
        onClose={() => setIsReviewModalVisible(false)}
        onSubmit={handleAddReview}
        shopName={currentShop?.storeName || 'this shop'}
        initialReview={userReviewRow}
      />

      <Modal
        visible={!!selectedReviewForModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReviewForModal(null)}
      >
        <TouchableOpacity
          style={styles.fullReviewOverlay}
          activeOpacity={1}
          onPress={() => setSelectedReviewForModal(null)}
        >
          <View style={styles.fullReviewCard} onStartShouldSetResponder={() => true}>
            <View style={styles.simpleModalHeader}>
              <Text style={styles.simpleModalTitle}>Review Details</Text>
              <TouchableOpacity onPress={() => setSelectedReviewForModal(null)}>
                <Icon name="close" size={24} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedReviewForModal && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.reviewHeader, { marginBottom: 20 }]}>
                  <View style={styles.reviewUserIcon}>
                    <Text style={styles.reviewUserInitial}>
                      {(selectedReviewForModal.user?.name || selectedReviewForModal.userName || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUserName}>{selectedReviewForModal.user?.name || selectedReviewForModal.userName || 'User'}</Text>
                    {renderRatingStars(selectedReviewForModal.rating, 16)}
                  </View>
                </View>

                <Text style={styles.fullReviewText}>{selectedReviewForModal.comment}</Text>

                <Text style={[styles.reviewDate, { marginTop: 20 }]}>
                  Posted on {selectedReviewForModal.createdAt ? new Date(selectedReviewForModal.createdAt).toLocaleDateString() : ''}
                </Text>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      <ConfirmModal
        visible={isDeleteModalVisible}
        onClose={() => {
          setIsDeleteModalVisible(false);
          setReviewIdToDelete(null);
        }}
        onConfirm={actuallyDeleteReview}
        title="Delete Review"
        message="Are you sure you want to remove your feedback? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep It"
        type="danger"
      />
    </View>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: 'transparent',
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 110,
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: 80,
  },

  parallaxHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 300,
    backgroundColor: Theme.colors.border,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },

  contentCard: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    marginTop: -30,
    minHeight: 600,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20
  },

  headerInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16,
    alignItems: 'center',
  },
  logoContainer: {
    width: 90, height: 90, borderRadius: 24,
    borderWidth: 4, borderColor: Theme.colors.white, backgroundColor: Theme.colors.white,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    overflow: 'hidden'
  },
  logoImage: { width: '100%', height: '100%' },
  headerTextCol: { flex: 1, paddingTop: 4 },
  shopName: { fontSize: 24, fontWeight: '900', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary },
  planBadge: { backgroundColor: Theme.colors.primary + '1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  planText: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 0.5 },
  shopMeta: { fontSize: 13, fontWeight: '600', color: Theme.colors.primary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },

  locationCard: {
    marginHorizontal: 20, marginTop: 20, padding: 16, backgroundColor: Theme.colors.white,
    borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  locationLeftRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 16 },
  pinIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  locationTextCol: { flex: 1 },
  address1: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, marginBottom: 2, fontFamily: Theme.typography.fontFamily },
  address2: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  directionsBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  directionsBtnText: { fontSize: 12, fontWeight: '700', color: Theme.colors.white },

  sectionContainer: { paddingHorizontal: 20, paddingTop: 24, },
  sectionContainer2: { paddingHorizontal: 20, paddingTop: 24, marginBottom: 50 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  seeAllText: { fontSize: 13, fontWeight: '700', color: Theme.colors.primary },
  aboutText: { fontSize: 14, lineHeight: 24, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },

  contactCard: {
    backgroundColor: Theme.colors.white, borderRadius: 20, padding: 16,
    marginTop: 8, gap: 16,
    borderWidth: 1, borderColor: Theme.colors.border
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  contactIconCircle: { width: 36, height: 36, borderRadius: 12, backgroundColor: Theme.colors.primary + '0D', alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 10, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  contactValue: { flex: 1, fontSize: 13, fontWeight: '700', color: Theme.colors.text, marginTop: 1, fontFamily: Theme.typography.fontFamily },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  serviceCard: {
    width: (Dimensions.get('window').width - 52) / 2,
    backgroundColor: Theme.colors.white, padding: 16, borderRadius: 20,
    borderWidth: 1.5, borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  serviceCardSelected: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6
  },
  absInfoBtn: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  serviceIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  serviceIconContainerSelected: { backgroundColor: Theme.colors.white },
  serviceBody: { gap: 4 },
  serviceTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  serviceTitleSelected: { color: Theme.colors.white },
  serviceDesc: { fontSize: 11, color: Theme.colors.textSecondary, lineHeight: 16, height: 32 },
  serviceDescSelected: { color: Theme.colors.white },
  servicePrice: { fontSize: 16, fontWeight: '900', color: Theme.colors.text, marginTop: 4 },
  servicePriceSelected: { color: Theme.colors.white },

  amenitiesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  amenityBadge: { backgroundColor: Theme.colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border },
  amenityText: { fontSize: 12, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  stickyCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.white, padding: 20, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: Theme.colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 10
  },
  ctaPriceCol: { flex: 1 },
  ctaSubtext: { fontSize: 12, fontWeight: '700', color: Theme.colors.textSecondary },
  ctaPriceText: { fontSize: 22, fontWeight: '900', color: Theme.colors.text },
  ctaButton: { flex: 1.5, backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  ctaBtnText: { color: Theme.colors.white, fontSize: 14, fontWeight: '800', fontFamily: Theme.typography.fontFamily },

  reviewSummaryCard: {
    flexDirection: 'row', backgroundColor: Theme.colors.white, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: Theme.colors.border, marginBottom: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  avgRatingCol: { alignItems: 'center', paddingRight: 24, borderRightWidth: 1, borderRightColor: Theme.colors.border, width: '45%' },
  avgRatingValue: { fontSize: 42, fontWeight: '900', color: Theme.colors.text, marginBottom: 4 },
  totalReviewsText: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 8, fontWeight: '600' },
  ratingBarsCol: { flex: 1, paddingLeft: 24, gap: 8 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingBarNum: { fontSize: 11, fontWeight: '800', color: Theme.colors.textSecondary, width: 12 },
  ratingBarBg: { flex: 1, height: 5, backgroundColor: Theme.colors.border, borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: '100%', borderRadius: 3 },

  reviewsListHorizontal: { paddingBottom: 10 },
  reviewItemCard: {
    width: 300, backgroundColor: Theme.colors.white, borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: Theme.colors.border, marginRight: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reviewUserIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  reviewUserInitial: { fontSize: 16, fontWeight: '800', color: Theme.colors.primary },
  reviewUserName: { fontSize: 15, fontWeight: '800', color: Theme.colors.text, marginBottom: 2 },
  reviewDate: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '600' },
  reviewComment: { fontSize: 14, color: Theme.colors.textSecondary, lineHeight: 22 },
  emptyReviews: { alignItems: 'center', paddingVertical: 30 },
  emptyReviewsText: { fontSize: 15, color: Theme.colors.textSecondary, fontStyle: 'italic', fontWeight: '500' },
  deleteReviewText: { fontSize: 12, fontWeight: '800', color: Theme.colors.error, marginTop: 8 },

  fullReviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  fullReviewCard: { width: '100%', backgroundColor: Theme.colors.white, borderRadius: 30, padding: 24, maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 20 },
  fullReviewScroll: { marginTop: 16, marginBottom: 24 },
  fullReviewText: { fontSize: 16, color: Theme.colors.text, lineHeight: 26 },
  closeFullReviewBtn: { backgroundColor: Theme.colors.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  closeFullReviewBtnText: { fontSize: 15, fontWeight: '800', color: Theme.colors.white },

  simpleModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  simpleModalTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  loaderCenter: { flex: 1, paddingVertical: 60, alignItems: 'center', justifyContent: 'center', width: '100%' },
  loaderText: { marginTop: 12, fontSize: 14, color: Theme.colors.textSecondary, fontWeight: '600' }
});
