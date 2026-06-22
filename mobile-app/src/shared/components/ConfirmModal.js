/* eslint-disable react-native/no-color-literals */
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useTheme } from "../../providers/ThemeProvider";

// App-styled confirmation dialog (replaces the native Alert).
export default function ConfirmModal({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  styles: customStyles,
}) {
  const { colors } = useTheme();

  // If no custom styles are supplied, build a clean StyleSeed/Toss fallback sheet.
  const styles = customStyles || StyleSheet.create({
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback accessibilityRole="button" onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback accessibilityRole="button">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalMessage}>{message}</Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.modalBtnGhost}
                  onPress={onCancel}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnGhostText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.modalBtnPrimary}
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalBtnPrimaryText}>{confirmLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
