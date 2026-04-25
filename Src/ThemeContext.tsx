import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Original Theme structure
const baseTheme = {
  typography: { fontFamily: 'PlusJakartaSans-Regular' },
  roundness: { small: 8, default: 12, large: 20, full: 999 },
};

export const LightTheme = {
  ...baseTheme,
  isDark: false,
  colors: {
    primary: '#2ac0ac',
    secondary: '#f97316',
    background: '#F6F8F8',
    surface: '#F7FBFA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#EBEBEB',
    error: '#FF4D4D',
    primaryText: '#FFFFFF',
    white: '#FFFFFF',
    black: '#000000',
  },
};

export const DarkTheme = {
  ...baseTheme,
  isDark: true,
  colors: {
    primary: '#2ac0ac',
    secondary: '#f97316',
    background: '#0D0D0D',
    surface: '#121212',
    card: '#1A1A1A',
    text: '#F5F5F5',
    textSecondary: '#A0A0A0',
    border: '#262626',
    error: '#FF6B6B',
    primaryText: '#FFFFFF',
    white: '#1A1A1A', // Legacy support
    black: '#F5F5F5', // Legacy support
  },
};

export type ThemeType = typeof LightTheme;

interface ThemeContextProps {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: (isDark?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: LightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('isDarkMode').then(val => {
      if (val === 'true') setIsDarkMode(true);
    });
  }, []);

  const toggleTheme = (force?: boolean) => {
    setIsDarkMode(prev => {
      const newVal = force !== undefined ? force : !prev;
      AsyncStorage.setItem('isDarkMode', String(newVal));
      return newVal;
    });
  };

  const theme = isDarkMode ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
