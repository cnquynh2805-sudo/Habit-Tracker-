import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HabitCategory = "Health" | "Study" | "Work" | "Mindfulness" | "Other";
export type HabitFrequency = "Daily" | string; // e.g. "Monday, Wednesday, Friday"
export type HabitPriority = "Low" | "Medium" | "High";
export type HabitStatus = "Active" | "Paused" | "Archived";

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetPerDay: number;
  priority: HabitPriority;
  status: HabitStatus;
  createdAt: string;
}

export type CheckinStatus = "Not Started" | "In Progress" | "Completed";

export interface Checkin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedCount: number;
  status: CheckinStatus;
}

export type TargetType = "Streak target" | "Total completions target";

export interface Goal {
  id: string;
  habitId: string;
  targetType: TargetType;
  targetValue: number;
}

let idCounter = 0;

const createId = () => {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
};

const validCategories: HabitCategory[] = ["Health", "Study", "Work", "Mindfulness", "Other"];
const validPriorities: HabitPriority[] = ["Low", "Medium", "High"];
const validStatuses: HabitStatus[] = ["Active", "Paused", "Archived"];
const validTargetTypes: TargetType[] = ["Streak target", "Total completions target"];

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const isValidHabit = (habit: Omit<Habit, "id" | "createdAt"> | Habit) => {
  return (
    hasText(habit.name) &&
    validCategories.includes(habit.category) &&
    hasText(habit.frequency) &&
    Number.isFinite(habit.targetPerDay) &&
    habit.targetPerDay > 0 &&
    validPriorities.includes(habit.priority) &&
    validStatuses.includes(habit.status)
  );
};

const isValidGoal = (goal: Omit<Goal, "id"> | Goal) => {
  return (
    hasText(goal.habitId) &&
    validTargetTypes.includes(goal.targetType) &&
    Number.isFinite(goal.targetValue) &&
    goal.targetValue > 0
  );
};

interface HabitState {
  habits: Habit[];
  checkins: Checkin[];
  goals: Goal[];
  lastAction: { type: "CHECKIN", previousCheckin: Checkin | null, habitId: string, date: string } | null;

  // Actions
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  
  checkIn: (habitId: string, date: string, completedCount: number) => void;
  
  setGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  undoLastCheckIn: () => void;
  
  resetData: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      checkins: [],
      goals: [],
      lastAction: null,

      addHabit: (habitData) => {
        if (!isValidHabit(habitData)) return;

        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habitData,
              id: createId(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;

            const updatedHabit = { ...habit, ...updates };
            return isValidHabit(updatedHabit) ? updatedHabit : habit;
          }),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
          checkins: state.checkins.filter((c) => c.habitId !== id),
          goals: state.goals.filter((g) => g.habitId !== id),
        }));
      },

      checkIn: (habitId, date, completedCount) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;

        // Validation constraints
        if (completedCount < 0) return;
        if (completedCount > habit.targetPerDay) return;
        
        const todayStr = new Date().toISOString().split("T")[0];
        if (date > todayStr) return; // No future check-ins

        const status: CheckinStatus =
          completedCount === 0
            ? "Not Started"
            : completedCount >= habit.targetPerDay
            ? "Completed"
            : "In Progress";

        set((state) => {
          const existingCheckinIndex = state.checkins.findIndex(
            (c) => c.habitId === habitId && c.date === date
          );

          let previousCheckin = null;
          let newCheckins = [...state.checkins];

          if (existingCheckinIndex >= 0) {
            previousCheckin = { ...state.checkins[existingCheckinIndex] };
            newCheckins[existingCheckinIndex] = {
              ...previousCheckin,
              completedCount,
              status,
            };
          } else {
            newCheckins.push({
              id: createId(),
              habitId,
              date,
              completedCount,
              status,
            });
          }

          return { 
            checkins: newCheckins,
            lastAction: { type: "CHECKIN", previousCheckin, habitId, date }
          };
        });
      },

      undoLastCheckIn: () => {
        set((state) => {
          if (!state.lastAction || state.lastAction.type !== "CHECKIN") return state;
          
          const { previousCheckin, habitId, date } = state.lastAction;
          let newCheckins = [...state.checkins];
          
          if (!previousCheckin) {
            // It was a new checkin, so we delete it
            newCheckins = newCheckins.filter(c => !(c.habitId === habitId && c.date === date));
          } else {
            // It was an updated checkin, so we restore the previous values
            const index = newCheckins.findIndex(c => c.habitId === habitId && c.date === date);
            if (index >= 0) {
              newCheckins[index] = previousCheckin;
            }
          }
          
          return { checkins: newCheckins, lastAction: null };
        });
      },

      setGoal: (goalData) => {
        const habitExists = get().habits.some((habit) => habit.id === goalData.habitId);
        if (!habitExists || !isValidGoal(goalData)) return;

        set((state) => ({
          goals: [
            ...state.goals.filter(g => g.habitId !== goalData.habitId), // Ensure one goal per habit
            {
              ...goalData,
              id: createId(),
            },
          ],
        }));
      },
      
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) => {
            if (goal.id !== id) return goal;

            const updatedGoal = { ...goal, ...updates };
            return isValidGoal(updatedGoal) ? updatedGoal : goal;
          }),
        }));
      },

      resetData: () => set({ habits: [], checkins: [], goals: [], lastAction: null }),
    }),
    {
      name: "habit-tracker-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
