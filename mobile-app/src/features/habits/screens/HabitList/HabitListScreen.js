import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globe, Palette, SlidersHorizontal, MoreVertical } from "lucide-react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStyles } from "./HabitListScreen.styles";
import { useTheme } from "../../../../providers/ThemeProvider";
import { API_BASE_URL } from "../CreateHabit/services/config";
import * as habitsManager from "../CreateHabit/services/habitsManager";

const CATEGORIES = ["All", "Health", "Study", "Work", "Mindfulness", "Other"];

const renderCategoryIcon = (categoryType, styles) => {
  switch (categoryType?.toLowerCase()) {
    case "health":
      return (
        <View style={styles.iconDropletBase}>
          <View style={styles.iconDropletTip} />
          <View style={styles.iconDropletRound} />
        </View>
      );
    case "study":
      return (
        <View style={styles.iconBookContainer}>
          <View style={styles.iconBookLeftPage} />
          <View style={styles.iconBookRightPage} />
        </View>
      );
    case "mindfulness":
      return (
        <View style={styles.iconMeditationContainer}>
          <View style={styles.iconMeditationHead} />
          <View style={styles.iconMeditationTorso} />
          <View style={styles.iconMeditationBaseLine} />
        </View>
      );
    case "work":
      return (
        <View style={styles.iconWorkBriefcase}>
          <View style={styles.iconBriefcaseHandle} />
          <View style={styles.iconBriefcaseBox} />
        </View>
      );
    default:
      return <Text style={styles.iconStarDefaultText}>★</Text>;
  }
};

const getPriorityStyleMapping = (priorityStr, colors, t) => {
  switch (priorityStr?.toLowerCase()) {
    case "low":
      return {
        bg: colors.priorityLowBg,
        text: colors.priorityLowText,
        label: t("priority.lowLong"),
        stripe: colors.priorityLowStripe,
      };
    case "high":
      return {
        bg: colors.priorityHighBg,
        text: colors.priorityHighText,
        label: t("priority.highLong"),
        stripe: colors.priorityHighStripe,
      };
    case "medium":
    default:
      return {
        bg: colors.priorityMediumBg,
        text: colors.priorityMediumText,
        label: t("priority.mediumLong"),
        stripe: colors.priorityMediumStripe,
      };
  }
};

const getAvailableStatusOptions = (status, t) => {
  const currentStatus = status || "Active";
  let options = [];

  switch (currentStatus) {
    case "Active":
      options = [
        { id: "Paused", label: t("habitList.contextMenu.pause") },
        { id: "Archived", label: t("habitList.contextMenu.archive") },
      ];
      break;
    case "Paused":
      options = [
        { id: "Active", label: t("habitList.contextMenu.resume") },
        { id: "Archived", label: t("habitList.contextMenu.archive") },
      ];
      break;
    case "Archived":
      options = [{ id: "Active", label: t("habitList.contextMenu.restore") }];
      break;
    default:
      options = [];
  }

  return [
    {
      id: "history",
      label: t("habitList.contextMenu.history"),
    },
    ...options,
    {
      id: "delete",
      label: t("habitList.contextMenu.delete"),
      isDestructive: true,
    },
  ];
};

