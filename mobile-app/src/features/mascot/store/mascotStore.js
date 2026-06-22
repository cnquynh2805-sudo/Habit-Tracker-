import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMascotStore = create(
  persist(
    (set) => ({
      equippedRewardId: 1,

      mascotSelected: false,
      selectedMascot: null,

      isHydrated: false,

      equipItem: (id) =>
        set({
          equippedRewardId: id,
        }),

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