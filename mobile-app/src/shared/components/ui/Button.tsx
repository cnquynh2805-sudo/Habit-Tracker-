import React from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

import { Text } from "./Text";
import { useTheme } from "../../../providers/ThemeProvider";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary";
}

export function Button({
  title,
  variant = "primary",
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.button,
        { backgroundColor: colors[variant] },
        typeof style === "object" ? style : {},
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: colors.onPrimary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%", // Adaptive width
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
});
