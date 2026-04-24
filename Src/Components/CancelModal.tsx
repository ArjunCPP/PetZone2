import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface CancelModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  policyInfo?: string;
  onOpenPolicy: (url: string, title: string) => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = 'Cancel Booking?',
  message = 'Are you sure you want to cancel this booking?',
  policyInfo,
  onOpenPolicy
}) => {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);

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
        <View style={styles.modalContainer}>
          <View style={styles.dragHandle} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.iconContainer}>
              <Icon name="close" size={36} color="#f43f5e" />
            </View>
            
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.messageText}>{message}</Text>
            
            {policyInfo ? (
              <View style={styles.policyBox}>
                <View style={styles.policyBoxHeader}>
                  <Icon name="info" size={16} color="#475569" />
                  <Text style={styles.policyBoxTitle}>Cancellation Policy</Text>
                </View>
                <Text style={styles.policyText}>{policyInfo}</Text>
              </View>
            ) : null}

            <View style={styles.quickLinksSection}>
              <Text style={styles.quickLinksHeader}>Important Policies</Text>
              
              <TouchableOpacity 
                style={styles.linkRow} 
                onPress={() => onOpenPolicy('https://petzone.quantuver-wizards.site/terms', 'Terms of Service')}
              >
                <Icon name="document" size={16} color={Theme.colors.primary} />
                <Text style={styles.linkText}>Terms of Service</Text>
                <Icon name="arrow_forward" size={14} color="#CBD5E1" />
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.linkRow}
                onPress={() => onOpenPolicy('https://petzone.quantuver-wizards.site/privacy', 'Privacy Policy')}
              >
                <Icon name="shield" size={16} color={Theme.colors.primary} />
                <Text style={styles.linkText}>Privacy Policy</Text>
                <Icon name="arrow_forward" size={14} color="#CBD5E1" />
              </TouchableOpacity>

              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.linkRow}
                onPress={() => onOpenPolicy('https://petzone.quantuver-wizards.site/refund', 'Refund Policy')}
              >
                <Icon name="wallet" size={16} color={Theme.colors.primary} />
                <Text style={styles.linkText}>Refund Policy</Text>
                <Icon name="arrow_forward" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                <Text style={styles.confirmBtnText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (Theme: any) => StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end', // Bottom sheet style
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContainer: { 
    width: '100%',
    backgroundColor: Theme.colors.background, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 12,
    maxHeight: '90%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconContainer: { 
    width: 72, height: 72, borderRadius: 36, 
    backgroundColor: '#FFE4E6', // Light rose
    alignItems: 'center', justifyContent: 'center', 
    alignSelf: 'center',
    marginBottom: 16
  },
  titleText: { 
    fontSize: 22, fontWeight: '800', color: Theme.colors.text, 
    textAlign: 'center', marginBottom: 8,
    fontFamily: Theme.typography.fontFamily,
  },
  messageText: { 
    fontSize: 15, color: Theme.colors.textSecondary, 
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
    fontFamily: Theme.typography.fontFamily,
  },
  policyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  policyBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  policyBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  policyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500'
  },
  quickLinksSection: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
  },
  quickLinksHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontFamily,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginLeft: 28,
  },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { 
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.white
  },
  cancelBtnText: { color: Theme.colors.textSecondary, fontSize: 15, fontWeight: '700' },
  confirmBtn: { 
    flex: 1, height: 52, borderRadius: 14, 
    backgroundColor: '#f43f5e',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
