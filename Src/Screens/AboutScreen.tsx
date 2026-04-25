import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { PETZONE_LOGO } from '../Assets';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={Theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={Theme.colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About PawNest</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Logo / Branding Section */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Image source={PETZONE_LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>PawNest</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            The ultimate platform to book grooming, spa treatments, and complete care for your best furry friends. We bring the best professionals directly to your fingertips.
          </Text>
        </View>

        {/* Links Section */}
        <Text style={styles.sectionTitle}>Legal & Policies</Text>
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WebViewScreen', { url: 'https://petzone.quantuver-wizards.site/terms', title: 'Terms of Service' })}
          >
            <Text style={styles.rowTitle}>Terms of Service</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WebViewScreen', { url: 'https://petzone.quantuver-wizards.site/privacy', title: 'Privacy Policy' })}
          >
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate('WebViewScreen', { url: 'https://petzone.quantuver-wizards.site/refund-policy', title: 'Refund Policy' })}
          >
            <Text style={styles.rowTitle}>Refund Policy</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Contact & Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HelpCenter' as any)}>
            <Text style={styles.rowTitle}>Help Center & FAQ</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:pawnestt@gamil.com')}>
            <Text style={styles.rowTitle}>Contact Support</Text>
            <Icon name="arrow_forward" size={18} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>© 2026 PawNest Inc. All rights reserved.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  headerRight: { width: 40 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  brandingSection: { alignItems: 'center', marginVertical: 32 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#25bba2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#25bba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: { width: 60, height: 60 },
  appName: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, marginBottom: 8, fontFamily: Theme.typography.fontFamily },
  appVersion: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Theme.colors.primary + '1A',
    borderRadius: 20,
    fontFamily: Theme.typography.fontFamily,
  },
  appDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    fontFamily: Theme.typography.fontFamily,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Theme.typography.fontFamily,
  },
  
  card: { backgroundColor: Theme.colors.card, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, minHeight: 60 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginLeft: 16 },

  footerText: { textAlign: 'center', fontSize: 12, color: Theme.colors.textSecondary, marginTop: 40, fontWeight: '600', fontFamily: Theme.typography.fontFamily }
});
