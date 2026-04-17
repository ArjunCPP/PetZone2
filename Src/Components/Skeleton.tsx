import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { useAppTheme } from '../ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius, style }: SkeletonProps) => {
  const { theme: Theme } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 20,
          borderRadius: borderRadius || 4,
          backgroundColor: Theme.isDark ? '#333' : '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const BookingCardSkeleton = () => {
  const { theme: Theme } = useAppTheme();
  return (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Skeleton width={56} height={56} borderRadius={12} />
        <View style={styles.shopInfo}>
          <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
        <Skeleton width={80} height={20} borderRadius={10} />
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <Skeleton width={120} height={16} borderRadius={4} />
        <Skeleton width={60} height={20} borderRadius={4} />
      </View>
    </View>
  );
};

export const TransactionCardSkeleton = () => {
  const { theme: Theme } = useAppTheme();
  return (
    <View style={[styles.bookingCard, { borderRadius: 20 }]}>
      <View style={[styles.cardHeader, { marginBottom: 16 }]}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="50%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <Skeleton width="30%" height={12} borderRadius={4} />
        </View>
        <Skeleton width={70} height={24} borderRadius={8} />
      </View>
      <View style={{ height: 1, backgroundColor: Theme.isDark ? '#333' : '#EEE', marginVertical: 4, marginBottom: 16 }} />
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Skeleton width={80} height={12} borderRadius={4} />
          <Skeleton width={100} height={12} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={80} height={12} borderRadius={4} />
          <Skeleton width={60} height={12} borderRadius={4} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Theme.isDark ? '#333' : '#EEE' }}>
        <View>
          <Skeleton width={60} height={10} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={100} height={20} borderRadius={4} />
        </View>
        <Skeleton width={80} height={32} borderRadius={10} />
      </View>
    </View>
  );
};

export const ShopCardSkeleton = ({ variant = 'featured' }: { variant?: 'featured' | 'grid' }) => {
  const { theme: Theme } = useAppTheme();
  const isGrid = variant === 'grid';

  return (
    <View style={[
      styles.shopCard, 
      { 
        width: '100%',
        borderRadius: Theme.roundness.large,
        borderColor: Theme.colors.border,
      }
    ]}>
      {/* Image Area */}
      <Skeleton 
        height={isGrid ? 120 : 200} 
        borderRadius={0} 
        style={{ borderTopLeftRadius: Theme.roundness.large, borderTopRightRadius: Theme.roundness.large }} 
      />
      
      {/* Body Area */}
      <View style={{ padding: isGrid ? 12 : 16, gap: isGrid ? 8 : 12 }}>
        <View style={{ flexDirection: isGrid ? 'column' : 'row', justifyContent: 'space-between', alignItems: isGrid ? 'flex-start' : 'center' }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton width="70%" height={isGrid ? 14 : 18} borderRadius={4} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Skeleton width={10} height={10} borderRadius={5} />
              <Skeleton width="40%" height={10} borderRadius={3} />
            </View>
          </View>
          {!isGrid && <Skeleton width={60} height={20} borderRadius={6} />}
        </View>
        
        {/* Button */}
        <Skeleton 
          height={isGrid ? 36 : 44} 
          borderRadius={Theme.roundness.default} 
        />
      </View>
    </View>
  );
};

export const BannerSkeleton = () => {
  return (
    <View style={{ width: '100%', paddingHorizontal: 16 }}>
      <Skeleton height={164} borderRadius={20} />
    </View>
  );
};

export const CategorySkeleton = () => {
    return (
        <View style={{ width: 70, gap: 8, alignItems: 'center' }}>
            <Skeleton width={52} height={52} borderRadius={26} />
            <Skeleton width={45} height={12} borderRadius={4} />
        </View>
    );
};

const styles = StyleSheet.create({
  bookingCard: { 
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#EEE'
  },
  shopCard: {
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopInfo: { flex: 1, gap: 4 },
  cardDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
