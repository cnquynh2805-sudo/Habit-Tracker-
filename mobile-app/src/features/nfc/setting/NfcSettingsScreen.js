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
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
import styles from "./NfcSettingsScreen.styles";
import useNfcMappings from "./hooks/useNfcMappings";

// Tách nhỏ UI hiển thị danh sách thẻ đã cấu hình để tránh re-render lãng phí
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

      const targetHabit = allHabits.find((h) => String(h.id) === String(habitId));
      const finalServerId = targetHabit?.serverId || "null";

      const urlToRecord =
        type === "MULTIPLE"
          ? `Bloom://nfc?type=multiple`
          : `Bloom://nfc?type=single&serverId=${finalServerId}&localId=${habitId}`;

      const bytes = Ndef.encodeMessage([Ndef.uriRecord(urlToRecord)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      const finalTagName =
        tagName.trim() ||
        (type === "MULTIPLE"
          ? "Multi-Habit Tag"
          : `Tag #${tag.id.slice(-4)}`);

      await saveMappingAndSync({
        tagId: tag.id,
        type,
        habitId,
        tagName: finalTagName,
        ndefUrl: urlToRecord,
      });

      Alert.alert(
        "Success",
        `Successfully configured and wrote data to "${finalTagName}"!`
      );
      setTagName("");
    } catch (err) {
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
    const habit = allHabits.find((h) => h.id === habitId);
    if (!habit) return "Linked habit deleted";
    return habit.name;
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