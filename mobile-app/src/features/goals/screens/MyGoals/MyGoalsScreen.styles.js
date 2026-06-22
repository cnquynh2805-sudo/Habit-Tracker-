import { StyleSheet } from "react-native";

export const getGoalsStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
    },
    searchButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginTop: 28,
      marginBottom: 14,
    },

    // ─── Overall Progress Card ───────────────────────────────────────────────
    overallCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    overallCardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    overallTextContainer: {
      flex: 1,
    },
    overallLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    overallCount: {
      fontSize: 36,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 40,
    },
    overallSubtext: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 2,
    },
    progressRingContainer: {
      width: 72,
      height: 72,
      justifyContent: "center",
      alignItems: "center",
    },
    progressRingText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      position: "absolute",
    },
    overallProgressBarBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginTop: 16,
      overflow: "hidden",
    },
    overallProgressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },

    // ─── Active Milestone Card ───────────────────────────────────────────────
    milestoneCard: {
      backgroundColor: colors.primaryLight || "rgba(76,175,80,0.1)",
      borderRadius: 20,
      padding: 18,
      marginBottom: 14,
    },
    milestoneHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    milestoneIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    milestoneTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    milestoneSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    milestoneProgressBg: {
      height: 8,
      backgroundColor: "rgba(0,0,0,0.08)",
      borderRadius: 4,
      marginBottom: 10,
      overflow: "hidden",
    },
    milestoneProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    milestoneFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    milestoneStatusText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    milestoneCountText: {
      fontSize: 13,
      color: colors.textMuted,
    },

    // ─── No Goal Card ────────────────────────────────────────────────────────
    noGoalCard: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      borderRadius: 20,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    noGoalIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    noGoalTextContainer: {
      flex: 1,
    },
    noGoalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    noGoalSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    setGoalButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    setGoalButtonText: {
      color: "#FFF",
      fontSize: 13,
      fontWeight: "700",
    },

    // ─── Mascot Card ─────────────────────────────────────────────────────────
    mascotCard: {
      backgroundColor: colors.primaryLight || "rgba(76,175,80,0.1)",
      borderRadius: 20,
      padding: 18,
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 28,
      marginBottom: 40,
    },
    mascotAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    mascotBubble: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 16,
      borderTopLeftRadius: 4,
    },
    mascotText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 21,
      fontStyle: "italic",
    },
  });
