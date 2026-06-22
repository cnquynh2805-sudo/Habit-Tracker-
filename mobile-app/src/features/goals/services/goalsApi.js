import apiClient from "../../../shared/api/apiClient";
import { endpoints } from "../../../shared/api/endpoints";
import { listHabits } from "../../habits/services/habitsApi";

/**
 * Fetch all goals from the backend.
 * Response: { value: [{id, habit_id, targetType, targetValue, ongoing_streak, current_completions, startDate}], Count }
 */
export const fetchGoals = async () => {
  const data = await apiClient.get(endpoints.goals.list);
  // API wraps items in a "value" array
  return Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : [];
};

/**
 * Try the dedicated dashboard endpoint first (GET /dashboard/goals).
 * Falls back to client-side join of /habits + /goals if dashboard endpoint fails (e.g. 500).
 *
 * Expected dashboard response shape (if working):
 *   { habitsWithGoals: [...], habitsWithoutGoals: [...], totalHabits: N, habitsWithGoalsCount: N }
 */
export const fetchDashboardGoals = async () => {
  try {
    const data = await apiClient.get(endpoints.goals.dashboard);
    if (data && (data.habitsWithGoals || data.habitsWithoutGoals)) {
      return { source: "dashboard", ...data };
    }
    // Dashboard didn't return expected shape — fall through to manual join
  } catch (_) {
    // Dashboard endpoint unavailable — use manual join
  }

  // Manual join: fetch habits + goals in parallel
  const [habitsRaw, goalsRaw] = await Promise.all([
    listHabits(),
    fetchGoals(),
  ]);

  // Build a map: habit_id -> goal
  const goalMap = {};
  goalsRaw.forEach((g) => {
    goalMap[String(g.habit_id)] = g;
  });

  const habitsWithGoals = [];
  const habitsWithoutGoals = [];

  habitsRaw.forEach((h) => {
    const goal = goalMap[String(h.id)];
    if (goal) {
      // Calculate progress
      const isStreak = goal.targetType === "Streak";
      const currentProgress = isStreak
        ? (goal.ongoing_streak || 0)
        : (goal.current_completions || 0);
      const progressPercent =
        goal.targetValue > 0
          ? Math.min((currentProgress / goal.targetValue) * 100, 100)
          : 0;

      habitsWithGoals.push({
        habitId: String(h.id),
        habitName: h.name,
        category: h.category,
        goal: {
          id: goal.id,
          targetType: goal.targetType,
          targetValue: goal.targetValue,
          currentProgress,
          progressPercent,
        },
      });
    } else {
      habitsWithoutGoals.push(h);
    }
  });

  return {
    source: "manual",
    habitsWithGoals,
    habitsWithoutGoals,
    totalHabits: habitsRaw.length,
    habitsWithGoalsCount: habitsWithGoals.length,
  };
};
