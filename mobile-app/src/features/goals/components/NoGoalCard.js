/* eslint-disable react-native/no-inline-styles */
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, TouchableOpacity } from "react-native";

export default function NoGoalCard({ item, styles, colors, onSetGoal }) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleSetGoal = () => {
    if (onSetGoal) {
      onSetGoal(item);
    } else {
      // Fallback: Navigate to CreateHabitScreen, passing the habitId
      navigation.navigate("CreateHabit", { habitId: item.id });
    }
  };

  return (
    <View style={styles.noGoalCard}>
      <View style={styles.noGoalIconContainer}>
        {/* We use a text icon for simplicity, but you can swap with lucide-react-native */}
        <Text style={{ fontSize: 20, color: colors.textMuted }}>⚪</Text>
      </View>
      <View style={styles.noGoalTextContainer}>
        <Text style={styles.noGoalTitle}>{item.name}</Text>
        <Text style={styles.noGoalSubtitle}>{t("goals.noGoalSet")}</Text>
      </View>
      <TouchableOpacity
        style={styles.setGoalButton}
        onPress={handleSetGoal}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t("goals.setGoal")}
      >
        <Text style={styles.setGoalButtonText}>{t("goals.setGoal")}</Text>
      </TouchableOpacity>
    </View>
  );
}
