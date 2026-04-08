import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl, Animated, FlatList, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { SearchField } from '../Components/SearchField';

import ShopCard from '../Components/ShopCard';
import { HOME_AVATAR, HOME_GROOMING_SHOP, HOME_PET_SPA, PETZONE_LOGO } from '../Assets';
import authApi from '../Api';

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

const HEADER_TOP_HEIGHT = 58; // Brand row height
const SEARCH_BOX_HEIGHT = 68; // Search container height
const TOTAL_HEADER_HEIGHT = HEADER_TOP_HEIGHT + SEARCH_BOX_HEIGHT;

export default function HomeScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [shops, setShops] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasFetched = useRef(false);
  
  // Carousel State
  const [bannerIndex, setBannerIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animation State
  const scrollY = useRef(new Animated.Value(0)).current;

  // Derived Values
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [0, -HEADER_TOP_HEIGHT],
    extrapolate: 'clamp'
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [0, 0.15],
    extrapolate: 'clamp'
  });

  useFocusEffect(
    useCallback(() => {
      fetchShops();
    }, [])
  );

  // Auto-scroll Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (bannerIndex + 1) % BANNERS.length;
      setBannerIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerIndex]);

  const fetchShops = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!hasFetched.current) {
      setInitialLoad(true);
    }

    try {
      const response = await authApi.tenantsList();
      if (response.data?.success) {
        setShops(response.data?.data?.data || []);
      }
    } catch (error: any) {
      console.log('❌ Fetch Shops Error:', error.response?.data || error.message);
    } finally {
      if (!hasFetched.current) {
        setInitialLoad(false);
        hasFetched.current = true;
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchShops(true);
  };

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
          <View 
            key={i} 
            style={[styles.paginationDot, bannerIndex === i && styles.paginationDotActive]} 
          />
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
      {CATEGORIES.map(cat => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.7}>
          <View style={[styles.categoryIconCircle, { backgroundColor: cat.color + '1A' }]}>
            <Icon name={cat.icon} size={26} color={cat.color} />
          </View>
          <Text style={styles.categoryName}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary} />
      <View style={styles.container}>

        {/* Animated Sticky Header */}
        <Animated.View style={[
          styles.headerMain, 
          { 
            height: TOTAL_HEADER_HEIGHT,
            transform: [{ translateY: headerTranslateY }],
            shadowOpacity: headerShadowOpacity
          }
        ]}>
          <View style={styles.headerTop}>
            <Text style={styles.brandTitle}>PetZone</Text>
            <TouchableOpacity 
              style={styles.bellBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications" size={22} color={Theme.colors.white} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <SearchField 
              isButton 
              onPress={() => navigation.navigate('Search')}
              placeholder="Search shops, pet spa..."
            />
          </View>
        </Animated.View>

        <Animated.ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: TOTAL_HEADER_HEIGHT }]}
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
              progressViewOffset={TOTAL_HEADER_HEIGHT}
            />
          }
        >
          {/* Section: Categories */}
          {renderCategories()}

          {/* Flash Offers */}
          {renderFlashCarousel()}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exclusive Deals</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>

          {/* Mixed Layout Shop List */}
          <View style={styles.shopsContainer}>
            {initialLoad ? (
              <ActivityIndicator color={Theme.colors.primary} size="large" style={{ marginTop: 40 }} />
            ) : shops.length > 0 ? (
              <View style={styles.shopsGrid}>
                {shops.map((shop, index) => {
                  const isFeatured = index < 2;
                  return (
                    <View 
                      key={shop.id || shop._id} 
                      style={isFeatured ? styles.featuredWrapper : styles.gridWrapper}
                    >
                      <ShopCard
                        variant={isFeatured ? 'featured' : 'grid'}
                        name={shop.storeName}
                        distance={shop.address?.city || 'Nearby'}
                        rating={4.8}
                        tags={shop.tags || shop.amenities || ['Pet Care']}
                        image={shop.logo?.url ? { uri: shop.logo.url } : HOME_GROOMING_SHOP}
                        onBook={() => navigation.navigate('ShopDetail', { shopId: shop.id || shop._id, shopDetails: shop })}
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search" size={48} color={Theme.colors.border} />
                <Text style={styles.emptyText}>No results found.</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  container: { flex: 1 },

  // Header Styles
  headerMain: { 
    position: 'absolute', top: 0, left: 0, right: 0, 
    zIndex: 10, backgroundColor: Theme.colors.primary, 
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 10
  },
  headerTop: { 
    height: HEADER_TOP_HEIGHT,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16
  },
  brandTitle: { fontSize: 24, fontWeight: '900', color: Theme.colors.white, letterSpacing: -0.5 },
  bellBtn: { 
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center'
  },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', borderWidth: 1.5, borderColor: Theme.colors.primary },
  
  searchContainer: { 
    height: SEARCH_BOX_HEIGHT, 
    paddingHorizontal: 16, justifyContent: 'center'
  },

  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 60 },

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
  gridWrapper: { width: '48.5%', marginBottom: 16 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: Theme.colors.textSecondary, fontSize: 15 },
});
