import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// 1. IMPORT SCREENS AND NEW NAVIGATORS
import BottomTabNavigator from "./src/navigation/BottomTabNavigator"; // Path to the newly created Tab Navigator file
import { QueryProvider } from "./src/providers/QueryProvider"; // React Query provider
import { ThemeProvider, useTheme } from "./src/providers/ThemeProvider"; // Theme provider
import CreateHabitScreen from "./src/features/habits/screens/CreateHabit/CreateHabitScreen"; // Habit creation/modification screen

// === DÒNG SỬA 1: IMPORT MÀN HÌNH NFC MỚI VÀO ĐÂY ===
import NfcSettingsScreen from "./src/features/nfc/setting/NfcSettingsScreen";
import HistoryScreen from "./src/features/habits/screens/HistoryScreen";

import "./src/shared/i18n"; // Initialize i18n
import { useMascotStore } from "@/features/mascot/store/mascotStore";
import MascotSelectionScreen from "@/features/mascot/screens/MascotSelectionScreen";
import ConfirmModal from "./src/shared/components/ConfirmModal";
import MilestoneModal from "./src/shared/components/MilestoneModal";
import { useAppStore } from "./src/shared/stores/useAppStore";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();
  const globalAlert = useAppStore((state) => state.globalAlert);
  const hideGlobalAlert = useAppStore((state) => state.hideGlobalAlert);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error || "#EF4444",
    },
  };

  const mascotSelected =
    useMascotStore(
      (state) => state.mascotSelected
    );

  const isHydrated =
    useMascotStore(
      (state) => state.isHydrated
    );

  if (!isHydrated) {
    return null;
  }

  return (

    <NavigationContainer theme={navigationTheme}>

      {/* <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator> */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!mascotSelected ? (
          <Stack.Screen
            name="MascotSelection"
            component={
              MascotSelectionScreen
            }
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={
                BottomTabNavigator
              }
            />

            <Stack.Screen
              name="CreateHabit"
              component={
                CreateHabitScreen
              }
              options={{
                animation:
                  "slide_from_bottom",
              }}
            />
          </>
        )}

        {/* === DÒNG SỬA 2: ĐĂNG KÝ ĐỊNH DANH "NfcSettings" TẠI ĐÂY === */}
        <Stack.Screen
          name="NfcSettings"
          component={NfcSettingsScreen}
          options={{
            animation: "slide_from_right", // Hiệu ứng lướt từ phải sang trái giống chuẩn native
          }}
        />

        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            animation: "slide_from_right",
          }}
        />

      </Stack.Navigator>

      <ConfirmModal
        visible={!!globalAlert}
        title={globalAlert?.title || ""}
        message={globalAlert?.message || ""}
        cancelLabel={globalAlert?.cancelLabel}
        confirmLabel={globalAlert?.confirmLabel || "Close"}
        onCancel={globalAlert?.onCancel || hideGlobalAlert}
        onConfirm={() => {
          if (globalAlert?.onConfirm) {
            globalAlert.onConfirm();
          }
          hideGlobalAlert();
        }}
      />
      <MilestoneModal />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </QueryProvider>
  );
}