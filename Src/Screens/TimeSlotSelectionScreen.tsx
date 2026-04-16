import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, FlatList, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import authApi from '../Api';

type Props = NativeStackScreenProps<RootStackParamList, 'TimeSlotSelection'>;

interface DateItem { id: string; day: string; date: number; month: string; fullDate: string; isClosed: boolean; }
interface DateItem { id: string; day: string; date: number; month: string; fullDate: string; isClosed: boolean; }
interface SlotItem {
  id: string;
  time: string; // Original time (e.g. ISO or HH:mm)
  displayTime: string;
  isBlocked: boolean;
  isBooked: boolean;
  isFull: boolean;
  isAvailable: boolean;
  isSelected?: boolean;
}

export default function TimeSlotSelectionScreen({ route, navigation }: Props) {
  console.log("Route Params: time slot", route.params);
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const { serviceTitle, price, tenant, serviceDetails, businessHours } = route.params;

  const dates = useMemo(() => {
    const generated: DateItem[] = [];
    const today = new Date();

    // Mapping: Backend (Mon=0...Sun=6) vs JS getDay (Sun=0, Mon=1...Sat=6)
    const backendDayIdxMap = [6, 0, 1, 2, 3, 4, 5]; // JS getDay() result -> Backend Index

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const backendIdx = backendDayIdxMap[d.getDay()];
      const isClosed = businessHours?.[backendIdx]?.isClosed ?? false;

      // Format as YYYY-MM-DD for API
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      generated.push({
        id: String(i),
        day: dayName,
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: formattedDate,
        isClosed: isClosed
      });
    }
    return generated;
  }, [businessHours]);

  const [selectedDateId, setSelectedDateId] = useState(() => {
    // Select first non-closed date if possible
    const firstAvailable = dates.find(d => !d.isClosed);
    return firstAvailable ? firstAvailable.id : '0';
  });
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
    return true;
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  const selectedDate = useMemo(() => dates.find(d => d.id === selectedDateId), [dates, selectedDateId]);
  const selectedSlot = slots.find(s => s.isSelected);

  useEffect(() => {
    if (selectedDate && !selectedDate.isClosed) {
      fetchAvailability(selectedDate.fullDate);
    } else {
      setSlots([]);
      setIsLoading(false);
    }
  }, [selectedDateId]);

  const formatToAmPm = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const generateTimeSlots = (apiSlots: any[]) => {
    return apiSlots.map((slot, index) => {
      const startTime = new Date(slot.time);
      const displayTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const isAvailable = slot.availability === 'AVAILABLE';
      const isBlocked = slot.availability === 'BLOCKED';

      return {
        id: slot.time, // Using the time string as unique ID
        time: slot.time,
        displayTime: displayTime,
        isBlocked: isBlocked,
        isBooked: slot.isBooked ?? false, // Keep existing check if available
        isFull: slot.isFull ?? false,
        isAvailable: isAvailable,
        isSelected: false
      };
    });
  };

  const fetchAvailability = async (dateStr: string) => {
    try {
      setIsLoading(true);
      const payload = {
        tenant: tenant,
        serviceDetails: serviceDetails,
        date: dateStr,
      };
      console.log("Response Time Slot Payload:", payload);

      const response = await authApi.servicesSlot(payload);
      console.log("Response Time Slot Data:", response.data);

      if (response.data?.success) {
        const { slots: apiSlots, availableSlots } = response.data.data;
        const processedSlots = generateTimeSlots(apiSlots || availableSlots || []);
        setSlots(processedSlots);
      } else {
        setSlots([]);
      }
    } catch (error) {
      console.log("Error fetching slots", error);
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotPress = (id: string) => {
    setSlots(current => current.map(s => {
      // Don't allow selecting if not available for any reason
      if (!s.isAvailable || s.isBlocked || s.isBooked || s.isFull) return s;
      return { ...s, isSelected: s.id === id };
    }));
  };

  const SlotSkeleton = () => (
    <View style={styles.slotsGrid}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <View key={i} style={[styles.slotCard, styles.skeletonCard]} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Normal Header like ShopDetail */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>{serviceTitle}</Text>
        </View>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <FlatList
            horizontal
            data={dates}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedDateId;
              const isClosed = item.isClosed;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => !isClosed && setSelectedDateId(item.id)}
                  disabled={isClosed}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                    isClosed && styles.dateCardDisabled
                  ]}
                >
                  <Text style={[
                    styles.dateDay,
                    isSelected && styles.dateTextSelected,
                    isClosed && styles.dateTextDisabled
                  ]}>{item.day}</Text>
                  <Text style={[
                    styles.dateNum,
                    isSelected && styles.dateTextSelected,
                    isClosed && styles.dateTextDisabled
                  ]}>{item.date}</Text>
                  <Text style={[
                    styles.dateMonth,
                    isSelected && styles.dateTextSelected,
                    isClosed && styles.dateTextDisabled
                  ]}>{item.month}</Text>

                  {isClosed && (
                    <View style={styles.closedBadge}>
                      <Text style={styles.closedText}>Closed</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: Theme.colors.primary }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          {isLoading ? (
            <SlotSkeleton />
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map(slot => {
                const isSelected = slot.isSelected;
                const isDisabled = !slot.isAvailable || slot.isBlocked || slot.isBooked || slot.isFull;

                let cardStyle: any[] = [styles.slotCard];
                let textStyle: any[] = [styles.slotTime];
                let statusLabel = '';

                if (isSelected) {
                  cardStyle.push(styles.slotCardSelected);
                  textStyle.push(styles.slotTimeSelected);
                } else if (slot.isBooked || slot.isBlocked || !slot.isAvailable) {
                  cardStyle.push(styles.slotCardBooked);
                  textStyle.push(styles.slotTimeBooked);
                  statusLabel = 'Booked';
                } else if (slot.isFull) {
                  cardStyle.push(styles.slotCardFull);
                  textStyle.push(styles.slotTimeFull);
                  statusLabel = 'Full';
                }

                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.7}
                    disabled={isDisabled}
                    onPress={() => handleSlotPress(slot.id)}
                    style={cardStyle}
                  >
                    <View style={styles.slotContent}>
                      {slot.isBlocked && <Icon name="lock" size={12} color="#757575" style={{ marginRight: 4 }} />}
                      <Text style={textStyle}>{slot.displayTime}</Text>
                    </View>

                    {statusLabel !== '' && !isSelected && (
                      <Text style={[styles.statusMiniLabel, { color: (textStyle[textStyle.length - 1] as any).color || '#444' }]}>
                        {statusLabel}
                      </Text>
                    )}

                    {isSelected && (
                      <View style={styles.slotCheck}>
                        <Icon name="check" size={10} color={Theme.colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <View>
            <Text style={styles.footerLabel}>BOOKING SLOT</Text>
            <Text style={styles.footerValue}>{selectedDate?.fullDate} • {selectedSlot?.displayTime || '---'}</Text>
          </View>
          <View style={styles.footerPriceCol}>
            <Text style={styles.footerLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.footerPrice}>₹{price}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.payBtn, !selectedSlot && { opacity: 0.5 }]}
          disabled={!selectedSlot}
          onPress={() => navigation.navigate('PetDetails', {
            shopId: route.params.shopId,
            shopName: route.params.shopName,
            tenant: route.params.tenant,
            serviceDetails: route.params.serviceDetails,
            serviceTitle: route.params.serviceTitle,
            date: selectedDate?.fullDate || '',
            time: selectedSlot?.id || '',
            applicableSpecies: route.params.applicableSpecies,
            price: price
          })}
        >
          <Text style={styles.payBtnText}>Confirm Booking</Text>
          <Icon name="check" size={18} color={Theme.colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },

  scrollContent: { paddingBottom: 140 },
  section: { padding: 16, paddingBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1C1E', marginBottom: 12 },

  dateList: { paddingRight: 16 },
  dateCard: {
    width: 65, height: 75, borderRadius: 14,
    backgroundColor: '#F7F8FA', borderWidth: 1, borderColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  dateCardSelected: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary, elevation: 4, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
  dateDay: { fontSize: 10, fontWeight: '700', color: '#8E9196', marginBottom: 2 },
  dateNum: { fontSize: 18, fontWeight: '900', color: '#1A1C1E' },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#8E9196', marginTop: 1 },
  dateTextSelected: { color: Theme.colors.white },
  dateCardDisabled: { opacity: 0.6, backgroundColor: '#F0F0F0' },
  dateTextDisabled: { color: '#B0B0B0' },
  closedBadge: { position: 'absolute', top: 3, right: 3, backgroundColor: '#FFEDED', paddingHorizontal: 3, paddingVertical: 1, borderRadius: 3 },
  closedText: { fontSize: 5, fontWeight: '900', color: '#FF5252', textTransform: 'uppercase' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCard: {
    width: '48%', height: 42,
    backgroundColor: Theme.colors.white, borderRadius: 8,
    borderWidth: 1, borderColor: '#EBEBEB',
    alignItems: 'center', justifyContent: 'center',
  },
  slotCardSelected: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primary },
  slotCardUnavailable: { backgroundColor: '#F8F9FA', opacity: 0.5, borderColor: '#EBEBEB' },
  slotCardBooked: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  slotCardFull: { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' },
  slotCardBlocked: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  slotTime: { fontSize: 12, fontWeight: '700', color: '#444' },
  slotTimeSelected: { color: Theme.colors.white },
  slotTimeUnavailable: { textDecorationLine: 'line-through', color: '#BCBCBC' },
  slotTimeBooked: { color: '#D32F2F' },
  slotTimeFull: { color: '#E65100' },
  slotTimeBlocked: { color: '#757575' },
  slotContent: { flexDirection: 'row', alignItems: 'center' },
  statusMiniLabel: { fontSize: 8, fontWeight: '800', marginTop: 1, textTransform: 'uppercase' },
  slotCheck: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: Theme.colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Theme.colors.primary },

  skeletonCard: { backgroundColor: '#EBEBEB', borderWidth: 0, opacity: 0.5 },

  legendRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '700', color: '#8E9196' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.white, padding: 16, paddingBottom: 24,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 15,
    borderTopWidth: 1, borderTopColor: '#F0F0F0'
  },
  footerInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  footerLabel: { fontSize: 9, fontWeight: '900', color: '#A0A3A8', letterSpacing: 0.8, marginBottom: 2 },
  footerValue: { fontSize: 13, fontWeight: '700', color: '#1A1C1E' },
  footerPriceCol: { alignItems: 'flex-end' },
  footerPrice: { fontSize: 20, fontWeight: '900', color: Theme.colors.primary },
  payBtn: {
    width: '100%', height: 50, backgroundColor: Theme.colors.primary,
    borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6
  },
  payBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
});
