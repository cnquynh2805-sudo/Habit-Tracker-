import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchDashboardGoals } from "../services/goalsApi";

const GOALS_DASHBOARD_CACHE_KEY = "@dashboard_goals_cache_v2";

/**
 * Hook to get combined goals+habits data for the Goals screen.
 *
 * Data flow:
 *  1. Try React Query cache (persisted to AsyncStorage by QueryProvider)
 *  2. Fetch from /dashboard/goals or /goals + /habits (client-side join fallback)
 *  3. Persist raw result to AsyncStorage as offline fallback
 *
 * Returns normalized data ready for the UI.
 */
export function useDashboardGoals() {
  const query = useQuery({
    queryKey: ["dashboard_goals_v2"],
    queryFn: async () => {
      try {
        const data = await fetchDashboardGoals();
        // Persist to AsyncStorage for manual offline fallback
        await AsyncStorage.setItem(
          GOALS_DASHBOARD_CACHE_KEY,
          JSON.stringify(data)
        );
        return data;
      } catch (err) {
        // Fall back to AsyncStorage cache
        const cached = await AsyncStorage.getItem(GOALS_DASHBOARD_CACHE_KEY);
        if (cached) return JSON.parse(cached);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,   // 5 minutes — data is stale after this
    gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep in memory/persisted cache
  });

  const rawData = query.data;

  // Derive UI-ready data from the raw API response
  const derived = useMemo(() => {
    if (!rawData) {
      return {
        activeGoals: [],
        habitsWithoutGoals: [],
        overallProgress: { activeCount: 0, totalCount: 0, percent: 0 },
      };
    }

    const activeGoals = rawData.habitsWithGoals || [];
    const habitsWithoutGoals = rawData.habitsWithoutGoals || [];
    const totalHabits = rawData.totalHabits || (activeGoals.length + habitsWithoutGoals.length);
    const habitsWithGoalsCount = rawData.habitsWithGoalsCount || activeGoals.length;

    return {
      activeGoals,
      habitsWithoutGoals,
      overallProgress: {
        activeCount: habitsWithGoalsCount,
        totalCount: totalHabits,
        percent: totalHabits > 0 ? (habitsWithGoalsCount / totalHabits) * 100 : 0,
      },
    };
  }, [rawData]);

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    ...derived,
  };
}
