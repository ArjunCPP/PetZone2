import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, ActivityIndicator, Animated, Pressable } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface Props { 
  name: string; 
  distance: string; 
  rating: number; 
  tags: string[]; 
  image?: ImageSourcePropType; 
  logo?: ImageSourcePropType;
  onBook: () => void; 
  onRemove?: () => void; 
  isRemoving?: boolean;
  variant?: 'featured' | 'grid';
  about?: string;
}

export default function ShopCard({ 
  name, distance, rating, tags, image, logo,
  onBook, onRemove, isRemoving, variant = 'featured', about 
}: Props) {
  const { theme: Theme } = useAppTheme();
  const isGrid = variant === 'grid';
  const styles = useMemo(() => getStyles(Theme, isGrid), [Theme, isGrid]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  return (
    <Pressable onPress={onBook} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ width: '100%', paddingBottom: 8 }}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        
        {/* --- IMAGE SECTION --- */}
        <View style={styles.imageCover}>
          {image ? (
            <Image source={image} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}><Text style={{fontSize: 40}}>🏪</Text></View>
          )}

          {/* OVERLAYS */}
          <View style={styles.overlayTop}>
            {!isGrid && (
              <View style={styles.badgePrimary}>
                <Icon name="trending" size={10} color="#FFF" />
                <Text style={styles.badgePrimaryText}>FEATURED</Text>
              </View>
            )}
            <View style={{flex: 1}} />
            {rating > 0 && (
              <View style={styles.badgeRating}>
                <Icon name="star" size={10} color="#FFB300" />
                <Text style={styles.badgeRatingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {onRemove && (
              <TouchableOpacity style={styles.removeBtn} onPress={(e) => { e.stopPropagation(); onRemove(); }}>
                {isRemoving ? <ActivityIndicator size="small" color="#FF5252" /> : <Icon name="close" size={12} color="#FFF" />}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- CONTENT SECTION --- */}
        <View style={styles.content}>
          <View style={styles.header}>
            {!isGrid && logo && (
              <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logo} resizeMode="cover" />
              </View>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>{name}</Text>
              <View style={styles.locationRow}>
                <Icon name="location" size={10} color={Theme.colors.textSecondary} />
                <Text style={styles.locationText} numberOfLines={1}>{distance}</Text>
              </View>
            </View>
          </View>

          {!isGrid && about && (
            <Text style={styles.about} numberOfLines={2}>{about}</Text>
          )}

          <View style={styles.footer}>
            <View style={styles.tags}>
              {tags.slice(0, isGrid ? 1 : 2).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.8}>
              <Text style={styles.bookBtnText}>{isGrid ? 'BOOK' : 'BOOK NOW'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const getStyles = (Theme: any, isGrid: boolean) => StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Theme.isDark ? 0.3 : 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  imageCover: {
    width: '100%',
    height: isGrid ? 110 : 160,
    backgroundColor: Theme.colors.border + '40',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgePrimary: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgePrimaryText: {
    color: Theme.colors.primaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeRating: {
    backgroundColor: 'rgba(25, 28, 33, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeRatingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  removeBtn: {
    backgroundColor: 'rgba(255, 82, 82, 0.9)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  content: {
    padding: isGrid ? 12 : 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isGrid ? 8 : 12,
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Theme.isDark ? 0.2 : 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: isGrid ? 14 : 17,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: Theme.typography.fontFamily,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: isGrid ? 11 : 12,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily,
  },
  about: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: Theme.typography.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Theme.colors.border + '80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontFamily: Theme.typography.fontFamily,
  },
  bookBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: isGrid ? 14 : 20,
    paddingVertical: isGrid ? 8 : 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    color: Theme.colors.primaryText,
    fontSize: isGrid ? 10 : 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Theme.typography.fontFamily,
  },
});
