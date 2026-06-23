/* eslint-disable no-unused-vars, react-native/no-inline-styles, react-native/no-color-literals, i18next/no-literal-string */
import {
  Upload,
  Settings,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  BookOpen,
  Sparkles,
  Activity,
  Flame,
  Zap,
  Heart,
  BarChart2,
  Minus,
} from "lucide-react-native";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  Share,
} from "react-native";
import { Svg, Rect, Text as SvgText } from "react-native-svg";

import { useMascotStore } from "@/features/mascot/store/mascotStore";
import { useTheme } from "@/providers/ThemeProvider";
import {
  computeDashboardSummary,
  computeHeatmap,
  computeWeeklyProgress,
  computePerformanceList,
} from "@/shared/services/derivedStateEngine";
import { useDomainStore } from "@/shared/stores/useDomainStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CELL_SIZE = 12;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const NUM_WEEKS = 13; // ~3 months

// ─── Category colors (matching design) ─────────────────────────────────────
const CATEGORY_COLORS = {
  health: "#327756",
  Health: "#327756",
  study: "#4A6A8F",
  Study: "#4A6A8F",
  personal: "#3E6669",
  Personal: "#3E6669",
  mindfulness: "#7C6B9A",
  Mindfulness: "#7C6B9A",
  fitness: "#327756",
  Fitness: "#327756",
  other: "#5F6368",
  Other: "#5F6368",
  default: "#327756",
};

// ─── HEATMAP ─────────────────────────────────────────────────────────────────
const HEAT_COLORS = ["#E8F5EE", "#A8D5BA", "#52A477", "#327756", "#1E4631"];

/**
 * Builds a 7-row × N-week grid from computed heatmap data.
 * heatmapData shape: [{ date: "YYYY-MM-DD", completionRate: 0–1 }, ...]
 */
function buildHeatGrid(heatmapData) {
  const dateMap = {};
  if (Array.isArray(heatmapData)) {
    heatmapData.forEach((item) => {
      if (item.date) dateMap[item.date] = item.completionRate ?? 0;
    });
  }

  const today = new Date();
  // Go back to the Sunday that is NUM_WEEKS weeks ago
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - today.getDay() - (NUM_WEEKS - 1) * 7);

  const cells = []; // [{ dateStr, intensity 0-1, col, row }]
  let col = 0;
  const cursor = new Date(startDay);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const row = cursor.getDay(); // 0=Sun … 6=Sat
    cells.push({ dateStr, intensity: dateMap[dateStr] ?? 0, col, row });
    cursor.setDate(cursor.getDate() + 1);
    if (row === 6) col++;
  }

  // Extract month labels for the header
  const monthLabels = [];
  let lastMonth = -1;
  cells.forEach((c) => {
    const month = new Date(c.dateStr).getMonth();
    if (month !== lastMonth && c.row === 0) {
      lastMonth = month;
      monthLabels.push({ col: c.col, month });
    }
  });

  return { cells, numCols: col + 1, monthLabels };
}

