import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMascotStore = create(
  persist(
    (set) => ({
      equippedRewardId: 1,

      equipItem: (id) =>
        set({
          equippedRewardId: id,
        }),
    }),
    {
      name: "mascot-storage",

      storage: {
        getItem: async (key) => {
          const value =
            await AsyncStorage.getItem(key);

          return value
            ? JSON.parse(value)
            : null;
        },

        setItem: async (key, value) => {
          await AsyncStorage.setItem(
            key,
            JSON.stringify(value)
          );
        },

        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);