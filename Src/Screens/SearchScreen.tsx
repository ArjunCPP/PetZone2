import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, useWindowDimensions, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { SearchField } from '../Components/SearchField';
import ShopCard from '../Components/ShopCard';
import { ShopCardSkeleton } from '../Components/Skeleton';
import authApi from '../Api';
import { HOME_GROOMING_SHOP } from '../Assets';
import { useLocation } from '../LocationContext';

export default function SearchScreen({ route, navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => getStyles(Theme, screenWidth), [Theme, screenWidth]);
  
  const [searchText, setSearchText] = useState(route.params?.initialSearch || '');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { coords, userLocation, isLocating, refreshLocation } = useLocation();
  const [distanceFilter, setDistanceFilter] = useState<'All' | '5' | '10' | '15'>('All');

  const getDistanceInKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
    return true;
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const initialSearch = route.params?.initialSearch;
      
      let response;
      if (initialSearch) {
        console.log('📡 Fetching Search Shops by Service:', initialSearch);
        response = await authApi.tenantsList({ serviceName: initialSearch });
      } else {
        response = await authApi.tenantsList();
      }

      console.log('✅ Search API Full Response:', JSON.stringify(response.data, null, 2));

      if (response.data?.success) {
        setShops(response.data?.data?.data || response.data?.data || []);
      }
    } catch (error) {
      console.log('Search Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(s => {
    // 1. Distance filter
    if (distanceFilter !== 'All' && coords) {
      const maxDistance = parseInt(distanceFilter, 10);
      const lat = s.location?.latitude || s.location?.coordinates?.[1];
      const lng = s.location?.longitude || s.location?.coordinates?.[0];
      if (!lat || !lng) return false;
      
      const dist = getDistanceInKm(coords.latitude, coords.longitude, lat, lng);
      if (dist > maxDistance) return false;
    }

    // 2. Text/Category match filter
    if (route.params?.initialSearch && searchText === route.params.initialSearch) {
      return true;
    }
    
    const query = searchText.toLowerCase();
    const nameMatch = s.storeName?.toLowerCase().includes(query);
    const cityMatch = s.address?.city?.toLowerCase().includes(query);
    const tagsMatch = s.tags?.some((t: string) => t.toLowerCase().includes(query));
    const amenitiesMatch = s.amenities?.some((a: string) => a.toLowerCase().includes(query));
    return nameMatch || cityMatch || tagsMatch || amenitiesMatch;
  });

  const renderShopItem = ({ item, index }: { item: any, index: number }) => (
    <View key={(item.id || item._id || 'search') + '-' + index} style={styles.gridWrapper}>
      <ShopCard
        variant="grid"
        name={item.storeName}
        distance={item.address?.city || 'Nearby'}
        rating={item.averageRating || 0}
        tags={item.tags || item.amenities || ['Pet Care']}
        image={item.coverImage?.url ? { uri: item.coverImage.url } : HOME_GROOMING_SHOP}
        logo={item.logo?.url ? { uri: item.logo.url } : undefined}
        onBook={() => navigation.navigate('ShopDetail', { shopId: item.id || item._id, shopDetails: item })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Theme.isDark ? "light-content" : "dark-content"} backgroundColor={Theme.colors.background} />
      
      {/* Modern Unified Header Section */}
      <View style={styles.headerContainer}>
        {/* Top: Back & Search */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.searchWrapper}>
            <SearchField 
              autoFocus 
              value={searchText}
              onChangeText={setSearchText}
              onClear={() => setSearchText('')}
            />
          </View>
        </View>

        {/* Middle: Subtle Location Indicator */}
        <View style={styles.locationInlineRow}>
          <Icon name="location" size={16} color={Theme.colors.primary} />
          <Text style={styles.locationInlineText} numberOfLines={1}>
            {isLocating ? 'Detecting location...' : (userLocation || 'Location unavailable')}
          </Text>
          <TouchableOpacity onPress={refreshLocation} style={styles.refreshBtn}>
             <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom: Distance Filters */}
        {coords && (
          <View style={styles.filterWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {['All', '5', '10', '15'].map((opt) => {
                const isActive = distanceFilter === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    activeOpacity={0.8}
                    style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                    onPress={() => setDistanceFilter(opt as any)}
                  >
                    <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                      {opt === 'All' ? 'All Areas' : `< ${opt} km`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.mainContent}>

        {loading ? (
          <View style={styles.listContent}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={styles.gridWrapper}>
                <ShopCardSkeleton variant="grid" />
              </View>
            ))}
          </View>
        ) : (
          <>
            <FlatList
              data={filteredShops}
              keyExtractor={(item, index) => (item.id || item._id || 'search') + '-' + index}
              renderItem={renderShopItem}
              numColumns={2}
              columnWrapperStyle={styles.rowWrapper}
              contentContainerStyle={styles.flatListContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBox}>
                    <Icon name="search" size={50} color={Theme.colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>No matches found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchText 
                      ? `We couldn't find any shops matching "${searchText}". Try a different keyword.` 
                      : "There are no shops available at the moment."}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any, screenWidth: number) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: Theme.colors.background 
  },
  headerContainer: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: Theme.colors.white, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchWrapper: { 
    flex: 1 
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Very soft contrast for grid background
  },
  listContent: { 
    padding: 16, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  rowWrapper: {
    justifyContent: 'space-between',
  },
  locationInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  locationInlineText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
    fontFamily: Theme.typography.fontFamily,
  },
  refreshBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  filterWrapper: {
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterBtnActive: {
    backgroundColor: Theme.colors.primary + '15',
    borderColor: Theme.colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  filterBtnTextActive: {
    color: Theme.colors.primary,
  },
  gridWrapper: {
    width: (screenWidth - 44) / 2,
    marginBottom: 16,
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.primary + '15', // Soft primary tint
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
    fontFamily: Theme.typography.fontFamily,
  },
  emptySubtitle: { 
    color: Theme.colors.textSecondary, 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Theme.typography.fontFamily,
  }
});
