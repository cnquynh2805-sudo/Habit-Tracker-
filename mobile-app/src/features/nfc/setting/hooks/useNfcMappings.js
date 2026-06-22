import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateHabit } from "../../../habits/screens/CreateHabit/services/habitsManager";
import * as nfcApi from "../services/nfcApi";

const HABITS_KEY = "@habits_list";
const NFC_MAPPING_KEY = "@local_nfc_mappings";

export default function useNfcMappings() {
  const [loading, setLoading] = useState(true);
  const [allHabits, setAllHabits] = useState([]);
  const [unconfiguredHabits, setUnconfiguredHabits] = useState([]);
  const [nfcMappings, setNfcMappings] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [storedHabitsJson, storedMappingsJson] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(NFC_MAPPING_KEY),
      ]);

      const parsedHabits = storedHabitsJson ? JSON.parse(storedHabitsJson) : [];
      const parsedMappings = storedMappingsJson ? JSON.parse(storedMappingsJson) : {};

      setAllHabits(parsedHabits);
      setNfcMappings(parsedMappings);

      const assignedIds = Object.values(parsedMappings)
        .filter((m) => m.type === "SINGLE")
        .map((m) => m.habitId)
        .filter(Boolean);

      setUnconfiguredHabits(
        parsedHabits.filter(
          (h) => h.status === "Active" && !assignedIds.includes(h.id)
        )
      );
    } catch (err) {
      console.warn("useNfcMappings loadData error", err);
      setAllHabits([]);
      setNfcMappings({});
      setUnconfiguredHabits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function persistMappings(mappings) {
    await AsyncStorage.setItem(NFC_MAPPING_KEY, JSON.stringify(mappings));
    setNfcMappings(mappings);

    const assignedIds = Object.values(mappings)
      .filter((m) => m.type === "SINGLE")
      .map((m) => m.habitId)
      .filter(Boolean);

    setUnconfiguredHabits(
      allHabits.filter(
        (h) => h.status === "Active" && !assignedIds.includes(h.id)
      )
    );
  }

  async function saveMappingAndSync({
    tagId,
    type,
    habitId = null,
    tagName = "",
    ndefUrl = "",
  }) {
    const finalTagName =
      tagName.trim() ||
      (type === "MULTIPLE"
        ? "Multi-Habit Tag"
        : `Tag #${(tagId || "").slice(-4)}`);

    const raw = await AsyncStorage.getItem(NFC_MAPPING_KEY);
    const mappings = raw ? JSON.parse(raw) : {};
    const existing = mappings[tagId] || {};

    const updated = {
      ...mappings,
      [tagId]: {
        ...existing,
        tagId,
        type,
        habitId: type === "SINGLE" ? habitId : null,
        tagName: finalTagName,
        ndefUrl,
        serverId: existing.serverId ?? null,
        createdAt: existing.createdAt ?? new Date().toISOString(),
      },
    };

    await persistMappings(updated);

    try {
      if (type === "SINGLE" && habitId) {
        await updateHabit(habitId, {
          nfcTagId: tagId,
          nfcTagName: finalTagName,
        });
      }

      if (nfcApi && typeof nfcApi.createNfcTagRemote === "function") {
        if (updated[tagId].serverId) {
          await nfcApi.updateNfcTagRemote(updated[tagId].serverId, {
            tag_id: tagId,
            type,
            tag_name: finalTagName,
            ndef_url: ndefUrl,
            habit_id: type === "SINGLE" ? habitId ?? null : null,
          });
        } else {
          const resp = await nfcApi.createNfcTagRemote({
            tag_id: tagId,
            type,
            tag_name: finalTagName,
            ndef_url: ndefUrl,
            habit_id: type === "SINGLE" ? habitId ?? null : null,
          });
          if (resp?.id) {
            updated[tagId].serverId = resp.id;
            await persistMappings(updated);
          }
        }
      }
    } catch (err) {
      console.warn("saveMappingAndSync error", err);
    }

    return updated[tagId];
  }

  async function removeMapping(tagId) {
    const raw = await AsyncStorage.getItem(NFC_MAPPING_KEY);
    const mappings = raw ? JSON.parse(raw) : {};
    const removed = mappings[tagId];
    if (!removed) return false;

    delete mappings[tagId];
    await persistMappings(mappings);

    try {
      if (removed.type === "SINGLE" && removed.habitId) {
        await updateHabit(removed.habitId, {
          nfcTagId: null,
          nfcTagName: null,
        });
      }
    } catch (err) {
      console.warn("removeMapping updateHabit failed", err);
    }

    if (removed.serverId && typeof nfcApi.deleteNfcTagRemote === "function") {
      try {
        await nfcApi.deleteNfcTagRemote(removed.serverId);
      } catch (err) {
        console.warn("removeMapping delete remote failed", err);
      }
    }

    return true;
  }

  return {
    loading,
    allHabits,
    unconfiguredHabits,
    nfcMappings,
    loadData,
    saveMappingAndSync,
    removeMapping,
  };
}