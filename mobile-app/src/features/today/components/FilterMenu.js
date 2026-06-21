import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const CATEGORIES = ["All", "Health", "Study", "Work", "Mindfulness", "Other"];
const STATUSES = ["All", "Overdue", "OnTime"];

function Chip({ label, active, onPress, styles }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.filterChipText, active && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function FilterMenu({
  visible,
  onClose,
  category,
  setCategory,
  status,
  setStatus,
  styles,
  t,
}) {
  const statusLabel = (s) => {
    if (s === "All") return t("today.filter.all");
    if (s === "Overdue") return t("today.overdue");
    return t("today.filter.onTime");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback accessibilityRole="button" onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback accessibilityRole="button">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t("today.filter.title")}</Text>

              <Text style={styles.filterGroupLabel}>
                {t("today.filter.category")}
              </Text>
              <View style={styles.filterChipsWrap}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    label={t(`category.${c.toLowerCase()}`)}
                    active={category === c}
                    onPress={() => setCategory(c)}
                    styles={styles}
                  />
                ))}
              </View>

              <Text style={styles.filterGroupLabel}>
                {t("today.filter.status")}
              </Text>
              <View style={styles.filterChipsWrap}>
                {STATUSES.map((s) => (
                  <Chip
                    key={s}
                    label={statusLabel(s)}
                    active={status === s}
                    onPress={() => setStatus(s)}
                    styles={styles}
                  />
                ))}
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                style={styles.filterCloseBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.filterCloseBtnText}>
                  {t("today.filter.done")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
