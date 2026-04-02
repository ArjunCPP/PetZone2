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
    background: '#f6f8f8',
    text: '#1A1A1A',
    textSecondary: '#888888',
    border: '#EBEBEB',
    white: '#FFFFFF',
    surface: '#F7FBFA',
    error: '#FF4D4D',
  },
};

export const DarkTheme = {
  ...baseTheme,
  isDark: true,
  colors: {
    primary: '#2ac0ac',
    secondary: '#f97316',
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2C2C2C',
    white: '#1E1E1E',
    surface: '#1A1A1A',
    error: '#FF6B6B',
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
