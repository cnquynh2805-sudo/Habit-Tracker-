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

  // ✅ SỬA LOGIC: Ép kiểu String đề phòng ID lệch kiểu dữ liệu int/string giữa Xano và Local AsyncStorage
  const calculateUnconfigured = (mappings, habitsList) => {
    const assignedHabitIds = Object.values(mappings)
      .filter((m) => String(m.type).toLowerCase() === "single")
      .map((m) => String(m.habitId))
      .filter(Boolean);

    return habitsList.filter(
      (h) => h.status === "Active" && !assignedHabitIds.includes(String(h.id))
    );
  };

  // ==========================================
  // 1. TẢI DATA (MERGE CHỐNG MẤT OFFLINE)
  // ==========================================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [storedHabitsJson, storedMappingsJson] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(NFC_MAPPING_KEY),
      ]);

      const parsedHabits = storedHabitsJson ? JSON.parse(storedHabitsJson) : [];
      let currentMappings = storedMappingsJson ? JSON.parse(storedMappingsJson) : {};

      try {
        if (nfcApi && typeof nfcApi.getNfcTagsRemote === "function") {
          const remoteTags = await nfcApi.getNfcTagsRemote();
          if (Array.isArray(remoteTags)) {
            const freshMappings = { ...currentMappings };
            remoteTags.forEach((tag) => {
              const cleanedTagId = (tag.tag_id || "").trim().toLowerCase();
              if (!cleanedTagId) return;

              const serverId = tag.nfc_tags_id || tag.id;
              freshMappings[cleanedTagId] = {
                ...(freshMappings[cleanedTagId] || {}),
                tagId: cleanedTagId,
                type: tag.type,
                tagName: tag.tag_name,
                ndefUrl: tag.ndef_url,
                habitId: tag.habit_id,
                serverId: serverId,
              };
            });
            currentMappings = freshMappings;
            await AsyncStorage.setItem(NFC_MAPPING_KEY, JSON.stringify(currentMappings));
          }
        }
      } catch (apiErr) {
        console.warn("[API GET] Lỗi tải server, giữ bộ đệm local cũ:", apiErr);
      }

      const calculatedUnconfigured = calculateUnconfigured(currentMappings, parsedHabits);

      setAllHabits(parsedHabits);
      setNfcMappings(currentMappings);
      setUnconfiguredHabits(calculatedUnconfigured);
    } catch (err) {
      console.warn("useNfcMappings loadData error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================
  // 2. TÁC VỤ LƯU ĐỒNG THỜI XUỐNG LOCAL & XANO SERVER
  // ==========================================
  async function saveMappingAndSync(payload) {
    let rawTagId = payload.tagId;
    
    if (!rawTagId) {
      console.warn("🚨 [NFC SAVE] Không thể thực hiện lưu vì thiếu thuộc tính tagId!");
      return { success: false, error: "MISSING_TAG_ID" };
    }

    const tagId = rawTagId.trim().toLowerCase();
    const { type, habitId = null, tagName = "", ndefUrl = "" } = payload;

    const [rawMappings, rawHabits] = await Promise.all([
      AsyncStorage.getItem(NFC_MAPPING_KEY),
      AsyncStorage.getItem(HABITS_KEY)
    ]);
    
    const mappings = rawMappings ? JSON.parse(rawMappings) : {};
    const habitsList = rawHabits ? JSON.parse(rawHabits) : [];
    const existing = mappings[tagId];

    // 🔥 ĐÃ SỬA CHẮC CHẮN: CHẶN GHI ĐÈ TUYỆT ĐỐI KHÔNG CHO PHÉP GẮN TIẾP
    if (existing) {
      console.warn(`🚨 [NFC REJECTED] Thẻ "${tagId}" đã được liên kết từ trước.`);
      return { 
        success: false, 
        error: "DUPLICATE_TAG_ID", 
        message: `Thẻ này đã gán cho thói quen "${existing.tagName || "Khác"}" rồi. Bạn cần gỡ liên kết (Unlink) thẻ cũ trước khi muốn gán thói quen mới!`,
        existingData: existing 
      };
    }

    const finalTagName =
      tagName.trim() ||
      (String(type).toLowerCase() === "multiple" ? "Multi-Habit Tag" : `Tag #${tagId.slice(-4)}`);

    // 🔥 ÉP KIỂU TRIỆT ĐỂ: Nếu là SINGLE thì parse sang số nguyên, nếu MULTIPLE hoặc không có thì ép bằng 0
    const safeHabitId = String(type).toLowerCase() === "single" && habitId 
        ? parseInt(habitId, 10) 
        : 0;

    const apiBody = {
      tag_id: tagId,
      type: type,
      tag_name: finalTagName,
      ndef_url: ndefUrl || `bloom://nfc?id=${tagId}`,
      habit_id: safeHabitId, // Đã khớp 100% định dạng Integer mà Xano yêu cầu
    };

    let serverId = null;

    try {
      if (nfcApi && typeof nfcApi.postNfcTagRemote === "function") {
        try {
          const resp = await nfcApi.postNfcTagRemote(apiBody);
          if (resp) serverId = resp.nfc_tags_id || resp.id;
        } catch (postErr) {
          // Phòng hờ lỗi kết nối rớt gói tin hoặc bất đồng bộ database trên Xano
          if (typeof nfcApi.getNfcTagsRemote === "function") {
            const remoteTags = await nfcApi.getNfcTagsRemote();
            const found = remoteTags?.find(t => (t.tag_id || "").toLowerCase() === tagId);
            if (found) {
              serverId = found.nfc_tags_id || found.id;
              if (typeof nfcApi.patchNfcTagRemote === "function") {
                await nfcApi.patchNfcTagRemote(serverId, apiBody);
              }
            }
          } else {
            throw postErr;
          }
        }
      }
    } catch (err) {
      console.error("[API SAVE] Lỗi đồng bộ API Server:", err);
    }

    let updatedHabitsList = [...habitsList];

    // Gán mã thẻ mới vào thói quen local
    try {
      if (String(type).toLowerCase() === "single" && habitId) {
        const res = await updateHabit(habitId, {
          nfcTagId: tagId,
          nfcTagName: finalTagName,
        });
        if (Array.isArray(res)) updatedHabitsList = res;
      }
    } catch (err) {
      console.warn("[LOCAL HABIT] Lỗi map NFC vào Habit mới:", err);
    }

    const updatedMappings = {
      ...mappings,
      [tagId]: {
        tagId,
        type,
        habitId: String(type).toLowerCase() === "single" ? habitId : null,
        tagName: finalTagName,
        ndefUrl: apiBody.ndef_url,
        serverId, 
        createdAt: new Date().toISOString(),
      },
    };

    await Promise.all([
      AsyncStorage.setItem(NFC_MAPPING_KEY, JSON.stringify(updatedMappings)),
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabitsList))
    ]);

    setNfcMappings(updatedMappings);
    setAllHabits(updatedHabitsList);
    setUnconfiguredHabits(calculateUnconfigured(updatedMappings, updatedHabitsList));

    console.log(`✅ [NFC LOG] Đã gán và lưu thành công thẻ: ${tagId}`);
    return { success: true, data: updatedMappings[tagId] };
  }

  // ==========================================
  // 3. TÁC VỤ XÓA / UNLINK THẺ
  // ==========================================
  async function removeMapping(rawTagId) {
    const tagId = (rawTagId || "").trim().toLowerCase();
    const [rawMappings, rawHabits] = await Promise.all([
      AsyncStorage.getItem(NFC_MAPPING_KEY),
      AsyncStorage.getItem(HABITS_KEY)
    ]);
    
    const mappings = rawMappings ? JSON.parse(rawMappings) : {};
    const habitsList = rawHabits ? JSON.parse(rawHabits) : [];
    const removed = mappings[tagId];
    if (!removed) return false;

    if (removed.serverId && nfcApi && typeof nfcApi.deleteNfcTagRemote === "function") {
      try {
        await nfcApi.deleteNfcTagRemote(removed.serverId);
      } catch (err) {
        console.error("[API DELETE] Lỗi xóa trên server:", err);
      }
    }

    let updatedHabitsList = [...habitsList];
    try {
      if (String(removed.type).toLowerCase() === "single" && removed.habitId) {
        const res = await updateHabit(removed.habitId, {
          nfcTagId: null,
          nfcTagName: null,
        });
        if (Array.isArray(res)) updatedHabitsList = res;
      }
    } catch (err) {
      console.warn("[LOCAL HABIT] Lỗi gỡ liên kết trong Habit:", err);
    }

    delete mappings[tagId];
    await Promise.all([
      AsyncStorage.setItem(NFC_MAPPING_KEY, JSON.stringify(mappings)),
      AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updatedHabitsList))
    ]);

    setNfcMappings(mappings);
    setAllHabits(updatedHabitsList);
    setUnconfiguredHabits(calculateUnconfigured(mappings, updatedHabitsList));

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