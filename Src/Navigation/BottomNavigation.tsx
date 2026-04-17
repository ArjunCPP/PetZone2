import React, { useMemo, useRef, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform, TouchableOpacity, UIManager, LayoutAnimation, Animated } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon, IconName } from '../Components/Icon';

import HomeScreen from '../Screens/HomeScreen';
import MyBookingsScreen from '../Screens/MyBookingsScreen';
import OffersScreen from '../Screens/OffersScreen';
import ProfileScreen from '../Screens/ProfileScreen';


export type BottomTabParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  OffersTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

interface TabItemProps {
  isFocused: boolean;
  iconName: IconName;
  label: string;
  onPress: () => void;
}

function AnimatedTabItem({ isFocused, iconName, label, onPress }: TabItemProps) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0.55)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const bgScaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 120, // softer spring
          mass: 0.9,      // slightly more mass for 'moving' feel
        }),
        Animated.spring(bgScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250, // slightly longer
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 250,
          delay: 100, // wait a bit more for layout to shift
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.85,
          useNativeDriver: true,
          damping: 14,
          stiffness: 140,
          mass: 0.8,
        }),
        Animated.timing(bgScaleAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.55,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.tabButton, isFocused && styles.tabButtonActive]}
    >
      <View style={[styles.pillContainer, isFocused ? styles.activePillContainer : styles.inactivePillContainer]}>
          {isFocused && (
             <Animated.View
               style={[
                 styles.animatedBackground,
                 {
                   transform: [{ scale: bgScaleAnim }],
                 },
               ]}
             />
          )}

          <Animated.View
            style={[
              styles.contentContainer,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            <Icon
              name={iconName}
              size={22}
              color={isFocused ? Theme.colors.white : Theme.colors.textSecondary}
            />
            {isFocused && (
              <Animated.Text style={[styles.activeLabel, { opacity: labelOpacity }]} numberOfLines={1}>
                {label}
              </Animated.Text>
            )}
          </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Super smooth, fluid transition using a specific spring config
            LayoutAnimation.configureNext({
              duration: 500,
              create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
              update: {
                type: LayoutAnimation.Types.spring,
                springDamping: 0.65, // More bounce, more "moving" feel
              },
              delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });
            navigation.navigate(route.name, route.params);
          }
        };

        let iconName: IconName = 'explore';
        let label = '';
        if (route.name === 'HomeTab') { iconName = 'explore'; label = 'Home'; }
        if (route.name === 'BookingsTab') { iconName = 'bookings'; label = 'Bookings'; }
        if (route.name === 'OffersTab') { iconName = 'offer'; label = 'Offers'; }
        if (route.name === 'ProfileTab') { iconName = 'profile'; label = 'Profile'; }

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            iconName={iconName}
            label={label}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function BottomNavigation() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen as any} />
      <Tab.Screen name="BookingsTab" component={MyBookingsScreen} />
      <Tab.Screen name="OffersTab" component={OffersScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 18,
    right: 18,
    backgroundColor: Theme.colors.white,
    borderRadius: 40,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  tabButtonActive: {
    flex: 2.5, // Slightly more space for a more relaxed look
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // to contain the animated background
  },
  activePillContainer: {
    height: 50,
    width: '100%',
    paddingHorizontal: 22,
    borderRadius: 30,
  },
  inactivePillContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  animatedBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.primary,
    borderRadius: 30, // Needs to match active container
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1, // ensure it's above the animated background
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800', // Slightly bolder for premium look
    fontFamily: Theme.typography.fontFamily,
    letterSpacing: 0.3,
  },
});
