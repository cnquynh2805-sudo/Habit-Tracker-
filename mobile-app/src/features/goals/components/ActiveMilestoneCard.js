import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function ActiveMilestoneCard({ item, styles, colors, onPress }) {
  const { t } = useTranslation();

  const { habitName, category, goal } = item;
  // targetType from the backend: "Streak" | "TotalCompletions"
  const { targetType, targetValue, currentProgress, progressPercent } = goal;

  const isStreak = targetType === "Streak";
  const isAchieved = progressPercent >= 100;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(progressPercent, 100) / 100, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressPercent, progress]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Unit label based on goal type
  const unit = isStreak ? t("goals.unitDays") : t("goals.unitSessions");
  const goalSubtitle = isStreak
    ? t("goals.goalTypeStreak", { count: targetValue })
    : t("goals.goalTypeTotal", { count: targetValue });

  // Status text
  let statusText = t("goals.keepGoing");
  if (isAchieved) statusText = t("goals.goalAchieved");
  else if (progressPercent >= 70) statusText = t("goals.almostThere");

  // Category icon
  const categoryIcon = {
    Health: "💧",
    Study: "📚",
    Work: "💼",
    Mindfulness: "🧘",
    Other: "⭐",
  }[category] || "🎯";

  return (
    <TouchableOpacity
      style={styles.milestoneCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${habitName}, ${t("goals.goalTypePrefix")}: ${goalSubtitle}`}
    >
      {/* Header row */}
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneIconContainer}>
          <Text style={{ fontSize: 22 }}>{isAchieved ? "✨" : categoryIcon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.milestoneTitle} numberOfLines={1}>
            {habitName}
          </Text>
          <Text style={styles.milestoneSubtitle}>
            {t("goals.goalTypePrefix")}: {goalSubtitle}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.milestoneProgressBg}>
        <Animated.View
          style={[styles.milestoneProgressFill, animatedBarStyle]}
        />
      </View>

      {/* Footer */}
      <View style={styles.milestoneFooter}>
        <Text style={[styles.milestoneStatusText, isAchieved && { color: colors.success || colors.primary }]}>
          {isStreak && progressPercent >= 70 && !isAchieved ? "✦ " : ""}
          {statusText}
        </Text>
        <Text style={styles.milestoneCountText}>
          {currentProgress} / {targetValue} {unit}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
