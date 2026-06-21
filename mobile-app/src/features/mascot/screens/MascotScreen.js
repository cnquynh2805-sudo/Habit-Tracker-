import React, { useState } from "react";

import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import MascotPreview from "../components/MascotPreview";

import CollectionCard from "../components/CollectionCard";

import { rewardItems } from "../data/rewards";

import { milestones } from "../data/milestones";

import { useMascotStore } from "../store/mascotStore";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./MascotScreen.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { chunkArray } from "../../../shared/helper/chunkArray";

export default function MascotScreen() {
  const [activeTab, setActiveTab] = useState("collection");
  const { profile, equipItem } = useMascotStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const SCREEN_WIDTH = Dimensions.get("window").width;
  
  const unlockedRewards = rewardItems.filter((item) => item.unlocked);
  const lockedRewards = rewardItems.filter((item) => !item.unlocked);
  
  const displayData = activeTab === "collection" ? unlockedRewards : lockedRewards;
  const pages = chunkArray(displayData, 4);
  const displayedMilestones = milestones.slice(0, 2);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}> 
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          My Room
        </Text>

        <Text style={styles.subtitle}>
          Take care of Barnaby today
        </Text>
      </View>

      <MascotPreview />

      <Text style={styles.name}>
        Barnaby the Bear
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
          <Text
            style={[
              styles.tabText,
              activeTab === "collection" && styles.activeTabText,
            ]}
          >
            Collection ({unlockedRewards.length})
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
          <Text
            style={[
              styles.tabText,
              activeTab === "locked" && styles.activeTabText,
            ]}
          >
            Locked ({lockedRewards.length})
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
              {pageItems.map((reward) => (
                <View key={reward.id} style={styles.cardWrapper}>
                  <CollectionCard
                    item={reward}
                    onEquip={equipItem}
                  />
                </View>
              ))}
            </View>
          )}
          style={styles.horizontalList}
          nestedScrollEnabled={false}
          scrollEnabled={true}
        />
      </View>

      {/* Milestones Section */}
      <Text style={styles.sectionTitle}>
        Milestones
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

      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>
          See all milestones
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}