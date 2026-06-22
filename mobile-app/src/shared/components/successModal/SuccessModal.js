import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { createSuccessModalStyles } from "./SuccessModal.styles";

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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✓</Text>
              </View>

              <Text style={styles.title}>
                {title}
              </Text>

              <Text style={styles.message}>
                {message}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}