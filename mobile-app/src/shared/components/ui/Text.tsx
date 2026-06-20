import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../../providers/ThemeProvider";

export interface TextProps extends RNTextProps {
  variant?: "body" | "title" | "caption";
}

export function Text({
  style,
  variant = "body",
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        { color: colors.primaryText },
        style,
      ]}
      // Enforce accessibility scaling by default
      allowFontScaling
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base font styles here
  },
  body: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 12,
  },
});
