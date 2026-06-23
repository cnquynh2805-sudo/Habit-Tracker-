import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
// import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
import { Platform } from 'react-native';

// Chỉ require thư viện thật nếu KHÔNG PHẢI là iOS (hoặc khi chạy build thật)
const NfcManager = Platform.OS !== 'ios' 
  ? require('react-native-nfc-manager').default 
  : null;

// Lúc này xuống dưới code bạn thoải mái gọi an toàn:
const startNfc = async () => {
  if (!NfcManager) {
    console.log("📱 [iOS Expo Go] Đã chặn an toàn, không gọi phần cứng.");
    return;
  }
  
  try {
    await NfcManager.start();
    // ... logic đọc thẻ của bạn
  } catch (err) {
    console.warn(err);
  }
};
import styles from "./NfcSettingsScreen.styles";
import useNfcMappings from "./hooks/useNfcMappings";

const ConfiguredTagRow = React.memo(({ tagId, mapping, habitLabel, onUnlink }) => {
  return (
    <View style={styles.mappingRow}>
      <View style={styles.mappingInfo}>
        <Text style={styles.mappingTitle}>
          {mapping.tagName?.trim() || "Unnamed Tag"}
        </Text>
        <Text style={styles.mappingSubtitle}>
          {mapping.type === "MULTIPLE"
            ? "MULTIPLE tag"
            : `SINGLE: ${habitLabel}`}
        </Text>
        <Text style={styles.mappingId}>ID: {tagId}</Text>
      </View>
      <TouchableOpacity
        style={styles.btnDanger}
        onPress={() => onUnlink(tagId)}
      >
        <Text style={styles.btnDangerText}>Unlink</Text>
      </TouchableOpacity>
    </View>
  );
});

