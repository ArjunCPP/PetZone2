import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { APPOINTMENTS_SCREENSHOT } from '../Assets';
import { Icon } from '../Components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'TodaysAppointments'>;

interface Appointment {
  id: string;
  customerName: string;
  petName: string;
  petType: 'Dog' | 'Cat';
  service: string;
  time: string;
  status: 'Pending' | 'Checked-In' | 'Completed';
}

const APPOINTMENTS: Appointment[] = [
  { id: '1', customerName: 'Alice Johnson', petName: 'Buddy', petType: 'Dog', service: 'Full Grooming', time: '09:00 AM', status: 'Checked-In' },
  { id: '2', customerName: 'Bob Smith', petName: 'Luna', petType: 'Cat', service: 'Bath & Dry', time: '10:30 AM', status: 'Pending' },
  { id: '3', customerName: 'Charlie Brown', petName: 'Snoopy', petType: 'Dog', service: 'Nail Trim', time: '11:45 AM', status: 'Pending' },
  { id: '4', customerName: 'David Wilson', petName: 'Max', petType: 'Dog', service: 'Haircut', time: '02:00 PM', status: 'Pending' },
];

export default function TodaysAppointmentsScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <Icon name="bookings" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Date Banner */}
      <View style={styles.dateBanner}>
        <View style={styles.dateInfo}>
          <Text style={styles.dayText}>Thursday,</Text>
          <Text style={styles.dateText}>24 October 2026</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{APPOINTMENTS.length} Total</Text>
        </View>
      </View>

      <FlatList
        data={APPOINTMENTS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.timeCol}>
              <Text style={styles.timeText}>{item.time.split(' ')[0]}</Text>
              <Text style={styles.ampmText}>{item.time.split(' ')[1]}</Text>
              <View style={styles.timeLine} />
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.petIconWrapper}>
                  <Icon name={item.petType === 'Dog' ? 'dog' : 'pets'} size={24} color={Theme.colors.secondary} />
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.petName} ({item.customerName})</Text>
                  <Text style={styles.serviceName}>{item.service}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'Checked-In' ? styles.statusActive : styles.statusPending]}>
                  <View style={[styles.statusDot, item.status === 'Checked-In' ? styles.dotActive : styles.dotPending]} />
                  <Text style={[styles.statusText, item.status === 'Checked-In' ? styles.textActive : styles.textPending]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                {item.status === 'Pending' ? (
                  <>
                    <TouchableOpacity style={styles.checkInBtn}>
                      <Text style={styles.checkInText}>Check In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailsBtn}>
                      <Text style={styles.detailsText}>View Details</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.completeBtn}>
                    <Text style={styles.completeText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />
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
  calendarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.border + '80' },
  calendarIcon: { },

  dateBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Theme.colors.white, marginBottom: 8 },
  dateInfo: { flex: 1 },
  dayText: { fontSize: 13, fontWeight: '700', color: Theme.colors.textSecondary },
  dateText: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginTop: 2 },
  countBadge: { backgroundColor: Theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  countText: { fontSize: 11, fontWeight: '800', color: Theme.colors.white },

  listContent: { padding: 16, paddingBottom: 40 },
  appointmentCard: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  timeCol: { width: 60, alignItems: 'center' },
  timeText: { fontSize: 16, fontWeight: '800', color: Theme.colors.text },
  ampmText: { fontSize: 10, fontWeight: '700', color: Theme.colors.textSecondary },
  timeLine: { width: 2, flex: 1, backgroundColor: Theme.colors.border, marginTop: 8, borderRadius: 1 },

  infoCard: { 
    flex: 1, backgroundColor: Theme.colors.white, borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: Theme.colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  petIconWrapper: { width: 48, height: 48, borderRadius: 12, backgroundColor: Theme.colors.secondary + '1A', alignItems: 'center', justifyContent: 'center' },
  petEmoji: { },
  petInfo: { flex: 1, gap: 2 },
  petName: { fontSize: 14, fontWeight: '800', color: Theme.colors.text },
  serviceName: { fontSize: 12, color: Theme.colors.textSecondary, fontWeight: '600' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusActive: { backgroundColor: '#10b9811A' },
  statusPending: { backgroundColor: '#f59e0b1A' },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: '#10b981' },
  dotPending: { backgroundColor: '#f59e0b' },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  textActive: { color: '#10b981' },
  textPending: { color: '#f59e0b' },

  cardActions: { flexDirection: 'row', gap: 10 },
  checkInBtn: { flex: 1.5, height: 40, borderRadius: 10, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkInText: { color: Theme.colors.white, fontSize: 12, fontWeight: '700' },
  detailsBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  detailsText: { color: Theme.colors.text, fontSize: 12, fontWeight: '700' },
  completeBtn: { width: '100%', height: 40, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  completeText: { color: Theme.colors.white, fontSize: 12, fontWeight: '700' },
});
