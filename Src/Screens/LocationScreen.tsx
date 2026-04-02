import React, { useMemo,  useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Location'>;

const SUGGESTIONS = [
  { id: '1', city: 'San Francisco, CA', country: 'United States' },
  { id: '2', city: 'San Diego, CA', country: 'United States' },
  { id: '3', city: 'San Jose, CA', country: 'United States' },
];

export default function LocationScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [searchText, setSearchText] = useState('San Francisco, CA');

  const handleLocationSet = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="back" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Location</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Illustration Section */}
          <View style={styles.illustrationWrapper}>
            <View style={styles.illustrationCard}>
              <View style={styles.bgGradient} />
              <View style={styles.pinContainer}>
                <View style={styles.mapPinOuter}>
                  <Icon name="location" size={48} color={Theme.colors.primary} />
                </View>
                <View style={styles.pawBadge}>
                  <Icon name="pets" size={24} color={Theme.colors.white} />
                </View>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.textSection}>
            <Text style={styles.headline}>Where are you located?</Text>
            <Text style={styles.subtitle}>
              Allow PetZone to access your location to find pets and friends nearby.
            </Text>
          </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            {/* Primary Action */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLocationSet} activeOpacity={0.85}>
              <Icon name="explore" size={20} color={Theme.colors.white} />
              <Text style={styles.primaryBtnText}>Use My Current Location</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Search */}
            <View style={styles.manualSearchSection}>
              <Text style={styles.label}>Set Location Manually</Text>
              <View style={styles.searchBox}>
                <Icon name="search" size={20} color={Theme.colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search city, neighborhood, or zip code"
                  placeholderTextColor={Theme.colors.textSecondary}
                />
              </View>

              {/* Suggestions List */}
              <View style={styles.suggestionsContainer}>
                {SUGGESTIONS.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.suggestionRow, index === SUGGESTIONS.length - 1 && styles.lastSuggestionRow]}
                    onPress={handleLocationSet}
                  >
                    <Icon name="location" size={20} color={Theme.colors.textSecondary} />
                    <View>
                      <Text style={styles.cityName}>{item.city}</Text>
                      <Text style={styles.countryName}>{item.country}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.surface },
  flex: { flex: 1 },
  navBar: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Theme.colors.primary + '1A' },
  backArrow: {},
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  backBtnPlaceholder: { width: 44, height: 44 },
  scrollContent: { paddingBottom: 40 },
  illustrationWrapper: { paddingHorizontal: 24, paddingVertical: 24, alignItems: 'center' },
  illustrationCard: {
    width: '100%', maxWidth: 280, aspectRatio: 1, backgroundColor: Theme.colors.primary + '1A',
    borderRadius: Theme.roundness.large, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.primary,
    opacity: 0.1,
  },
  pinContainer: { alignItems: 'center', position: 'relative' },
  mapPinOuter: {
    backgroundColor: Theme.colors.white, padding: 24, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    borderWidth: 4, borderColor: Theme.colors.primary, marginBottom: 16,
  },
  pinEmoji: {},
  pawBadge: {
    position: 'absolute', bottom: 4, right: -16,
    backgroundColor: Theme.colors.primary, padding: 12, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5
  },
  pawBadgeEmoji: {},
  textSection: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  headline: { fontSize: 28, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily, textAlign: 'center', lineHeight: 24 },
  actionsSection: { paddingHorizontal: 24, flexGrow: 1 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
    backgroundColor: Theme.colors.primary, paddingVertical: 16, borderRadius: Theme.roundness.default,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  primaryBtnIcon: {},
  primaryBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '700', fontFamily: Theme.typography.fontFamily },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Theme.colors.border },
  dividerText: { fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  manualSearchSection: { gap: 12 },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginLeft: 4, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.white,
    borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.roundness.default,
    paddingHorizontal: 16, height: 56, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 15, color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, height: '100%' },
  suggestionsContainer: {
    backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.roundness.default, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 4,
    overflow: 'hidden', marginTop: 8
  },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.surface
  },
  lastSuggestionRow: { borderBottomWidth: 0 },
  suggestionIcon: {},
  cityName: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  countryName: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: Theme.typography.fontFamily },
});
