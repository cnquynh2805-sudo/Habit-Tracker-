/**
 * derivedStateEngine.js
 *
 * ARCHITECTURE NOTE:
 * This module is the single source of truth for ALL computed/derived values
 * in the Habit Tracker app. It fulfills the Advanced Challenge requirement:
 *   - "Avoid duplicated state"
 *   - "All streaks, totals, percentages, and warnings must be derived from source data"
 *   - "Clear separation between Raw data (habits/check-ins) and Computed values"
 *
 * These are PURE FUNCTIONS — no side effects, no API calls, no React hooks.
 * Inputs: raw habit and checkin arrays from the server.
 * Outputs: computed values ready for UI consumption.
 *
 * Future: if a real backend is added, only the data-fetching hooks need to
 * change. This engine and the UI components remain untouched (plug-and-play).
 */

/**
 * Parse a date string (YYYY-MM-DD) or timestamp into a normalized "YYYY-MM-DD" string.
 * Returns null if the input is falsy or unparseable.
 * @param {string|number|Date} rawDate
 * @returns {string|null}
 */
function toDateOnly(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }
  try {
    const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Given a Date object, return the "YYYY-MM-DD" string for its day of week.
 * dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 * @param {Date} d
 * @returns {number} 0-6
 */
function getDayOfWeek(d) {
  return new Date(d).getDay();
}

/**
 * Map the habit's daysOfWeek strings (e.g. ["Mon","Tue"]) to JS day-of-week numbers (0-6).
 * Supports both full names and 3-letter abbreviations (case-insensitive).
 * @param {string[]} daysOfWeek
 * @returns {Set<number>}
 */
function parseDaysOfWeek(daysOfWeek) {
  const MAP = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
  };
  const set = new Set();
  (daysOfWeek || []).forEach((d) => {
    const key = d.toLowerCase().slice(0, 3);
    const num = MAP[key] ?? MAP[d.toLowerCase()];
    if (num !== undefined) set.add(num);
  });
  return set;
}

/**
 * Check if a habit is scheduled on a given date.
 * @param {object} habit - { frequency, daysOfWeek }
 * @param {Date} date
 * @returns {boolean}
 */
function isHabitScheduledOn(habit, date) {
  const freq = (habit?.frequency || "").toLowerCase();
  if (freq === "daily" || !habit?.daysOfWeek?.length) return true;
  const scheduledDays = parseDaysOfWeek(habit.daysOfWeek);
  return scheduledDays.has(getDayOfWeek(date));
}

/**
 * Given a sorted (DESC) array of completed date strings ["2024-06-20","2024-06-19",...],
 * and the habit's frequency config, count the current streak.
 *
 * "Daily" habit: each consecutive day must be in the set.
 * "Specific days" habit: only the scheduled weekdays count; other days are skipped.
 *
 * Algorithm:
 *  1. Start from today (or yesterday if today not yet completed).
 *  2. Walk backwards day by day.
 *  3. For "specific days" habits, skip non-scheduled days silently.
 *  4. Stop counting as soon as a scheduled day has no completed entry.
 *
 * @param {string[]} completedDates - YYYY-MM-DD strings, sorted DESC (newest first)
 * @param {object} habit - { frequency: "Daily"|"Specific", daysOfWeek: [...] }
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
function computeStreak(completedDates, habit) {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completedSet = new Set(completedDates);
  const isSpecific =
    (habit?.frequency || "").toLowerCase().includes("specific") ||
    (habit?.daysOfWeek?.length > 0 &&
      (habit?.frequency || "").toLowerCase() !== "daily");
  const scheduledDays = isSpecific ? parseDaysOfWeek(habit.daysOfWeek) : null;

  const todayStr = toDateOnly(new Date());
  const todayDate = new Date(todayStr);

  let currentStreak = 0;
  let longestStreak = 0;
  let runStreak = 0;

  // Walk backwards from today over the full sorted date range.
  // We iterate day-by-day for correctness.
  const oldestDate = new Date(completedDates[completedDates.length - 1]);

  // Extend 1 day before oldest to ensure last day is checked.
  const limit = new Date(oldestDate);
  limit.setDate(limit.getDate() - 1);

  const cursor = new Date(todayDate);
  let currentStreakFinished = false;

  while (cursor > limit) {
    const cursorStr = toDateOnly(cursor);
    const dayOfWeek = getDayOfWeek(cursor);

    // For specific-days habits: skip non-scheduled days (they don't break streak).
    const isScheduled = isSpecific ? scheduledDays.has(dayOfWeek) : true;

    if (isScheduled) {
      if (completedSet.has(cursorStr)) {
        runStreak += 1;
        if (!currentStreakFinished) currentStreak = runStreak;
        if (runStreak > longestStreak) longestStreak = runStreak;
      } else {
        // Today not completed yet → don't break current streak, just don't count it.
        if (cursorStr === todayStr) {
          // Don't break streak for today being incomplete.
        } else {
          // Gap found: finish counting current streak.
          if (!currentStreakFinished) currentStreakFinished = true;
          runStreak = 0;
        }
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, longestStreak };
}

/**
 * Count the total number of days where completedCount >= targetPerDay.
 * @param {Array<{completedCount: number, date_only: string}>} checkins - raw checkin records for a habit
 * @param {number} targetPerDay
 * @returns {number}
 */
