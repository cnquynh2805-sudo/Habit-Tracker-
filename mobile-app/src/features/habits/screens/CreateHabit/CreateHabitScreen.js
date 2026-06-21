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
import { useTheme } from "../../../../providers/ThemeProvider";
import * as habitsManager from "./services/habitsManager";

export default function CreateHabitScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const habitId = route?.params?.habitId;
  const isEditMode = !!habitId;

  const [isEditable, setIsEditable] = useState(!isEditMode);
  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState("Mindfulness");
  const [frequency, setFrequency] = useState("Daily");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [daysOfWeekList, setDaysOfWeekList] = useState([]);
  const [targetPerDay, setTargetPerDay] = useState("1");
  const [priority, setPriority] = useState("Medium");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
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

  // ===== LOAD HABIT FOR EDIT =====
  const loadHabitForEditing = async () => {
    try {
      const targetHabit = await habitsManager.getHabitById(habitId);
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

        // Hiển thị trạng thái đồng bộ chính xác theo SyncStatus
        if (targetHabit.syncStatus === "synced") {
          setSyncStatus("✅ Synced");
        } else if (targetHabit.syncStatus === "pending") {
          setSyncStatus("⏳ Pending sync...");
        } else if (targetHabit.syncStatus === "failed") {
          setSyncStatus("❌ Sync failed");
        } else {
          setSyncStatus("");
        }

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
    } catch (e) {
      console.log("Error loading habit details:", e);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      loadHabitForEditing();
    } else {
      setCurrentStatus("Active");
      setSyncStatus("");
    }
  }, [isEditMode]);

  // ===== HEADER HANDLERS =====
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

  const handleRightHeaderPress = () => {
    if (isEditable) {
      handleSaveAction();
    } else {
      setIsEditable(true);
    }
  };

  // ===== FORM HANDLERS =====
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

  // ===== SAVE ACTION =====
  const handleSaveAction = async () => {
    console.log("👉 [UI CLICK]: Người dùng bấm nút SAVE/EDIT trên Header!");
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
    setSyncStatus("💾 Saving...");

    try {
      const allHabits = await habitsManager.getHabits();
      const isNameDuplicate = allHabits.some((habit) => {
        const isSameName =
          habit.name.trim().toLowerCase() === cleanedName.toLowerCase();
        if (isEditMode) {
          return isSameName && String(habit.id) !== String(habitId);
        }
        return isSameName;
      });

      if (isNameDuplicate) {
        Alert.alert(
          "Duplicate Name",
          "A habit with this name already exists. Please choose a unique name!",
        );
        setIsLoading(false);
        setSyncStatus("");
        return;
      }

      const targetPerDayInt = parseInt(targetPerDay, 10) || 1;
      const finalStatus = isEditMode ? currentStatus : "Active";

      const payload = {
        name: cleanedName,
        category,
        frequency,
        daysOfWeek: frequency === "Custom" ? daysOfWeekList : null,
        targetPerDay: targetPerDayInt,
        priority,
        status: finalStatus,
      };

      if (isEditMode) {
        // ===== UPDATE HABIT =====
        console.log(`👉 [UI ACTION]: Chế độ SỬA - Chuẩn bị gọi habitsManager.updateHabit cho ID: ${habitId}`);
        const updatedResult = await habitsManager.updateHabit(habitId, payload);

        setBackupData({
          name: cleanedName,
          category,
          frequency,
          daysOfWeek: frequency === "Custom" ? daysOfWeekList : [],
          targetPerDay: targetPerDay,
          status: finalStatus,
          priority,
        });
        setIsEditable(false);

        // Kiểm tra xem đồng bộ trực tiếp lên Xano thành công hay phải đưa vào hàng đợi offline
        if (updatedResult && updatedResult.syncStatus === "synced") {
          setSyncStatus("✅ Synced");
        } else {
          setSyncStatus("⏳ Pending sync...");
        }

        Alert.alert("Success", "Habit updated");
        await loadHabitForEditing();
      } else {
        // ===== CREATE HABIT =====
        console.log("👉 [UI ACTION]: Chế độ TẠO MỚI - Chuẩn bị gọi habitsManager.createHabit");
        const newHabit = await habitsManager.createHabit(payload);

        if (newHabit) {
          if (newHabit.syncStatus === "synced") {
            setSyncStatus("✅ Synced");
          } else {
            setSyncStatus("⏳ Pending sync...");
          }
          Alert.alert("Success", "Habit created");

          setTimeout(() => {
            if (navigation) navigation.goBack();
          }, 800);
        } else {
          setSyncStatus("❌ Failed to save");
          Alert.alert("Error", "Failed to create habit");
        }
      }
    } catch (error) {
      console.error("Error saving habit on UI:", error);
      setSyncStatus("❌ Error");
      
      if (error.message === "DUPLICATE_NAME") {
        Alert.alert("Duplicate Name", "A habit with this name already exists. Please choose a unique name!");
      } else {
        Alert.alert("Error", error.message || "Failed to save habit");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ===== DELETE ACTION 1 (Nút bấm từ Header) =====
  const handleDeleteAction = () => {
    console.log("👉 [UI CLICK]: Người dùng vừa bấm nút 'Delete' trên thanh Header!");
    
    if (!habitId) {
      Alert.alert("Error", "Cannot delete: Habit ID is missing.");
      return;
    }

    const currentHabitName = habitName.trim() || "this habit";
    
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${currentHabitName}" permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log(`👉 [UI CONFIRM]: Đã xác nhận cảnh báo. Kích hoạt hàm xóa cho ID: ${habitId}`);
            setIsLoading(true);
            setSyncStatus("🗑️ Deleting...");

            try {
              const isDeleted = await habitsManager.deleteHabit(habitId);
              if (isDeleted) {
                Alert.alert(
                  "Success", 
                  "Habit deleted successfully",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        if (navigation) {
                          console.log("➡️ [UI NAVIGATE]: Đóng màn hình, quay lại danh sách chính.");
                          navigation.goBack();
                        }
                      } 
                    }
                  ]
                );
              } else {
                Alert.alert("Error", "Failed to delete habit");
              }
            } catch (e) {
              console.error("Error deleting habit on UI:", e);
              setSyncStatus("❌ Delete failed");
              Alert.alert("Error", "Failed to delete habit");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  // ===== DELETE ACTION 2 (Hàm xóa phụ từ các phần UI khác nếu có) =====
  const handleDeleteHabit = async () => {
    if (!habitId) return;

    console.log(`👉 [UI ACTION]: Kích hoạt hàm handleDeleteHabit phụ cho ID: ${habitId}`);
    setIsLoading(true);
    try {
      const success = await habitsManager.deleteHabit(habitId);
      if (success) {
        Alert.alert(
          "Success", 
          "Habit deleted successfully",
          [
            { 
              text: "OK", 
              onPress: () => {
                if (navigation) navigation.goBack();
              } 
            }
          ]
        );
      } else {
        Alert.alert("Error", "Xóa habit thất bại");
      }
    } catch (error) {
      console.warn("Delete habit failed", error);
      Alert.alert("Error", "Xóa habit thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== UPDATE STATUS QUICK ROW =====
  const handleUpdateStatus = async (newStatus) => {
    if (!habitId) return;
    setIsLoading(true);
    try {
      const updatedHabit = await habitsManager.updateHabit(habitId, {
        status: newStatus,
      });
      if (updatedHabit) {
        await loadHabitForEditing();
      }
    } catch (error) {
      console.warn("Update habit failed", error);
      Alert.alert("Error", "Cập nhật trạng thái thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER =====
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

      {/* SYNC STATUS INDICATOR */}
      {syncStatus ? (
        <View
          style={{
            backgroundColor: colors.surfaceVariant,
            padding: 8,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {syncStatus}
          </Text>
        </View>
      ) : null}

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