import { create } from "zustand";

export interface GlobalAlertConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface MilestoneAlertConfig {
  type: "eighty" | "hundred";
  habitName: string;
  goalName: string;
  progressPct: number;
  streak: number;
  rewardId?: number; // populated if type == "hundred"
  goalId: number;
}

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  globalAlert: GlobalAlertConfig | null;
  showGlobalAlert: (config: GlobalAlertConfig) => void;
  hideGlobalAlert: () => void;

  milestoneAlert: MilestoneAlertConfig | null;
  showMilestoneAlert: (config: MilestoneAlertConfig) => void;
  hideMilestoneAlert: () => void;
  checkMilestoneForHabit: (habitId: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  globalAlert: null,
  showGlobalAlert: (config) => set({ globalAlert: config }),
  hideGlobalAlert: () => set({ globalAlert: null }),

  milestoneAlert: null,
  showMilestoneAlert: (config) => set({ milestoneAlert: config }),
  hideMilestoneAlert: () => set({ milestoneAlert: null }),

  checkMilestoneForHabit: async (habitId: number) => {
    try {
      const { fetchDashboardGoals } = require("../../features/goals/services/goalsApi");
      const { useMascotStore } = require("../../features/mascot/store/mascotStore");

      const dashboardData = await fetchDashboardGoals();
      const habitWithGoal = dashboardData?.habitsWithGoals?.find(
        (h: any) => Number(h.habitId) === Number(habitId)
      );

      if (!habitWithGoal || !habitWithGoal.goal) return;

      const goal = habitWithGoal.goal;
      const progressPct = goal.progressPercent || 0;
      const mascotState = useMascotStore.getState();

      // Use String key for goal.id to ensure consistent map lookup
      // (Xano IDs can arrive as number or string depending on endpoint).
      const goalKey = String(goal.id);
      const notified = mascotState.notifiedMilestones?.[goalKey] || {};

      // Priority 1: Check 100% milestone
      if (progressPct >= 100 && !notified.hundred) {
        const unlockedRewardId = mascotState.unlockRandomReward();

        // Mark FIRST so a second rapid checkin doesn't double-fire.
        mascotState.markMilestoneNotified(goalKey, "hundred");

        get().showMilestoneAlert({
          type: "hundred",
          habitName: habitWithGoal.habitName,
          goalName: goal.targetType,
          progressPct: 100,
          streak: goal.currentProgress,
          rewardId: unlockedRewardId,
          goalId: goal.id,
        });
        return;
      }

      // Priority 2: Check 80% milestone
      if (progressPct >= 80 && progressPct < 100 && !notified.eighty) {
        // Mark before showing so rapid check-ins don't double-fire.
        mascotState.markMilestoneNotified(goalKey, "eighty");

        get().showMilestoneAlert({
          type: "eighty",
          habitName: habitWithGoal.habitName,
          goalName: goal.targetType,
          progressPct: progressPct,
          streak: goal.currentProgress,
          goalId: goal.id,
        });
      }
    } catch (e) {
      console.log("Error checking milestone for habit:", e);
    }
  },
}));