function computeTotalCompletions(checkins, targetPerDay) {
  const target = Math.max(1, targetPerDay || 1);
  return (checkins || []).filter((c) => (c.completedCount || 0) >= target)
    .length;
}

// ─── DASHBOARD DERIVED STATE FUNCTIONS ───────────────────────────────────────

/**
 * Build an index of checkins grouped by habit_id for O(1) lookups.
 * @param {Array} checkins - flat raw checkins array
 * @returns {Map<number, Array>}
 */
function buildCheckinIndex(checkins) {
  const index = new Map();
  (checkins || []).forEach((c) => {
    const hid = c.habit_id;
    if (hid == null) return;
    if (!index.has(hid)) index.set(hid, []);
    index.get(hid).push(c);
  });
  return index;
}

/**
 * Compute today's completion score as a percentage (0–100).
 * Score = (habits completed today / habits scheduled today) * 100
 *
 * @param {Array} habits - raw habits array
 * @param {Array} checkins - raw checkins array (90-day window)
 * @returns {number} 0–100
 */
export function computeTodayScore(habits, checkins) {
  const today = new Date();
  const todayStr = toDateOnly(today);

  const activeHabits = (habits || []).filter(
    (h) => h.isActive !== false && isHabitScheduledOn(h, today),
  );
  if (activeHabits.length === 0) return 0;

  const checkinIndex = buildCheckinIndex(checkins);

  let completed = 0;
  activeHabits.forEach((habit) => {
    const habitCheckins = checkinIndex.get(habit.id) || [];
    const todayCheckin = habitCheckins.find(
      (c) => (c.date_only || c.date || "").slice(0, 10) === todayStr,
    );
    if (
      todayCheckin &&
      (todayCheckin.completedCount || 0) >= Math.max(1, habit.targetPerDay || 1)
    ) {
      completed++;
    }
  });

  return Math.round((completed / activeHabits.length) * 100);
}

/**
 * Compute today's trend as delta vs yesterday's score.
 * @param {Array} habits
 * @param {Array} checkins
 * @returns {number} signed delta (e.g. +12.5 or -8.0)
 */
export function computeTodayTrend(habits, checkins) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateOnly(yesterday);

  const checkinIndex = buildCheckinIndex(checkins);

  const scheduledYesterday = (habits || []).filter(
    (h) => h.isActive !== false && isHabitScheduledOn(h, yesterday),
  );
  if (scheduledYesterday.length === 0) return 0;

  let completedYesterday = 0;
  scheduledYesterday.forEach((habit) => {
    const habitCheckins = checkinIndex.get(habit.id) || [];
    const yCheckin = habitCheckins.find(
      (c) => (c.date_only || c.date || "").slice(0, 10) === yesterdayStr,
    );
    if (
      yCheckin &&
      (yCheckin.completedCount || 0) >= Math.max(1, habit.targetPerDay || 1)
    ) {
      completedYesterday++;
    }
  });

  const yesterdayScore = Math.round(
    (completedYesterday / scheduledYesterday.length) * 100,
  );
  const todayScore = computeTodayScore(habits, checkins);

  return +(todayScore - yesterdayScore).toFixed(1);
}

/**
 * Compute a full dashboard summary object.
 *
 * @param {Array} habits
 * @param {Array} checkins
 * @param {Array} goals
 * @returns {{ todayScore: number, todayTrend: number, activeHabits: number, atRisk: number }}
 */
