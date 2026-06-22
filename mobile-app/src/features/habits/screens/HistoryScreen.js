import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  ArrowLeft,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Check,
  AlertCircle,
} from "lucide-react-native";

import { useTheme } from "../../../providers/ThemeProvider";
import { calculateHabitStats } from "../../../shared/services/derivedStateEngine";
import { useHabitHistory } from "../hooks/useHabitHistory";
import { getStyles } from "./HistoryScreen.styles";

export default function HistoryScreen({ route, navigation }) {
  const { habit } = route.params || {};
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const habitId = habit?.id;
  const targetPerDay = Math.max(1, habit?.targetPerDay || 1);

  // Fetch checkin history for this habit
  const { data: checkins = [], isLoading } = useHabitHistory(habitId);

  // Calculate habit stats dynamically using the derivedStateEngine
  const stats = useMemo(() => {
    return calculateHabitStats(checkins, habit);
  }, [checkins, habit]);

  // Group check-ins by month and sort them newest first
  const sections = useMemo(() => {
    const grouped = checkins.reduce((acc, c) => {
      const dateStr = c.date_only || c.date;
      if (!dateStr || typeof dateStr !== "string") return acc;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return acc;

      // Group by month and year localized
      const monthYear = d.toLocaleDateString(i18n.language, {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(c);
      return acc;
    }, {});

    return Object.keys(grouped).map((month) => ({
      title: month,
      data: grouped[month].sort((a, b) => {
        const dA = new Date(a.date_only || a.date);
        const dB = new Date(b.date_only || b.date);
        return dB.getTime() - dA.getTime();
      }),
    }));
  }, [checkins, i18n.language]);

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(i18n.language, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("common.loading") || "Loading..."}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t("history.back")}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {habit?.name}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Current Streak */}
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: "rgba(249, 115, 22, 0.1)" }]}>
            <Flame size={20} color="#F97316" />
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>{t("history.streak")}</Text>
        </View>

        {/* Longest Streak */}
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: "rgba(234, 179, 8, 0.1)" }]}>
            <Trophy size={20} color="#EAB308" />
          </View>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>{t("history.longest") || "Longest"}</Text>
        </View>

        {/* Total Completions */}
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
            <CheckCircle2 size={20} color="#10B981" />
          </View>
          <Text style={styles.statValue}>{stats.totalCompletions}</Text>
          <Text style={styles.statLabel}>{t("history.total")}</Text>
        </View>
      </View>

      {/* Check-ins Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.sectionListContent}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const completedCount = item.completedCount || 0;
          const isDone = completedCount >= targetPerDay;

          return (
            <View style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <View style={styles.historyIconWrapper}>
                  <Calendar size={18} color={colors.textSecondary} />
                </View>
                <View>
                  <Text style={styles.dateText}>{formatDate(item.date_only || item.date)}</Text>
                </View>
              </View>

              <View style={styles.historyItemRight}>
                <Text style={styles.progressText}>
                  {completedCount}/{targetPerDay}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isDone
                        ? colors.successLight
                        : "rgba(245, 158, 11, 0.1)",
                    },
                  ]}
                >
                  {isDone ? (
                    <Check size={14} color={colors.successDark} />
                  ) : (
                    <AlertCircle size={14} color="#D97706" />
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Calendar size={32} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>{t("history.empty")}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
