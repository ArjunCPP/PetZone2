import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';

const DEMO_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Welcome to PetZone! 🐾',
    message: 'We are excited to help you care for your furry friends. Explore top-rated grooming and spa services near you.',
    time: '2 hours ago',
    type: 'welcome',
    icon: 'pets' as const,
    color: '#4A90E2'
  },
  {
    id: '2',
    title: 'Booking Confirmed!',
    message: 'Your appointment at Royal Pet Salon has been successfully booked for Oct 12th at 2:00 PM.',
    time: '5 hours ago',
    type: 'confirmation',
    icon: 'check' as const,
    color: '#7ED321'
  },
  {
    id: '3',
    title: 'Flash Offer: 20% OFF 🎁',
    message: 'Use code PETLOVE20 to get an instant discount on all Spa & Grooming services this weekend.',
    time: 'Yesterday',
    type: 'offer',
    icon: 'offer' as const,
    color: '#F5A623'
  }
];

export default function NotificationScreen({ navigation }: any) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconWrapper}>
        <Icon name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.white} />
      
      {/* Normal Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={DEMO_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="notifications" size={48} color={Theme.colors.border} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  header: { 
    height: 64,
    backgroundColor: Theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F7F8FA',
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  listContent: { padding: 16, gap: 12 },
  notificationCard: { 
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'flex-start'
  },
  iconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  textContainer: { flex: 1, gap: 2 },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1C1E' },
  cardTime: { fontSize: 11, color: '#A0A3A8', fontWeight: '500' },
  cardMessage: { fontSize: 13, color: '#6A6D71', lineHeight: 18, fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { marginTop: 16, color: Theme.colors.textSecondary, fontSize: 15, fontWeight: '600' }
});
