import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl, Animated, FlatList, ActivityIndicator, StatusBar, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../ThemeContext';
import { Icon, IconName } from '../Components/Icon';
import ShopCard from '../Components/ShopCard';
import { HOME_GROOMING_SHOP } from '../Assets';
import authApi from '../Api';
import { ShopCardSkeleton, BannerSkeleton, CategorySkeleton } from '../Components/Skeleton';
import { notificationService } from '../Services/NotificationService';

// Screen width is now read dynamically inside the component via useWindowDimensions

// Statics deleted



const HEADER_TOP_HEIGHT = 78;   // Row 1: Shortcuts (Reduced)
const SEARCH_BOX_HEIGHT = 76;   // Row 2: Search line (Reduced)
const ROW_GAP = 20;             // Tighter gap

// Total height of sticky components: Shortcuts + Search + Gap
const TOTAL_HEADER_HEIGHT = HEADER_TOP_HEIGHT + SEARCH_BOX_HEIGHT + ROW_GAP;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme: Theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => getStyles(Theme, insets, screenWidth), [Theme, insets, screenWidth]);
  const [shops, setShops] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasFetched = useRef(false);
  const hasFetchedBanners = useRef(false);

  const [bannerIndex, setBannerIndex] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [fetchingBanners, setFetchingBanners] = useState(true);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load unread count whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      // 1. Status Bar Setup
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Theme.colors.primary);
      }

      // 2. Fetch Notifications & Listener
      notificationService.getUnreadCount().then(count => {
        setUnreadCount(count);
      });
      const unsubscribeNotif = notificationService.onUnreadCountChange(setUnreadCount);

      // 3. Main Data Fetch
      fetchShops();
      fetchPetServicesFilter();
      fetchActiveOffers();

      return () => {
        unsubscribeNotif();
      };
    }, [Theme])
  );

  // Animation Interpolations
  const STICKY_ZONE_HEIGHT = SEARCH_BOX_HEIGHT + 14;
  const COLLAPSE_THRESHOLD = HEADER_TOP_HEIGHT + ROW_GAP;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [0, -COLLAPSE_THRESHOLD],
    extrapolate: 'clamp'
  });

  const topRowOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const headerBgColor = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [Theme.colors.primary, Theme.colors.primary],
    extrapolate: 'clamp'
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, TOTAL_HEADER_HEIGHT],
    outputRange: [0, 0.25],
    extrapolate: 'clamp'
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [0, 12],
    extrapolate: 'clamp'
  });

  const fetchActiveOffers = async () => {
    try {
      if (!hasFetchedBanners.current) {
        setFetchingBanners(true);
      }
      const response = await authApi.activeOffers();
      console.log('📡 Fetching active offers:', response.data);
      if (response.data?.success) {
        setBanners(response.data.data);
      }
    } catch (error: any) {
      console.log('❌ Fetch active offers Error:', error.response?.data || error.message);
    } finally {
      hasFetchedBanners.current = true;
      setFetchingBanners(false);
    }
  };

  const fetchPetServicesFilter = async () => {
    try {
      const response = await authApi.petServicesFilter();
      console.log('📡 Fetching pet services filter', response.data);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const top4 = response.data.data.slice(0, 4);
        const mapped = top4.map((service: any, index: number) => {
          const name = service.name || 'Service';
          const cat = (service.category || '').toLowerCase();

          // Dynamic Icon Mapping
          let icon: IconName = 'pets';
          if (cat.includes('bath') || name.toLowerCase().includes('bath')) icon = 'shower';
          else if (cat.includes('groom') || name.toLowerCase().includes('groom')) icon = 'cut';
          else if (cat.includes('day') || name.toLowerCase().includes('day')) icon = 'dog';
          else if (cat.includes('premium') || name.toLowerCase().includes('premium')) icon = 'diamond';

          const colors = ['#4A90E2', '#FF6F61', '#7ED321', '#8B5CF6'];
          return {
            ...service,
            id: service.id || service._id || `service-${index}`,
            displayName: name,
            icon,
            color: colors[index % colors.length]
          };
        });
        setDynamicServices(mapped);
      }
    } catch (error: any) {
      console.log('❌ Fetch pet services filter Error:', error.response?.data || error.message);
    }
  };

  const handleServicePress = (service: any) => {
    console.log('🚀 Navigating to Search for Service:', service.name);
    navigation.navigate('Search', { initialSearch: service.name });
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      let nextIndex = (bannerIndex + 1) % banners.length;
      setBannerIndex(nextIndex);
      try {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5
        });
      } catch (e) {
        // Fallback for indexing errors during layout shifts
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerIndex, banners.length]);

  const fetchShops = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!hasFetched.current) setInitialLoad(true);

    try {
      console.log('📡 Fetching all shops (No filter)');
      const response = await authApi.tenantsList();
      if (response.data?.success) {
        setShops(response.data?.data?.data || []);
      }
    } catch (error: any) {
      console.log('❌ Fetch Shops Error:', error.response?.data || error.message);
    } finally {
      setInitialLoad(false);
      hasFetched.current = true;
      setRefreshing(false);
    }
  };


  const onRefresh = () => fetchShops(true);

  // --- REUSABLE ANIMATED SCALE BUTTON ---
  const ScaleButton = ({ children, style, onPress }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4
      }).start();
    };

    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View style={[style, { transform: [{ scale }] }]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  };

  const renderFlashCarousel = () => (
    <View style={styles.carouselContainer}>
      {fetchingBanners ? (
        <BannerSkeleton />
      ) : banners.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={banners}
            keyExtractor={(item, index) => (item.id || item._id || 'banner') + '-' + index}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setBannerIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.bannerWrapper}>
                <Image source={{ uri: item.images?.[0]?.url }} style={styles.bannerImage} resizeMode="cover" />
              </View>
            )}
          />
          <View style={styles.pagination}>
            {banners.map((_, i) => (
              <View key={i} style={[styles.paginationDot, bannerIndex === i && styles.paginationDotActive]} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>

        {/* --- ANIMATED HEADER --- */}
        <Animated.View style={[
          styles.headerMain,
          {
            height: TOTAL_HEADER_HEIGHT + insets.top,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: headerBgColor,
            elevation: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 10], extrapolate: 'clamp' }),
            shadowOpacity: headerShadowOpacity
          }
        ]}>
          <View style={{ height: insets.top }} />

          <Animated.View style={[styles.headerShortcuts, { opacity: topRowOpacity }]}>
            <View style={styles.shortcutList}>
              {dynamicServices.length > 0 ? (
                <>
                  {dynamicServices.map(service => (
                    <View key={service.id} style={styles.shortcutWrapper}>
                      <ScaleButton style={styles.shortcutPill} onPress={() => handleServicePress(service)}>
                        <View style={styles.shortcutIconBox}>
                          <Icon name={service.icon} size={20} color={service.color} />
                        </View>
                        <Text style={styles.shortcutName} numberOfLines={1}>{service.displayName.split(' ')[0]}</Text>
                      </ScaleButton>
                    </View>
                  ))}
                  {/* Offers button only appears when dynamic services are loaded */}
                  <View style={styles.shortcutWrapper}>
                    <ScaleButton style={styles.shortcutPill} onPress={() => navigation.navigate('OffersTab')}>
                      <View style={styles.shortcutIconBox}>
                        <Icon name="offer" size={20} color="#F5A623" />
                      </View>
                      <Text style={styles.shortcutName}>Offers</Text>
                    </ScaleButton>
                  </View>
                </>
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={styles.shortcutWrapper}>
                      <CategorySkeleton />
                    </View>
                  ))}
                </>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[
            styles.searchContainer,
            { transform: [{ translateY: searchBarTranslateY }] }
          ]}>
            <View style={styles.searchWrapper}>
              <Icon name="search" size={20} color="#666" />
              <TextInput
                placeholder="Search shops, grooming, spa..."
                style={styles.searchInput}
                placeholderTextColor="#999"
                onFocus={() => navigation.navigate('Search')}
              />
            </View>
            <TouchableOpacity
              style={styles.qrBtn}
              activeOpacity={0.6}
              onPress={() => {
                notificationService.markAllRead();
                setUnreadCount(0);
                navigation.navigate('Notifications');
              }}
            >
              <Icon name="notifications" size={24} color="#FFF" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* --- SCROLLABLE CONTENT --- */}
        <Animated.ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: TOTAL_HEADER_HEIGHT + insets.top }]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
              tintColor={Theme.colors.primary}
              progressViewOffset={TOTAL_HEADER_HEIGHT + insets.top}
            />
          }
        >
          {renderFlashCarousel()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exclusive Deals</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>

          <View style={styles.shopsContainer}>
            {(initialLoad || isFiltering) ? (
              <View style={styles.shopsGrid}>
                {/* 2 Featured Skeletons */}
                <View style={styles.featuredWrapper}>
                  <ShopCardSkeleton variant="featured" />
                </View>
                <View style={styles.featuredWrapper}>
                  <ShopCardSkeleton variant="featured" />
                </View>
                {/* 4 Grid Skeletons */}
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gridWrapper}>
                    <ShopCardSkeleton variant="grid" />
                  </View>
                ))}
              </View>
            ) : shops.length > 0 ? (
              <View style={styles.shopsGrid}>
                {shops.map((shop, index) => {
                  const isFeatured = index < 2;
                  return (
                    <View key={(shop.id || shop._id || 'shop') + '-' + index} style={isFeatured ? styles.featuredWrapper : styles.gridWrapper}>
                      <ShopCard
                        variant={isFeatured ? 'featured' : 'grid'}
                        name={shop.storeName}
                        distance={shop.address?.city || 'Nearby'}
                        rating={shop.averageRating || 0}
                        tags={shop.tags || shop.amenities || ['Pet Care']}
                        image={shop.coverImage?.url ? { uri: shop.coverImage.url } : HOME_GROOMING_SHOP}
                        logo={shop.logo?.url ? { uri: shop.logo.url } : undefined}
                        about={shop.description}
                        onBook={() => navigation.navigate('ShopDetail', { shopId: shop.id || shop._id, shopDetails: shop })}
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color="#EEE" />
                <Text style={styles.emptyText}>No results found.</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const getStyles = (Theme: any, insets: any, screenWidth: number) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.primary },
  container: { flex: 1, backgroundColor: Theme.colors.primary },

  // Header Styles
  headerMain: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10
  },
  headerShortcuts: {
    height: HEADER_TOP_HEIGHT,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    paddingTop: 8, // More breathing room
  },
  shortcutList: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  shortcutWrapper: { alignItems: 'center', width: 64 },
  shortcutPill: { alignItems: 'center', width: '100%' },
  shortcutIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18, // Slightly larger icons
    backgroundColor: Theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
  },
  shortcutName: { fontSize: 10, fontWeight: '800', color: '#FFF', textAlign: 'center', textTransform: 'uppercase' },

  searchContainer: {
    height: SEARCH_BOX_HEIGHT,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 12,
    marginTop: ROW_GAP,
    paddingBottom: 13, // Modern padding
  },
  searchWrapper: {
    flex: 1, height: 48, borderRadius: 14,
    backgroundColor: '#F5F7FA',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1C1E', marginLeft: 12, paddingVertical: 0 },
  vDivider: { width: 1, height: 20, backgroundColor: Theme.colors.border },
  qrBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', paddingBottom: 2 },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },


  scrollArea: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingBottom: 120 },

  // Categories
  categoriesScroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 20 },
  categoryItem: { alignItems: 'center', width: 72 },
  categoryIconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, fontWeight: '700', color: Theme.colors.text, textAlign: 'center' },

  // Carousel
  carouselContainer: { width: screenWidth, height: 194, marginTop: 8 },
  bannerWrapper: { width: screenWidth, paddingHorizontal: 16 },
  bannerImage: { width: '100%', height: 164, borderRadius: 20 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.border },
  paginationDotActive: { width: 16, backgroundColor: Theme.colors.primary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, marginTop: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: Theme.colors.text, letterSpacing: -0.5 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: Theme.colors.primary },

  // Shops List
  shopsContainer: { paddingHorizontal: 16 },
  shopsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featuredWrapper: { width: '100%', marginBottom: 20 },
  gridWrapper: {
    width: (screenWidth - 44) / 2,
    marginBottom: 16,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: Theme.colors.textSecondary, fontSize: 15 },
});
