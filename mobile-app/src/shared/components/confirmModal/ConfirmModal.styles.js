import { StyleSheet } from "react-native";

export const createConfirmModalStyles = (colors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      paddingHorizontal: 28,
    },

    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 22,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },

    modalMessage: {
      fontSize: 14,
      color: colors.textMuted,
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
      backgroundColor: colors.surfaceMuted,
    },

    modalBtnGhostText: {
      color: colors.textSecondary,
      fontWeight: "700",
      fontSize: 14,
    },

    modalBtnPrimary: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },

    modalBtnPrimaryText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 14,
    },
    modalBtnDanger: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,

      backgroundColor:
        colors.error ||
        "#DC2626",
    },
  });