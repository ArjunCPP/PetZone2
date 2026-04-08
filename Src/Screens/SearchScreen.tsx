import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { SearchField } from '../Components/SearchField';
import authApi from '../Api';
import { HOME_GROOMING_SHOP } from '../Assets';

export default function SearchScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [searchText, setSearchText] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderShopItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ShopDetail', { shopId: item.id || item._id, shopDetails: item })}
    >
      <Image 
        source={item.logo?.url ? { uri: item.logo.url } : HOME_GROOMING_SHOP} 
        style={styles.cardImage}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.storeName}</Text>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.address?.city || 'Nearby'}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.ratingBox}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Text style={styles.viewText}>View Details</Text>
        </View>
      </View>
      <View style={styles.arrowBox}>
        <Icon name="chevron_right" size={20} color={Theme.colors.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredShops}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderShopItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search" size={48} color={Theme.colors.border} />
              <Text style={styles.emptyText}>No shops matching "{searchText}"</Text>
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
  listContent: { padding: 16, gap: 16 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: Theme.colors.white, 
    borderRadius: 20, 
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  cardImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F0F0F0' },
  cardInfo: { flex: 1, marginLeft: 16, gap: 4 },
  cardName: { fontSize: 17, fontWeight: '800', color: '#1A1C1E' },
  cardAddress: { fontSize: 13, color: '#8E9196', fontWeight: '500' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#1A1C1E' },
  viewText: { fontSize: 12, fontWeight: '700', color: Theme.colors.primary },
  arrowBox: { paddingLeft: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: Theme.colors.textSecondary, fontSize: 15, fontWeight: '500' }
});