export default function NfcSettingsScreen() {
  const [scanState, setScanState] = useState("ready");
  const [tagName, setTagName] = useState("");
  
  const [showAllHabits, setShowAllHabits] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const {
    loading,
    allHabits,
    unconfiguredHabits,
    nfcMappings,
    loadData,
    saveMappingAndSync,
    removeMapping,
  } = useNfcMappings();

  const cleanUpNfcListener = async () => {
    if (NfcManager && typeof NfcManager.cancelTechnologyRequest === "function") {
      await NfcManager.cancelTechnologyRequest().catch(() => null);
    }
  };

  useEffect(() => {
    if (NfcManager && typeof NfcManager.start === "function") {
      NfcManager.start().catch(() => null);
    }
    loadData();
    return () => {
      cleanUpNfcListener();
    };
  }, []);

  // Hàm cốt lõi xử lý việc lưu data sau khi đã chốt được Tag ID (từ quét thật hoặc nhập tay)
  const finalizeConfiguration = async (tagId, type, habitId) => {
    try {
      const finalTagName =
        tagName.trim() ||
        (type === "MULTIPLE" ? "Multi-Habit Tag" : `Tag #${tagId.slice(-4)}`);

      // Ghi chuẩn URL thường
      const urlToRecord =
        type === "MULTIPLE"
          ? `bloom://nfc?type=multiple&tagId=${tagId}`
          : `bloom://nfc?type=single&tagId=${tagId}&localId=${habitId}`;

      // 🔥 ÉP KIỂU TRIỆT ĐỂ CHO XANO: Nếu là MULTIPLE hoặc không có ID, luôn bằng 0 (Integer)
      const safeHabitId = (type === "MULTIPLE" || !habitId) ? 0 : parseInt(habitId, 10);

      // 🔥 TRUYỀN DATA "BAO ĐẬU": Truyền cả camelCase (cho local) và snake_case (cho Xano)
      const result = await saveMappingAndSync({
        tagId: tagId,
        type: type,
        habitId: safeHabitId,
        tagName: finalTagName,
        ndefUrl: urlToRecord,
        // -- Đính kèm snake_case đề phòng useNfcMappings truyền thẳng lên Axios --
        tag_id: tagId,
        habit_id: safeHabitId,
        tag_name: finalTagName,
        ndef_url: urlToRecord,
      });

      if (result && result.success) {
        Alert.alert("Success", `Successfully configured tag "${finalTagName}"!`);
        setTagName("");
      } else if (result && result.error === "DUPLICATE_TAG_ID") {
        Alert.alert("Tag Exists", result.message);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to save tag configuration.");
    } finally {
      setScanState("ready");
      loadData();
    }
  };

  const handleWriteAndSave = async (type, habitId = null) => {
    try {
      setScanState("scanning");
      
      // 1. Cố gắng kích hoạt phần cứng quét NFC (Chỉ chạy được trên máy thật)
      await NfcManager.requestTechnology([NfcTech.Ndef]);
      const tag = await NfcManager.getTag();
      
      if (!tag || !tag.id) {
        throw new Error("No valid tag detected.");
      }

      // Check trùng cục bộ ngay khi quét trên máy thật
      if (nfcMappings && nfcMappings[tag.id]) {
        Alert.alert(
          "Tag Exists",
          `This tag is already configured as "${nfcMappings[tag.id].tagName || "Unnamed Tag"}".`
        );
        setScanState("ready");
        await cleanUpNfcListener();
        return;
      }

      // Ghi data Ndef lên chip vật lý
      const targetHabit = allHabits.find((h) => String(h.id) === String(habitId));
      const finalServerId = targetHabit?.serverId || "null";
      
      const urlToRecord =
        type === "MULTIPLE"
          ? `bloom://nfc?type=multiple&tagId=${tag.id}`
          : `bloom://nfc?type=single&tagId=${tag.id}&serverId=${finalServerId}&localId=${habitId}`;

      const bytes = Ndef.encodeMessage([Ndef.uriRecord(urlToRecord)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      await cleanUpNfcListener();

      // Tiến hành lưu lên Xano
      await finalizeConfiguration(tag.id, type, habitId);

    } catch (nfcHardwareErr) {
      // 2. HÀNG RÀO PHÒNG THỦ MÁY ẢO: Khi phát hiện lỗi phần cứng, hiện luôn ô nhập tay ID
      await cleanUpNfcListener();
      setScanState("ready");

      Alert.prompt(
        "NFC Hardware Mock",
        "Laptop không hỗ trợ quét thẻ. Hãy nhập tay một mã ID Tag (ví dụ: 04a1b2) để giả lập:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: (mockTagId) => {
              const cleanedId = (mockTagId || "").trim().toLowerCase();
              if (!cleanedId) {
                Alert.alert("Error", "Mã ID không được để trống!");
                return;
              }
              // Chuyển thẳng ID nhập tay vào luồng lưu API
              finalizeConfiguration(cleanedId, type, habitId);
            },
          },
        ],
        "plain-text"
      );
    }
  };

  const handleRemoveMapping = useCallback((tagId) => {
    const currentTagName = nfcMappings?.[tagId]?.tagName || tagId;
    Alert.alert(
      "Remove Tag",
      `Are you sure you want to unlink "${currentTagName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            try {
              await removeMapping(tagId);
              loadData();
            } catch (err) {
              Alert.alert("Error", "Failed to unlink tag.");
            }
          },
        },
      ]
    );
  }, [nfcMappings, removeMapping, loadData]);

  const getHabitLabel = useCallback((habitId) => {
    if (!allHabits) return "Loading habit...";
    const habit = allHabits.find((h) => String(h.id) === String(habitId));
    if (!habit) return "Linked habit deleted";
    return habit.name || habit.title || "Unnamed Habit";
  }, [allHabits]);

  const safeNfcMappings = useMemo(() => nfcMappings || {}, [nfcMappings]);
  const tagKeys = useMemo(() => Object.keys(safeNfcMappings), [safeNfcMappings]);

  const visibleHabits = useMemo(() => {
    const list = unconfiguredHabits || [];
    return showAllHabits ? list : list.slice(0, 3);
  }, [unconfiguredHabits, showAllHabits]);

  const visibleTags = useMemo(() => {
    return showAllTags ? tagKeys : tagKeys.slice(0, 3);
  }, [tagKeys, showAllTags]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B604D" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>NFC Settings</Text>

      {scanState === "scanning" && (
        <View style={styles.scanInfo}>
          <ActivityIndicator color="#3B604D" />
          <Text style={styles.scanText}>Hold the NFC tag near the phone...</Text>
        </View>
      )}

      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Tag label</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Optional tag name"
          placeholderTextColor="#7C8B82"
          value={tagName}
          onChangeText={setTagName}
        />

        <Text style={styles.sectionTitle}>Configure tag</Text>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => handleWriteAndSave("MULTIPLE")}
          disabled={scanState === "scanning"}
        >
          <Text style={styles.btnPrimaryText}>Configure as MULTIPLE</Text>
        </TouchableOpacity>

        {unconfiguredHabits && unconfiguredHabits.length > 0 && (
          <>
            <Text style={styles.sectionSubTitle}>Or assign to a habit</Text>
            {visibleHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={styles.btnSecondary}
                onPress={() => handleWriteAndSave("SINGLE", habit.id)}
                disabled={scanState === "scanning"}
              >
                <Text style={styles.btnSecondaryText}>{habit.name || habit.title}</Text>
              </TouchableOpacity>
            ))}

            {unconfiguredHabits.length > 3 && (
              <TouchableOpacity 
                onPress={() => setShowAllHabits(!showAllHabits)}
                style={{ paddingVertical: 4, alignItems: "center" }}
              >
                <Text style={{ color: "#3B604D", fontWeight: "700", fontSize: 13 }}>
                  {showAllHabits ? "Collapse ▲" : `View all (${unconfiguredHabits.length}) ▼`}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>Configured tags ({tagKeys.length})</Text>

      {tagKeys.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No configured tags yet.</Text>
        </View>
      ) : (
        <>
          {visibleTags.map((tagId) => (
            <ConfiguredTagRow
              key={tagId}
              tagId={tagId}
              mapping={safeNfcMappings[tagId]}
              habitLabel={getHabitLabel(safeNfcMappings[tagId].habitId)}
              onUnlink={handleRemoveMapping}
            />
          ))}

          {tagKeys.length > 3 && (
            <TouchableOpacity 
              onPress={() => setShowAllTags(!showAllTags)}
              style={{ paddingVertical: 8, alignItems: "center", marginBottom: 20 }}
            >
              <Text style={{ color: "#3B604D", fontWeight: "700", fontSize: 13 }}>
                {showAllTags ? "Collapse ▲" : `View all (${tagKeys.length}) ▼`}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}