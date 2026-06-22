/* eslint-disable i18next/no-literal-string */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppStore } from "../../../../shared/stores/useAppStore";

import { getStyles } from "./TodayScreen.styles";
import { useTheme } from "../../../../providers/ThemeProvider";
import ConfirmModal from "../../../../shared/components/ConfirmModal";
import DailyProgressCard from "../../components/DailyProgressCard";
import FilterMenu from "../../components/FilterMenu";
import MascotAvatar from "../../components/MascotAvatar";
import TodoHabitCard from "../../components/TodoHabitCard";
import UndoSnackbar from "../../components/UndoSnackbar";
import { useTodayCheckins } from "../../hooks/useTodayCheckins";
import { getGreetingKey } from "../../utils/today";
import { CATEGORY_ICONS } from "../../../habits/constants";
import { ChevronDown, ChevronUp } from "lucide-react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_EMOJI = {
  health: "💚",
  study: "📘",
  work: "💼",
  mindfulness: "🧘",
  other: "⭐",
};

function formatDate(language) {
  try {
    return new Date().toLocaleDateString(language, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return new Date().toDateString();
  }
}

export default function TodayScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();

  const {
    isLoading,
    todo,
    done,
    mascot,
    undo,
    completedCount,
    totalCount,
    atRiskCount,
    progressPct,
    reload,
    incrementCount,
    setCount,
    markDone,
    undoLast,
    confirmHabit,
    setConfirmHabit,
  } = useTodayCheckins();

  const [doneExpanded, setDoneExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter (⋯) state.
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const filterActive = categoryFilter !== "All" || statusFilter !== "All";

  // Swipe-to-done confirmation state managed by hook.

  useEffect(() => {
    const unsubscribe = navigation?.addListener("focus", () => reload());
    return unsubscribe;
  }, [navigation, reload]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleUndo = () => {
    const success = undoLast();
    if (!success) {
      useAppStore.getState().showGlobalAlert({
        title: t("common.error"),
        message: t("today.nothingToUndo"),
      });
    }
  };

  const toggleDone = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDoneExpanded((prev) => !prev);
  };

  const filteredTodo = todo.filter((item) => {
    const catOk =
      categoryFilter === "All" ||
      (item.habit.category || "").toLowerCase() ===
        categoryFilter.toLowerCase();
    const statusOk =
      statusFilter === "All" ||
      (statusFilter === "Overdue" ? item.overdue : !item.overdue);
    return catOk && statusOk;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header: greeting + date + mascot */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text
              style={styles.greetingText}
            >{`${t(getGreetingKey())} 👋`}</Text>
            <Text style={styles.dateText}>{formatDate(i18n.language)}</Text>
          </View>
          <MascotAvatar state={mascot} styles={styles} />
        </View>

        {/* Daily progress */}
        <DailyProgressCard
          styles={styles}
          colors={colors}
          t={t}
          completedCount={completedCount}
          totalCount={totalCount}
          progressPct={progressPct}
          atRiskCount={atRiskCount}
        />

        {/* To Do */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t("today.toDo")}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("today.filter.title")}
            onPress={() => setFilterOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={[
                styles.sectionKebab,
                filterActive && styles.sectionKebabActive,
              ]}
            >
              {filterActive ? "⊙" : "⋯"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : totalCount === 0 ? (
          <Text style={styles.emptyText}>{t("today.noHabits")}</Text>
        ) : todo.length === 0 ? (
          <Text style={styles.emptyText}>{t("today.allDone")}</Text>
        ) : filteredTodo.length === 0 ? (
          <Text style={styles.emptyText}>{t("today.noMatch")}</Text>
        ) : (
          filteredTodo.map((item) => (
            <TodoHabitCard
              key={item.habit.id}
              item={item}
              styles={styles}
              colors={colors}
              t={t}
              onCheckin={incrementCount}
              onSetCount={setCount}
              onSwipeDone={setConfirmHabit}
            />
          ))
        )}

        {/* Done */}
        {done.length > 0 && (
          <>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.sectionHeaderRow}
              onPress={toggleDone}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>
                {t("today.done", { count: done.length })}
              </Text>
              <Text style={styles.sectionKebab}>
                {doneExpanded ? <ChevronDown /> : <ChevronUp />}
              </Text>
            </TouchableOpacity>

            {doneExpanded &&
              done.map(({ habit, streak }) => (
                <View key={habit.id} style={styles.doneRow}>
                  <View style={styles.doneEmojiContainer}>
                    <Image
                      source={CATEGORY_ICONS[(habit.category || "other").toLowerCase()]}
                      style={styles.doneEmoji}
                    />
                  </View>                 
                  <Text style={styles.doneName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  {streak > 1 && (
                    <Text style={styles.doneStreak}>
                      🔥 {t("today.dayStreak", { count: streak })}
                    </Text>
                  )}
                  <View style={styles.doneCheckCircle}>
                    <Text style={styles.doneCheckMark}>✓</Text>
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>

      <UndoSnackbar
        visible={!!undo}
        message={undo ? t(undo.messageKey) : ""}
        onUndo={handleUndo}
        styles={styles}
        t={t}
      />

      <FilterMenu
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={categoryFilter}
        setCategory={setCategoryFilter}
        status={statusFilter}
        setStatus={setStatusFilter}
        styles={styles}
        t={t}
      />

      <ConfirmModal
        visible={!!confirmHabit}
        title={t("today.confirmDoneTitle")}
        message={
          confirmHabit
            ? t("today.confirmDoneMsg", { name: confirmHabit.name })
            : ""
        }
        cancelLabel={t("common.cancel")}
        confirmLabel={t("today.confirmYes")}
        onCancel={() => setConfirmHabit(null)}
        onConfirm={() => {
          markDone(confirmHabit);
          setConfirmHabit(null);
        }}
        styles={styles}
      />
    </SafeAreaView>
  );
}