function intensityToColor(intensity) {
  if (intensity <= 0) return HEAT_COLORS[0];
  if (intensity < 0.25) return HEAT_COLORS[1];
  if (intensity < 0.5) return HEAT_COLORS[2];
  if (intensity < 0.75) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function HeatmapGrid({ heatmapData }) {
  const { cells, numCols, monthLabels } = useMemo(
    () => buildHeatGrid(heatmapData),
    [heatmapData],
  );
  const totalCols = Math.max(numCols, NUM_WEEKS);
  const svgWidth = totalCols * CELL_STEP;
  const headerH = 18;
  const svgHeight = headerH + 7 * CELL_STEP;

  return (
    <View style={{ width: "100%", aspectRatio: svgWidth / svgHeight }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Month labels */}
        {monthLabels.map((ml, i) => (
          <SvgText
            key={i}
            x={ml.col * CELL_STEP}
            y={headerH - 4}
            fontSize={9}
            fill="#5F6368"
          >
            {MONTH_NAMES[ml.month]}
          </SvgText>
        ))}
        {/* Cells */}
        {cells.map((c, i) => (
          <Rect
            key={i}
            x={c.col * CELL_STEP}
            y={headerH + c.row * CELL_STEP}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={2}
            fill={intensityToColor(c.intensity)}
          />
        ))}
      </Svg>
    </View>
  );
}

// ─── WEEKLY BAR CHART ─────────────────────────────────────────────────────────
const BAR_MAX_HEIGHT = 100;

/**
 * weeklyData shape from computeWeeklyProgress:
 * [{ day: "M", categories: { Health: 0.8, Study: 0.4 } }, ...]
 */
function WeeklyBarChart({ weeklyData, colors }) {
  const uniqueCats = useMemo(() => {
    const s = new Set();
    (weeklyData || []).forEach((d) =>
      Object.keys(d.categories || {}).forEach((cat) => s.add(cat)),
    );
    return [...s];
  }, [weeklyData]);

  return (
    <View>
      <View style={wStyles.chartRow}>
        {(weeklyData || []).map((entry, i) => {
          const cats = Object.entries(entry.categories || {});
          const totalRatio = cats.reduce((sum, [, v]) => sum + v, 0);
          const barH = Math.max(
            4,
            Math.min(totalRatio * BAR_MAX_HEIGHT, BAR_MAX_HEIGHT),
          );

          return (
            <View key={i} style={wStyles.barCol}>
              <View style={wStyles.barWrapper}>
                <View
                  style={[wStyles.barContainer, { height: BAR_MAX_HEIGHT }]}
                >
                  {cats.length > 0 ? (
                    <View style={[wStyles.barStack, { height: barH }]}>
                      {[...cats].reverse().map(([cat, ratio], si) => {
                        const segH = (ratio / Math.max(totalRatio, 1)) * barH;
                        const color =
                          CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
                        return (
                          <View
                            key={si}
                            style={[
                              wStyles.barSegment,
                              { height: segH, backgroundColor: color },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    <View
                      style={[
                        wStyles.barStack,
                        { height: 6, backgroundColor: colors.border },
                      ]}
                    />
                  )}
                </View>
              </View>
              <Text style={[wStyles.dayLabel, { color: colors.textMuted }]}>
                {entry.day}
              </Text>
            </View>
          );
        })}
      </View>
      {/* Legend */}
      {uniqueCats.length > 0 && (
        <View style={wStyles.legend}>
          {uniqueCats.map((cat) => (
            <View key={cat} style={wStyles.legendItem}>
              <View
                style={[
                  wStyles.legendDot,
                  {
                    backgroundColor:
                      CATEGORY_COLORS[cat] || CATEGORY_COLORS.default,
                  },
                ]}
              />
              <Text style={[wStyles.legendText, { color: colors.textMuted }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const wStyles = StyleSheet.create({
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  barCol: { flex: 1, alignItems: "center" },
  barWrapper: { alignItems: "center", justifyContent: "flex-end" },
  barContainer: { justifyContent: "flex-end", width: 22 },
  barStack: {
    width: 22,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barSegment: { width: "100%" },
  dayLabel: { fontSize: 11, marginTop: 6 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
});

// ─── HABIT ICON MAP ──────────────────────────────────────────────────────────
function HabitIcon({ name, color, size = 18 }) {
  const lower = (name || "").toLowerCase();
  if (
    lower.includes("workout") ||
    lower.includes("exercise") ||
    lower.includes("gym")
  )
    return <Dumbbell size={size} color={color} />;
  if (
    lower.includes("meditat") ||
    lower.includes("mindful") ||
    lower.includes("breath")
  )
    return <Sparkles size={size} color={color} />;
  if (
    lower.includes("read") ||
    lower.includes("book") ||
    lower.includes("study")
  )
    return <BookOpen size={size} color={color} />;
  if (lower.includes("run") || lower.includes("walk") || lower.includes("step"))
    return <Activity size={size} color={color} />;
  if (lower.includes("water") || lower.includes("drink"))
    return <Zap size={size} color={color} />;
  if (lower.includes("sleep") || lower.includes("rest"))
    return <Heart size={size} color={color} />;
  return <BarChart2 size={size} color={color} />;
}

// ─── PERFORMANCE HABIT CARD ──────────────────────────────────────────────────
/**
 * Performance habit card matching the design:
 *   - Habit icon + name + 7d rate%
 *   - Current streak (or "At Risk")
 *   - Best streak + Total completions
 *   - 7d Rate label
 */
function HabitPerformanceCard({ item, colors }) {
  const {
    habit,
    currentStreak,
    longestStreak,
    totalCompletions,
    rate7d,
    isAtRisk,
  } = item;
  const catColor = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.default;

  const cardBg = isAtRisk
    ? { backgroundColor: "#FFF0F0", borderColor: "#FFCCCC", borderWidth: 1 }
    : { backgroundColor: colors.surface };
  const iconBg = isAtRisk ? "#FFE4E4" : colors.background;
  const iconColor = isAtRisk ? "#E53E3E" : catColor;
  const percentColor = isAtRisk ? "#E53E3E" : catColor;

  return (
    <View style={[s.habitCard, cardBg]}>
      <View style={[s.habitIconBg, { backgroundColor: iconBg }]}>
        {isAtRisk ? (
          <AlertTriangle size={18} color={iconColor} />
        ) : (
          <HabitIcon name={habit.name} color={iconColor} size={18} />
        )}
      </View>
      <View style={s.habitInfo}>
        <View style={s.habitRow}>
          <Text style={[s.habitName, { color: colors.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <Text style={[s.habitRate, { color: percentColor }]}>{rate7d}%</Text>
        </View>
        <View style={s.habitRow}>
          <Text
            style={[
              s.habitStreak,
              { color: isAtRisk ? "#E53E3E" : colors.textMuted },
            ]}
          >
            {isAtRisk
              ? "⏱ At Risk"
              : currentStreak > 0
                ? `🔥 ${currentStreak}d streak`
                : "No active streak"}
          </Text>
          <Text
            style={[
              s.habitRateLabel,
              { color: isAtRisk ? "#E53E3E" : colors.textMuted },
            ]}
          >
            7d Rate
          </Text>
        </View>
        <Text style={[s.habitBest, { color: colors.textMuted }]}>
          Best: {longestStreak}d • Total: {totalCompletions}
        </Text>
      </View>
    </View>
  );
}

// ─── MASCOT MESSAGE ──────────────────────────────────────────────────────────
function buildMascotMessage(performanceList) {
  if (!Array.isArray(performanceList) || performanceList.length === 0) {
    return {
      text: "Keep building great habits! Every day counts.",
      name: "Keep going!",
    };
  }

  const atRisk = performanceList.filter((p) => p.isAtRisk);
  const crushing = performanceList.filter((p) => p.rate7d >= 80);

  let msg = "";
  if (crushing.length > 0 && atRisk.length === 0) {
    msg =
      "You're crushing all your habits! Keep this incredible momentum going!";
  } else if (atRisk.length > 0 && crushing.length > 0) {
    const atRiskName = atRisk[0]?.habit?.name || "that habit";
    const crushingCat =
      crushing[0]?.habit?.category || "your strong categories";
    msg = `You're crushing it on ${crushingCat}, but ${atRiskName} needs some love today. Don't let that streak slip away!`;
  } else if (atRisk.length > 0) {
    const atRiskName = atRisk[0]?.habit?.name || "some habits";
    msg = `${atRiskName} needs attention. Give it some focus today to get back on track!`;
  } else {
    msg = "Keep building great habits! Every small action compounds over time.";
  }

  return { text: `"${msg}"`, name: "Keep going!" };
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const DashboardScreen = () => {
  const { colors: themeColors } = useTheme();
  const C = themeColors;

  const { habits, goals, checkins, isLoading, error, fetchDomainData } =
    useDomainStore();
  const { selectedMascot } = useMascotStore();
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchDomainData();
  }, [fetchDomainData]);

  const onRefresh = useCallback(() => {
    fetchDomainData(true);
  }, [fetchDomainData]);

  // ── Derived State (all computed from raw data via derivedStateEngine) ───────
  const { todayScore, todayTrend, activeHabits, atRisk } = useMemo(
    () => computeDashboardSummary(habits, checkins, goals),
    [habits, checkins, goals],
  );

  const heatmapData = useMemo(
    () => computeHeatmap(habits, checkins, 90),
    [habits, checkins],
  );

  const weeklyData = useMemo(
    () => computeWeeklyProgress(habits, checkins),
    [habits, checkins],
  );

  const performanceList = useMemo(
    () => computePerformanceList(habits, checkins),
    [habits, checkins],
  );

  // ── Category filter derived from actual habit categories ───────────────────
  const categories = useMemo(() => {
    const cats = new Set();
    performanceList.forEach((p) => {
      const cat = p.habit.category;
      if (cat) cats.add(cat);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [performanceList]);

  const filteredPerformanceList = useMemo(() => {
    if (activeFilter === "All") return performanceList;
    return performanceList.filter(
      (p) =>
        (p.habit.category || "").toLowerCase() === activeFilter.toLowerCase(),
    );
  }, [performanceList, activeFilter]);

  // Group filtered list by category for section headers
  const groupedPerformance = useMemo(() => {
    const groups = {};
    filteredPerformanceList.forEach((item) => {
      const cat = item.habit.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredPerformanceList]);

  const mascotMsg = useMemo(
    () => buildMascotMessage(performanceList),
    [performanceList],
  );

  const styles = useMemo(() => makeStyles(C), [C]);

  // ── Trend indicator ────────────────────────────────────────────────────────
  const trendDisplay = useMemo(() => {
    if (todayTrend === 0) return { label: "±0%", Icon: Minus, color: "#fff" };
    if (todayTrend > 0)
      return {
        label: `+${todayTrend.toFixed(1)}%`,
        Icon: TrendingUp,
        color: "#fff",
      };
    return {
      label: `${todayTrend.toFixed(1)}%`,
      Icon: TrendingDown,
      color: "#fff",
    };
  }, [todayTrend]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Share dashboard"
            accessibilityRole="button"
            onPress={() =>
              Share.share({
                message: `My habit consistency today: ${todayScore}%`,
              })
            }
          >
            <Upload size={22} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Settings"
            accessibilityRole="button"
            style={{ marginLeft: 16 }}
          >
            <Settings size={22} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── SUMMARY CARDS ─────────────────────────────────────────────── */}
        <View style={styles.summaryRow}>
          {/* Today % */}
          <View style={[styles.summaryCard, { backgroundColor: "#3E6669" }]}>
            <Text style={styles.summaryLabel}>Today %</Text>
            <Text
              style={styles.summaryValue}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {todayScore}%
            </Text>
            <View style={styles.summarySubRow}>
              <trendDisplay.Icon size={10} color={trendDisplay.color} />
              <Text style={styles.summarySub}>{` ${trendDisplay.label}`}</Text>
            </View>
          </View>

          {/* Active Habits */}
          <View style={[styles.summaryCard, { backgroundColor: "#327756" }]}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text
              style={styles.summaryValue}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {activeHabits}
            </Text>
            <Text style={styles.summarySub}>Current{"\n"}Habits</Text>
          </View>

          {/* At Risk */}
          <View style={[styles.summaryCard, { backgroundColor: "#4A6A8F" }]}>
            <Text style={styles.summaryLabel}>At Risk</Text>
            <Text
              style={styles.summaryValue}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {atRisk}
            </Text>
            <View style={styles.summarySubRow}>
              <AlertTriangle size={10} color="#fff" />
              <Text style={styles.summarySub}> Action{"\n"}Needed</Text>
            </View>
          </View>
        </View>

        {/* ── CONSISTENCY HEATMAP ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>
              Consistency
            </Text>
            <Text style={[styles.cardSubtitle, { color: C.textMuted }]}>
              Last 3 Months
            </Text>
          </View>
          <HeatmapGrid heatmapData={heatmapData} />
          {/* Legend */}
          <View style={styles.legendRow}>
            <Text style={[styles.legendLabel, { color: C.textMuted }]}>
              Less
            </Text>
            {HEAT_COLORS.map((hc, i) => (
              <View
                key={i}
                style={[styles.legendCell, { backgroundColor: hc }]}
              />
            ))}
            <Text style={[styles.legendLabel, { color: C.textMuted }]}>
              More
            </Text>
          </View>
        </View>

        {/* ── WEEKLY PROGRESS ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>
              Weekly Progress
            </Text>
            <View style={[styles.weekPill, { backgroundColor: C.background }]}>
              <Text style={[styles.weekPillText, { color: C.text }]}>
                This Week ▾
              </Text>
            </View>
          </View>
          <WeeklyBarChart weeklyData={weeklyData} colors={C} />
        </View>

        {/* ── PERFORMANCE ───────────────────────────────────────────────── */}
        <Text style={[styles.pageTitle, { marginBottom: 14 }]}>
          Performance
        </Text>

        {/* Category chips — derived from actual habit data */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveFilter(cat)}
              style={[
                styles.chip,
                activeFilter === cat
                  ? { backgroundColor: "#2D4A3E" }
                  : {
                      backgroundColor: C.surface,
                      borderColor: C.border,
                      borderWidth: 1,
                    },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${cat}`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: activeFilter === cat ? "#fff" : C.text },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Habit performance list grouped by category */}
        {Object.keys(groupedPerformance).length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart2 size={32} color={C.textMuted} />
            <Text style={[styles.emptyText, { color: C.textMuted }]}>
              {habits.length === 0
                ? "No habits found. Create some habits to see your performance!"
                : "No habits match the selected category."}
            </Text>
          </View>
        ) : (
          Object.entries(groupedPerformance).map(([cat, items]) => (
            <View key={cat}>
              <Text style={[styles.catLabel, { color: C.textMuted }]}>
                {cat.toUpperCase()}
              </Text>
              {items.map((item) => (
                <HabitPerformanceCard
                  key={item.habit.id}
                  item={item}
                  colors={C}
                />
              ))}
            </View>
          ))
        )}

        {/* ── MASCOT NOTE ───────────────────────────────────────────────── */}
        <View style={[styles.mascotCard, { backgroundColor: C.successLight }]}>
          <View style={[styles.mascotIconBg, { backgroundColor: "#2D4A3E" }]}>
            <Text style={{ fontSize: 22 }}>🐾</Text>
          </View>
          <View style={styles.mascotContent}>
            <Text style={[styles.mascotText, { color: "#2D4A3E" }]}>
              {mascotMsg.text}
            </Text>
            <Text style={[styles.mascotName, { color: "#2D4A3E" }]}>
              {mascotMsg.name}
            </Text>
          </View>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: "#FFF0F0" }]}>
            <AlertTriangle size={14} color="#E53E3E" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
function makeStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: C.text,
    },
    headerActions: { flexDirection: "row", alignItems: "center" },
    scroll: { paddingHorizontal: 20, paddingBottom: 110 },

    // Summary cards
    summaryRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    summaryCard: {
      flex: 1,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 14,
      minHeight: 125,
      justifyContent: "space-between",
    },
    summaryLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: "rgba(255,255,255,0.85)",
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: "800",
      color: "#fff",
      includeFontPadding: false,
      marginBottom: 4,
    },
    summarySubRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 2,
    },
    summarySub: {
      fontSize: 11,
      color: "rgba(255,255,255,0.85)",
      lineHeight: 15,
    },

    // Section cards
    card: {
      backgroundColor: C.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    cardTitle: { fontSize: 17, fontWeight: "600" },
    cardSubtitle: { fontSize: 13 },

    // Week pill
    weekPill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
    },
    weekPillText: { fontSize: 12, fontWeight: "500" },

    // Heatmap legend
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 10,
      gap: 3,
    },
    legendLabel: { fontSize: 11, marginHorizontal: 2 },
    legendCell: { width: 11, height: 11, borderRadius: 2 },

    // Filter chips
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipText: { fontSize: 13, fontWeight: "500" },

    // Category label
    catLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      marginTop: 4,
      marginBottom: 10,
    },

    // Habit cards
    habitCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 10,
    },
    habitIconBg: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    habitInfo: { flex: 1 },
    habitRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 3,
    },
    habitName: { fontSize: 15, fontWeight: "500", flex: 1, marginRight: 8 },
    habitRate: { fontSize: 15, fontWeight: "700" },
    habitStreak: { fontSize: 13 },
    habitRateLabel: { fontSize: 11 },
    habitBest: { fontSize: 12, marginTop: 3 },

    // Mascot card
    mascotCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      borderRadius: 20,
      padding: 18,
      marginTop: 8,
      marginBottom: 16,
    },
    mascotIconBg: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    mascotContent: { flex: 1 },
    mascotText: {
      fontSize: 14,
      lineHeight: 22,
      fontStyle: "italic",
    },
    mascotName: {
      fontSize: 14,
      fontWeight: "700",
      marginTop: 10,
    },

    // Empty state
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 240,
    },

    // Error
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      marginTop: 8,
    },
    errorText: { fontSize: 13, color: "#E53E3E", flex: 1 },
  });
}

const s = StyleSheet.create({
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  habitIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  habitInfo: { flex: 1 },
  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  habitName: { fontSize: 15, fontWeight: "500", flex: 1, marginRight: 8 },
  habitRate: { fontSize: 15, fontWeight: "700" },
  habitStreak: { fontSize: 13 },
  habitRateLabel: { fontSize: 11 },
  habitBest: { fontSize: 12, marginTop: 3 },
});

export default DashboardScreen;
