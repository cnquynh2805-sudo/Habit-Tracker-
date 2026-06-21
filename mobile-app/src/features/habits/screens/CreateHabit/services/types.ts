export type SyncStatus = "pending" | "synced" | "failed";

export interface Habit {
  id: string; // ID cục bộ ở Client (Luôn luôn là chuỗi string duy nhất)
  name: string;
  category?: "Health" | "Study" | "Work" | "Mindfulness" | "Other";
  frequency?: "Daily" | "Custom";
  daysOfWeek?: string[] | null;
  targetPerDay?: number; // Bắt buộc là Kiểu Số (Number)
  priority?: "Low" | "Medium" | "High";
  status?: "Active" | "Paused" | "Archived";
  createdAt: string;
  serverId?: string; // ID Thật từ cơ sở dữ liệu Server Xano trả về
  nfcTagId?: string | null;
  nfcTagName?: string | null;
  syncStatus?: SyncStatus;
}