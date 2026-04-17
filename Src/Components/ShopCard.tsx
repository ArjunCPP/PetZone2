import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType, ActivityIndicator, Animated, Platform, Pressable } from 'react-native';
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
  onBook, onRemove, isRemoving, variant = 'featured',
  about
}: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme, variant), [Theme, variant]);
  
  const isGrid = variant === 'grid';

  // --- ANIMATIONS ---
  const zoomAnim = useRef(new Animated.Value(1.1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry Animation (Zoom + Fade)
    Animated.parallel([
      Animated.timing(zoomAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Constant Logo Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable 
      onPress={onBook}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '100%', marginBottom: 4 }}
    >
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: pressAnim }] }]}>
        <View style={styles.imageContainer}>
          {/* Animated Background Cover */}
          <Animated.View style={{ flex: 1, transform: [{ scale: zoomAnim }] }}>
            {image ? (
              <Image source={image} style={styles.shopImage} resizeMode="cover" />
            ) : (
              <View style={styles.shopImagePlaceholder}>
                <Text style={styles.shopImageEmoji}>🏪</Text>
              </View>
            )}
          </Animated.View>
          
          {/* Overlay Badges */}
          <View style={styles.topOverlay}>
            {!isGrid && (
              <View style={styles.trendingBadge}>
                <Icon name="trending" size={10} color="#FFF" />
                <Text style={styles.trendingText}>TRENDING</Text>
              </View>
            )}

            {rating > 0 && (
              <View style={styles.ratingBadge}>
                <Icon name="star" size={isGrid ? 10 : 14} color="#F4C430" />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {onRemove && !isGrid && (
            <TouchableOpacity 
              style={styles.removeBadge} 
              onPress={(e) => {
                e.stopPropagation();
                onRemove?.();
              }} 
              disabled={isRemoving} 
              activeOpacity={0.8}
            >
              {isRemoving ? <ActivityIndicator size="small" color="#FF5252" /> : <Icon name="close" size={16} color="#FF5252" />}
            </TouchableOpacity>
          )}
        </View>

        {/* OVERLAPPING LOGO / PROFILE PICTURE */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.logoOutline, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.logoInner}>
              {logo ? (
                <Image source={logo} style={styles.shopLogo} resizeMode="cover" />
              ) : (
                <View style={styles.shopLogoPlaceholder}>
                  <Text style={{ fontSize: isGrid ? 12 : 16 }}>🐾</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        <View style={styles.body}>
          <View style={isGrid ? styles.titleCol : styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.shopName} numberOfLines={1}>{name}</Text>
              <View style={styles.distanceRow}>
                <Icon name="location" size={12} color={Theme.colors.textSecondary} />
                <Text style={styles.distanceText}>{distance}</Text>
              </View>
            </View>
          </View>

          {/* About Snippet */}
          <Text style={styles.aboutSnippet} numberOfLines={isGrid ? 1 : 2}>
            {about || "Experience premium pet grooming and care services tailored for your furry friends."}
          </Text>

          <View style={styles.detailsRow}>
            <View style={styles.tagsContainer}>
              {tags.slice(0, isGrid ? 1 : 2).map((tag, i) => (
                <View key={tag + i} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
              <Text style={styles.bookBtnText}>{isGrid ? 'BOOK' : 'BOOK NOW'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const getStyles = (Theme: any, variant: 'featured' | 'grid') => {
  const isGrid = variant === 'grid';
  
  return StyleSheet.create({
    card: { 
      backgroundColor: Theme.colors.white, borderRadius: 28, 
      overflow: 'visible',
      shadowColor: '#000', 
      shadowOpacity: isGrid ? 0.08 : 0.12, 
      shadowOffset: { width: 0, height: isGrid ? 4 : 8 }, 
      shadowRadius: isGrid ? 8 : 16, 
      elevation: isGrid ? 4 : 8, 
      borderWidth: 1, borderColor: '#F0F0F0',
      width: '100%',
    },
    imageContainer: { 
      width: '100%', 
      height: isGrid ? 110 : 180, 
      backgroundColor: '#F5F7FA', 
      position: 'relative',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
    },
    shopImage: { width: '100%', height: '100%' },
    shopImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    shopImageEmoji: { fontSize: isGrid ? 32 : 48 },
    
    topOverlay: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    trendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      gap: 4,
    },
    trendingText: { fontSize: 9, fontWeight: '900', color: Theme.colors.white, letterSpacing: 0.5 },
    
    ratingBadge: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, 
      paddingHorizontal: 8, paddingVertical: 4, gap: 4,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    ratingText: { fontSize: isGrid ? 10 : 12, fontWeight: '800', color: Theme.colors.text },
    
    removeBadge: {
      position: 'absolute', top: 10, right: 10, alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10,
      width: 32, height: 32, zIndex: 30
    },

    // Logo Overlap Styles
    logoWrapper: {
      position: 'absolute',
      top: isGrid ? 85 : 150, // Overlapping height
      left: 16,
      zIndex: 20,
    },
    logoOutline: {
      padding: 3,
      backgroundColor: '#FFF',
      borderRadius: isGrid ? 18 : 24,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    },
    logoInner: {
      width: isGrid ? 32 : 48,
      height: isGrid ? 32 : 48,
      borderRadius: isGrid ? 16 : 24,
      backgroundColor: '#F5F7FA',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#EEE',
    },
    shopLogo: { width: '100%', height: '100%' },
    shopLogoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    body: { 
      paddingTop: isGrid ? 16 : 24, // Space for logo overlap
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 10 
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    titleCol: { gap: 4 },
    titleContainer: { flex: 1 },
    shopName: { 
      fontSize: isGrid ? 15 : 19, 
      fontWeight: '900', 
      color: Theme.colors.text, 
      fontFamily: Theme.typography.fontFamily,
      letterSpacing: -0.5,
    },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    distanceText: { 
      fontSize: isGrid ? 11 : 13, 
      color: Theme.colors.textSecondary, 
      fontFamily: Theme.typography.fontFamily,
      fontWeight: '600'
    },
    
    aboutSnippet: {
      fontSize: isGrid ? 10 : 12,
      color: Theme.colors.textSecondary,
      lineHeight: isGrid ? 14 : 18,
      fontFamily: Theme.typography.fontFamily,
    },

    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2,
    },
    tagsContainer: { flexDirection: 'row', gap: 6 },
    tagBadge: { 
      backgroundColor: '#F0F4F8', 
      borderRadius: 8, 
      paddingHorizontal: 8, 
      paddingVertical: 4 
    },
    tagText: { 
      fontSize: 8, 
      fontWeight: '800', 
      color: '#52606D', 
      fontFamily: Theme.typography.fontFamily, 
      letterSpacing: 0.3 
    },
    bookBtn: { 
      backgroundColor: Theme.colors.primary, 
      borderRadius: 12, 
      paddingVertical: isGrid ? 8 : 10, 
      paddingHorizontal: isGrid ? 14 : 20,
      alignItems: 'center',
      shadowColor: Theme.colors.primary, 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 8, 
      elevation: 4,
    },
    bookBtnText: { 
      color: Theme.colors.white, 
      fontSize: isGrid ? 10 : 12, 
      fontWeight: '800', 
      letterSpacing: 0.5, 
      fontFamily: Theme.typography.fontFamily 
    },
  });
};
