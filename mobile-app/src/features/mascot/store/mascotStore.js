import { create } from "zustand";

export const useMascotStore =
  create((set) => ({
    equippedRewardId: 1,

    equipItem: (id) =>
      set({
        equippedRewardId: id,
      }),
  }));