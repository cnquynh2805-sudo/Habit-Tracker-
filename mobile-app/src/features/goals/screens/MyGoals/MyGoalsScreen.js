import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActiveMilestoneCard from "../../components/ActiveMilestoneCard";
import NoGoalCard from "../../components/NoGoalCard";
import OverallProgressCard from "../../components/OverallProgressCard";
import GoalSettingModal from "../../components/GoalSettingModal";
import { useDashboardGoals } from "../../hooks/useDashboardGoals";
import { getGoalsStyles } from "./MyGoalsScreen.styles";
import { useTheme } from "../../../../providers/ThemeProvider";

export default function MyGoalsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getGoalsStyles(colors);

  const [selectedHabit, setSelectedHabit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const handleOpenModal = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const {
    isLoading,
    isFetching,
    isError,
    activeGoals,
    habitsWithoutGoals,
    overallProgress,
    refetch,
  } = useDashboardGoals();
  /**
   * Build a flat heterogeneous array for FlashList.
   * FlashList requires a single `data` prop and routes items by type
   * in renderItem — this is the recommended pattern for mixed layouts.
   */
  const listData = useMemo(() => {
    const data = [];

    // Section 1 – Overall Progress card
    data.push({ type: "OVERALL_PROGRESS" });

    // Section 2 – Active Milestones
    if (activeGoals.length > 0) {
      data.push({ type: "SECTION_HEADER", title: t("goals.activeMilestones") });
      activeGoals.forEach((goal) => {
        data.push({ type: "ACTIVE_GOAL", item: goal });
      });
    }

    // Section 3 – Habits without goals
    if (habitsWithoutGoals.length > 0) {
      data.push({ type: "SECTION_HEADER", title: t("goals.noGoalSetTitle") });
      habitsWithoutGoals.forEach((habit) => {
        data.push({ type: "NO_GOAL", item: habit });
      });
    }

    // Section 4 – Mascot encouragement
    data.push({ type: "MASCOT" });

    return data;
  }, [activeGoals, habitsWithoutGoals, t]);

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "OVERALL_PROGRESS":
        return (
          <OverallProgressCard
            activeCount={overallProgress.activeCount}
            totalCount={overallProgress.totalCount}
            percent={overallProgress.percent}
            styles={styles}
            colors={colors}
          />
        );

      case "SECTION_HEADER":
        return <Text style={styles.sectionTitle}>{item.title}</Text>;

      case "ACTIVE_GOAL":
        return (
          <ActiveMilestoneCard
            item={item.item}
            styles={styles}
            colors={colors}
            onPress={() => handleOpenModal(item.item)}
          />
        );

      case "NO_GOAL":
        return (
          <NoGoalCard
            item={item.item}
            styles={styles}
            colors={colors}
            onSetGoal={() => handleOpenModal(item.item)}
          />
        );

      case "MASCOT": {
        const mascotMsg =
          activeGoals.length > 0
            ? t("goals.mascotActive")
            : t("goals.mascotEmpty");
        return (
          <View style={styles.mascotCard}>
            <View style={styles.mascotAvatar}>
              <Text style={{ fontSize: 26 }}>🦊</Text>
            </View>
            <View style={styles.mascotBubble}>
              <Text style={styles.mascotText}>"{mascotMsg}"</Text>
            </View>
          </View>
        );
      }

      default:
        return null;
    }
  };

  const getItemType = (item) => item.type;

  // Full-screen loading
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Screen header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t("tabs.goals")}</Text>
        {/* Search icon placeholder */}
        <View style={styles.searchButton}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </View>
      </View>

      {isError ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: colors.error || "#ef4444", fontSize: 14 }}>
            {t("common.error")}
          </Text>
        </View>
      ) : (
        <FlashList
          data={listData}
          renderItem={renderItem}
          getItemType={getItemType}
          keyExtractor={(item, index) => {
            if (item.type === "ACTIVE_GOAL") return `goal_${item.item.habitId}`;
            if (item.type === "NO_GOAL") return `no_goal_${item.item.id}`;
            if (item.type === "SECTION_HEADER") return `header_${item.title}`;
            return `${item.type}_${index}`;
          }}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isFetching}
        />
      )}

      <GoalSettingModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedHabit(null);
        }}
        habit={selectedHabit}
        colors={colors}
      />
    </SafeAreaView>
  );
}
