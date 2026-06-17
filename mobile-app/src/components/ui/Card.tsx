import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";

import { useTheme } from "../../providers/ThemeProvider";

export function Card({ style, children, ...props }: ViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.background }, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
});
