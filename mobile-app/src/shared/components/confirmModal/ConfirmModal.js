import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { createConfirmModalStyles } from "./ConfirmModal.styles";

export default function ConfirmModal({
  visible,
  title,
  message,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  destructive = false
}) {
  const { colors } = useTheme();
  const styles = createConfirmModalStyles(colors);

  const primaryStyle = destructive
  ? styles.modalBtnDanger
  : styles.modalBtnPrimary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {title}
              </Text>

              <Text style={styles.modalMessage}>
                {message}
              </Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalBtnGhost}
                  onPress={onCancel}
                  activeOpacity={0.85}
                >
                  <Text
                    style={styles.modalBtnGhostText}
                  >
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    destructive
                    ? styles.modalBtnDanger
                    : styles.modalBtnPrimary
                  }
                  onPress={onConfirm}
                  activeOpacity={0.85}
                >
                  <Text
                    style={
                      styles.modalBtnPrimaryText
                    }
                  >
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}