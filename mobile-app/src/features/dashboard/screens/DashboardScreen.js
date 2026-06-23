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
import {
  Upload,
  Settings,
  AlertTriangle,
  TrendingUp,
  Dumbbell,
  BookOpen,
  Sparkles,
  Activity,
  Flame,
  Zap,
  Heart,
  BarChart2,
} from "lucide-react-native";
import { Svg, Rect, Text as SvgText } from "react-native-svg";
import { useTheme } from "@/providers/ThemeProvider";
import { useDashboardStore } from "../store/useDashboardStore";
import { useMascotStore } from "@/features/mascot/store/mascotStore";
import { calculateHabitStats } from "@/shared/services/derivedStateEngine";

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
  default: "#327756",
};

// ─── HEATMAP ─────────────────────────────────────────────────────────────────
// Builds a 7-row × N-week grid from raw heatmap data from /dashboard/simple-heatmap
const HEAT_COLORS = ["#E8F5EE", "#A8D5BA", "#52A477", "#327756", "#1E4631"];

function buildHeatGrid(heatmap) {
  // heatmap shape: { dates: { "2026-03-01": 0.4, ... } } or array
  const dateMap = {};
  if (heatmap) {
    if (Array.isArray(heatmap)) {
      heatmap.forEach((item) => {
        if (item.date || item.date_only) {
          const key = (item.date || item.date_only).slice(0, 10);
          dateMap[key] = item.completionRate ?? item.value ?? 0;
        }
      });
    } else if (typeof heatmap === "object") {
      // Some APIs return { dates: {}, summary: {} }
      const raw = heatmap.dates || heatmap;
      Object.entries(raw).forEach(([k, v]) => {
        dateMap[k] = typeof v === "number" ? v : (v?.completionRate ?? 0);
      });
    }
  }

  const today = new Date();
  // Go back to the Sunday that is NUM_WEEKS weeks ago
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - today.getDay() - (NUM_WEEKS - 1) * 7);

  const cells = []; // [{ dateStr, intensity 0-1, col, row }]
  let col = 0;
  let cursor = new Date(startDay);
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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function HeatmapGrid({ heatmap }) {
  const { cells, numCols, monthLabels } = useMemo(() => buildHeatGrid(heatmap), [heatmap]);
  const totalCols = Math.max(numCols, NUM_WEEKS);
  const svgWidth = totalCols * CELL_STEP;
  const headerH = 18;
  const svgHeight = headerH + 7 * CELL_STEP;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={svgWidth} height={svgHeight}>
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
    </ScrollView>
  );
}

// ─── WEEKLY BAR CHART ─────────────────────────────────────────────────────────
const BAR_MAX_HEIGHT = 100;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/**
 * weeklyProgress shape from /dashboard/weekly-progress:
 * Array of { day_label: "Mon", categories: { Health: 0.8, Study: 0.4, Personal: 0.6 } }
 * OR
 * { week: [{ day: "Mon", health: 0.8, study: 0.4 }] }
 *
 * We normalise into: [{ day, segments: [{category, ratio}] }]
 */
function normaliseWeeklyData(weeklyProgress) {
  if (!weeklyProgress) return DAY_LABELS.map((d) => ({ day: d, segments: [] }));

  const raw = Array.isArray(weeklyProgress)
    ? weeklyProgress
    : weeklyProgress.week || weeklyProgress.data || [];

  if (!raw.length) return DAY_LABELS.map((d) => ({ day: d, segments: [] }));

  return raw.map((entry, i) => {
    const day = DAY_LABELS[i] ?? entry.day_label?.[0] ?? entry.day?.[0] ?? DAY_LABELS[i];
    const cats = entry.categories || {};
    const segments = Object.entries(cats).map(([cat, ratio]) => ({
      category: cat,
      ratio: Math.min(Number(ratio) || 0, 1),
    }));
    // Fallback: parse flat fields like { health: 0.8, study: 0.4 }
    if (!segments.length) {
      ["health", "study", "personal", "mindfulness"].forEach((cat) => {
        if (entry[cat] != null) {
          segments.push({ category: cat, ratio: Math.min(Number(entry[cat]) || 0, 1) });
        }
      });
    }
    return { day, segments };
  });
}

