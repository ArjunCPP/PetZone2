import React, { useMemo,  useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'TimeSlotSelection'>;

interface DateItem { id: string; day: string; date: number; month: string; fullDate: string; }
interface SlotItem { id: string; time: string; status: 'available' | 'unavailable' | 'selected'; }

const DATES: DateItem[] = [
  { id: '1', day: 'Today', date: 24, month: 'Oct', fullDate: 'Thu, 24 Oct' },
  { id: '2', day: 'Tomorrow', date: 25, month: 'Oct', fullDate: 'Fri, 25 Oct' },
  { id: '3', day: 'Sat',   date: 26, month: 'Oct', fullDate: 'Sat, 26 Oct' },
  { id: '4', day: 'Sun',   date: 27, month: 'Oct', fullDate: 'Sun, 27 Oct' },
  { id: '5', day: 'Mon',   date: 28, month: 'Oct', fullDate: 'Mon, 28 Oct' },
];

const INITIAL_SLOTS: SlotItem[] = [
  { id: '1', time: '09:00 AM', status: 'available' },
  { id: '2', time: '10:00 AM', status: 'unavailable' },
  { id: '3', time: '11:00 AM', status: 'selected' },
  { id: '4', time: '12:00 PM', status: 'available' },
  { id: '5', time: '01:00 PM', status: 'available' },
  { id: '6', time: '02:00 PM', status: 'unavailable' },
  { id: '7', time: '03:00 PM', status: 'available' },
  { id: '8', time: '04:00 PM', status: 'available' },
];

export default function TimeSlotSelectionScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { serviceTitle, price } = route.params;
  const [selectedDateId, setSelectedDateId] = useState('1');
  const [slots, setSlots] = useState(INITIAL_SLOTS);

  const selectedDate = DATES.find(d => d.id === selectedDateId);
  const selectedSlot = slots.find(s => s.status === 'selected');

  const handleSlotPress = (id: string) => {
    setSlots(current => current.map(s => {
      if (s.status === 'unavailable') return s;
      return { ...s, status: s.id === id ? 'selected' : 'available' };
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceTitle} - ₹{price}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <FlatList
            horizontal
            data={DATES}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedDateId;
              return (
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setSelectedDateId(item.id)}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{item.day}</Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>{item.date}</Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{item.month}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.slotsGrid}>
            {slots.map(slot => {
              const isSelected = slot.status === 'selected';
              const isUnavailable = slot.status === 'unavailable';
              
              return (
                <TouchableOpacity 
                  key={slot.id} 
                  disabled={isUnavailable}
                  onPress={() => handleSlotPress(slot.id)}
                  style={[
                    styles.slotCard, 
                    isSelected && styles.slotCardSelected,
                    isUnavailable && styles.slotCardUnavailable
                  ]}
                >
                  <Text style={[
                    styles.slotTime,
                    isSelected && styles.slotTimeSelected,
                    isUnavailable && styles.slotTimeUnavailable
                  ]}>
                    {slot.time}
                  </Text>
                  <View style={[styles.slotIcon, isSelected && styles.slotIconSelected]}>
                    {isUnavailable ? (
                      <Icon name="close" size={18} color={Theme.colors.textSecondary} />
                    ) : isSelected ? (
                      <Icon name="check" size={18} color={Theme.colors.white} />
                    ) : (
                      <Icon name="check" size={18} color={Theme.colors.primary + '33'} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.primary + '33' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.secondary }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.border }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <View>
            <Text style={styles.footerLabel}>BOOKING SLOT</Text>
            <Text style={styles.footerValue}>{selectedDate?.fullDate} • {selectedSlot?.time}</Text>
          </View>
          <View style={styles.footerPriceCol}>
            <Text style={styles.footerLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.footerPrice}>₹{price}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.payBtn} 
          onPress={() => navigation.navigate('Payment', { 
            shopId: route.params.shopId,
            date: selectedDate?.fullDate || '',
            time: selectedSlot?.time || '',
            price: price
          })}
        >
          <Text style={styles.payBtnText}>Proceed to Pay</Text>
          <Icon name="arrow_forward" size={20} color={Theme.colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  header: { 
    backgroundColor: Theme.colors.background, paddingHorizontal: 16, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center'
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: { },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, marginLeft: 12 },
  
  scrollContent: { paddingBottom: 120 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 16, fontFamily: Theme.typography.fontFamily },
  
  dateList: { paddingRight: 16 },
  dateCard: { 
    width: 72, height: 80, borderRadius: Theme.roundness.large, 
    backgroundColor: Theme.colors.primary + '1A', borderWidth: 1, borderColor: Theme.colors.primary + '33',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  dateCardSelected: { backgroundColor: Theme.colors.primary, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  dateDay: { fontSize: 10, fontWeight: '600', color: Theme.colors.textSecondary, marginBottom: 4 },
  dateNum: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  dateMonth: { fontSize: 10, fontWeight: '600', color: Theme.colors.textSecondary, marginTop: 4 },
  dateTextSelected: { color: Theme.colors.white },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotCard: { 
    width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.primary + '4D',
    backgroundColor: Theme.colors.white
  },
  slotCardSelected: { borderColor: Theme.colors.secondary, borderWidth: 2, backgroundColor: Theme.colors.secondary + '0D' },
  slotCardUnavailable: { borderColor: Theme.colors.border, backgroundColor: Theme.colors.border + '33', opacity: 0.6 },
  slotTime: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  slotTimeSelected: { color: Theme.colors.secondary },
  slotTimeUnavailable: { textDecorationLine: 'line-through', color: Theme.colors.textSecondary },
  slotIcon: { },
  slotIconSelected: {},

  legendRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600', color: Theme.colors.textSecondary },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.white, padding: 16, paddingBottom: 24,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10
  },
  footerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  footerLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 1, marginBottom: 4 },
  footerValue: { fontSize: 14, fontWeight: '700', color: Theme.colors.text },
  footerPriceCol: { alignItems: 'flex-end' },
  footerPrice: { fontSize: 20, fontWeight: '800', color: Theme.colors.primary },
  payBtn: { 
    width: '100%', height: 56, backgroundColor: Theme.colors.secondary, 
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Theme.colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  payBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '700' },
  payBtnArrow: { },
});
