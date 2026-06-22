import { StyleSheet } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flexOne: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 140,
    },

    content: {
      paddingHorizontal: 20,
      paddingBottom: 140,
    },

    header: {
      paddingTop: 8,
      paddingBottom: 16,
    },

    headerRow: {
      paddingTop: 8,
      paddingBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    settingsButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surface || "#f5f5f5",
      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary,
    },

    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 2,
    },

    name: {
      textAlign: "center",
      marginTop: 16,
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
    },

    tabContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border || "#e0e0e0",
      marginBottom: 12,
      position: "relative",
    },

    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    activeTab: {
    },

    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textMuted,
    },

    activeTabText: {
      color: colors.primary,
      fontWeight: "700",
    },

    tabIndicator: {
      position: "absolute",
      bottom: -1,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: colors.primary,
    },

    countText: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 16,
      fontWeight: "500",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
    },

    cardWrapper: {
      width: "48%",
    },

    horizontalListContainer: {
      height: 460,
      marginTop: 8,
      marginBottom: 24,
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },

    horizontalList: {
      flex: 1,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    milestone: {
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "flex-start",
    },

    milestoneIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      marginTop: 2,
    },

    milestoneIconText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },

    milestoneContent: {
      flex: 1,
    },

    milestoneTitle: {
      color: colors.text,
      fontWeight: "700",
      marginBottom: 4,
      fontSize: 14,
    },

    milestoneDescription: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },

    seeAllButton: {
      paddingVertical: 12,
      marginTop: 8,
      alignItems: "center",
    },

    seeAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "600",
    },
  });