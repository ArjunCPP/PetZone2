import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
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

type IconProps = { focused: boolean; color: string; size: number; name: IconName };

const TabIcon = ({ name, color, focused }: IconProps) => {
  const { theme: Theme } = useAppTheme();
  return (
    <View style={getStyles(Theme).iconContainer}>
      <Icon 
        name={name} 
        size={24} 
        color={focused ? Theme.colors.primary : '#94a3b8'} 
      />
    </View>
  );
};

export default function BottomNavigation() {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen as any} 
        options={{
          tabBarLabel: 'HOME',
          tabBarIcon: (props) => <TabIcon {...props} name="explore" />
        }}
      />
      <Tab.Screen 
        name="BookingsTab" 
        component={MyBookingsScreen} 
        options={{
          tabBarLabel: 'MY BOOKINGS',
          tabBarIcon: (props) => <TabIcon {...props} name="bookings" />
        }}
      />
      <Tab.Screen 
        name="OffersTab" 
        component={OffersScreen} 
        options={{
          tabBarLabel: 'OFFERS',
          tabBarIcon: (props) => <TabIcon {...props} name="offer" />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'PROFILE',
          tabBarIcon: (props) => <TabIcon {...props} name="profile" />
        }}
      />
    </Tab.Navigator>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Theme.typography.fontFamily,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  }
});
