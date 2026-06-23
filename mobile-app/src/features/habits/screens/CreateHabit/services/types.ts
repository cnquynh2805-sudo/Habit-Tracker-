export type SyncStatus = "pending" | "synced" | "failed";

export interface Habit {
  id: string;
  name: string;
  category?: "Health" | "Study" | "Work" | "Mindfulness" | "Other";
  frequency?: "Daily" | "Custom";
  daysOfWeek?: string[] | null;
  targetPerDay?: number;
  priority?: "Low" | "Medium" | "High";
  status?: "Active" | "Paused" | "Archived";
  createdAt: string;
  serverId?: string;
  nfcTagId?: string | null;
  nfcTagName?: string | null;
  syncStatus?: SyncStatus;
}
