import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'info';
  policyInfo?: string;
  onOpenPolicy?: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Yes, Cancel',
  cancelLabel = 'Go Back',
  type = 'danger',
  policyInfo,
  onOpenPolicy,
  loading = false
}) => {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme, type), [Theme, type]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Icon 
              name={type === 'danger' ? 'close' : 'bookings'} 
              size={32} 
              color={type === 'danger' ? '#f43f5e' : Theme.colors.primary} 
            />
          </View>
          
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.messageText}>{message}</Text>
          
          {policyInfo && (
            <View style={styles.policyContainer}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Icon name="tag" size={14} color="#666" />
                  <Text style={styles.policyText}>{policyInfo}</Text>
                </View>
                {onOpenPolicy && (
                  <TouchableOpacity onPress={onOpenPolicy} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 12, color: Theme.colors.primary, fontWeight: '700', textDecorationLine: 'underline' }}>Read Full Policy</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (Theme: any, type: 'danger' | 'info') => StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContainer: { 
    width: '85%',
    backgroundColor: Theme.colors.card, 
    borderRadius: 20, 
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: Theme.isDark ? 0.4 : 0.1, shadowRadius: 10, elevation: 10
  },
  iconContainer: { 
    width: 60, height: 60, borderRadius: 30, 
    backgroundColor: type === 'danger' ? (Theme.isDark ? '#f43f5e20' : '#FFF5F5') : (Theme.colors.primary + '1A'),
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  titleText: { 
    fontSize: 18, fontWeight: '700', color: Theme.colors.text, 
    textAlign: 'center', marginBottom: 8 
  },
  messageText: { 
    fontSize: 14, color: Theme.colors.textSecondary, 
    textAlign: 'center', lineHeight: 20, marginBottom: 20 
  },
  policyContainer: {
    width: '100%',
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500'
  },
  buttonRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { 
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.card
  },
  cancelBtnText: { color: Theme.colors.textSecondary, fontSize: 14, fontWeight: '600' },
  confirmBtn: { 
    flex: 1, height: 48, borderRadius: 12, 
    backgroundColor: type === 'danger' ? '#f43f5e' : '#3b82f6',
    alignItems: 'center', justifyContent: 'center'
  },
  confirmBtnText: { color: Theme.colors.primaryText, fontSize: 14, fontWeight: '700' },
});
