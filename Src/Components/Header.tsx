/**
 * Header Component
 * Shared top bar used on the Login screen.
 *
 * Props:
 *   showLogo?: boolean  → shows PawNest logo + wordmark (default: true)
 *   title?: string      → plain text title (used instead of logo)
 *   onBack?: () => void → shows back arrow and calls this on press
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// import { LOGO_ICON } from '../Assets'; // ← uncomment when asset is ready

interface Props {
  showLogo?: boolean;
  title?: string;
  onBack?: () => void;
}

export default function Header({ showLogo = false, title, onBack }: Props) {
  return (
    <View style={styles.container}>

      {/* Back Arrow (optional) */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}

      {/* Logo or Title */}
      {showLogo ? (
        <View style={styles.logoRow}>
          {/* <Image source={LOGO_ICON} style={styles.logoIcon} resizeMode="contain" /> */}
          {/* PLACEHOLDER – replace View below with Image above */}
          <View style={styles.logoIconPlaceholder}>
            <Text style={styles.pawEmoji}>🐾</Text>
          </View>
          <Text style={styles.logoText}>PawNest</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title ?? ''}</Text>
      )}

      {/* Right spacer to keep title centered */}
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  backBtn: { width: 36, alignItems: 'center' },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F26522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawEmoji: { fontSize: 18 },
  logoIcon: { width: 36, height: 36 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
});
