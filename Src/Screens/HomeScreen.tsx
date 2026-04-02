import React, { useMemo,  useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

import ShopCard from '../Components/ShopCard';
import { HOME_AVATAR, HOME_GROOMING_SHOP, HOME_PET_SPA, PETZONE_LOGO } from '../Assets';
import authApi from '../Api';

// MOCK_SHOPS removed as we now fetch from API

const CATEGORIES = [
  { id: '1', name: 'Location', icon: 'location' as const, color: '#FF6F61' },
  { id: '2', name: 'Explore', icon: 'explore' as const, color: '#4A90E2' },
  { id: '3', name: 'Offers', icon: 'offer' as const, color: '#7ED321' },
  { id: '4', name: 'Favorite', icon: 'heart' as const, color: '#F5A623' },
];

export default function HomeScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [searchText, setSearchText] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasFetched = useRef(false);

  useFocusEffect(
    useCallback(() => {
      fetchShops();
    }, [])
  );

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

  const filteredShops = shops.filter(s => s.storeName?.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Image source={HOME_AVATAR} style={styles.avatarImage} resizeMode="cover" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>PetZone</Text>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
            <Icon name="notifications" size={22} color={Theme.colors.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Location Bar */}
        <View style={styles.locationBar}>
          <View style={styles.locationLeft}>
            <View style={styles.pinIconContainer}>
              <Icon name="location" size={16} color={Theme.colors.primary} />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>Ernakulam, Kochi</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
              tintColor={Theme.colors.primary}
            />
          }
        >

          {/* Range Selector & Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchBox}>
              <View style={styles.searchIconWrapper}>
                <Icon name="search" size={20} color={Theme.colors.primary} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search pet grooming shops..."
                placeholderTextColor={Theme.colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <View style={styles.rangeSelectorWrapper}>
              <TouchableOpacity style={styles.rangeSelectorBtn}>
                <Text style={styles.rangeText}>Within 5 km</Text>
                <Icon name="chevron_down" size={14} color={Theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map(category => (
              <TouchableOpacity key={category.id} style={styles.categoryItem}>
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '1A' }]}>
                  <Icon name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section: Shops Near You */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shops Near You</Text>
          </View>

          <View style={styles.shopsList}>
            {initialLoad ? (
              <>
                <SkeletonShopCard />
                <SkeletonShopCard />
                <SkeletonShopCard />
              </>
            ) : filteredShops.length > 0 ? (
              filteredShops.map(shop => (
                <ShopCard
                  key={shop.id || shop._id}
                  name={shop.storeName}
                  distance={shop.address?.city || 'Nearby'}
                  rating={4.5} // Placeholder
                  tags={shop.tags || ['Pet Care']}
                  image={shop.logo?.url ? { uri: shop.logo.url } : HOME_GROOMING_SHOP}
                  onBook={() => navigation.navigate('ShopDetail', { shopId: shop.id || shop._id, shopDetails: shop })}
                />
              ))
            ) : (
                <Text style={{ textAlign: 'center', color: Theme.colors.textSecondary, marginTop: 20 }}>No shops found.</Text>
            )}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );

  function SkeletonShopCard() {
    const animValue = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0.3, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }, []);

    return (
      <View style={styles.skeletonCard}>
        <Animated.View style={[styles.skeletonImg, { opacity: animValue }]} />
        <View style={styles.skeletonBody}>
          <View style={styles.skeletonHeaderRow}>
            <View style={styles.skeletonTitleGroup}>
              <Animated.View style={[styles.skeletonTitle, { opacity: animValue }]} />
              <Animated.View style={[styles.skeletonSub, { opacity: animValue }]} />
            </View>
            <Animated.View style={[styles.skeletonTag, { opacity: animValue }]} />
          </View>
          <Animated.View style={[styles.skeletonBtn, { opacity: animValue }]} />
        </View>
      </View>
    );
  }
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  container: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Theme.colors.background, paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.primary + '1A'
  },
  avatarContainer: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: Theme.colors.primary,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Theme.colors.primary + '33'
  },
  avatarImage: { width: '100%', height: '100%' },
  appLogo: { width: 100, height: 32 },
  appTitle: {},
  bellBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Theme.colors.white,
    borderWidth: 1.5, borderColor: Theme.colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
  },
  notificationDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FF5252', borderWidth: 1.5, borderColor: Theme.colors.white
  },
  bellIcon: {},

  locationBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Theme.colors.background
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, overflow: 'hidden', gap: 8 },
  pinIconContainer: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Theme.colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center'
  },
  pinIcon: {},
  locationText: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, flex: 1 },
  editBtn: {},
  editIcon: {},

  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  searchSection: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  rangeSelectorWrapper: { flexDirection: 'row', marginTop: 4 },
  rangeSelectorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Theme.colors.primary, paddingHorizontal: 12, height: 28, borderRadius: 999,
  },
  rangeText: { fontSize: 11, fontWeight: '700', color: Theme.colors.white, fontFamily: Theme.typography.fontFamily },
  rangeChevron: {},

  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white,
    borderWidth: 1.5, borderColor: Theme.colors.primary + '26', borderRadius: 16,
    height: 56, paddingHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  searchIconWrapper: { paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, height: '100%', paddingRight: 16 },
  filterBtn: {},

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  seeAll: {},

  shopsList: { paddingHorizontal: 16, gap: 24, paddingBottom: 24 },

  categoryScroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categoryIconContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  categoryName: { fontSize: 12, fontWeight: '600', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  // Skeletons
  skeletonCard: {
    backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.large,
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: Theme.colors.border,
    marginBottom: 24, padding: 0
  },
  skeletonImg: { width: '100%', height: 192, backgroundColor: '#E0E0E0' },
  skeletonBody: { padding: 16, gap: 12 },
  skeletonHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  skeletonTitleGroup: { flex: 1, gap: 8, paddingRight: 12 },
  skeletonTitle: { width: '80%', height: 20, borderRadius: 4, backgroundColor: '#E0E0E0' },
  skeletonSub: { width: '40%', height: 14, borderRadius: 4, backgroundColor: '#E0E0E0' },
  skeletonTag: { width: 40, height: 20, borderRadius: 4, backgroundColor: '#E0E0E0' },
  skeletonBtn: { width: '100%', height: 48, borderRadius: 8, backgroundColor: '#E0E0E0', marginTop: 4 },
});
