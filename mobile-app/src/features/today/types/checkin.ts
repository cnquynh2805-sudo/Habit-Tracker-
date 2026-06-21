// Mirrors the `checkins` schema from the Habit Tracker Swagger (Xano).
export type CheckinStatus = "Not Started" | "In Progress" | "Completed";

export interface Checkin {
  id: number;
  habit_id: number;
  // Unix timestamp (timestamptz) of when progress was tracked.
  date: number;
  // Total repetitions recorded.
  completedCount: number;
  status: CheckinStatus;
}

// Fields the client sends when creating/updating a check-in.
export type CheckinInput = Omit<Checkin, "id">;