function WeeklyBarChart({ weeklyProgress, colors }) {
  const data = useMemo(() => normaliseWeeklyData(weeklyProgress), [weeklyProgress]);
  const uniqueCats = useMemo(() => {
    const s = new Set();
    data.forEach((d) => d.segments.forEach((seg) => s.add(seg.category)));
    return [...s];
  }, [data]);

  return (
    <View>
      <View style={wStyles.chartRow}>
        {data.map((entry, i) => {
          const totalRatio = entry.segments.reduce((sum, s) => sum + s.ratio, 0);
          const barH = Math.max(4, Math.min(totalRatio * BAR_MAX_HEIGHT, BAR_MAX_HEIGHT));
          let currentBottom = 0;
          const segments = [...entry.segments].reverse(); // render bottom-up

          return (
            <View key={i} style={wStyles.barCol}>
              <View style={wStyles.barWrapper}>
                <View style={[wStyles.barContainer, { height: BAR_MAX_HEIGHT }]}>
                  {entry.segments.length > 0 ? (
                    <View style={[wStyles.barStack, { height: barH }]}>
                      {segments.map((seg, si) => {
                        const segH = (seg.ratio / Math.max(totalRatio, 1)) * barH;
                        const color = CATEGORY_COLORS[seg.category] || CATEGORY_COLORS.default;
                        return (
                          <View
                            key={si}
                            style={[wStyles.barSegment, { height: segH, backgroundColor: color }]}
                          />
                        );
                      })}
                    </View>
                  ) : (
                    <View style={[wStyles.barStack, { height: 6, backgroundColor: colors.border }]} />
                  )}
                </View>
              </View>
              <Text style={[wStyles.dayLabel, { color: colors.textMuted }]}>{entry.day}</Text>
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
                style={[wStyles.legendDot, { backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.default }]}
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
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    justifyContent: "flex-end",
    width: 22,
  },
  barStack: {
    width: 22,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barSegment: {
    width: "100%",
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
});

// ─── HABIT ICON MAP ──────────────────────────────────────────────────────────
function HabitIcon({ name, color, size = 18 }) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("workout") || lower.includes("exercise") || lower.includes("gym"))
    return <Dumbbell size={size} color={color} />;
  if (lower.includes("meditat") || lower.includes("mindful") || lower.includes("breath"))
    return <Sparkles size={size} color={color} />;
  if (lower.includes("read") || lower.includes("book") || lower.includes("study"))
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
function HabitPerformanceCard({ habit, checkins, colors }) {
  const stats = useMemo(() => calculateHabitStats(checkins || [], habit), [checkins, habit]);

  const rate7d = useMemo(() => {
    if (!checkins || checkins.length === 0) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCheckins = checkins.filter((c) => {
      const d = new Date(c.date_only || c.date);
      return d >= sevenDaysAgo;
    });
    const completed = recentCheckins.filter(
      (c) => (c.completedCount || 0) >= Math.max(1, habit.targetPerDay || 1)
    ).length;
    return Math.round((completed / 7) * 100);
  }, [checkins, habit]);

  const isAtRisk = rate7d < 50;
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
          <Text style={[s.habitStreak, { color: isAtRisk ? "#E53E3E" : colors.textMuted }]}>
            {isAtRisk
              ? "⏱ At Risk"
              : stats.currentStreak > 0
              ? `🔥 ${stats.currentStreak}d streak`
              : "No active streak"}
          </Text>
          <Text style={[s.habitRateLabel, { color: isAtRisk ? "#E53E3E" : colors.textMuted }]}>
            7d Rate
          </Text>
        </View>
        <Text style={[s.habitBest, { color: colors.textMuted }]}>
          Best: {stats.longestStreak}d • Total: {stats.totalCompletions}
        </Text>
      </View>
    </View>
  );
}

// ─── SUMMARY CARDS ───────────────────────────────────────────────────────────
function deriveSummary(summary, goals) {
  // /dashboard/summary shape:
  //   { todayCompletionRate, activeHabitsCount, atRiskCount, weekTrend, ... }
  // Fallback: derive from goals data
  let todayScore = 0;
  let todayTrend = null;
  let activeHabits = 0;
  let riskCount = 0;

  if (summary) {
    todayScore = Math.round(
      (summary.todayCompletionRate ?? summary.today_completion_rate ?? summary.todayScore ?? 0) * 100
    );
    // Some APIs return 0-100 directly
    if (todayScore > 1 && todayScore <= 100) {
      // already in percentage
    } else if (summary.todayCompletionRate > 1) {
      todayScore = Math.round(summary.todayCompletionRate);
    }
    todayTrend = summary.weekTrend ?? summary.week_trend ?? null;
    activeHabits = summary.activeHabitsCount ?? summary.active_habits_count ?? summary.activeHabits ?? 0;
    riskCount = summary.atRiskCount ?? summary.at_risk_count ?? summary.riskCount ?? 0;
  }

  // If no API data yet, derive from goals
  if (!summary && goals && Array.isArray(goals)) {
    activeHabits = goals.length;
    riskCount = goals.filter((g) => g.progressPercent < 50).length;
  }

  return { todayScore, todayTrend, activeHabits, riskCount };
}

// ─── FILTER CATEGORIES from goals data ──────────────────────────────────────
function groupByCategory(goals) {
  const groups = {};
  if (!Array.isArray(goals)) return groups;
  goals.forEach((item) => {
    // goals data from /dashboard/goals has habit info
    const habit = item.habit || item;
    const cat = (habit.category || "Other").trim();
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(habit);
  });
  return groups;
}

// ─── MASCOT MESSAGE ──────────────────────────────────────────────────────────
function buildMascotMessage(goals, selectedMascot) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return { text: "Keep building great habits! Every day counts.", name: "Your Mascot" };
  }

  const atRisk = goals.filter((g) => {
    const rate = g.sevenDayRate ?? g.seven_day_rate ?? (g.progressPercent || 0) / 100;
    return rate < 0.5;
  });

  const crushing = goals.filter((g) => {
    const rate = g.sevenDayRate ?? g.seven_day_rate ?? (g.progressPercent || 0) / 100;
    return rate >= 0.8;
  });

  let msg = "";
  if (crushing.length > 0 && atRisk.length === 0) {
    msg = `You're crushing all your habits! Keep this incredible momentum going!`;
  } else if (atRisk.length > 0 && crushing.length > 0) {
    const atRiskName = atRisk[0]?.habit?.name || atRisk[0]?.name || "that habit";
    const crushingCat = crushing[0]?.habit?.category || "your strong categories";
    msg = `You're crushing it on ${crushingCat}, but ${atRiskName} needs some love today. Don't let that streak slip away!`;
  } else if (atRisk.length > 0) {
    const atRiskName = atRisk[0]?.habit?.name || atRisk[0]?.name || "some habits";
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

  const {
    summary,
    heatmap,
    weeklyProgress,
    goals,
    isLoading,
    error,
    loadDashboardData,
    checkinsByHabit,
  } = useDashboardStore();

  const { selectedMascot } = useMascotStore();
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Derived state from store data
  const { todayScore, todayTrend, activeHabits, riskCount } = useMemo(
    () => deriveSummary(summary, goals),
    [summary, goals]
  );

  const categoryGroups = useMemo(() => groupByCategory(goals), [goals]);
  const categories = useMemo(() => ["All", ...Object.keys(categoryGroups)], [categoryGroups]);

  const filteredGroups = useMemo(() => {
    if (activeFilter === "All") return categoryGroups;
    return categoryGroups[activeFilter] ? { [activeFilter]: categoryGroups[activeFilter] } : {};
  }, [activeFilter, categoryGroups]);

  const mascotMsg = useMemo(() => buildMascotMessage(goals, selectedMascot), [goals, selectedMascot]);

  const styles = useMemo(() => makeStyles(C), [C]);

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
              Share.share({ message: `My habit consistency today: ${todayScore}%` })
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── SUMMARY CARDS ─────────────────────────────────────────────── */}
        <View style={styles.summaryRow}>
          {/* Today % */}
          <View style={[styles.summaryCard, { backgroundColor: "#3E6669" }]}>
            <Text style={styles.summaryLabel}>Today %</Text>
            <Text style={styles.summaryValue} adjustsFontSizeToFit numberOfLines={1}>
              {todayScore}%
            </Text>
            {todayTrend != null && (
              <View style={styles.summarySubRow}>
                <TrendingUp size={10} color="#fff" />
                <Text style={styles.summarySub}>{` ${todayTrend > 0 ? "+" : ""}${
                  typeof todayTrend === "number" ? todayTrend.toFixed(1) + "%" : todayTrend
                }`}</Text>
              </View>
            )}
          </View>

          {/* Active Habits */}
          <View style={[styles.summaryCard, { backgroundColor: "#327756" }]}>
            <Text style={styles.summaryLabel}>Active</Text>
            <Text style={styles.summaryValue} adjustsFontSizeToFit numberOfLines={1}>
              {activeHabits}
            </Text>
            <Text style={styles.summarySub}>Current{"\n"}Habits</Text>
          </View>

          {/* At Risk */}
          <View style={[styles.summaryCard, { backgroundColor: "#4A6A8F" }]}>
            <Text style={styles.summaryLabel}>At Risk</Text>
            <Text style={styles.summaryValue} adjustsFontSizeToFit numberOfLines={1}>
              {riskCount}
            </Text>
            <View style={styles.summarySubRow}>
              <AlertTriangle size={10} color="#fff" />
              <Text style={styles.summarySub}>{" "}Action{"\n"}Needed</Text>
            </View>
          </View>
        </View>

        {/* ── CONSISTENCY HEATMAP ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Consistency</Text>
            <Text style={[styles.cardSubtitle, { color: C.textMuted }]}>Last 3 Months</Text>
          </View>
          <HeatmapGrid heatmap={heatmap} />
          {/* Legend */}
          <View style={styles.legendRow}>
            <Text style={[styles.legendLabel, { color: C.textMuted }]}>Less</Text>
            {HEAT_COLORS.map((hc, i) => (
              <View key={i} style={[styles.legendCell, { backgroundColor: hc }]} />
            ))}
            <Text style={[styles.legendLabel, { color: C.textMuted }]}>More</Text>
          </View>
        </View>

        {/* ── WEEKLY PROGRESS ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Weekly Progress</Text>
            <View style={[styles.weekPill, { backgroundColor: C.background }]}>
              <Text style={[styles.weekPillText, { color: C.text }]}>This Week ▾</Text>
            </View>
          </View>
          <WeeklyBarChart weeklyProgress={weeklyProgress} colors={C} />
        </View>

        {/* ── PERFORMANCE ───────────────────────────────────────────────── */}
        <Text style={[styles.pageTitle, { marginBottom: 14 }]}>Performance</Text>

        {/* Category chips */}
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
                  : { backgroundColor: C.surface, borderColor: C.border, borderWidth: 1 },
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
        {Object.keys(filteredGroups).length === 0 ? (
          <View style={styles.emptyState}>
            <BarChart2 size={32} color={C.textMuted} />
            <Text style={[styles.emptyText, { color: C.textMuted }]}>
              No habit data yet. Complete some habits to see your performance!
            </Text>
          </View>
        ) : (
          Object.entries(filteredGroups).map(([cat, habits]) => (
            <View key={cat}>
              <Text style={[styles.catLabel, { color: C.textMuted }]}>
                {cat.toUpperCase()}
              </Text>
              {habits.map((habit, i) => {
                const habitCheckins = (checkinsByHabit || {})[habit.id] || [];
                return (
                  <HabitPerformanceCard
                    key={habit.id ?? i}
                    habit={habit}
                    checkins={habitCheckins}
                    colors={C}
                  />
                );
              })}
            </View>
          ))
        )}

        {/* ── MASCOT NOTE ───────────────────────────────────────────────── */}
        <View style={[styles.mascotCard, { backgroundColor: C.successLight }]}>
          <View style={[styles.mascotIconBg, { backgroundColor: "#2D4A3E" }]}>
            {/* Simple smiley mascot face */}
            <Text style={{ fontSize: 22 }}>🐾</Text>
          </View>
          <View style={styles.mascotContent}>
            <Text style={[styles.mascotText, { color: "#2D4A3E" }]}>{mascotMsg.text}</Text>
            <Text style={[styles.mascotName, { color: "#2D4A3E" }]}>{mascotMsg.name}</Text>
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
      minHeight: 120,
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export default DashboardScreen;
