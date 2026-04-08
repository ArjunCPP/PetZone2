import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Icon } from './Icon';
import { useAppTheme } from '../ThemeContext';

interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  isButton?: boolean;
  autoFocus?: boolean;
  onClear?: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({ 
  placeholder = "Search shops, services...",
  value,
  onChangeText,
  onPress,
  isButton = false,
  autoFocus = false,
  onClear
}) => {
  const { theme: Theme } = useAppTheme();

  if (isButton) {
    return (
      <TouchableOpacity 
        style={styles.searchBox} 
        activeOpacity={0.8} 
        onPress={onPress}
      >
        <Icon name="search" size={20} color={Theme.colors.textSecondary} />
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.searchBox}>
      <Icon name="search" size={20} color={Theme.colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={Theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Icon name="close" size={18} color={Theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F5F7FA', // Soft light gray
    height: 52, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1A1C1E', 
    fontWeight: '500',
    paddingVertical: 0
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    color: '#8E9196',
    fontWeight: '500'
  }
});
