/**
 * ShopCard Component
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface Props { name: string; distance: string; rating: number; tags: string[]; image?: ImageSourcePropType; onBook: () => void; }

export default function ShopCard({ name, distance, rating, tags, image, onBook }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
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
        <View style={styles.ratingBadge}>
          <Icon name="star" size={14} color="#F4C430" />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.shopName} numberOfLines={1}>{name}</Text>
            <View style={styles.distanceRow}>
              <Icon name="location" size={12} color={Theme.colors.textSecondary} />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>BOOK NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  card: { 
    backgroundColor: Theme.colors.white, borderRadius: Theme.roundness.large, 
    overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: Theme.colors.border
  },
  imageContainer: { width: '100%', height: 192, backgroundColor: Theme.colors.border, position: 'relative' },
  shopImage: { width: '100%', height: '100%' },
  shopImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shopImageEmoji: { fontSize: 48 },
  ratingBadge: { 
    position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Theme.roundness.default, 
    paddingHorizontal: 8, paddingVertical: 4, gap: 4 
  },
  star: { },
  ratingText: { fontSize: 12, fontWeight: '700', color: Theme.colors.text },
  body: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleContainer: { flex: 1, paddingRight: 12 },
  shopName: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: 4 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceIcon: { },
  distanceText: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
  tagsContainer: { flexDirection: 'row', gap: 4 },
  tagBadge: { backgroundColor: Theme.colors.primary + '1A', borderRadius: Theme.roundness.small, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: 10, fontWeight: '700', color: Theme.colors.primary, fontFamily: Theme.typography.fontFamily, letterSpacing: 0.5 },
  bookBtn: { 
    backgroundColor: Theme.colors.secondary, borderRadius: Theme.roundness.default, 
    paddingVertical: 14, alignItems: 'center', shadowColor: Theme.colors.secondary, 
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 
  },
  bookBtnText: { color: Theme.colors.white, fontSize: 14, fontWeight: '700', letterSpacing: 1, fontFamily: Theme.typography.fontFamily },
});
