export type HabitFrequency = "Daily" | "Weekly" | "Custom";
export type HabitPriority = "Low" | "Medium" | "High";
export type HabitStatus = "Active" | "Paused" | "Archived";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: HabitFrequency;
  daysOfWeek: DayOfWeek[] | null;
  targetPerDay: number;
  priority: HabitPriority;
  status: HabitStatus;
  canCheckin: boolean;
  created_at?: number;
  updated_at?: number;
}

// Fields the client sends when creating/updating a habit.
export type HabitInput = Omit<
  Habit,
  "id" | "created_at" | "updated_at" | "canCheckin"
>;
