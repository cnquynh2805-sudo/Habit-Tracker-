/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const getStyles = (colors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    modalCard: {
      backgroundColor: colors.surface || "#FFFFFF",
      borderRadius: 20,
      padding: 22,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text || "#333333",
      marginBottom: 4,
    },
    modalMessage: {
      fontSize: 14,
      color: colors.textMuted || "#666666",
      lineHeight: 20,
      marginBottom: 18,
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    modalBtnGhost: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted || "#F5F5F5",
    },
    modalBtnGhostText: {
      color: colors.textSecondary || "#666666",
      fontWeight: "700",
      fontSize: 14,
    },
    modalBtnPrimary: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.primary || "#4CAF50",
    },
    modalBtnPrimaryText: {
      color: colors.onPrimary || "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
    },
  });
