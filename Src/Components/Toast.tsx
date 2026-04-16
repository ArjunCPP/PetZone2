import React, { useMemo,  useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useAppTheme } from '../ThemeContext';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

export const Toast = ({ visible, message, type = 'info', onHide, duration = 3000 }: ToastProps) => {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const translateY = useRef(new Animated.Value(PathY())).current;

  function PathY() {
    return 100; // Start hidden below
  }

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 25,
          friction: 8,
        }),
        Animated.delay(duration),
        Animated.timing(translateY, {
          toValue: 100, // Hide back down
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, duration]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return Theme.colors.primary;
      case 'error': return Theme.colors.error;
      default: return Theme.colors.text;
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: getBackgroundColor(),
        transform: [{ translateY }],
      }
    ]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const getStyles = (Theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110, // Positioned above the floating tab bar
    alignSelf: 'center',
    backgroundColor: '#222222',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 9999,
    maxWidth: width - 40,
  },
  text: {
    color: Theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily,
  },
});
