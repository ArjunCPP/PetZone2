import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { SearchField } from '../Components/SearchField';
import ShopCard from '../Components/ShopCard';
import { ShopCardSkeleton } from '../Components/Skeleton';
import authApi from '../Api';
import { HOME_GROOMING_SHOP } from '../Assets';

export default function SearchScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [searchText, setSearchText] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const response = await authApi.tenantsList();
      if (response.data?.success) {
        setShops(response.data?.data?.data || []);
      }
    } catch (error) {
      console.log('Search Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(s => 
    s.storeName?.toLowerCase().includes(searchText.toLowerCase()) ||
    s.address?.city?.toLowerCase().includes(searchText.toLowerCase())
  );

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
      <StatusBar barStyle={Theme.isDark ? "light-content" : "dark-content"} backgroundColor={Theme.colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
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

      {loading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.gridWrapper}>
              <ShopCardSkeleton variant="grid" />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item, index) => (item.id || item._id || 'search') + '-' + index}
          renderItem={renderShopItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color={Theme.colors.border} />
              <Text style={styles.emptyText}>
                {searchText ? `No shops matching "${searchText}"` : "No shops available"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F7F8FA', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  searchWrapper: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { 
    padding: 16, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  gridWrapper: {
    width: (Dimensions.get('window').width - 44) / 2,
    marginBottom: 16,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 100 },
  emptyText: { marginTop: 12, color: Theme.colors.textSecondary, fontSize: 15, fontWeight: '500' }
});
