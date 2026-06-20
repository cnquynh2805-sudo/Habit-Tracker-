// Centralized API endpoint paths (relative to apiClient baseURL).
export const endpoints = {
  habits: {
    list: "/habits",
    detail: (id: string) => `/habits/${id}`,
    create: "/habits",
    update: (id: string) => `/habits/${id}`,
    remove: (id: string) => `/habits/${id}`,
  },
} as const;
