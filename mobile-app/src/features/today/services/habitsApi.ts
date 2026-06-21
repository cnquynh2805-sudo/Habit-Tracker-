import apiClient from "@/shared/api/apiClient";
import { endpoints } from "@/shared/api/endpoints";

// Shape returned by GET /habits on the Habit Tracker Swagger (Xano).
export interface ServerHabit {
  id: number;
  name: string;
  category: string;
  frequency: string;
  daysOfWeek: string | string[] | null;
  targetPerDay: number;
  priority: string;
  status: string;
  createdAt?: number;
  nfcTagId?: string;
}

// apiClient's response interceptor already unwraps `response.data`.
export function listHabits(): Promise<ServerHabit[]> {
  return apiClient.get(endpoints.habits.list);
}