export default function HabitListScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { setThemeMode, themeMode, colors } = useTheme();
  const styles = getStyles(colors);

  const [habits, setHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentViewStatus, setCurrentViewStatus] = useState("Active"); 
  const [isLoading, setIsLoading] = useState(false);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const handleLanguageChange = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      setIsLangMenuOpen(false);
    } catch (e) {
      console.error("Language error:", e);
      Alert.alert("Error", "Failed to change language");
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      setThemeMode(theme);
      setIsThemeMenuOpen(false);
    } catch (e) {
      console.error("Theme error:", e);
      Alert.alert("Error", "Failed to change theme");
    }
  };

  const loadOriginalHabits = async () => {
    setIsLoading(true);
    try {
      const localHabits = await habitsManager.getHabits();
      if (localHabits && localHabits.length > 0) {
        setHabits(localHabits);
      }

      const response = await fetch(`${API_BASE_URL}/habits`);
      if (response.ok) {
        const raw = await response.json();
        const apiHabits = Array.isArray(raw)
          ? raw
          : raw?.data || raw?.habits || raw?.items || [];
        
        setHabits(apiHabits);
        await AsyncStorage.setItem("@habits_list", JSON.stringify(apiHabits));
      }
    } catch (error) {
      console.log("Load habits failed, rolling back to storage:", error);
      try {
        const cachedData = await AsyncStorage.getItem("@habits_list");
        setHabits(cachedData ? JSON.parse(cachedData) : []);
      } catch (storageError) {
        console.log("Read cache failed:", storageError);
        setHabits([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllMenus = useCallback(() => {
    setActiveDropdownId(null);
    setIsHeaderMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsThemeMenuOpen(false);
    setIsFilterMenuOpen(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation?.addListener("focus", () => {
      loadOriginalHabits();
      closeAllMenus();
    });
    return unsubscribe;
  }, [navigation, closeAllMenus]);

  const handleUpdateStatus = async (habitId, newStatus) => {
    try {
      console.log(`[UI ACTION]: Cap nhat trang thai habit ${habitId} thanh ${newStatus}`);
      // Goi API thong qua habitsManager voi payload chuan
      await habitsManager.updateHabit(habitId, { status: newStatus });

      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          if (String(h.id) === String(habitId) || (h.serverId && String(h.serverId) === String(habitId))) {
            return {
              ...h,
              status: newStatus,
              syncStatus: "synced",
            };
          }
          return h;
        })
      );
      
      setActiveDropdownId(null);
    } catch (error) {
      console.log("Error updating status:", error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const handleDeleteHabit = (item) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${item.name}" permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const targetId = item.id || item.serverId;
            try {
              const isDeleted = await habitsManager.deleteHabit(targetId);
              if (isDeleted) {
                setHabits((prevHabits) => prevHabits.filter((h) => String(h.id) !== String(targetId) && String(h.serverId) !== String(targetId)));
                setActiveDropdownId(null);
                Alert.alert("Success", "Habit deleted successfully");
              } else {
                Alert.alert("Error", "Failed to delete habit");
              }
            } catch (error) {
              console.error("Error deleting habit on UI:", error);
              Alert.alert("Error", "Failed to delete habit");
            }
          },
        },
      ],
    );
  };

  const filteredHabits = useMemo(() => {
    return habits.filter((item) => {
      if (!item || (!item.id && !item.serverId)) {
        return false;
      }

      const matchCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      const itemStatus = item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
        : "Active";
      const matchStatus = itemStatus === currentViewStatus;

      return matchCategory && matchStatus;
    });
  }, [habits, selectedCategory, currentViewStatus]);

  const renderHabitItem = useCallback(({ item }) => {
    const rawStatus = item.status || "Active";
    const currentStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const currentId = item.id || item.serverId;
    const isDropdownVisible = activeDropdownId === currentId;
    const priTheme = getPriorityStyleMapping(item.priority, colors, t);
    const availableOptions = getAvailableStatusOptions(currentStatus, t);

    const isStudy = item.category?.toLowerCase() === "study";
    const categoryBadgeBg = isStudy ? colors.badgeStudyBg : colors.badgeDefaultBg;
    const categoryBadgeText = isStudy ? colors.badgeStudyText : colors.badgeDefaultText;

    return (
      <View style={styles.cardOuterContainer}>
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Interactive element"
          style={styles.habitCardWrapper}
          onPress={() => {
            closeAllMenus();
            navigation && navigation.navigate("CreateHabit", { habitId: currentId });
          }}
          activeOpacity={0.9}
        >
          <View style={[styles.cardLeftStripe, { backgroundColor: priTheme.stripe }]} />

          <View style={styles.cardMainContentContainer}>
            <View style={styles.leftMetaContainer}>
              <View style={[styles.iconCircleBadge, currentStatus !== "Active" && styles.iconCircleBadgePaused]}>
                {renderCategoryIcon(item.category, styles)}
              </View>
            </View>

            <View style={styles.cardTextGroup}>
              <Text style={[styles.habitTitleLabel, currentStatus !== "Active" && styles.textMuted]} numberOfLines={1}>
                {item.name}
              </Text>

              <DynamicPriorityTagsGrid
                item={item}
                currentStatus={currentStatus}
                categoryBadgeBg={categoryBadgeBg}
                categoryBadgeText={categoryBadgeText}
                colors={colors}
                styles={styles}
                t={t}
                priTheme={priTheme}
              />
            </View>

            <View style={styles.cardRightActionBlock}>
              <View style={[
                styles.statusCapsule,
                currentStatus === "Active" && styles.statusCapsuleActive,
                currentStatus === "Paused" && styles.statusCapsulePaused,
                currentStatus === "Archived" && styles.statusCapsuleArchived,
              ]}>
                <Text
                  style={[
                    styles.statusCapsuleText,
                    currentStatus === "Active" && styles.statusTextActive,
                    currentStatus === "Paused" && styles.statusTextPaused,
                    currentStatus === "Archived" && styles.statusTextArchived,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {t(`status.${currentStatus.toLowerCase()}`)}
                </Text>
              </View>

              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Open Context Menu"
                style={styles.moreOptionsButton}
                onPress={() => setActiveDropdownId(isDropdownVisible ? null : currentId)}
                activeOpacity={0.7}
              >
                <MoreVertical size={20} color={colors.textSecondary || "#666"} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {isDropdownVisible && availableOptions.length > 0 && (
          <View style={[styles.cardDropdownListMenu, { height: availableOptions.length * 36 + 8 }]}>
            {availableOptions.map((option) => (
              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Interactive element"
                key={option.id}
                style={styles.cardDropdownOptionItem}
                onPress={() => {
                  if (option.id === "delete") {
                    handleDeleteHabit(item);
                  } else if (option.id === "history") {
                    closeAllMenus();
                    navigation && navigation.navigate("History", {
                      habit: item,
                    });
                  } else {
                    handleUpdateStatus(currentId, option.id);
                  }
                }}
              >
                <Text style={[styles.cardDropdownOptionText, option.isDestructive && { color: colors.warningDark, fontWeight: "bold" }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }, [activeDropdownId, colors, t, styles, navigation, closeAllMenus]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <TouchableWithoutFeedback onPress={closeAllMenus}>
        <View style={styles.flexContainer}>
          {/* TOP HEADER */}
          <View style={styles.globalTopNavigationHeader}>
            {/* <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={styles.headerLeftArrowButton}
              onPress={() => navigation && navigation.goBack()}
            >
              <Text style={styles.headerArrowSymbol}>←</Text>
            </TouchableOpacity> */}

            <Text style={styles.headerMainTitleText}>
              {t("habitList.title")}
            </Text>

            <View style={styles.headerRightActionGroup}>
              {/* Language Dropdown */}
              <View style={styles.langMenuWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Language"
                  onPress={() => {
                    setIsLangMenuOpen((prev) => !prev);
                    setIsThemeMenuOpen(false);
                    setIsHeaderMenuOpen(false);
                    setIsFilterMenuOpen(false);
                  }}
                  style={styles.headerIconButton}
                >
                  <Globe color={colors.primary} size={24} />
                </TouchableOpacity>
                {isLangMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    {[
                      { id: "en", flag: "🇺🇸", code: "EN" },
                      { id: "vi", flag: "🇻🇳", code: "VI" },
                      { id: "fr", flag: "🇫🇷", code: "FR" },
                      { id: "ja", flag: "🇯🇵", code: "JA" },
                      { id: "zh", flag: "🇨🇳", code: "ZH" },
                      { id: "de", flag: "🇩🇪", code: "DE" },
                    ].map((lang) => (
                      <TouchableOpacity
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={lang.code}
                        key={lang.id}
                        style={styles.headerMenuPopoverItem}
                        onPress={() => handleLanguageChange(lang.id)}
                      >
                        <Text style={[styles.headerMenuPopoverText, i18n.language === lang.id && { color: colors.primary, fontWeight: "700" }]}>
                          {lang.flag} {lang.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Theme Dropdown */}
              <View style={styles.themeMenuWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Theme"
                  onPress={() => {
                    setIsThemeMenuOpen((prev) => !prev);
                    setIsLangMenuOpen(false);
                    setIsHeaderMenuOpen(false);
                    setIsFilterMenuOpen(false);
                  }}
                  style={styles.headerIconButton}
                >
                  <Palette color={colors.primary} size={24} />
                </TouchableOpacity>
                {isThemeMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    {["Light", "Dark", "System"].map((theme) => (
                      <TouchableOpacity
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={theme}
                        key={theme}
                        style={styles.headerMenuPopoverItem}
                        onPress={() => handleThemeChange(theme)}
                      >
                        <Text style={[styles.headerMenuPopoverText, themeMode === theme && { color: colors.primary, fontWeight: "700" }]}>
                          {t("theme." + theme.toLowerCase())}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Interactive element"
                style={styles.headerActionIconBtn}
                onPress={() => {
                  closeAllMenus();
                  navigation && navigation.navigate("CreateHabit");
                }}
              >
                <Text style={styles.headerPlusIconSymbol}>+</Text>
              </TouchableOpacity>

              {/* MENU 3 CHẤM */}
              <View style={styles.relativeWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Interactive element"
                  style={styles.headerActionIconBtn}
                  onPress={() => {
                    setIsHeaderMenuOpen((prev) => !prev);
                    setIsLangMenuOpen(false);
                    setIsThemeMenuOpen(false);
                    setIsFilterMenuOpen(false);
                  }}
                >
                  <Text style={styles.headerArchiveIconSymbol}>⋮</Text>
                </TouchableOpacity>

                {isHeaderMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    {[
                      { id: "Active", title: t("habitList.filter.active") },
                      { id: "Paused", title: t("habitList.filter.paused") },
                      { id: "Archived", title: t("habitList.filter.archived") },
                    ].map((menuItem) => (
                      <TouchableOpacity
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel="Interactive element"
                        key={menuItem.id}
                        style={[styles.headerMenuPopoverItem, currentViewStatus === menuItem.id && { backgroundColor: colors.surfaceMuted }]}
                        onPress={() => {
                          setCurrentViewStatus(menuItem.id);
                          closeAllMenus();
                        }}
                      >
                        <Text style={[styles.headerMenuPopoverText, currentViewStatus === menuItem.id && { color: colors.primary, fontWeight: "700" }]}>
                          {menuItem.title}
                        </Text>
                      </TouchableOpacity>
                    ))}

                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

                    <TouchableOpacity
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel="NFC Settings"
                      style={styles.headerMenuPopoverItem}
                      onPress={() => {
                        closeAllMenus();
                        navigation && navigation.navigate("NfcSettings");
                      }}
                    >
                      <Text style={[styles.headerMenuPopoverText, { color: colors.primary, fontWeight: "600" }]}>
                        ⚙ NFC Setting
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* FILTERBAR ROW */}
          <View style={styles.topFilterBarContainer}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Filter Categories"
              onPress={() => {
                setIsFilterMenuOpen((prev) => !prev);
                setIsLangMenuOpen(false);
                setIsThemeMenuOpen(false);
                setIsHeaderMenuOpen(false);
              }}
              style={styles.filterTriggerRowBtn}
            >
              <SlidersHorizontal color={colors.primary} size={22} />
              <Text style={styles.filterTriggerText}>
                {t("Filter")}
              </Text>
            </TouchableOpacity>

            {isFilterMenuOpen && (
              <View style={styles.filterStandalonePopoverMenu}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.headerMenuPopoverItem,
                      selectedCategory === cat && { backgroundColor: colors.surfaceMuted }
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setIsFilterMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.headerMenuPopoverText,
                        selectedCategory === cat && { color: colors.primary, fontWeight: "700" },
                      ]}
                    >
                      {t("category." + cat.toLowerCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* HABITS FLATLIST */}
          {isLoading && habits.length === 0 ? (
            <View style={styles.loadingCenterWheel}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredHabits}
              keyExtractor={(item) => String(item.id || item.serverId)}
              renderItem={renderHabitItem}
              contentContainerStyle={styles.listScrollContentBody}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={closeAllMenus}
            />
          )}

          {/* FLOATING ACTION BUTTON */}
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Interactive element"
            style={styles.floatingActionButton}
            onPress={() => {
              closeAllMenus();
              navigation && navigation.navigate("CreateHabit");
            }}
            activeOpacity={0.85}
          >
            <View style={styles.fabPlusSignHorizontal} />
            <View style={styles.fabPlusSignVertical} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const DynamicPriorityTagsGrid = React.memo(({
  item,
  currentStatus,
  categoryBadgeBg,
  categoryBadgeText,
  colors,
  styles,
  t,
  priTheme,
}) => {
  const [topGroupWidth, setTopGroupWidth] = React.useState(null);
  const currentId = item.id || item.serverId;

  return (
    <View style={styles.cardTagsGrid}>
      <View style={styles.cardTagsRow}>
        <View style={styles.cardTagsTopGroup} onLayout={(e) => setTopGroupWidth(e.nativeEvent.layout.width)}>
          <View style={[styles.miniMetaBadge, { backgroundColor: categoryBadgeBg }]}>
            <Text style={[styles.miniMetaBadgeText, { color: categoryBadgeText }]} numberOfLines={1} ellipsizeMode="tail">
              {t(`category.${(item.category || "").toLowerCase()}`)}
            </Text>
          </View>
          <View style={[styles.miniMetaBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.miniMetaBadgeText, { color: colors.textMuted }]} numberOfLines={1} ellipsizeMode="tail">
              {t(`frequency.${(item.frequency || "").toLowerCase()}`)}
            </Text>
          </View>
        </View>

      </View>

      <View style={styles.cardTagsRow}>
        <View style={[styles.figmaPriorityCapsuleBase, { backgroundColor: priTheme.bg }, topGroupWidth ? { width: topGroupWidth } : { flexShrink: 1 }]}>
          <Text style={[styles.figmaPriorityCapsuleText, { color: priTheme.text }]} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit>
            {priTheme.label}
          </Text>
        </View>
      </View>
    </View>
  );
});