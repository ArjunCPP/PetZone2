import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Icon, IconName } from './Icon';
import { useAppTheme } from '../ThemeContext';

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: IconName;
  category?: string;
  durationMinutes?: number;
  applicableSpecies?: string[];
  pricingType?: string;
}

interface ServiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  service: Service | null;
  onBook: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  visible,
  onClose,
  service,
  onBook
}) => {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

  if (!service) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.modalContent}>
          {/* Modal Handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.modalIconContainer}>
              <Icon name={service.icon || 'dog'} size={32} color={Theme.colors.primary} />
            </View>
            <View style={styles.modalTitleCol}>
              <Text style={styles.modalTitle}>{service.title}</Text>
              <Text style={styles.modalCategory}>{service.category?.toUpperCase()} PACK</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Icon name="close" size={20} color={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Icon name="clock" size={16} color={Theme.colors.primary} />
                <Text style={styles.modalStatText}>{service.durationMinutes || '--'} mins</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                 <Icon name="pets" size={16} color={Theme.colors.primary} />
                 <Text style={[styles.modalStatText, { flex: 1 }]} numberOfLines={2}>
                  {service.applicableSpecies?.join(', ') || 'All Pets'}
                 </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>About Service</Text>
              <Text style={styles.modalDescription}>{service.description || 'No detailed description available.'}</Text>
            </View>

            <View style={styles.modalPriceCard}>
              <View>
                <Text style={styles.modalPriceLabel}>Fixed Price</Text>
                <Text style={styles.modalPriceValue}>₹{service.price}</Text>
              </View>
              <TouchableOpacity style={styles.modalBookBtn} onPress={onBook}>
                <Text style={styles.modalBookBtnText}>Select & Book</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (Theme: any) => StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { 
    backgroundColor: Theme.colors.white, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingTop: 8,
    maxHeight: '85%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Theme.colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  modalIconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: Theme.colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  modalTitleCol: { flex: 1, marginLeft: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  modalCategory: { fontSize: 10, fontWeight: '700', color: Theme.colors.textSecondary, letterSpacing: 1, marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  
  modalScroll: { paddingHorizontal: 24, paddingBottom: 40 },
  modalStatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.background, padding: 16, borderRadius: 16, marginBottom: 24 },
  modalStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 4 },
  modalStatDivider: { width: 1, height: 24, backgroundColor: Theme.colors.border },
  modalStatText: { fontSize: 13, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily, flexShrink: 1 },

  modalSection: { marginBottom: 24 },
  modalSectionTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.text, marginBottom: 8 },
  modalDescription: { fontSize: 14, color: Theme.colors.textSecondary, lineHeight: 22 },

  modalPriceCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 20, backgroundColor: Theme.colors.primary + '0D', borderRadius: 20,
    borderWidth: 1, borderColor: Theme.colors.primary + '1A'
  },
  modalPriceLabel: { fontSize: 12, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  modalPriceValue: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary, marginTop: 2 },
  modalBookBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  modalBookBtnText: { color: Theme.colors.white, fontSize: 15, fontWeight: '800' },
});
