import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useTheme } from "../../providers/ThemeProvider";
import { getStyles } from "./ConfirmModal.styles";

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
  const defaultStyles = getStyles(colors);
  const styles = customStyles || defaultStyles;

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
                {cancelLabel ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.modalBtnGhost}
                    onPress={onCancel}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalBtnGhostText}>{cancelLabel}</Text>
                  </TouchableOpacity>
                ) : null}
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

