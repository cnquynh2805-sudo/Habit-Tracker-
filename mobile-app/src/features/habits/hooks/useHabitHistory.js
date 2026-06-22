import { useQuery } from "@tanstack/react-query";
import { listHabitCheckins } from "../services/checkinsApi";

/**
 * React Query hook to fetch check-in history for a specific habit.
 */
export function useHabitHistory(habitId) {
  return useQuery({
    queryKey: ["habit_history", habitId],
    queryFn: async () => {
      if (!habitId) return [];
      const data = await listHabitCheckins(habitId);
      return Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : [];
    },
    enabled: !!habitId,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });
}
