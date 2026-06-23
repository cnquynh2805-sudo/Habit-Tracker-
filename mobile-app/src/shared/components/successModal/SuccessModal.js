/* eslint-disable i18next/no-literal-string */
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import { createSuccessModalStyles } from "./SuccessModal.styles";

import { useTheme } from "@/providers/ThemeProvider";

export default function SuccessModal({
  visible,
  title = "Success",
  message,
  buttonLabel = "OK",
  onClose,
}) {
  const { colors } = useTheme();
  const styles = createSuccessModalStyles(colors);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback accessibilityRole="button" onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback accessibilityRole="button">
            <View style={styles.modalCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✓</Text>
              </View>

              <Text style={styles.title}>{title}</Text>

              <Text style={styles.message}>{message}</Text>

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.button}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
