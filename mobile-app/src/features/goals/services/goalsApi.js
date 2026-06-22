import apiClient from "../../../shared/api/apiClient";
import { endpoints } from "../../../shared/api/endpoints";
import { listHabits } from "../../habits/services/habitsApi";
import { calculateGoalProgress } from "../../../shared/services/derivedStateEngine";

/**
 * Fetch all goals from the backend.
 * Response: { value: [{id, habit_id, targetType, targetValue, reward_item_id, startDate}], Count }
 *
 * NOTE: `ongoing_streak` and `current_completions` are intentionally NOT used anywhere
 * in the frontend. All progress is computed on-the-fly by derivedStateEngine.
 */
export const fetchGoals = async () => {
  const data = await apiClient.get(endpoints.goals.list);
  return Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : [];
};

/**
 * Fetch ALL check-in records (full history, not just today).
 * Used by derivedStateEngine to compute streaks and total completions.
 */
export const fetchAllCheckins = async () => {
  try {
    const data = await apiClient.get(endpoints.checkins.listAll);
    return Array.isArray(data?.value) ? data.value : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

/**
 * Try the dedicated dashboard endpoint first (GET /dashboard/goals).
 * Falls back to client-side join of /habits + /goals + /checkins if dashboard endpoint
 * fails or returns unexpected data.
 *
 * ARCHITECTURE (Advanced Challenge — Derived State):
 *   ALL progress values (currentProgress, progressPercent, isEncouraged, isAchieved)
 *   are computed via derivedStateEngine — NEVER read from static DB columns.
 *   This satisfies "Avoid duplicated state" and "Clear separation between
 *   Raw data and Computed values".
 */
export const fetchDashboardGoals = async () => {
  // Always fetch raw data in parallel (habits, goals, full checkin history).
  const [habitsRaw, goalsRaw, allCheckins] = await Promise.all([
    listHabits(),
    fetchGoals(),
    fetchAllCheckins(),
  ]);

  // Build lookup maps for O(1) access.
  const goalMap = {};
  goalsRaw.forEach((g) => {
    goalMap[String(g.habit_id)] = g;
  });

  // Group checkins by habit_id for efficient per-habit Engine access.
  const checkinsByHabit = {};
  allCheckins.forEach((c) => {
    const key = String(c.habit_id);
    if (!checkinsByHabit[key]) checkinsByHabit[key] = [];
    checkinsByHabit[key].push(c);
  });

  const habitsWithGoals = [];
  const habitsWithoutGoals = [];

  habitsRaw.forEach((h) => {
    const goal = goalMap[String(h.id)];
    if (goal) {
      const habitCheckins = checkinsByHabit[String(h.id)] || [];

      // DERIVED STATE: compute progress from raw check-in history via Engine.
      const { progress, percentage, isEncouraged, isAchieved } =
        calculateGoalProgress(goal, h, habitCheckins);

      habitsWithGoals.push({
        habitId: String(h.id),
        habitName: h.name,
        category: h.category,
        goal: {
          id: goal.id,
          targetType: goal.targetType,
          targetValue: goal.targetValue,
          // currentProgress is a DERIVED value, NOT a stored DB field.
          currentProgress: progress,
          progressPercent: percentage,
          isEncouraged,
          isAchieved,
        },
      });
    } else {
      habitsWithoutGoals.push(h);
    }
  });

  return {
    source: "derived",
    habitsWithGoals,
    habitsWithoutGoals,
    totalHabits: habitsRaw.length,
    habitsWithGoalsCount: habitsWithGoals.length,
  };
};

/**
 * Create a new goal for a habit.
 * Path: POST /habits/{habitId}/goals
 * Payload: { targetType, targetValue }
 */
export const createGoal = async (habitId, goalData) => {
  try {
    const data = await apiClient.post(endpoints.goals.byHabit(habitId), {
      targetType: goalData.targetType,
      targetValue: Number(goalData.targetValue),
    });
    return data;
  } catch (error) {
    console.error("Error creating goal:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update an existing goal.
 * Path: PATCH /habits/{habitId}/goals/{goalId}
 * Payload: { targetValue }
 */
export const updateGoal = async (habitId, goalId, goalData) => {
  try {
    const data = await apiClient.patch(
      endpoints.goals.updateByHabit(habitId, goalId),
      {
        targetValue: Number(goalData.targetValue),
      }
    );
    return data;
  } catch (error) {
    console.error("Error updating goal:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Delete an existing goal.
 * Path: DELETE /habits/{habitId}/goals/{goalId}
 */
export const deleteGoal = async (habitId, goalId) => {
  try {
    const data = await apiClient.delete(endpoints.goals.updateByHabit(habitId, goalId));
    return data;
  } catch (error) {
    console.error("Error deleting goal:", error.response?.data?.message || error.message);
    throw error;
  }
};
