import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStyles } from "./CreateHabitScreen.styles";
import { useTheme } from "../../providers/ThemeProvider";

export default function CreateHabitScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const habitId = route?.params?.habitId;
  const isEditMode = !!habitId; // Currently in view/edit flow for an existing habit

  // Standard Editable Logic: If creating new, open immediately; if viewing existing, lock initially (false)
  const [isEditable, setIsEditable] = useState(!isEditMode);
  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState("Mindfulness");
  const [frequency, setFrequency] = useState("Daily");
  const [currentStatus, setCurrentStatus] = useState("Active"); // Capitalized to match OpenAPI specification
  const [daysOfWeekList, setDaysOfWeekList] = useState([]); // Map fields: custom_days -> daysOfWeek
  const [targetPerDay, setTargetPerDay] = useState("1");
  const [priority, setPriority] = useState("Medium");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Backup state to restore original data if the user presses "Cancel" while editing
  const [backupData, setBackupData] = useState(null);

  const daysOfWeekOptions = [
    { id: "Mon", label: "M" },
    { id: "Tue", label: "T" },
    { id: "Wed", label: "W" },
    { id: "Thu", label: "T" },
    { id: "Fri", label: "F" },
    { id: "Sat", label: "S" },
    { id: "Sun", label: "S" },
  ];

  const loadHabitForEditing = async () => {
    try {
      const existingDataJson = await AsyncStorage.getItem("@habits_list");
      if (existingDataJson) {
        const habitsList = JSON.parse(existingDataJson);
        const targetHabit = habitsList.find((h) => h.id === habitId);
        if (targetHabit) {
          const rawPriority = targetHabit.priority || "Medium";
          const formattedPriority =
            rawPriority.charAt(0).toUpperCase() +
            rawPriority.slice(1).toLowerCase();

          const rawFrequency = targetHabit.frequency || "Daily";
          const formattedFrequency =
            rawFrequency.charAt(0).toUpperCase() +
            rawFrequency.slice(1).toLowerCase();

          const rawStatus = targetHabit.status || "Active";
          const formattedStatus =
            rawStatus.charAt(0).toUpperCase() +
            rawStatus.slice(1).toLowerCase();

          setHabitName(targetHabit.name);
          setCategory(targetHabit.category || "Mindfulness");
          setFrequency(formattedFrequency);
          setDaysOfWeekList(targetHabit.daysOfWeek || []);
          setTargetPerDay((targetHabit.targetPerDay || 1).toString());
          setCurrentStatus(formattedStatus);
          setPriority(formattedPriority);

          setBackupData({
            name: targetHabit.name,
            category: targetHabit.category || "Mindfulness",
            frequency: formattedFrequency,
            daysOfWeek: targetHabit.daysOfWeek || [],
            targetPerDay: (targetHabit.targetPerDay || 1).toString(),
            status: formattedStatus,
            priority: formattedPriority,
          });
        }
      }
    } catch (e) {
      console.log("Error loading habit details:", e);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      loadHabitForEditing(); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setCurrentStatus("Active");
    }
  }, [isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // LEFT HEADER BUTTON ACTION (Cancel or Delete)
  const handleLeftHeaderPress = () => {
    if (!isEditMode) {
      if (navigation) navigation.goBack();
    } else {
      if (isEditable) {
        if (backupData) {
          setHabitName(backupData.name);
          setCategory(backupData.category);
          setFrequency(backupData.frequency);
          setDaysOfWeekList(backupData.daysOfWeek);
          setTargetPerDay(backupData.targetPerDay);
          setCurrentStatus(backupData.status);
          setPriority(backupData.priority);
        }
        setIsEditable(false);
      } else {
        handleDeleteAction();
      }
    }
  };

  // RIGHT HEADER BUTTON ACTION (Save or Edit)
  const handleRightHeaderPress = () => {
    if (isEditable) {
      handleSaveAction();
    } else {
      setIsEditable(true);
    }
  };

  const handleFrequencyPress = (type) => {
    setFrequency(type);
    if (type === "Custom" && isEditable) {
      setIsModalVisible(true);
    }
  };

  const handleToggleDay = (dayId) => {
    if (daysOfWeekList.includes(dayId)) {
      setDaysOfWeekList(daysOfWeekList.filter((d) => d !== dayId));
    } else {
      setDaysOfWeekList([...daysOfWeekList, dayId]);
    }
  };

  const handleModalCloseRequest = () => {
    if (daysOfWeekList.length === 0) {
      setFrequency("Daily");
    }
    setIsModalVisible(false);
  };

  const handleModalDonePress = () => {
    if (daysOfWeekList.length === 0) {
      Alert.alert(
        "Required",
        "Please select at least one day for your custom schedule.",
        [{ text: "OK" }],
      );
      return;
    }
    setIsModalVisible(false);
  };

  const incrementTarget = () => {
    if (!isEditable) return;
    const current = parseInt(targetPerDay, 10) || 0;
    setTargetPerDay((current + 1).toString());
  };

  const decrementTarget = () => {
    if (!isEditable) return;
    const current = parseInt(targetPerDay, 10) || 0;
    if (current > 1) setTargetPerDay((current - 1).toString());
    else setTargetPerDay("1");
  };

  const handleSaveAction = async () => {
    const cleanedName = habitName.trim();
    if (!cleanedName) {
      Alert.alert("Error", "Please enter a habit name.");
      return;
    }

    if (frequency === "Custom" && daysOfWeekList.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one day for Custom frequency.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const existingHabitsJson = await AsyncStorage.getItem("@habits_list");
      let currentHabits = existingHabitsJson
        ? JSON.parse(existingHabitsJson)
        : [];

      const isNameDuplicate = currentHabits.some((habit) => {
        const isSameName =
          habit.name.trim().toLowerCase() === cleanedName.toLowerCase();
        if (isEditMode) {
          return isSameName && habit.id !== habitId;
        }
        return isSameName;
      });

      if (isNameDuplicate) {
        Alert.alert(
          "Duplicate Name",
          "A habit with this name already exists. Please choose a unique name!",
        );
        setIsLoading(false);
        return;
      }

      // Ensure standard Active state behavior or retain strict localized derived structures
      const finalStatus = isEditMode ? currentStatus : "Active";
      const canCheckIn = finalStatus === "Active";

      if (isEditMode) {
        currentHabits = currentHabits.map((habit) => {
          if (habit.id === habitId) {
            return {
              ...habit,
              name: cleanedName,
              category,
              frequency,
              daysOfWeek: frequency === "Custom" ? daysOfWeekList : null,
              targetPerDay: parseInt(targetPerDay, 10) || 1,
              priority,
              status: finalStatus,
              canCheckin: canCheckIn,
              isSynced: false,
            };
          }
          return habit;
        });

        setBackupData({
          name: cleanedName,
          category,
          frequency,
          daysOfWeek: frequency === "Custom" ? daysOfWeekList : [],
          targetPerDay,
          status: finalStatus,
          priority,
        });

        await AsyncStorage.setItem(
          "@habits_list",
          JSON.stringify(currentHabits),
        );
        setIsEditable(false);
      } else {
        const newHabit = {
          id: Date.now().toString(),
          name: cleanedName,
          category,
          frequency,
          daysOfWeek: frequency === "Custom" ? daysOfWeekList : null,
          targetPerDay: parseInt(targetPerDay, 10) || 1,
          priority,
          status: "Active",
          canCheckin: true,
          isSynced: false,
          createdAt: new Date().toISOString(), // Structured matching standard specification
        };
        currentHabits.unshift(newHabit);
        await AsyncStorage.setItem(
          "@habits_list",
          JSON.stringify(currentHabits),
        );
        if (navigation) navigation.goBack();
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to save habit.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAction = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const existingHabitsJson =
                await AsyncStorage.getItem("@habits_list");
              if (existingHabitsJson) {
                const currentHabits = JSON.parse(existingHabitsJson);
                const updatedList = currentHabits.filter(
                  (h) => h.id !== habitId,
                );
                await AsyncStorage.setItem(
                  "@habits_list",
                  JSON.stringify(updatedList),
                );
                if (navigation) navigation.goBack();
              }
            } catch (e) {
              console.log("Error deleting habit:", e);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.topHeaderContainer}>
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Interactive element"
          onPress={handleLeftHeaderPress}
          disabled={isLoading}
        >
          <Text
            style={
              !isEditMode || isEditable
                ? styles.headerCancelText
                : styles.headerDeleteText
            }
          >
            {!isEditMode ? "Cancel" : isEditable ? "Cancel" : "Delete"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitleText}>
          {!isEditMode
            ? "New Habit"
            : isEditable
              ? "Edit Habit"
              : "Habit Detail"}
        </Text>

        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Interactive element"
          style={styles.headerSaveCapsuleButton}
          onPress={handleRightHeaderPress}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Text style={styles.headerSaveCapsuleText}>
              {isEditable ? "Save" : "Edit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot Speech Bubble */}
        <View style={styles.mascotSpeechSection}>
          <View style={styles.mascotRoundAvatar}>
            <View style={styles.mascotMiniFace}>
              <View style={styles.mascotMiniEyesRow}>
                <View style={styles.mascotMiniEye} />
                <View style={styles.mascotMiniEye} />
              </View>
              <View style={styles.mascotMiniSmile} />
            </View>
          </View>
          <View style={styles.mascotBubbleCloud}>
            <Text style={styles.mascotBubbleText}>
              {!isEditMode
                ? "Starting a new habit is the first step towards a better you! What shall we tackle today?"
                : isEditable
                  ? "Tweak your progress metrics here to stay on track!"
                  : "Review your progress metrics below."}
            </Text>
          </View>
        </View>

        {/* Habit Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabelText}>
            {t("createHabit.habitNameLabel")}
          </Text>
          <View
            style={[
              styles.pencilInputWrapper,
              !isEditable && styles.inputFieldDisabled,
            ]}
          >
            <TextInput
              accessibilityLabel="Text input field"
              style={styles.mainInputField}
              placeholder={t("createHabit.habitNamePlaceholder")}
              placeholderTextColor={colors.textDisabled}
              value={habitName}
              onChangeText={setHabitName}
              editable={isEditable && !isLoading}
              multiline
              textAlignVertical="center"
            />
          </View>
        </View>

        {/* Category Chips */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabelText}>
            {t("createHabit.categoryLabel")}
          </Text>
          <View style={styles.categoryChipsMatrix}>
            {[
              { id: "Health", label: "Health 💚" },
              { id: "Study", label: "Study 📘" },
              { id: "Work", label: "Work 💼" },
              { id: "Mindfulness", label: "Mindfulness 🧘" },
              { id: "Other", label: "Other ⭐" },
            ].map((chip) => {
              const isSelected = category === chip.id;
              return (
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Interactive element"
                  key={chip.id}
                  style={[
                    styles.figmaCategoryChip,
                    isSelected && styles.figmaCategoryChipActive,
                  ]}
                  onPress={() => setCategory(chip.id)}
                  disabled={!isEditable || isLoading}
                >
                  <Text
                    style={[
                      styles.figmaCategoryChipText,
                      isSelected && styles.figmaCategoryChipTextActive,
                    ]}
                  >
                    {t("category." + chip.id.toLowerCase() + "Emoji", {
                      defaultValue: chip.label,
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Frequency Row */}
        <View style={styles.formInlineRow}>
          <Text style={styles.formLabelText}>
            {t("createHabit.frequencyLabel")}
          </Text>

          <View style={styles.capsuleToggleContainer}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={[
                styles.capsuleToggleButton,
                frequency === "Daily" && styles.capsuleToggleButtonActive,
              ]}
              onPress={() => handleFrequencyPress("Daily")}
              disabled={!isEditable || isLoading}
            >
              <Text
                style={[
                  styles.capsuleToggleText,
                  frequency === "Daily" && styles.capsuleToggleTextActive,
                ]}
              >
                {t("frequency.daily", { defaultValue: "Daily" })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={[
                styles.capsuleToggleButton,
                frequency === "Custom" && styles.capsuleToggleButtonActive,
              ]}
              onPress={() => handleFrequencyPress("Custom")}
              disabled={!isEditable || isLoading}
            >
              <Text
                style={[
                  styles.capsuleToggleText,
                  frequency === "Custom" && styles.capsuleToggleTextActive,
                ]}
              >
                {t("frequency.customWithCount", {
                  count: daysOfWeekList.length,
                  defaultValue: `Custom (${daysOfWeekList.length})`,
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target per Day Counter */}
        <View style={styles.formInlineRow}>
          <View style={styles.labelSubGroup}>
            <Text style={styles.formLabelText}>
              {t("createHabit.targetLabel")}
            </Text>
            <Text style={styles.subHintTextText}>
              {t("createHabit.targetUnit")}
            </Text>
          </View>
          <View style={styles.figmaCounterPillContainer}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={styles.counterCircleBtn}
              onPress={decrementTarget}
              disabled={!isEditable || isLoading}
            >
              <Text style={styles.counterBtnSymbol}>−</Text>
            </TouchableOpacity>

            <TextInput
              accessibilityLabel="Text input field"
              style={styles.counterValueInputNode}
              value={targetPerDay}
              onChangeText={(txt) =>
                setTargetPerDay(txt.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              editable={isEditable && !isLoading}
            />

            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={styles.counterCircleBtn}
              onPress={incrementTarget}
              disabled={!isEditable || isLoading}
            >
              <Text style={styles.counterBtnSymbol}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Priority Grid Buttons */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabelText}>
            {t("createHabit.priorityLabel")}
          </Text>
          <View style={styles.priorityFlexibleRow}>
            {[
              {
                id: "Low",
                label: "Low",
                activeStyle: styles.lowPriorityActiveBorder,
              },
              {
                id: "Medium",
                label: "Medium",
                activeStyle: styles.mediumPriorityActiveBorder,
              },
              {
                id: "High",
                label: "High",
                activeStyle: styles.highPriorityActiveBorder,
              },
            ].map((p) => {
              const isSelected = priority === p.id;
              return (
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Interactive element"
                  key={p.id}
                  style={[
                    styles.priorityBlockButton,
                    isSelected
                      ? p.activeStyle
                      : styles.priorityBlockButtonInactive,
                  ]}
                  onPress={() => setPriority(p.id)}
                  disabled={!isEditable || isLoading}
                >
                  <Text
                    style={[
                      styles.priorityBlockText,
                      isSelected
                        ? styles.priorityBlockTextActive
                        : styles.priorityBlockTextInactive,
                    ]}
                  >
                    {t("priority." + p.id.toLowerCase(), {
                      defaultValue: p.label,
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Minimalist Green Footer Banner */}
        <View style={styles.bottomLightGreenBanner}>
          <View style={styles.proTipFloatingBadge}>
            <Text style={styles.proTipTextContent}>
              {t("createHabit.proTip")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CUSTOM FREQUENCY DAY SELECTION MODAL POPUP */}
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={handleModalCloseRequest}
      >
        <View style={styles.modalOverlayBackground}>
          <View style={styles.modalContentCardBox}>
            <Text style={styles.modalHeaderTitle}>
              {t("createHabit.modalCustomTitle")}
            </Text>
            <Text style={styles.modalSubDescription}>
              {t("createHabit.modalCustomDesc")}
            </Text>

            <View style={styles.modalDaysHorizontalRow}>
              {daysOfWeekOptions.map((day) => {
                const isSelected = daysOfWeekList.includes(day.id);
                return (
                  <TouchableOpacity
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Interactive element"
                    key={day.id}
                    style={[
                      styles.ratioDayCircleButton,
                      isSelected && styles.ratioDayCircleButtonActive,
                    ]}
                    onPress={() => handleToggleDay(day.id)}
                  >
                    <Text
                      style={[
                        styles.ratioDayCircleText,
                        isSelected && styles.ratioDayCircleTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={styles.modalDoneActionButton}
              onPress={handleModalDonePress}
            >
              <Text style={styles.modalDoneButtonText}>{t("common.done")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