export function computeDashboardSummary(habits, checkins, goals) {
  const activeHabits = (habits || []).filter(
    (h) => h.isActive !== false,
  ).length;
  const checkinIndex = buildCheckinIndex(checkins);

  // At-risk: habits scheduled in the last 7 days with < 50% completion rate OR active today but not completed
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const today = new Date();
  const todayStr = toDateOnly(today);

  let atRisk = 0;
  (habits || [])
    .filter((h) => h.isActive !== false)
    .forEach((habit) => {
      const habitCheckins = checkinIndex.get(habit.id) || [];
      const targetPerDay = Math.max(1, habit.targetPerDay || 1);

      const recentCompleted = habitCheckins.filter((c) => {
        const d = new Date((c.date_only || c.date || "").slice(0, 10));
        return d >= sevenDaysAgo && (c.completedCount || 0) >= targetPerDay;
      }).length;
      const denominator =
        habitCheckins.length < 7 ? Math.max(1, habitCheckins.length) : 7;
      const rate7d = Math.round((recentCompleted / denominator) * 100);

      const scheduledToday = isHabitScheduledOn(habit, today);
      const todayCheckin = habitCheckins.find(
        (c) => (c.date_only || c.date || "").slice(0, 10) === todayStr,
      );
      const completedToday = !!(
        todayCheckin && (todayCheckin.completedCount || 0) >= targetPerDay
      );

      const isAtRisk = rate7d < 50 || (scheduledToday && !completedToday);
      if (isAtRisk) atRisk++;
    });

  return {
    todayScore: computeTodayScore(habits, checkins),
    todayTrend: computeTodayTrend(habits, checkins),
    activeHabits,
    atRisk,
  };
}

/**
 * Compute heatmap data for the last N days.
 * Returns an array of { date: "YYYY-MM-DD", completionRate: 0–1 }
 *
 * @param {Array} habits
 * @param {Array} checkins
 * @param {number} days - lookback window (default 90)
 * @returns {Array<{ date: string, completionRate: number }>}
 */
export function computeHeatmap(habits, checkins, days = 90) {
  const checkinIndex = buildCheckinIndex(checkins);
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateOnly(d);

    const scheduledHabits = (habits || []).filter(
      (h) => h.isActive !== false && isHabitScheduledOn(h, d),
    );

    if (scheduledHabits.length === 0) {
      result.push({ date: dateStr, completionRate: 0 });
      continue;
    }

    let completed = 0;
    scheduledHabits.forEach((habit) => {
      const habitCheckins = checkinIndex.get(habit.id) || [];
      const dayCheckin = habitCheckins.find(
        (c) => (c.date_only || c.date || "").slice(0, 10) === dateStr,
      );
      if (
        dayCheckin &&
        (dayCheckin.completedCount || 0) >= Math.max(1, habit.targetPerDay || 1)
      ) {
        completed++;
      }
    });

    result.push({
      date: dateStr,
      completionRate: +(completed / scheduledHabits.length).toFixed(3),
    });
  }

  return result;
}

/**
 * Compute weekly progress for the last 7 days, grouped by category.
 * Returns an array of 7 entries (Mon..Sun), each with:
 *   { day: "M"|"T"|..., categories: { Health: 0.8, Study: 0.5, ... } }
 *
 * @param {Array} habits
 * @param {Array} checkins
 * @returns {Array<{ day: string, categories: Record<string, number> }>}
 */
export function computeWeeklyProgress(habits, checkins) {
  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]; // 0=Sun
  const checkinIndex = buildCheckinIndex(checkins);

  // Build the last 7 days starting from Monday of this week
  const result = [];
  const today = new Date();

  // Start from 6 days ago (inclusive of today → 7 days total)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = toDateOnly(d);
    const dayLabel = DAY_LABELS[d.getDay()];

    const categories = {};
    const scheduledHabits = (habits || []).filter(
      (h) => h.isActive !== false && isHabitScheduledOn(h, d),
    );

    scheduledHabits.forEach((habit) => {
      const cat = habit.category || "Other";
      if (!categories[cat]) categories[cat] = { completed: 0, total: 0 };
      categories[cat].total++;

      const habitCheckins = checkinIndex.get(habit.id) || [];
      const dayCheckin = habitCheckins.find(
        (c) => (c.date_only || c.date || "").slice(0, 10) === dateStr,
      );
      if (
        dayCheckin &&
        (dayCheckin.completedCount || 0) >= Math.max(1, habit.targetPerDay || 1)
      ) {
        categories[cat].completed++;
      }
    });

    // Normalize to ratios
    const ratioCategories = {};
    Object.entries(categories).forEach(([cat, { completed, total }]) => {
      ratioCategories[cat] = total > 0 ? +(completed / total).toFixed(3) : 0;
    });

    result.push({ day: dayLabel, categories: ratioCategories });
  }

  return result;
}

/**
 * Compute performance list for all habits.
 * Each entry contains stats needed for the Performance section habit cards:
 *   { habit, currentStreak, longestStreak, totalCompletions, rate7d }
 *
 * @param {Array} habits
 * @param {Array} checkins
 * @returns {Array<{
 *   habit: object,
 *   currentStreak: number,
 *   longestStreak: number,
 *   totalCompletions: number,
 *   rate7d: number
 * }>}
 */
