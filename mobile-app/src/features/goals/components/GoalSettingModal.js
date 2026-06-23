/* eslint-disable react-hooks/set-state-in-effect, react-native/no-color-literals, react-native-a11y/no-nested-touchables, react-native-a11y/has-valid-accessibility-descriptors, i18next/no-literal-string */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";

import { useAppStore } from "../../../shared/stores/useAppStore";
import { useGoalMutations } from "../hooks/useGoalMutations";

export default function GoalSettingModal({ visible, onClose, habit, colors }) {
  const { t } = useTranslation();

  // Load mutation hooks
  const { createGoal, updateGoal, isCreating, isUpdating } = useGoalMutations();

  // Local state for form controls
  const [targetType, setTargetType] = useState("Streak"); // "Streak" | "TotalCompletions"
  const [targetValue, setTargetValue] = useState(30);

  // Initialize values when the modal is opened/changed
  useEffect(() => {
    if (visible && habit) {
      if (habit.goal) {
        setTargetType(habit.goal.targetType || "Streak");
        setTargetValue(habit.goal.targetValue || 30);
      } else {
        // Defaults for a new goal
        setTargetType("Streak");
        setTargetValue(30);
      }
    }
  }, [visible, habit]);

  if (!habit) return null;

  const isEditing = !!habit.goal;
  const isLoading = isCreating || isUpdating;

  const handleTextChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (!cleaned) {
      setTargetValue(0);
    } else {
      const parsed = parseInt(cleaned, 10);
      setTargetValue(Math.min(parsed, 9999));
    }
  };

  const saveToBackend = async () => {
    try {
      if (isEditing) {
        await updateGoal({
          habitId: habit.habitId || habit.id,
          goalId: habit.goal.id,
          targetValue,
        });
        useAppStore.getState().showGlobalAlert({
          title: t("common.done"),
          message: t("goals.goalSaved"),
        });
      } else {
        await createGoal({
          habitId: habit.id,
          habitName: habit.name,
          category: habit.category,
          targetType,
          targetValue,
        });
        useAppStore.getState().showGlobalAlert({
          title: t("common.done"),
          message: t("goals.goalSaved"),
        });
      }
      onClose();

      // Trigger milestone check after a new goal is created or updated
      // in case it instantly reaches 80% or 100% based on existing check-ins.
      useAppStore.getState().checkMilestoneForHabit(habit.habitId || habit.id);
    } catch (error) {
      const debugInfo = __DEV__
        ? `\nDetails: ${error?.message || String(error)}`
        : "";
      useAppStore.getState().showGlobalAlert({
        title: t("common.error"),
        message: t("goals.goalSaveFailed") + debugInfo,
      });
    }
  };

  // Save changes
  const handleSave = async () => {
    if (targetValue <= 0) {
      useAppStore.getState().showGlobalAlert({
        title: t("common.error"),
        message: t("goals.invalidTargetValue"),
      });
      return;
    }

    if (targetValue > 30) {
      useAppStore.getState().showGlobalAlert({
        title: "High Target",
        message: `Are you sure you want to set a target of ${targetValue}?`,
        confirmText: "Yes",
        cancelText: "Cancel",
        onConfirm: saveToBackend,
      });
    } else {
      await saveToBackend();
    }
  };

  // Get current progress text for display
  const currentProgress = habit.goal?.currentProgress || 0;
  const progressText =
    targetType === "Streak"
      ? `${currentProgress} ${t("goals.daysInARow")}`
      : `${currentProgress} ${t("goals.timesTotal")}`;

  // Helper styles based on active theme colors
  const activeGreen = colors.primary || "#4CAF50";
  const activeGreenLight = colors.primaryLight || "rgba(76, 175, 80, 0.08)";
  const customStyles = StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.surface || "#FFFFFF",
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: Platform.OS === "ios" ? 36 : 24,
      maxHeight: "85%",
    },
    dragHandle: {
      width: 44,
      height: 5,
      backgroundColor: colors.border || "#E0E0E0",
      borderRadius: 3,
      alignSelf: "center",
      marginTop: 8,
      marginBottom: 20,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    habitName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text || "#333333",
      flexShrink: 1,
    },
    categoryBadge: {
      backgroundColor: colors.secondaryLight || "#E8F5E9",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "600",
      color: activeGreen,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted || "#757575",
      marginTop: 6,
      marginBottom: 24,
    },
    cardsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    typeCard: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.border || "#E0E0E0",
      backgroundColor: colors.surface || "#FFFFFF",
      borderRadius: 20,
      padding: 16,
      alignItems: "flex-start",
    },
    selectedCard: {
      borderColor: activeGreen,
      backgroundColor: activeGreenLight,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#F5F5F5",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    selectedIconWrapper: {
      backgroundColor: activeGreen,
    },
    cardEmoji: {
      fontSize: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text || "#333333",
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 11,
      color: colors.textMuted || "#757575",
      lineHeight: 14,
    },
    targetSection: {
      backgroundColor: colors.background || "#F5F5F7",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      marginBottom: 16,
    },
    targetSectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted || "#757575",
      marginBottom: 14,
    },
    adjustRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    },
    adjustBtnMinus: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: colors.border || "#CCCCCC",
      backgroundColor: colors.surface || "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    adjustBtnPlus: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: activeGreen,
      alignItems: "center",
      justifyContent: "center",
    },
    btnTextMinus: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.textMuted || "#666",
    },
    btnTextPlus: {
      fontSize: 22,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    targetNumberInput: {
      fontSize: 34,
      fontWeight: "700",
      color: colors.text || "#333333",
      minWidth: 100,
      textAlign: "center",
      borderBottomWidth: 2,
      borderBottomColor: activeGreen,
      paddingVertical: 8,
    },
    targetUnitText: {
      fontSize: 12,
      color: colors.textMuted || "#757575",
      marginTop: 4,
    },
    progressText: {
      fontSize: 13,
      color: colors.text || "#333333",
      textAlign: "center",
      marginTop: 4,
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: activeGreen,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: activeGreen,
      fontWeight: "700",
      fontSize: 15,
    },
    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 24,
      backgroundColor: activeGreen,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessible
      accessibilityViewIsModal
    >
      <Pressable style={customStyles.backdrop} onPress={onClose}>
        <Pressable
          style={customStyles.modalContainer}
          onPress={(e) => e.stopPropagation()} // Prevent close when tapping content
        >
          {/* Top handle bar */}
          <View style={customStyles.dragHandle} />

          {/* Habit Header */}
          <View style={customStyles.headerRow}>
            <Text style={customStyles.habitName} numberOfLines={1}>
              {habit.habitName || habit.name}
            </Text>
            <View style={customStyles.categoryBadge}>
              <Text style={customStyles.categoryText}>
                {t(`category.${(habit.category || "").toLowerCase()}`)}
              </Text>
            </View>
          </View>

          <Text style={customStyles.subtitle}>{t("goals.modalSubtitle")}</Text>

          {/* Cards for Target Type selection */}
          <View style={customStyles.cardsRow}>
            {/* Streak card */}
            <TouchableOpacity
              style={[
                customStyles.typeCard,
                targetType === "Streak" && customStyles.selectedCard,
              ]}
              onPress={() => setTargetType("Streak")}
              activeOpacity={0.8}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ checked: targetType === "Streak" }}
              accessibilityLabel={t("goals.streakTarget")}
            >
              <View
                style={[
                  customStyles.iconWrapper,
                  targetType === "Streak" && customStyles.selectedIconWrapper,
                ]}
              >
                <Text style={customStyles.cardEmoji}>🔥</Text>
              </View>
              <Text style={customStyles.cardTitle}>
                {t("goals.streakTarget")}
              </Text>
              <Text style={customStyles.cardDesc}>
                {t("goals.streakTargetDesc")}
              </Text>
            </TouchableOpacity>

            {/* Total Completions card */}
            <TouchableOpacity
              style={[
                customStyles.typeCard,
                targetType === "TotalCompletions" && customStyles.selectedCard,
              ]}
              onPress={() => setTargetType("TotalCompletions")}
              activeOpacity={0.8}
              accessible
              accessibilityRole="radio"
              accessibilityState={{
                checked: targetType === "TotalCompletions",
              }}
              accessibilityLabel={t("goals.totalCompletions")}
            >
              <View
                style={[
                  customStyles.iconWrapper,
                  targetType === "TotalCompletions" &&
                    customStyles.selectedIconWrapper,
                ]}
              >
                <Text style={customStyles.cardEmoji}>✔️</Text>
              </View>
              <Text style={customStyles.cardTitle}>
                {t("goals.totalCompletions")}
              </Text>
              <Text style={customStyles.cardDesc}>
                {t("goals.totalCompletionsDesc")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Target Value adjustment section */}
          <View style={customStyles.targetSection}>
            <Text style={customStyles.targetSectionTitle}>
              {t("goals.targetGoal")}
            </Text>

            <View style={customStyles.adjustRow}>
              <TextInput
                style={customStyles.targetNumberInput}
                value={targetValue === 0 ? "" : String(targetValue)}
                onChangeText={handleTextChange}
                keyboardType="number-pad"
                maxLength={4}
                selectTextOnFocus
              />
            </View>

            <Text style={customStyles.targetUnitText}>
              {targetType === "Streak"
                ? t("goals.daysInARow")
                : t("goals.timesTotal")}
            </Text>
          </View>

          {/* Current progress text */}
          <Text style={customStyles.progressText}>
            {t("goals.currentProgressLabel", { progress: progressText })}
          </Text>

          {/* Actions */}
          <View style={customStyles.buttonRow}>
            {/* Cancel Button */}
            <TouchableOpacity
              style={customStyles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t("common.cancel")}
            >
              <Text style={customStyles.cancelButtonText}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>

            {/* Save/Submit Button */}
            <TouchableOpacity
              style={customStyles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t("goals.saveGoal")}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={customStyles.saveButtonText}>
                  {t("goals.saveGoal")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
