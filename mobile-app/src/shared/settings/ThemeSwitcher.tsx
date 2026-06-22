import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Palette } from "lucide-react-native";

type ThemeSwitcherProps = {
  themeMode: "Light" | "Dark" | "System";
  setThemeMode: (theme: "Light" | "Dark" | "System") => void;
  colors: any;
  t?: (key: string) => string;
  onChange?: (theme: string) => void;
};

export default function ThemeSwitcher({
  themeMode,
  setThemeMode,
  colors,
  t,
  onChange,
}: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);

  const themes: ThemeSwitcherProps["themeMode"][] = ["Light", "Dark", "System"];

  const handleSelect = (theme: ThemeSwitcherProps["themeMode"]) => {
    setThemeMode(theme);
    setOpen(false);
    onChange?.(theme);
  };

  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity onPress={() => setOpen(!open)}>
        <Palette color={colors.primary} size={24} />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            position: "absolute",
            top: 32,
            right: 0,
            minWidth: 48 + 72,
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: colors.border,
            zIndex: 10000,
          }}
        >
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme}
              onPress={() => handleSelect(theme)}
              style={{ paddingVertical: 10, paddingHorizontal: 14 }}
            >
              <Text
                style={{
                  color:
                    themeMode === theme ? colors.primary : colors.textSecondary,
                  fontSize: 14,
                  fontWeight: themeMode === theme ? "700" : "400",
                }}
              >
                {t?.(`theme.${theme.toLowerCase()}`) ?? theme}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
