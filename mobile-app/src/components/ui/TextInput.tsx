import React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../providers/ThemeProvider";

export interface TextInputProps extends RNTextInputProps {
  // Add custom props if needed
}

export function TextInput({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();

  return (
    <RNTextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.background,
          color: colors.primaryText,
          borderColor: colors.secondary,
        },
        style,
      ]}
      placeholderTextColor={colors.secondary}
      accessible
      accessibilityRole="none"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
});
