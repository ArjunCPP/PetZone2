/**
 * StackNavigation
 * Defines the full screen-by-screen flow:
 *   Splash → Login → Otp → Location → Home
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen   from '../Screens/SplashScreen';
import LoginScreen    from '../Screens/LoginScreen';
import RegisterScreen from '../Screens/RegisterScreen';
import OtpScreen      from '../Screens/OtpScreen';
import ForgotPasswordScreen from '../Screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../Screens/ResetPasswordScreen';
import LocationScreen from '../Screens/LocationScreen';
import HomeScreen     from '../Screens/HomeScreen';
import ShopDetailScreen from '../Screens/ShopDetailScreen';
import BottomNavigation from './BottomNavigation';
import TimeSlotSelectionScreen from '../Screens/TimeSlotSelectionScreen';
import PaymentScreen from '../Screens/PaymentScreen';
import BookingConfirmationScreen from '../Screens/BookingConfirmationScreen';
import UpdateProfileScreen from '../Screens/UpdateProfileScreen';
import AdminLoginScreen from '../Screens/AdminLoginScreen';
import AdminDashboardScreen from '../Screens/AdminDashboardScreen';
import TodaysAppointmentsScreen from '../Screens/TodaysAppointmentsScreen';
import BlockSlotScreen from '../Screens/BlockSlotScreen';
import AboutScreen from '../Screens/AboutScreen';
import SettingsScreen from '../Screens/SettingsScreen';
import SearchScreen from '../Screens/SearchScreen';
import SavedShopsScreen from '../Screens/SavedShopsScreen';
import NotificationScreen from '../Screens/NotificationScreen';
import PetDetailsScreen from '../Screens/PetDetailsScreen';

import { RootStackParamList } from './types';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash"    component={SplashScreen} />
      <Stack.Screen name="Login"     component={LoginScreen} />
      <Stack.Screen name="Register"  component={RegisterScreen} />
      <Stack.Screen name="Otp"       component={OtpScreen} />
      <Stack.Screen name="ForgotPassword"   component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword"    component={ResetPasswordScreen} />
      <Stack.Screen name="Location"   component={LocationScreen} />
      <Stack.Screen name="MainTabs"   component={BottomNavigation} />
      <Stack.Screen name="ShopDetail"          component={ShopDetailScreen} />
      <Stack.Screen name="TimeSlotSelection"   component={TimeSlotSelectionScreen} />
      <Stack.Screen name="PetDetails"          component={PetDetailsScreen} />
      <Stack.Screen name="Payment"             component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="UpdateProfile"       component={UpdateProfileScreen} />
      <Stack.Screen name="AdminLogin"          component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard"      component={AdminDashboardScreen} />
      <Stack.Screen name="TodaysAppointments"  component={TodaysAppointmentsScreen} />
      <Stack.Screen name="BlockSlot"           component={BlockSlotScreen} />
      <Stack.Screen name="About"               component={AboutScreen} />
      <Stack.Screen name="Settings"            component={SettingsScreen} />
      <Stack.Screen name="SavedShops"          component={SavedShopsScreen} />
      <Stack.Screen name="Search"              component={SearchScreen} />
      <Stack.Screen name="Notifications"       component={NotificationScreen} />
    </Stack.Navigator>
  );
}
