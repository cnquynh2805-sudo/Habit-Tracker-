import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

const lightColors = {
  background: "#F9FBF9",
  surface: "#FFFFFF",
  surfaceMuted: "#EAEAEA",
  primary: "#2D4A3E",
  onPrimary: "#FFFFFF",
  primaryLight: "#A8D5BA",
  primaryMedium: "#8FDAB5",
  successLight: "#C2E7D9",
  successDark: "#1E4631",
  warningLight: "#FDE8BB",
  warningDark: "#B76E00",
  text: "#1C1C1C",
  textSecondary: "#334155",
  textMuted: "#5F6368",
  textDisabled: "#9E9E9E",
  border: "#EAEAEA",
  priorityLowBg: "#EFF6FF",
  priorityLowText: "#1E40AF",
  priorityLowStripe: "#3B82F6",
  priorityMediumBg: "#FEFCE8",
  priorityMediumText: "#854D0E",
  priorityMediumStripe: "#F59E0B",
  priorityHighBg: "#E6F4EA",
  priorityHighText: "#137333",
  priorityHighStripe: "#137333",
  badgeStudyBg: "#D6E6FE",
  badgeStudyText: "#3B82F6",
  badgeDefaultBg: "#D1E7DD",
  badgeDefaultText: "#2D4A3E",
};

const darkColors = {
  background: "#0F1115",
  surface: "#1A1D24",
  surfaceMuted: "#252A33",
  primary: "#34D399",
  onPrimary: "#022C22",
  primaryLight: "#064E3B",
  primaryMedium: "#059669",
  successLight: "#064E3B",
  successDark: "#34D399",
  warningLight: "#451A03",
  warningDark: "#FDE047",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textDisabled: "#64748B",
  border: "#475569",
  priorityLowBg: "#1E3A8A",
  priorityLowText: "#BFDBFE",
  priorityLowStripe: "#3B82F6",
  priorityMediumBg: "#713F12",
  priorityMediumText: "#FEF08A",
  priorityMediumStripe: "#F59E0B",
  priorityHighBg: "#064E3B",
  priorityHighText: "#A7F3D0",
  priorityHighStripe: "#10B981",
  badgeStudyBg: "#1E3A8A",
  badgeStudyText: "#93C5FD",
  badgeDefaultBg: "#064E3B",
  badgeDefaultText: "#6EE7B7",
};

export type ThemeMode = "Light" | "Dark" | "System";

type ThemeContextType = {
  isDark: boolean;
  colors: typeof lightColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("System");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("theme_mode").then((savedMode) => {
      if (
        savedMode === "Light" ||
        savedMode === "Dark" ||
        savedMode === "System"
      ) {
        setThemeModeState(savedMode as ThemeMode);
      }
      setIsReady(true);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem("theme_mode", mode);
  };

  const isDark =
    themeMode === "System"
      ? systemColorScheme === "dark"
      : themeMode === "Dark";
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
