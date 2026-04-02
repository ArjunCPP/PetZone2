/**
 * BottomNav Component
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TabVariant = 'home' | 'map';
interface Tab { label: string; emoji: string; }
interface Props { activeTab: string; variant?: TabVariant; onTabPress?: (tab: string) => void; }

const HOME_TABS: Tab[] = [{ label: 'Home', emoji: '🏠' }, { label: 'My Bookings', emoji: '📅' }, { label: 'Offers', emoji: '🏷️' }, { label: 'Profile', emoji: '👤' }];
const MAP_TABS: Tab[] = [{ label: 'Home', emoji: '🏠' }, { label: 'Map', emoji: '🗺️' }, { label: 'Social', emoji: '🐾' }, { label: 'Profile', emoji: '👤' }];

export default function BottomNav({ activeTab, variant = 'home', onTabPress }: Props) {
  const tabs = variant === 'map' ? MAP_TABS : HOME_TABS;
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = tab.label === activeTab;
        return (
          <TouchableOpacity key={tab.label} style={styles.tab} onPress={() => onTabPress?.(tab.label)}>
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{tab.emoji}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EFEFEF', paddingBottom: 24, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icon: { fontSize: 20, color: '#AAA' },
  label: { fontSize: 10, color: '#AAA', fontWeight: '500' },
  activeIcon: { color: '#2DB89D' },
  activeLabel: { color: '#2DB89D', fontWeight: '700' },
});
