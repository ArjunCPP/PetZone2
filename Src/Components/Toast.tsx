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
    return -100;
  }

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 20,
          friction: 7,
        }),
        Animated.delay(duration),
        Animated.timing(translateY, {
          toValue: -100,
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
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#222222',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 9999,
  },
  text: {
    color: Theme.colors.white,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily,
  },
});
