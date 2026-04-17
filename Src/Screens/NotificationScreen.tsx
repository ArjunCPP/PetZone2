import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import { notificationService, AppNotification } from '../Services/NotificationService';
import { ConfirmModal } from '../Components/ConfirmModal';

export default function NotificationScreen({ navigation }: any) {
  const { theme: Theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      // Mark all as read when user opens this screen — clears the home badge
      notificationService.markAllRead();

      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.replace('MainTabs');
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [navigation, loadNotifications])
  );

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    setIsClearModalVisible(true);
  };

  const confirmClearAll = async () => {
    await notificationService.clearNotifications();
    setNotifications([]);
    setIsClearModalVisible(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={styles.notificationCard}>
      <View style={styles.iconWrapper}>
        <Icon
          name={item.icon}
          size={22}
          color={item.color || Theme.colors.primary}
        />
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Theme.colors.white}
      />

      {/* Header */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => (item.id || 'notif') + '-' + index}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Icon name="notifications" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>
          </View>
        }
      />

      {/* Custom Clear All confirmation modal */}
      <ConfirmModal
        visible={isClearModalVisible}
        onClose={() => setIsClearModalVisible(false)}
        onConfirm={confirmClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to remove all notifications? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        type="danger"
      />
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.white },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.white
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary + '1A'
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily,
  },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '40',
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
  cardTitle: { fontSize: 15, fontWeight: '700', color: Theme.colors.text },
  cardTime: { fontSize: 11, color: Theme.colors.textSecondary, fontWeight: '500' },
  cardMessage: { fontSize: 13, color: Theme.colors.textSecondary, lineHeight: 18, fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: { color: Theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtext: { color: Theme.colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }
});
