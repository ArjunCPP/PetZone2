import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Icon } from '../Icon';
import { useAppTheme } from '../../ThemeContext';

interface ContactSectionProps {
  currentShop: any;
  styles: any;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  currentShop,
  styles
}) => {
  const { theme: Theme } = useAppTheme();

  if (!currentShop?.phone && !currentShop?.email && !currentShop?.ownerName) return null;

  return (
    <View style={styles.sectionContainer2}>
      <Text style={styles.sectionTitle}>Contact & Info</Text>
      <View style={styles.contactCard}>
        {currentShop?.ownerName && (
          <View style={styles.contactRow}>
            <View style={styles.contactIconCircle}>
              <Icon name="profile" size={16} color={Theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Owner</Text>
              <Text style={styles.contactValue} numberOfLines={1}>{currentShop.ownerName}</Text>
            </View>
          </View>
        )}
        {currentShop?.phone && (
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${currentShop.phone}`)}>
            <View style={styles.contactIconCircle}>
              <Text style={{ fontSize: 16 }}>📞</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={[styles.contactValue, { color: Theme.colors.primary }]} numberOfLines={1}>{currentShop.phone}</Text>
            </View>
          </TouchableOpacity>
        )}
        {currentShop?.email && (
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${currentShop.email}`)}>
            <View style={styles.contactIconCircle}>
              <Text style={{ fontSize: 16 }}>✉️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={[styles.contactValue, { color: Theme.colors.primary }]} numberOfLines={1}>{currentShop.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
