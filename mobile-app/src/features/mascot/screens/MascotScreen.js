import React, { useState } from "react";

import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";

import { Settings } from "lucide-react-native";

import MascotPreview from "../components/MascotPreview";

import CollectionCard from "../components/CollectionCard";

import { rewardItems } from "../data/rewards";

import { milestones } from "../data/milestones";

import { useMascotStore } from "../store/mascotStore";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./MascotScreen.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { chunkArray } from "../../../shared/helper/chunkArray";
import LanguageSwitcher from "@/shared/settings/LanguageSwitcher";
import ThemeSwitcher from "@/shared/settings/ThemeSwitcher";
import i18n from "@/shared/i18n";
import { useTranslation } from "react-i18next";
import { resetSystemData } from "../services/resetSytemApi";
import ConfirmModal from "@/shared/components/confirmModal/ConfirmModal";

export default function MascotScreen() {
  const { setThemeMode, themeMode, colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("collection");
  const { equippedRewardId, equipItem } = useMascotStore();
  const styles = createStyles(colors);
  const SCREEN_WIDTH = Dimensions.get("window").width;
  
  const unlockedRewards = rewardItems.filter((item) => item.unlocked);
  const lockedRewards = rewardItems.filter((item) => !item.unlocked);
  
  const displayData = activeTab === "collection" ? unlockedRewards : lockedRewards;
  const pages = chunkArray(displayData, 4);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const displayedMilestones = showAllMilestones
  ? milestones
  : milestones.slice(0, 2);
  
  const handleResetData = async () => {
    try {
      await resetSystemData();

      await AsyncStorage.multiRemove([
      "@habits_list",
      "@dashboard_goals_cache_v2",
      "@local_nfc_mappings",
      "@today_habits_cache",
      "mascot-storage",

    ]);

      // Reset mascot store
      useMascotStore.setState({
        equippedRewardId: 1,
      });

      Alert.alert(
        "Success",
        "All data has been reset."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to reset data."
      );
    }
  };

 const [showResetModal, setShowResetModal] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}> 
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>
            {t("mascot.title")}
          </Text>

          <Text style={styles.subtitle}>
            {t("mascot.subtitle")}
          </Text>
        </View>

        <View style={styles.settingsButton}>
          
          <View>
            <LanguageSwitcher i18n={i18n} colors={colors} />
          </View>

          <View>
            <ThemeSwitcher
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              colors={colors}
              t={t}
            />
          </View>

        </View>
        
        {/* <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      <MascotPreview />

      <Text style={styles.name}>
        Barnaby the Brother
      </Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "collection" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("collection")}
        >
          <Text style={[styles.tabText, activeTab === "collection" && styles.activeTabText]}>
            {t("mascot.collection")} ({unlockedRewards.length})
          </Text>
          {activeTab === "collection" && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "locked" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("locked")}
        >
          <Text style={[styles.tabText, activeTab === "locked" && styles.activeTabText]}>
            {t("mascot.locked")} ({lockedRewards.length})
          </Text>
          {activeTab === "locked" && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Collection/Locked Section - Horizontal Paging */}
      <View style={styles.horizontalListContainer}>
        <FlatList
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item: pageItems }) => (
            <View
              style={{
                width: SCREEN_WIDTH - 40,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {pageItems.map((reward) => {
                const isEquipped =
                  equippedRewardId === reward.id;

                return (
                  <View key={reward.id} style={styles.cardWrapper}>
                    <CollectionCard
                      item={reward}
                      isEquipped={isEquipped}
                      onEquip={equipItem}
                    />
                  </View>
                );
              })}
            </View>
          )}
          style={styles.horizontalList}
          nestedScrollEnabled={false}
          scrollEnabled={true}
        />
      </View>

      {/* Milestones Section */}
      <Text style={styles.sectionTitle}>
        {t("mascot.milestones")}
      </Text>

      {displayedMilestones.map((m) => (
        <View
          key={m.id}
          style={styles.milestone}
        >
          <View style={styles.milestoneIcon}>
            <Text style={styles.milestoneIconText}>
              {m.completed ? "✓" : "○"}
            </Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>
              {m.title}
            </Text>

            <Text style={styles.milestoneDescription}>
              {m.description}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.seeAllButton}
        onPress={() =>
          setShowAllMilestones(!showAllMilestones)
        }
      >
        <Text style={styles.seeAllText}>
          {showAllMilestones
            ? "Show Less"
            : t("mascot.seeAllMilestones")}
        </Text>
      </TouchableOpacity>

      <View style={styles.resetContainer}>
        <Text style={styles.resetDescription}>
          Want to start over?{" "}
          <Text
            style={styles.resetLink}
            onPress={() => setShowResetModal(true)}
          >
            Reset
          </Text>
        </Text>
      </View>
    </ScrollView>

    <ConfirmModal
      visible={showResetModal}
      title="Reset Data"
      message="This action will reset all data in your account and cannot be undone."
      cancelLabel="Cancel"
      confirmLabel="Reset"
      onCancel={() => setShowResetModal(false)}
      onConfirm={handleResetData}
    />

    </SafeAreaView>

  );
}