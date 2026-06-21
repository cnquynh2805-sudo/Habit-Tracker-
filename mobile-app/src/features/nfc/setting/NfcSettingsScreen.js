import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
import styles from "./NfcSettingsScreen.styles";
import useNfcMappings from "./hooks/useNfcMappings";

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

  const handleWriteAndSave = async (type, habitId = null) => {
    try {
      setScanState("scanning");
      await NfcManager.requestTechnology([NfcTech.Ndef]);
      const tag = await NfcManager.getTag();
      
      if (!tag || !tag.id) {
        throw new Error("No valid tag detected.");
      }

      if (nfcMappings && nfcMappings[tag.id]) {
        Alert.alert(
          "Tag Exists",
          `This tag is already configured as "${
            nfcMappings[tag.id].tagName?.trim() || "Unnamed Tag"
          }". Please unlink it first.`
        );
        return;
      }

      // ==================== KHU VỰC SỬA ĐỔI CHÍ MẠNG ====================
      // BƯỚC 1: Tìm kiếm Habit tương ứng để bốc ra đúng serverId (số của Xano)
      const targetHabit = allHabits.find((h) => String(h.id) === String(habitId));
      const finalServerId = targetHabit?.serverId || "null";

      // BƯỚC 2: Chuyển đổi URL ghi vào thẻ thành dạng Deep Link của App (Thay vì gọi thẳng API Xano)
      // Cấu trúc: myhabitapp://nfc?type=...
      const urlToRecord =
        type === "MULTIPLE"
          ? `Bloom://nfc?type=multiple`
          : `Bloom://nfc?type=single&serverId=${finalServerId}&localId=${habitId}`;
      // ==================================================================

      const bytes = Ndef.encodeMessage([Ndef.uriRecord(urlToRecord)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      const finalTagName =
        tagName.trim() ||
        (type === "MULTIPLE"
          ? "Multi-Habit Tag"
          : `Tag #${tag.id.slice(-4)}`);

      console.log("⏳ [API Sync]: Đang đẩy dữ liệu cấu hình thẻ lên Xano Server...");

      // Vẫn gọi hàm đồng bộ lưu trữ cấu trúc lên Xano để backup
      await saveMappingAndSync({
        tagId: tag.id,
        type,
        habitId,
        tagName: finalTagName,
        ndefUrl: urlToRecord, // Đồng bộ luôn link Deep Link này lên DB mây
      });

      console.log(`✅ [API Sync Thành Công]: Đã lưu thẻ ${finalTagName} lên cơ sở dữ liệu API!`);

      Alert.alert(
        "Success",
        `Successfully configured and wrote data to "${finalTagName}"!`
      );
      setTagName("");
    } catch (err) {
      console.warn("NFC write error", err);
      Alert.alert(
        "Write Error",
        "Failed to write data onto the NFC tag. Please try again."
      );
    } finally {
      await cleanUpNfcListener();
      setScanState("ready");
      loadData();
    }
  };

  const handleRemoveMapping = async (tagId) => {
    Alert.alert(
      "Remove Tag",
      `Are you sure you want to unlink "${nfcMappings[tagId]?.tagName || tagId}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`⏳ [API Sync]: Đang yêu cầu xóa thẻ khỏi API...`);
              await removeMapping(tagId);
              console.log(`✅ [API Sync Thành Công]: Thẻ đã được gỡ đồng bộ hoàn toàn khỏi hệ thống API.`);
              loadData();
            } catch (err) {
              Alert.alert("Error", "Failed to unlink tag.");
            }
          },
        },
      ]
    );
  };

  const getHabitLabel = (habitId) => {
    if (!allHabits) return "Loading habit...";
    const habit = allHabits.find((h) => h.id === habitId);
    if (!habit) return "Linked habit deleted";
    return habit.name;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B604D" />
      </View>
    );
  }

  const safeNfcMappings = nfcMappings || {};
  const tagKeys = Object.keys(safeNfcMappings);

  const visibleHabits = showAllHabits 
    ? (unconfiguredHabits || []) 
    : (unconfiguredHabits || []).slice(0, 3);

  const visibleTags = showAllTags 
    ? tagKeys 
    : tagKeys.slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>NFC Settings</Text>

      {scanState === "scanning" && (
        <View style={styles.scanInfo}>
          <ActivityIndicator color="#3B604D" />
          <Text style={styles.scanText}>
            Hold the NFC tag near the phone...
          </Text>
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
                <Text style={styles.btnSecondaryText}>{habit.name}</Text>
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

      <Text style={styles.sectionTitle}>
        Configured tags ({tagKeys.length})
      </Text>

      {tagKeys.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No configured tags yet.</Text>
        </View>
      ) : (
        <>
          {visibleTags.map((tagId) => (
            <View key={tagId} style={styles.mappingRow}>
              <View style={styles.mappingInfo}>
                <Text style={styles.mappingTitle}>
                  {safeNfcMappings[tagId].tagName?.trim() || "Unnamed Tag"}
                </Text>
                <Text style={styles.mappingSubtitle}>
                  {safeNfcMappings[tagId].type === "MULTIPLE"
                    ? "MULTIPLE tag"
                    : `SINGLE: ${getHabitLabel(safeNfcMappings[tagId].habitId)}`}
                </Text>
                <Text style={styles.mappingId}>ID: {tagId}</Text>
              </View>
              <TouchableOpacity
                style={styles.btnDanger}
                onPress={() => handleRemoveMapping(tagId)}
              >
                <Text style={styles.btnDangerText}>Unlink</Text>
              </TouchableOpacity>
            </View>
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