export function computePerformanceList(habits, checkins) {
  const checkinIndex = buildCheckinIndex(checkins);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const today = new Date();
  const todayStr = toDateOnly(today);

  return (habits || [])
    .filter((h) => h.isActive !== false)
    .map((habit) => {
      const habitCheckins = checkinIndex.get(habit.id) || [];
      const targetPerDay = Math.max(1, habit.targetPerDay || 1);

      // Build sorted DESC completed dates
      const completedDates = habitCheckins
        .filter((c) => (c.completedCount || 0) >= targetPerDay)
        .map((c) => toDateOnly(c.date_only || c.date))
        .filter(Boolean)
        .sort()
        .reverse();

      const { currentStreak, longestStreak } = computeStreak(
        completedDates,
        habit,
      );
      const totalCompletions = computeTotalCompletions(
        habitCheckins,
        targetPerDay,
      );

      // 7-day completion rate (out of 7 calendar days, not just scheduled days)
      const recentCompleted = habitCheckins.filter((c) => {
        const d = new Date((c.date_only || c.date || "").slice(0, 10));
        return d >= sevenDaysAgo && (c.completedCount || 0) >= targetPerDay;
      }).length;
      const denominator =
        habitCheckins.length < 7 ? Math.max(1, habitCheckins.length) : 7;
      const rate7d = Math.round((recentCompleted / denominator) * 100);

      const scheduledToday = isHabitScheduledOn(habit, today);
      const todayCheckin = habitCheckins.find(
        (c) => (c.date_only || c.date || "").slice(0, 10) === todayStr,
      );
      const completedToday = !!(
        todayCheckin && (todayCheckin.completedCount || 0) >= targetPerDay
      );
      const isAtRisk = rate7d < 50 || (scheduledToday && !completedToday);

      return {
        habit,
        currentStreak,
        longestStreak,
        totalCompletions,
        rate7d,
        isAtRisk,
      };
    });
}

// ─── ORIGINAL EXPORTS (preserved for backward compatibility) ─────────────────

/**
 * Calculate goal progress for a single goal, given its associated habit and checkins.
 *
 * @param {object} goal   - { id, targetType: "Streak"|"TotalCompletions", targetValue, startDate }
 * @param {object} habit  - { id, targetPerDay, frequency, daysOfWeek, ... }
 * @param {Array}  checkins - ALL checkin records for this habit (from API, unfiltered by date)
 * @returns {{
 *   progress: number,       // raw count (streak days or total sessions)
 *   percentage: number,     // 0–100 clamped
 *   isEncouraged: boolean,  // true when 80% <= percentage < 100%
 *   isAchieved: boolean,    // true when percentage >= 100%
 * }}
 */
export function calculateGoalProgress(goal, habit, checkins) {
  if (!goal || !habit) {
    return {
      progress: 0,
      percentage: 0,
      isEncouraged: false,
      isAchieved: false,
    };
  }

  const targetPerDay = Math.max(1, habit.targetPerDay || 1);
  const targetValue = Math.max(1, goal.targetValue || 1);

  // Filter checkins to only those that hit the daily target.
  const completedCheckins = (checkins || []).filter(
    (c) => (c.completedCount || 0) >= targetPerDay,
  );

  // Build a sorted DESC list of completion dates.
  const completedDates = completedCheckins
    .map((c) => toDateOnly(c.date_only || c.date))
    .filter(Boolean)
    .sort()
    .reverse(); // DESC (newest first)

  let progress = 0;

  const isStreak = (goal.targetType || "").toLowerCase() === "streak";

  if (isStreak) {
    const { currentStreak } = computeStreak(completedDates, habit);
    progress = currentStreak;
  } else {
    // TotalCompletions
    progress = computeTotalCompletions(checkins, targetPerDay);
  }

  const percentage = Math.min((progress / targetValue) * 100, 100);
  const isEncouraged = percentage >= 80 && percentage < 100;
  const isAchieved = percentage >= 100;

  return { progress, percentage, isEncouraged, isAchieved };
}

/**
 * Calculate streak stats for a single habit (for Today screen / Habit List display).
 *
 * @param {Array}  checkins  - raw checkin records for this habit
 * @param {object} habit     - { targetPerDay, frequency, daysOfWeek }
 * @returns {{ currentStreak: number, longestStreak: number, totalCompletions: number }}
 */
export function calculateHabitStats(checkins, habit) {
  const targetPerDay = Math.max(1, habit?.targetPerDay || 1);

  const completedDates = (checkins || [])
    .filter((c) => (c.completedCount || 0) >= targetPerDay)
    .map((c) => toDateOnly(c.date_only || c.date))
    .filter(Boolean)
    .sort()
    .reverse();

  const { currentStreak, longestStreak } = computeStreak(completedDates, habit);
  const totalCompletions = computeTotalCompletions(checkins, targetPerDay);

  return { currentStreak, longestStreak, totalCompletions };
}
