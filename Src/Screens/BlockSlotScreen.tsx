import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'BlockSlot'>;

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

export default function BlockSlotScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('24 Oct');

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBlock = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one time slot to block.');
      return;
    }
    Alert.alert('Success', `Successfully blocked ${selectedSlots.length} slots for ${selectedDate}.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Block Time Slots</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={() => setSelectedSlots([])}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="explore" size={20} color={Theme.colors.primary} />
          <Text style={styles.infoText}>Blocked slots will be shown as "Unavailable" to your customers on the booking page.</Text>
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.dateRow}>
          {['24 Oct', '25 Oct', '26 Oct', '27 Oct'].map(date => (
            <TouchableOpacity 
              key={date} 
              style={[styles.dateCard, selectedDate === date && styles.activeDateCard]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dateText, selectedDate === date && styles.activeDateText]}>{date}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Slots Grid */}
        <Text style={styles.sectionTitle}>Choose Slots to Block</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map(slot => {
            const isSelected = selectedSlots.includes(slot);
            return (
              <TouchableOpacity 
                key={slot} 
                style={[styles.slotCard, isSelected && styles.activeSlotCard]}
                onPress={() => toggleSlot(slot)}
              >
                <Text style={[styles.slotText, isSelected && styles.activeSlotText]}>{slot}</Text>
                {isSelected && <Icon name="lock" size={16} color={Theme.colors.secondary} />}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Selected:</Text>
          <Text style={styles.summaryValue}>{selectedSlots.length} Slots</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleBlock}>
          <Text style={styles.confirmBtnText}>Confirm Block</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.white
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: { },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  resetBtn: { padding: 8 },
  resetText: { color: Theme.colors.secondary, fontWeight: '700', fontSize: 13 },

  scrollContent: { padding: 16, paddingBottom: 120 },

  infoBox: { 
    flexDirection: 'row', backgroundColor: Theme.colors.primary + '0D', 
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.primary + '33', gap: 12, marginBottom: 24
  },
  infoEmoji: { },
  infoText: { flex: 1, fontSize: 13, color: Theme.colors.text, lineHeight: 18, fontWeight: '500' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.text, marginBottom: 16 },

  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  dateCard: { flex: 1, height: 48, borderRadius: 12, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  activeDateCard: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  dateText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary },
  activeDateText: { color: Theme.colors.white },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotCard: { 
    width: '48%', height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, borderRadius: 12, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.border
  },
  activeSlotCard: { borderColor: Theme.colors.secondary, backgroundColor: Theme.colors.secondary + '0D' },
  slotText: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  activeSlotText: { color: Theme.colors.secondary },
  checkIcon: { },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: Theme.colors.white, padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Theme.colors.border 
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 14, fontWeight: '700', color: Theme.colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '800', color: Theme.colors.primary },
  confirmBtn: { 
    backgroundColor: Theme.colors.secondary, height: 56, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  confirmBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
});
