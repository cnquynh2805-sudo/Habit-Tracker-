import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: '#F9FBF9',
  surface: '#FFFFFF',
  surfaceMuted: '#EAEAEA',
  primary: '#2D4A3E',
  onPrimary: '#FFFFFF',
  primaryLight: '#A8D5BA',
  primaryMedium: '#8FDAB5',
  successLight: '#C2E7D9',
  successDark: '#1E4631',
  warningLight: '#FDE8BB',
  warningDark: '#B76E00',
  text: '#1C1C1C',
  textSecondary: '#334155',
  textMuted: '#5F6368',
  textDisabled: '#9E9E9E',
  border: '#EAEAEA',
};

const darkColors = {
  background: '#121413',
  surface: '#1E211F',
  surfaceMuted: '#2D312E',
  primary: '#A8D5BA',
  onPrimary: '#121413',
  primaryLight: '#1E332B',
  primaryMedium: '#2D4A3E',
  successLight: '#163324',
  successDark: '#8FDAB5',
  warningLight: '#4A3400',
  warningDark: '#FDE8BB',
  text: '#E8EBE9',
  textSecondary: '#A0AAB2',
  textMuted: '#7D858A',
  textDisabled: '#565E62',
  border: '#2D312E',
};

export type ThemeMode = 'Light' | 'Dark' | 'System';

type ThemeContextType = {
  isDark: boolean;
  colors: typeof lightColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('System');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme_mode').then((savedMode) => {
      if (savedMode === 'Light' || savedMode === 'Dark' || savedMode === 'System') {
        setThemeModeState(savedMode as ThemeMode);
      }
      setIsReady(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('theme_mode', mode);
  };

  const isDark = themeMode === 'System' ? systemColorScheme === 'dark' : themeMode === 'Dark';
  const colors = isDark ? darkColors : lightColors;

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
