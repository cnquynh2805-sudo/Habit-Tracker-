// Centralized API endpoint paths (relative to apiClient baseURL).
export const endpoints = {
  habits: {
    list: "/habits",
    detail: (id: string) => `/habits/${id}`,
    create: "/habits",
    update: (id: string) => `/habits/${id}`,
    remove: (id: string) => `/habits/${id}`,
    checkins: (id: string) => `/habits/${id}/checkins`,
  },
  checkins: {
    today: "/habits-today?timezone=Asia%2FHo_Chi_Minh",
    list: "/checkins",
    listAll: "/checkins", // used by derivedStateEngine to fetch full history
    detail: (id: string) => `/checkins/${id}`,
    create: "/checkins",
    update: (id: string) => `/checkins/${id}`,
    remove: (id: string) => `/checkins/${id}`,
  },
  goals: {
    list: "/goals",
    detail: (id: string) => `/goals/${id}`,
    dashboard: "/dashboard/goals",
    byHabit: (habitId: string) => `/habits/${habitId}/goals`,
    updateByHabit: (habitId: string, goalId: string) => `/habits/${habitId}/goals/${goalId}`,
    progressByHabit: (habitId: string, goalId: string) =>
      `/habits/${habitId}/goals/${goalId}/progress`,
  },
  system: {
    reset: "/system/reset",
  },
} as const;
