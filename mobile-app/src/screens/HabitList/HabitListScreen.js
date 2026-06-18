/* eslint-disable react-native/no-color-literals, no-dupe-keys, react-native/no-inline-styles, i18next/no-literal-string, react-native-a11y/no-nested-touchables */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globe, Palette } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getStyles } from "./HabitListScreen.styles";
import { useTheme } from "../../providers/ThemeProvider";

export default function HabitListScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { setThemeMode, themeMode, colors } = useTheme();
  const styles = getStyles(colors);

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

  const [habits, setHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentViewStatus, setCurrentViewStatus] = useState("Active"); // Matches exact PascalCase capitalization in OpenAPI specs
  const [isLoading, setIsLoading] = useState(false);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const categories = ["All", "Health", "Study", "Work", "Mindfulness", "Other"];

  const loadOriginalHabits = async () => {
    setIsLoading(true);
    try {
      const cachedData = await AsyncStorage.getItem("@habits_list");
      if (cachedData) {
        setHabits(JSON.parse(cachedData));
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.log("Error reading storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation?.addListener("focus", () => {
      loadOriginalHabits();
      setActiveDropdownId(null);
      setIsHeaderMenuOpen(false);
      setIsLangMenuOpen(false);
      setIsThemeMenuOpen(false);
      setIsLangMenuOpen(false);
      setIsThemeMenuOpen(false);
    });
    return unsubscribe;
  }, [navigation]);

  // Update habit status (Active / Paused / Archived)
  const handleUpdateStatus = async (habitId, newStatus) => {
    try {
      const cachedData = await AsyncStorage.getItem("@habits_list");
      let allHabits = cachedData ? JSON.parse(cachedData) : [];

      allHabits = allHabits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            status: newStatus, // Receives normalized 'Active' / 'Paused' / 'Archived' values
            canCheckin: newStatus === "Active", // Structuring local key mapping to camelCase
            isSynced: false,
          };
        }
        return h;
      });

      setHabits(allHabits);
      await AsyncStorage.setItem("@habits_list", JSON.stringify(allHabits));
      setActiveDropdownId(null);
    } catch (error) {
      console.log("Error updating status:", error);
    }
  };

  // Permanently delete a habit with confirmation alert
  const handleDeleteHabit = (habitId) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const cachedData = await AsyncStorage.getItem("@habits_list");
              const allHabits = cachedData ? JSON.parse(cachedData) : [];

              const updatedList = allHabits.filter((h) => h.id !== habitId);

              setHabits(updatedList);
              await AsyncStorage.setItem(
                "@habits_list",
                JSON.stringify(updatedList),
              );
              setActiveDropdownId(null);
            } catch (error) {
              console.log("Error deleting habit:", error);
            }
          },
        },
      ],
    );
  };

  // Generate action menu options dynamically based on current context status matching PascalCase specification
  const getAvailableStatusOptions = (status) => {
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

    // Always append the Delete option at the end of the context dropdown
    return [
      ...options,
      {
        id: "delete",
        label: t("habitList.contextMenu.delete"),
        isDestructive: true,
      },
    ];
  };

  const filteredHabits = habits.filter((item) => {
    const matchCategory =
      selectedCategory === "All" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    // Normalize existing legacy items or missing items defaults gracefully to 'Active'
    const itemStatus = item.status
      ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
      : "Active";
    const matchStatus = itemStatus === currentViewStatus;

    return matchCategory && matchStatus;
  });

  const renderCategoryIcon = (categoryType) => {
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
          </View>
        );
      default:
        return <Text style={styles.iconStarDefaultText}>★</Text>;
    }
  };

  const getPriorityStyleMapping = (priorityStr) => {
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

  const renderHabitItem = ({ item }) => {
    // Ensures clean rendering even if backward compatible structural fields mismatch
    const rawStatus = item.status || "Active";
    const currentStatus =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const isDropdownVisible = activeDropdownId === item.id;
    const priTheme = getPriorityStyleMapping(item.priority);
    const availableOptions = getAvailableStatusOptions(currentStatus);

    const isStudy = item.category?.toLowerCase() === "study";
    const categoryBadgeBg = isStudy
      ? colors.badgeStudyBg
      : colors.badgeDefaultBg;
    const categoryBadgeText = isStudy
      ? colors.badgeStudyText
      : colors.badgeDefaultText;

    return (
      <View style={styles.cardOuterContainer}>
        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Interactive element"
          style={styles.habitCardWrapper}
          onPress={() =>
            navigation &&
            navigation.navigate("CreateHabit", { habitId: item.id })
          }
          activeOpacity={0.9}
        >
          <View
            style={[
              styles.cardLeftStripe,
              { backgroundColor: priTheme.stripe },
            ]}
          />

          <View style={styles.cardMainContentContainer}>
            <View style={styles.leftMetaContainer}>
              <View
                style={[
                  styles.iconCircleBadge,
                  currentStatus !== "Active" && styles.iconCircleBadgePaused,
                ]}
              >
                {renderCategoryIcon(item.category)}
              </View>
            </View>

            <View style={styles.cardTextGroup}>
              <Text
                style={[
                  styles.habitTitleLabel,
                  currentStatus !== "Active" && styles.textMuted,
                ]}
                numberOfLines={1}
              >
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
                isDropdownVisible={isDropdownVisible}
                setActiveDropdownId={setActiveDropdownId}
                priTheme={priTheme}
              />
            </View>

            <View style={styles.cardRightActionBlock}>
              <View style={styles.figmaChevronRightContainer}>
                <View style={styles.figmaChevronLineTop} />
                <View style={styles.figmaChevronLineBottom} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isDropdownVisible && availableOptions.length > 0 && (
          <View
            style={[
              styles.cardDropdownListMenu,
              { height: availableOptions.length * 36 + 8 },
            ]}
          >
            {availableOptions.map((option) => (
              <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel="Interactive element"
                key={option.id}
                style={styles.cardDropdownOptionItem}
                onPress={() => {
                  if (option.id === "delete") {
                    handleDeleteHabit(item.id);
                  } else {
                    handleUpdateStatus(item.id, option.id);
                  }
                }}
              >
                <Text
                  style={[
                    styles.cardDropdownOptionText,
                    option.isDestructive && {
                      color: colors.warningDark,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <TouchableWithoutFeedback
        accessibilityRole="button"
        onPress={() => {
          setActiveDropdownId(null);
          setIsHeaderMenuOpen(false);
          setIsLangMenuOpen(false);
          setIsThemeMenuOpen(false);
        }}
      >
        <View style={styles.flexContainer}>
          {/* TOP HEADER */}
          <View style={styles.globalTopNavigationHeader}>
            <TouchableOpacity
              accessible
              accessibilityRole="button"
              accessibilityLabel="Interactive element"
              style={styles.headerLeftArrowButton}
              onPress={() => navigation && navigation.goBack()}
            >
              <Text style={styles.headerArrowSymbol}>←</Text>
            </TouchableOpacity>

            <Text style={styles.headerMainTitleText}>
              {t("habitList.title")}
            </Text>

            <View style={styles.headerRightActionGroup}>
              <View style={styles.langMenuWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Language"
                  onPress={() => setIsLangMenuOpen(!isLangMenuOpen)}
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
                        <Text
                          style={[
                            styles.headerMenuPopoverText,
                            i18n.language === lang.id && {
                              color: colors.primary,
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {lang.flag} {lang.code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.themeMenuWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Theme"
                  onPress={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
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
                        <Text
                          style={[
                            styles.headerMenuPopoverText,
                            themeMode === theme && {
                              color: colors.primary,
                              fontWeight: "700",
                            },
                          ]}
                        >
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
                onPress={() => navigation && navigation.navigate("CreateHabit")}
              >
                <Text style={styles.headerPlusIconSymbol}>+</Text>
              </TouchableOpacity>

              <View style={styles.relativeWrapper}>
                <TouchableOpacity
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Interactive element"
                  style={styles.headerActionIconBtn}
                  onPress={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
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
                        style={[
                          styles.headerMenuPopoverItem,
                          currentViewStatus === menuItem.id && {
                            backgroundColor: colors.surfaceMuted,
                          },
                        ]}
                        onPress={() => {
                          setCurrentViewStatus(menuItem.id);
                          setIsHeaderMenuOpen(false);
                          setIsLangMenuOpen(false);
                          setIsThemeMenuOpen(false);
                          setActiveDropdownId(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.headerMenuPopoverText,
                            currentViewStatus === menuItem.id && {
                              color: colors.primary,
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {menuItem.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* FILTER BAR */}
          <View style={styles.topFilterBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBarScrollInner}
            >
              {categories.map((cat) => {
                const isCurrent = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Interactive element"
                    key={cat}
                    style={[
                      styles.filterChipButton,
                      isCurrent && styles.filterChipButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isCurrent && styles.filterChipTextActive,
                      ]}
                    >
                      {t("category." + cat.toLowerCase())}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* HABITS FLATLIST */}
          {isLoading && habits.length === 0 ? (
            <View style={styles.loadingCenterWheel}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredHabits}
              keyExtractor={(item) => item.id}
              renderItem={renderHabitItem}
              contentContainerStyle={styles.listScrollContentBody}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => {
                setActiveDropdownId(null);
                setIsHeaderMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsThemeMenuOpen(false);
              }}
            />
          )}

          {/* FLOATING ACTION BUTTON */}
          <TouchableOpacity
            accessible
            accessibilityRole="button"
            accessibilityLabel="Interactive element"
            style={styles.floatingActionButton}
            onPress={() => navigation && navigation.navigate("CreateHabit")}
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

const DynamicPriorityTagsGrid = ({
  item,
  currentStatus,
  categoryBadgeBg,
  categoryBadgeText,
  colors,
  styles,
  t,
  isDropdownVisible,
  setActiveDropdownId,
  priTheme,
}) => {
  const [topGroupWidth, setTopGroupWidth] = React.useState(null);

  return (
    <View style={styles.cardTagsGrid}>
      <View style={styles.cardTagsRow}>
        <View
          style={styles.cardTagsTopGroup}
          onLayout={(e) => setTopGroupWidth(e.nativeEvent.layout.width)}
        >
          <View
            style={[styles.miniMetaBadge, { backgroundColor: categoryBadgeBg }]}
          >
            <Text
              style={[styles.miniMetaBadgeText, { color: categoryBadgeText }]}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
            >
              {t(`category.${(item.category || "").toLowerCase()}`)}
            </Text>
          </View>
          <View
            style={[styles.miniMetaBadge, { backgroundColor: colors.border }]}
          >
            <Text
              style={[styles.miniMetaBadgeText, { color: colors.textMuted }]}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
            >
              {t(`frequency.${(item.frequency || "").toLowerCase()}`)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          accessible
          accessibilityRole="button"
          accessibilityLabel="Interactive element"
          style={[
            styles.statusCapsule,
            currentStatus === "Active" && styles.statusCapsuleActive,
            currentStatus === "Paused" && styles.statusCapsulePaused,
            currentStatus === "Archived" && styles.statusCapsuleArchived,
          ]}
          onPress={() =>
            setActiveDropdownId(isDropdownVisible ? null : item.id)
          }
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statusCapsuleText,
              currentStatus === "Active" && styles.statusTextActive,
              currentStatus === "Paused" && styles.statusTextPaused,
              currentStatus === "Archived" && styles.statusTextArchived,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
          >
            {t(`status.${currentStatus.toLowerCase()}`)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardTagsRow}>
        <View
          style={[
            styles.figmaPriorityCapsuleBase,
            { backgroundColor: priTheme.bg },
            topGroupWidth ? { width: topGroupWidth } : { flexShrink: 1 },
          ]}
        >
          <Text
            style={[styles.figmaPriorityCapsuleText, { color: priTheme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
          >
            {priTheme.label}
          </Text>
        </View>
      </View>
    </View>
  );
};
