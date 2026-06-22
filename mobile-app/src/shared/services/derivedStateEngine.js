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
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
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
  const isSpecific = (habit?.frequency || "").toLowerCase().includes("specific") ||
    (habit?.daysOfWeek?.length > 0 && (habit?.frequency || "").toLowerCase() !== "daily");
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

  let cursor = new Date(todayDate);
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
  return (checkins || []).filter((c) => (c.completedCount || 0) >= target).length;
}

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
    return { progress: 0, percentage: 0, isEncouraged: false, isAchieved: false };
  }

  const targetPerDay = Math.max(1, habit.targetPerDay || 1);
  const targetValue = Math.max(1, goal.targetValue || 1);

  // Filter checkins to only those that hit the daily target.
  const completedCheckins = (checkins || []).filter(
    (c) => (c.completedCount || 0) >= targetPerDay
  );

  // Build a sorted DESC list of completion dates.
  const completedDates = completedCheckins
    .map((c) => toDateOnly(c.date_only || c.date))
    .filter(Boolean)
    .sort()
    .reverse(); // DESC (newest first)

  let progress = 0;

  const isStreak =
    (goal.targetType || "").toLowerCase() === "streak";

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
  const totalCompletions = completeTotalCompletions(checkins, targetPerDay);

  return { currentStreak, longestStreak, totalCompletions };
}

// Internal alias to avoid typo in export above
function completeTotalCompletions(checkins, targetPerDay) {
  return computeTotalCompletions(checkins, targetPerDay);
}
