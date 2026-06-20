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
    list: "/checkins",
    detail: (id: number) => `/checkins/${id}`,
    create: "/checkins",
    update: (id: number) => `/checkins/${id}`,
    remove: (id: number) => `/checkins/${id}`,
  },
} as const;
