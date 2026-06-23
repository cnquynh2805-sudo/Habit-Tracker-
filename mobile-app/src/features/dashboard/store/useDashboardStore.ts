import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dashboardApi } from "../services/dashboardApi";
import apiClient from "@/shared/api/apiClient";
import { endpoints } from "@/shared/api/endpoints";
import { AxiosError } from "axios";

interface DashboardState {
  summary: any | null;
  heatmap: any | null;
  weeklyProgress: any | null;
  goals: any | null;
  checkinsByHabit: Record<number, any[]> | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  loadDashboardData: (force?: boolean) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      summary: null,
      heatmap: null,
      weeklyProgress: null,
      goals: null,
      checkinsByHabit: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      loadDashboardData: async (force = false) => {
        const { lastFetched, isLoading } = get();
        const now = Date.now();
        // Skip if already loading or cache < 5 min old (unless forced)
        if (isLoading || (!force && lastFetched && now - lastFetched < 5 * 60 * 1000)) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";

          // Compute dates for 3-month heatmap
          const endDateObj = new Date();
          const startDateObj = new Date();
          startDateObj.setMonth(startDateObj.getMonth() - 3);
          const endDate = endDateObj.toISOString().split("T")[0];
          const startDate = startDateObj.toISOString().split("T")[0];

          // Fetch all dashboard endpoints concurrently
          const [summaryRes, heatmapRes, weeklyRes, goalsRes] = await Promise.allSettled([
            dashboardApi.getSummary(),
            dashboardApi.getSimpleHeatmap(startDate, endDate, timezone),
            dashboardApi.getWeeklyProgress(),
            dashboardApi.getGoals(),
          ]);

          const summary =
            summaryRes.status === "fulfilled" ? summaryRes.value : get().summary;
          const heatmap =
            heatmapRes.status === "fulfilled" ? heatmapRes.value : get().heatmap;
          const weeklyProgress =
            weeklyRes.status === "fulfilled" ? weeklyRes.value : get().weeklyProgress;
          const goals =
            goalsRes.status === "fulfilled" ? goalsRes.value : get().goals;

          // Fetch all checkins for per-habit derived stats
          // GET /checkins returns all checkins — build a map { habitId: [...] }
          let checkinsByHabit: Record<number, any[]> = get().checkinsByHabit || {};
          try {
            const allCheckins: any[] = await apiClient.get(endpoints.checkins.listAll);
            if (Array.isArray(allCheckins)) {
              checkinsByHabit = {};
              allCheckins.forEach((c: any) => {
                const hid = c.habit_id;
                if (hid != null) {
                  if (!checkinsByHabit[hid]) checkinsByHabit[hid] = [];
                  checkinsByHabit[hid].push(c);
                }
              });
            }
          } catch (e) {
            console.warn("Could not fetch all checkins for stats:", e);
          }

          set({
            summary,
            heatmap,
            weeklyProgress,
            goals,
            checkinsByHabit,
            isLoading: false,
            lastFetched: now,
            error: null,
          });
        } catch (err: any) {
          console.error("Dashboard data load error:", err);
          set({
            error:
              err instanceof AxiosError ? err.message : "Failed to load dashboard data",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "dashboard-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        summary: state.summary,
        heatmap: state.heatmap,
        weeklyProgress: state.weeklyProgress,
        goals: state.goals,
        checkinsByHabit: state.checkinsByHabit,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
