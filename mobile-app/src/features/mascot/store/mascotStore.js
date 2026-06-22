import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMascotStore = create(
  persist(
    (set, get) => ({
      equippedRewardId: 1,

      mascotSelected: false,
      selectedMascot: null,

      isHydrated: false,
      
      unlockedRewardIds: [1, 2],
      notifiedMilestones: {},

      equipItem: (id) =>
        set({
          equippedRewardId: id,
        }),

      unlockRandomReward: () => {
        const state = get();
        const allIds = Array.from({ length: 16 }, (_, i) => i + 1);
        const lockedIds = allIds.filter(id => !state.unlockedRewardIds.includes(id));
        if (lockedIds.length === 0) return null; // all unlocked
        const randomId = lockedIds[Math.floor(Math.random() * lockedIds.length)];
        set({
          unlockedRewardIds: [...state.unlockedRewardIds, randomId],
        });
        return randomId;
      },

      markMilestoneNotified: (goalId, level) => {
        const key = String(goalId);
        set((state) => {
          const current = state.notifiedMilestones[key] || {};
          return {
            notifiedMilestones: {
              ...state.notifiedMilestones,
              [key]: {
                ...current,
                [level]: true,
              },
            },
          };
        });
      },

      // Reset all persisted milestone flags (useful for testing or when goals are deleted).
      resetMilestoneNotifications: () =>
        set({ notifiedMilestones: {} }),

      chooseMascot: (mascotId) =>
        set({
          mascotSelected: true,
          selectedMascot: mascotId,
        }),

      setHydrated: (value) =>
        set({
          isHydrated: value,
        }),
    }),
    {
      name: "mascot-storage",

      storage: {
        getItem: async (name) => {
          const value =
            await AsyncStorage.getItem(name);

          return value
            ? JSON.parse(value)
            : null;
        },

        setItem: async (name, value) => {
          await AsyncStorage.setItem(
            name,
            JSON.stringify(value)
          );
        },

        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);