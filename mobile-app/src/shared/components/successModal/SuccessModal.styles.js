/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const createSuccessModalStyles = (colors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
    },

    modalCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
    },

    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primaryLight || "#E8F5E9",
      marginBottom: 16,
    },

    icon: {
      fontSize: 36,
      fontWeight: "700",
      color: colors.primary,
    },

    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },

    message: {
      textAlign: "center",
      fontSize: 14,
      lineHeight: 22,
      color: colors.textMuted,
      marginBottom: 24,
    },

    button: {
      alignSelf: "stretch",
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },

    buttonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
  });
