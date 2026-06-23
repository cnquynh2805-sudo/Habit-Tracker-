import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rewardItems } from "../data/rewards";

export const useMascotStore = create(
  persist(
    (set, get) => ({
      equippedRewardId: 1,
      mascotSelected: false,
      selectedMascot: null,
      isHydrated: false,
      unlockedRewardIds: [1], // Chỉ mở khóa vật phẩm 1 mặc định ban đầu
      notifiedMilestones: {},

      equipItem: (id) =>
        set({
          equippedRewardId: id,
        }),

      /**
       * Hàm cốt lõi: Kiểm tra xem mục tiêu đã đạt thỏa mãn điều kiện của phần thưởng nào chưa.
       * Nếu có, tiến hành kích hoạt mở khóa động vào mảng lưu trữ local.
       */
      checkAndUnlockRewardForGoal: (targetType, targetValue) => {
        const state = get();
        
        // Chuyển đổi định dạng targetType từ backend/engine mục tiêu sang loại của rewards
        const rewardConditionType = targetType === "Streak" ? "streak" : "completions";

        // Tìm kiếm phần thưởng phù hợp với điều kiện mục tiêu hiện tại chưa được mở khóa
        const itemsToUnlock = rewardItems.filter((item) => {
          return (
            item.unlockCondition.type === rewardConditionType &&
            targetValue >= item.unlockCondition.value &&
            !state.unlockedRewardIds.includes(item.id)
          );
        });

        if (itemsToUnlock.length === 0) return null;

        const newUnlockedIds = itemsToUnlock.map((item) => item.id);
        const updatedList = [...state.unlockedRewardIds, ...newUnlockedIds];

        set({
          unlockedRewardIds: updatedList,
        });

        // Trả về danh sách vật phẩm vừa kích hoạt thành công để thông báo cho Client UI
        return itemsToUnlock;
      },

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
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
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