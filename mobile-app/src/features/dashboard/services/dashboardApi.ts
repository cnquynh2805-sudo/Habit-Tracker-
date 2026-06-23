import apiClient from "@/shared/api/apiClient";
import { endpoints } from "@/shared/api/endpoints";

export const dashboardApi = {
  getSummary: async (signal?: AbortSignal) => {
    return apiClient.get(endpoints.dashboard.summary, { signal });
  },

  getSimpleHeatmap: async (
    startDate: string,
    endDate: string,
    timezone: string,
    signal?: AbortSignal
  ) => {
    return apiClient.get(endpoints.dashboard.simpleHeatmap, {
      params: { startDate, endDate, timezone },
      signal,
    });
  },

  getWeeklyProgress: async (signal?: AbortSignal) => {
    return apiClient.get(endpoints.dashboard.weeklyProgress, { signal });
  },

  getGoals: async (signal?: AbortSignal) => {
    return apiClient.get(endpoints.dashboard.goals, { signal });
  },
};
