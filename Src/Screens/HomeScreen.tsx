import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl, Animated, FlatList, Dimensions, ActivityIndicator, StatusBar, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import ShopCard from '../Components/ShopCard';
import { HOME_GROOMING_SHOP } from '../Assets';
import authApi from '../Api';
import { useLocation } from '../LocationContext';
import { ShopCardSkeleton } from '../Components/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
  { id: '1', image: require('../Assets/Home_Screen/offer_banner_1.png') },
  { id: '2', image: require('../Assets/Home_Screen/offer_banner_2.png') },
];

const CATEGORIES = [
  { id: '1', name: 'Bath & Spa', icon: 'shower' as const, color: '#4A90E2' },
  { id: '2', name: 'Grooming', icon: 'cut' as const, color: '#FF6F61' },
  { id: '3', name: 'Day Care', icon: 'dog' as const, color: '#7ED321' },
  { id: '4', name: 'Premium', icon: 'offer' as const, color: '#F5A623' },
];

const HEADER_TOP_HEIGHT = 78;   // Row 1: Shortcuts (Reduced)
const SEARCH_BOX_HEIGHT = 76;   // Row 2: Search line (Reduced)
const ROW_GAP = 20;             // Tighter gap

// Total height of sticky components: Shortcuts + Search + Gap
const TOTAL_HEADER_HEIGHT = HEADER_TOP_HEIGHT + SEARCH_BOX_HEIGHT + ROW_GAP;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme, insets), [Theme, insets]);
  const [shops, setShops] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasFetched = useRef(false);

  const [bannerIndex, setBannerIndex] = useState(0);
  const {
    userLocation,
    coords,
    isLocating,
    isDeviceLocationOn,
    refreshLocation
  } = useLocation();

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation Interpolations
  const STICKY_ZONE_HEIGHT = SEARCH_BOX_HEIGHT + 14; // Slightly more for centering
  const COLLAPSE_THRESHOLD = HEADER_TOP_HEIGHT + ROW_GAP; // Hide shortcuts only

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
    outputRange: [0, 12], // Push down into the center of the sticky area
    extrapolate: 'clamp'
  });

  useFocusEffect(
    useCallback(() => {
      // Force Status Bar styling when on Home Screen
      StatusBar.setBarStyle('light-content');
      import('react-native').then(({ Platform }) => {
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Theme.colors.primary);
        }
      });

      fetchShops();
    }, [Theme])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (bannerIndex + 1) % BANNERS.length;
      setBannerIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerIndex]);

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

  const renderLocationRow = () => (
    <View style={styles.locationContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={refreshLocation}
        style={styles.locationInner}
        disabled={isLocating}
      >
        <Icon
          name="location"
          size={18}
          color={Theme.colors.primary}
        />
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>Current Location</Text>
          <Text style={styles.locationValue} numberOfLines={1}>
            {isLocating ? 'Detecting...' : userLocation}
          </Text>
        </View>
        <Icon name="back" size={14} color="#999" style={{ transform: [{ rotate: '-180deg' }] }} />
      </TouchableOpacity>
    </View>
  );

  const renderFlashCarousel = () => (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setBannerIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.bannerWrapper}>
            <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
          </View>
        )}
      />
      <View style={styles.pagination}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.paginationDot, bannerIndex === i && styles.paginationDotActive]} />
        ))}
      </View>
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
              {CATEGORIES.map(cat => (
                <View key={cat.id} style={styles.shortcutWrapper}>
                  <ScaleButton style={styles.shortcutPill}>
                    <View style={styles.shortcutIconBox}>
                      <Icon name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <Text style={styles.shortcutName} numberOfLines={1}>{cat.name.split(' ')[0]}</Text>
                  </ScaleButton>
                </View>
              ))}
              <View style={styles.shortcutWrapper}>
                <ScaleButton style={styles.shortcutPill}>
                  <View style={styles.shortcutIconBox}>
                    <Icon name="offer" size={20} color="#F5A623" />
                  </View>
                  <Text style={styles.shortcutName}>Offers</Text>
                </ScaleButton>
              </View>
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
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications" size={24} color="#FFF" />
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
          {renderLocationRow()}
          {renderFlashCarousel()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exclusive Deals</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>

          <View style={styles.shopsContainer}>
            {initialLoad ? (
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
                    <View key={shop.id || shop._id} style={isFeatured ? styles.featuredWrapper : styles.gridWrapper}>
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

const getStyles = (Theme: any, insets: any) => StyleSheet.create({
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
    width: 56, height: 56, borderRadius: 18, // Slightly larger icons
    backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
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
    backgroundColor: '#FFF',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 12, height: '100%' },
  vDivider: { width: 1, height: 20, backgroundColor: '#EEE' },
  qrBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', paddingBottom: 2 },

  scrollArea: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingBottom: 120 },

  // Categories
  categoriesScroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 20 },
  categoryItem: { alignItems: 'center', width: 72 },
  categoryIconCircle: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, fontWeight: '700', color: Theme.colors.text, textAlign: 'center' },

  // Carousel
  carouselContainer: { width: SCREEN_WIDTH, height: 194, marginTop: 8 },
  bannerWrapper: { width: SCREEN_WIDTH, paddingHorizontal: 16 },
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
    width: (SCREEN_WIDTH - 44) / 2,
    marginBottom: 16,
  },

  // Simple Location Styles
  locationContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  locationInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: Theme.colors.textSecondary, fontSize: 15 },
});
