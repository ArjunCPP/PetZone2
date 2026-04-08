/**
 * ShopCard Component
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface Props { 
  name: string; 
  distance: string; 
  rating: number; 
  tags: string[]; 
  image?: ImageSourcePropType; 
  onBook: () => void; 
  onRemove?: () => void; 
  isRemoving?: boolean;
  variant?: 'featured' | 'grid';
}

export default function ShopCard({ 
  name, distance, rating, tags, image, 
  onBook, onRemove, isRemoving, variant = 'featured'
}: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme, variant), [Theme, variant]);
  
  const isGrid = variant === 'grid';

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={image} style={styles.shopImage} resizeMode="cover" />
        ) : (
          <View style={styles.shopImagePlaceholder}>
            <Text style={styles.shopImageEmoji}>🏪</Text>
          </View>
        )}
        
        {onRemove && !isGrid && (
          <TouchableOpacity style={styles.removeBadge} onPress={onRemove} disabled={isRemoving} activeOpacity={0.8}>
            {isRemoving ? <ActivityIndicator size="small" color="#FF5252" /> : <Icon name="close" size={16} color="#FF5252" />}
          </TouchableOpacity>
        )}
        
        <View style={styles.ratingBadge}>
          <Icon name="star" size={isGrid ? 10 : 14} color="#F4C430" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>

        {!isGrid && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>TRENDING</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={isGrid ? styles.titleCol : styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.shopName} numberOfLines={1}>{name}</Text>
            <View style={styles.distanceRow}>
              <Icon name="location" size={10} color={Theme.colors.textSecondary} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
          
          {!isGrid && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 1).map(tag => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>{isGrid ? 'BOOK' : 'BOOK NOW'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (Theme: any, variant: 'featured' | 'grid') => {
  const isGrid = variant === 'grid';
  
  return StyleSheet.create({
    card: { 
      backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.large, 
      overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, 
      shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: Theme.colors.border,
      width: isGrid ? '100%' : '100%',
    },
    imageContainer: { 
      width: '100%', 
      height: isGrid ? 120 : 200, 
      backgroundColor: Theme.colors.border, position: 'relative' 
    },
    shopImage: { width: '100%', height: '100%' },
    shopImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    shopImageEmoji: { fontSize: isGrid ? 32 : 48 },
    removeBadge: {
      position: 'absolute', top: 12, left: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Theme.roundness.default,
      width: 32, height: 32, zIndex: 10
    },
    ratingBadge: { 
      position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, 
      paddingHorizontal: 6, paddingVertical: 3, gap: 4 
    },
    featuredBadge: {
      position: 'absolute', bottom: 12, left: 12, backgroundColor: Theme.colors.primary,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6
    },
    featuredText: { fontSize: 10, fontWeight: '900', color: Theme.colors.white, letterSpacing: 0.5 },
    ratingText: { fontSize: isGrid ? 10 : 12, fontWeight: '700', color: Theme.colors.text },
    body: { padding: isGrid ? 12 : 16, gap: isGrid ? 8 : 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    titleCol: { gap: 4 },
    titleContainer: { flex: 1, paddingRight: isGrid ? 0 : 12 },
    shopName: { fontSize: isGrid ? 14 : 17, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: isGrid ? 2 : 4 },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceText: { fontSize: isGrid ? 10 : 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', flex: 1 },
    tagBadge: { backgroundColor: Theme.colors.primary + '1A', borderRadius: Theme.roundness.small, paddingHorizontal: 8, paddingVertical: 4 },
    tagText: { fontSize: 9, fontWeight: '700', color: Theme.colors.primary, fontFamily: Theme.typography.fontFamily, letterSpacing: 0.5 },
    bookBtn: { 
      backgroundColor: Theme.colors.secondary, borderRadius: Theme.roundness.default, 
      paddingVertical: isGrid ? 10 : 14, alignItems: 'center', shadowColor: Theme.colors.secondary, 
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 
    },
    bookBtnText: { color: Theme.colors.white, fontSize: isGrid ? 12 : 14, fontWeight: '700', letterSpacing: 1, fontFamily: Theme.typography.fontFamily },
  });
};
