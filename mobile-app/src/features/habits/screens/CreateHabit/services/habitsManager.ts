/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { isOnline } from "./config";
import {
  createHabitRemote,
  deleteHabitRemote,
  updateHabitRemote,
} from "./habitsApi";
import { Habit } from "./types";

const HABITS_KEY = "@habits_list";

// 1. FETCH ALL HABITS (READ)
export async function getHabits(): Promise<Habit[]> {
  try {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading habits from storage:", error);
    return [];
  }
}

// 2. GET HABIT DETAILS BY UNIQUE STRING ID
export async function getHabitById(id: string): Promise<Habit | undefined> {
  const habits = await getHabits();
  return habits.find((h) => String(h.id) === String(id));
}

// 3. CREATE NEW HABIT (CREATE)
export async function createHabit(
  habitData: Partial<Habit>,
): Promise<Habit | null> {
  try {
    const habits = await getHabits();

    const newName = (habitData.name || "").trim();
    if (!newName) throw new Error("EMPTY_NAME");

    const isDuplicate = habits.some(
      (h) => h.name && h.name.trim().toLowerCase() === newName.toLowerCase(),
    );
    if (isDuplicate) {
      throw new Error("DUPLICATE_NAME");
    }

    // Initialize a unique string ID locally
    const uniqueId = Date.now().toString();
    const newHabit: any = {
      id: uniqueId,
      serverId: null, // Initially has no server ID
      name: newName,
      category: habitData.category || "Mindfulness",
      frequency: habitData.frequency || "Daily",
      daysOfWeek: habitData.daysOfWeek || null,
      targetPerDay: habitData.targetPerDay || 1,
      priority: habitData.priority || "Medium",
      status: habitData.status || "Active",
      createdAt: new Date().toISOString(),
      syncStatus: "pending",
    };

    // Save locally first so the UI can update immediately
    habits.push(newHabit);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));

    // Push to Xano server
    if (await isOnline()) {
      try {
        const apiResult = await createHabitRemote(newHabit);

        if (apiResult && apiResult.serverId) {
          const currentHabits = await getHabits();
          const syncIndex = currentHabits.findIndex(
            (h) => String(h.id) === String(uniqueId),
          );
          if (syncIndex >= 0) {
            // Update sync status and serverId in local storage
            currentHabits[syncIndex].syncStatus = "synced";
            currentHabits[syncIndex].serverId = String(apiResult.serverId);
            await AsyncStorage.setItem(
              HABITS_KEY,
              JSON.stringify(currentHabits),
            );

            // Update reference object returned to the UI
            newHabit.syncStatus = "synced";
            newHabit.serverId = String(apiResult.serverId);
          }
        }
      } catch (apiErr) {
        // Kept pending for the Sync Engine to process later if network fails
      }
    }
    return newHabit;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
}

// 4. UPDATE HABIT (UPDATE)
export async function updateHabit(
  habitId: string,
  habitData: Partial<Habit>,
): Promise<void> {
  try {
    const habits = await getHabits();
    const index = habits.findIndex((h) => String(h.id) === String(habitId));

    if (index < 0) {
      throw new Error("HABIT_NOT_FOUND");
    }

    // Protect the original local string ID and preserve the existing serverId
    const originalLocalId = habits[index].id;
    const currentServerId = habits[index].serverId;

    const updatedHabit = {
      ...habits[index],
      ...habitData,
      id: originalLocalId,
      serverId: currentServerId,
      syncStatus: "pending" as const,
    };

    habits[index] = updatedHabit;
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));

    if (await isOnline()) {
      try {
        await updateHabitRemote(updatedHabit);

        const currentHabits = await getHabits();
        const syncIndex = currentHabits.findIndex(
          (h) => String(h.id) === String(originalLocalId),
        );
        if (syncIndex >= 0) {
          currentHabits[syncIndex].syncStatus = "synced";
          await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(currentHabits));
        }
      } catch (apiErr) {
        // Kept pending for automatic background synchronization later
      }
    }
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
}

// 5. DELETE HABIT (DELETE)
export async function deleteHabit(habitId: string): Promise<boolean> {
  try {
    const habits = await getHabits();
    const targetHabit = habits.find((h) => String(h.id) === String(habitId));

    if (!targetHabit) {
      return false;
    }

    // Step 1: Remove from local storage immediately based on the local ID
    const filteredHabits = habits.filter(
      (h) => String(h.id) !== String(targetHabit.id),
    );
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(filteredHabits));

    // Step 2: Trigger the remote DELETE request
    if (await isOnline()) {
      try {
        await deleteHabitRemote(targetHabit);
      } catch (apiErr) {
        // API failed but local is already successfully updated
      }
    }
    return true;
  } catch (error) {
    console.error("Error deleting habit:", error);
    return false;
  }
}

// 6. BACKGROUND SYNC ENGINE
export async function syncOfflineData(): Promise<void> {
  if (!(await isOnline())) return;
  try {
    const habits = await getHabits();
    let hasChanges = false;

    for (let i = 0; i < habits.length; i++) {
      const habit = habits[i];
      if (habit.syncStatus === "pending") {
        try {
          if (habit.serverId) {
            // Existing record on server, content modified -> Trigger PATCH
            await updateHabitRemote(habit);
          } else {
            // Fresh local record created offline -> Trigger POST
            const apiResult = await createHabitRemote(habit);
            if (apiResult && apiResult.serverId) {
              habits[i].serverId = String(apiResult.serverId);
            }
          }
          habits[i].syncStatus = "synced";
          hasChanges = true;
        } catch (e) {
          console.error(`Sync failed for habit: ${habit.id}`, e);
        }
      }
    }

    if (hasChanges) {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    }
  } catch (error) {
    console.error("Error in Sync Engine process:", error);
  }
}

// 7. RESTORE FROM SERVER (USED ON RE-INSTALLATION OR RELOAD)
export async function downloadHabitsFromServer(
  remoteHabits: any[],
): Promise<void> {
  try {
    if (!Array.isArray(remoteHabits)) return;

    const formattedHabits: Habit[] = remoteHabits.map((rh) => ({
      // Use the remote ID as the local ID mapping to keep both in alignment
      id: String(rh.id),
      serverId: String(rh.id),
      name: rh.name,
      category: rh.category || "Mindfulness",
      frequency: rh.frequency || "Daily",
      daysOfWeek: rh.daysOfWeek || null,
      targetPerDay: rh.targetPerDay || 1,
      priority: rh.priority || "Medium",
      status: rh.status || "Active",
      createdAt: rh.createdAt || new Date().toISOString(),
      syncStatus: "synced",
    }));

    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(formattedHabits));
  } catch (error) {
    console.error("Error downloading remote data from server:", error);
  }
}
