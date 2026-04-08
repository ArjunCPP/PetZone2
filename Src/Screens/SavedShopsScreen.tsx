import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import ShopCard from '../Components/ShopCard';
import { Toast } from '../Components/Toast';
import { HOME_GROOMING_SHOP } from '../Assets';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedShops'>;

export default function SavedShopsScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  const [savedShops, setSavedShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedShops();
    }, [])
  );

  const fetchSavedShops = async () => {
    setLoading(true);
    try {
      const response = await authApi.savedTenants();
      const savedData = response.data?.data?.data || response.data?.data || [];
      
      console.log("Found Saved Shops:", savedData);
      setSavedShops(savedData);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to load saved shops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShop = async (deleteId: string) => {
    console.log("Delete ID", deleteId);
    if (!deleteId) {
      showToast('Error: Missing ID', 'error');
      return;
    }

    setRemovingId(deleteId);
    try {
      const response = await authApi.deleteSaveTenant(deleteId);
      if (response.data && response.data.success) {
        showToast('Shop removed from saved list', 'success');
        setSavedShops(prev => prev.filter(item => {
          const id = item._id || item.id || (item.tenant && (item.tenant._id || item.tenant.id));
          return id !== deleteId;
        }));
      } else {
        showToast(response.data?.message || 'Failed to remove shop', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Shops</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {savedShops.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="heart" size={64} color={Theme.colors.border} />
              <Text style={styles.emptyText}>You haven't saved any shops yet.</Text>
            </View>
          ) : (
            savedShops.map((item, index) => {
              const shop = item.tenant || item;
              const deleteId = item._id || item.id;
              const navId = shop._id || shop.id;

              if (!shop) return null;

              return (
                <View key={deleteId || index} style={styles.cardWrapper}>
                  <ShopCard
                    name={shop.storeName || 'Unknown Shop'}
                    distance={shop.address?.city || 'Nearby'}
                    rating={4.8} 
                    tags={shop.tags || shop.amenities || ['Pet Care']}
                    image={shop.logo?.url ? { uri: shop.logo.url } : HOME_GROOMING_SHOP}
                    onBook={() => navigation.navigate('ShopDetail', { shopId: navId, shopDetails: shop })}
                    onRemove={() => handleRemoveShop(deleteId)}
                    isRemoving={removingId === deleteId && deleteId != null}
                  />
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  headerRight: { width: 40 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardWrapper: { marginBottom: 16 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 64 },
  emptyText: { marginTop: 16, fontSize: 16, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
});
