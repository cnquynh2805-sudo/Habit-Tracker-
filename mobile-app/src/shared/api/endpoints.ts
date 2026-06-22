// Centralized API endpoint paths (relative to apiClient baseURL).
export const endpoints = {
  habits: {
    list: "/habits",
    detail: (id: string) => `/habits/${id}`,
    create: "/habits",
    update: (id: string) => `/habits/${id}`,
    remove: (id: string) => `/habits/${id}`,
  },
  checkins: {
    today: "/habits-today?timezone=Asia%2FHo_Chi_Minh",
    list: "/checkins",
    detail: (id: string) => `/checkins/${id}`,
    create: "/checkins",
    update: (id: string) => `/checkins/${id}`,
    remove: (id: string) => `/checkins/${id}`,
  },
} as const;
