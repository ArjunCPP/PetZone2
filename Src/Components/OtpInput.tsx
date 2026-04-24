import React, { useMemo,  useRef } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useAppTheme } from '../ThemeContext';

interface Props { length: number; value: string[]; onChange: (value: string[]) => void; editable?: boolean; }

export default function OtpInput({ length, value, onChange, editable = true }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newValue = [...value];
    newValue[index] = digit;
    onChange(newValue);
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      const newValue = [...value];
      newValue[index - 1] = '';
      onChange(newValue);
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput 
          key={i} 
          ref={el => { inputs.current[i] = el; }} 
          style={[styles.box, value[i] ? styles.boxFilled : null]} 
          keyboardType="number-pad" 
          textAlign="center" 
          value={value[i]} 
          onChangeText={text => handleChange(text, i)} 
          onKeyPress={e => handleKeyPress(e, i)} 
          editable={editable}
          caretHidden 
          selectTextOnFocus
        />
      ))}
    </View>
  );
}
const getStyles = (Theme: any) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  box: { 
    width: 48, height: 64, borderRadius: Theme.roundness.default, 
    backgroundColor: Theme.colors.white, fontSize: 24, fontWeight: '700', 
    color: Theme.colors.text, borderWidth: 2, borderColor: Theme.colors.border,
    fontFamily: Theme.typography.fontFamily,
  },
  boxFilled: { 
    borderColor: Theme.colors.primary, 
    backgroundColor: Theme.colors.surface,
  },
});
