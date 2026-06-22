import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGoal, updateGoal, deleteGoal } from "../services/goalsApi";

const GOALS_DASHBOARD_CACHE_KEY = "@dashboard_goals_cache_v2";

export function useGoalMutations() {
  const queryClient = useQueryClient();

  // Helper to persist data to AsyncStorage for offline fallback
  const persistCache = async (data) => {
    try {
      await AsyncStorage.setItem(GOALS_DASHBOARD_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to persist goals cache to AsyncStorage:", err);
    }
  };

  // 1. Create Goal Mutation
  const createMutation = useMutation({
    mutationFn: ({ habitId, targetType, targetValue }) =>
      createGoal(habitId, { targetType, targetValue }),
    onMutate: async ({ habitId, habitName, category, targetType, targetValue }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["dashboard_goals_v2"] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["dashboard_goals_v2"]);

      // Optimistically update to the new value
      if (previousData) {
        const nextData = { ...previousData };
        nextData.habitsWithoutGoals = (previousData.habitsWithoutGoals || []).filter(
          (h) => String(h.id) !== String(habitId)
        );

        const alreadyExists = (previousData.habitsWithGoals || []).some(
          (h) => String(h.habitId) === String(habitId)
        );

        if (!alreadyExists) {
          const newGoalItem = {
            habitId: String(habitId),
            habitName: habitName,
            category: category,
            goal: {
              id: "temp_" + Date.now(),
              targetType,
              targetValue: Number(targetValue),
              currentProgress: 0,
              progressPercent: 0,
            },
          };
          nextData.habitsWithGoals = [...(previousData.habitsWithGoals || []), newGoalItem];
          nextData.habitsWithGoalsCount = (previousData.habitsWithGoalsCount || 0) + 1;
        }

        queryClient.setQueryData(["dashboard_goals_v2"], nextData);
        // Persist to local cache immediately
        await persistCache(nextData);
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(["dashboard_goals_v2"], context.previousData);
        persistCache(context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["dashboard_goals_v2"] });
    },
  });

  // 2. Update Goal Mutation
  const updateMutation = useMutation({
    mutationFn: ({ habitId, goalId, targetValue }) =>
      updateGoal(habitId, goalId, { targetValue }),
    onMutate: async ({ habitId, goalId, targetValue }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard_goals_v2"] });
      const previousData = queryClient.getQueryData(["dashboard_goals_v2"]);

      if (previousData) {
        const nextData = { ...previousData };
        nextData.habitsWithGoals = (previousData.habitsWithGoals || []).map((item) => {
          if (String(item.habitId) === String(habitId)) {
            const nextGoal = { ...item.goal, targetValue: Number(targetValue) };
            const current = nextGoal.currentProgress || 0;
            nextGoal.progressPercent =
              nextGoal.targetValue > 0 ? Math.min((current / nextGoal.targetValue) * 100, 100) : 0;
            return { ...item, goal: nextGoal };
          }
          return item;
        });

        queryClient.setQueryData(["dashboard_goals_v2"], nextData);
        await persistCache(nextData);
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["dashboard_goals_v2"], context.previousData);
        persistCache(context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_goals_v2"] });
    },
  });

  // 3. Delete Goal Mutation (optional cleanup, helpful fallback)
  const deleteMutation = useMutation({
    mutationFn: ({ habitId, goalId }) => deleteGoal(habitId, goalId),
    onMutate: async ({ habitId, goalId }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard_goals_v2"] });
      const previousData = queryClient.getQueryData(["dashboard_goals_v2"]);

      if (previousData) {
        const nextData = { ...previousData };
        const removedItem = (previousData.habitsWithGoals || []).find(
          (item) => String(item.habitId) === String(habitId)
        );

        if (removedItem) {
          nextData.habitsWithGoals = (previousData.habitsWithGoals || []).filter(
            (item) => String(item.habitId) !== String(habitId)
          );
          nextData.habitsWithoutGoals = [
            ...(previousData.habitsWithoutGoals || []),
            {
              id: Number(habitId),
              name: removedItem.habitName,
              category: removedItem.category,
            },
          ];
          nextData.habitsWithGoalsCount = Math.max(0, (previousData.habitsWithGoalsCount || 1) - 1);
        }

        queryClient.setQueryData(["dashboard_goals_v2"], nextData);
        await persistCache(nextData);
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["dashboard_goals_v2"], context.previousData);
        persistCache(context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_goals_v2"] });
    },
  });

  return {
    createGoal: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateGoal: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteGoal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
