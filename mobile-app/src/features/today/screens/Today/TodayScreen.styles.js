/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const getStyles = (colors) =>
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

    // --- Header ---
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 16,
    },
    headerTextGroup: {
      flex: 1,
      paddingRight: 12,
    },
    greetingText: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary,
    },
    dateText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 2,
    },
    mascotAvatarBox: {
      width: 72,
      height: 72,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    mascotAvatarImage: {
      width: "100%",
      height: "100%",
    },

    // --- Daily Progress card ---
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    progressTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    progressTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },
    progressSubtitle: {
      fontSize: 14,
      color: colors.primary,
      marginTop: 4,
    },
    progressPctValue: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.primary,
    },
    progressPctLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "right",
    },
    progressBarTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.surfaceMuted,
      marginTop: 16,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    riskPill: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.warningLight,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginTop: 16,
    },
    riskPillText: {
      color: colors.warningDark,
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 8,
      flex: 1,
    },

    // --- Section headers ---
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    sectionKebab: {
      fontSize: 22,
      color: colors.textMuted,
      fontWeight: "800",
    },

    // --- Habit card (To Do) ---
    cardClip: {
      borderRadius: 18,
      marginBottom: 14,
      overflow: "hidden",
    },
    swipeHintLayer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.successLight,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 24,
    },
    swipeHintText: {
      color: colors.successDark,
      fontWeight: "800",
      fontSize: 14,
    },
    habitCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    habitCardOverdue: {
      // Solid light-red (opaque so the card behind it doesn't show through).
      backgroundColor: "#FCEBEA",
      borderColor: "#F3C9C5",
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    categoryCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.successLight,
      marginRight: 12,
    },
    categoryCircleImage: {
      width: 20,
      height: 20,
      resizeMode: "contain",
    },
    cardTitleGroup: {
      flex: 1,
      paddingRight: 10,
    },
    habitName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    habitMeta: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 3,
    },
    habitMetaOverdue: {
      color: "#C0392B",
      fontWeight: "700",
    },
    checkinButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    checkinButtonOverdue: {
      backgroundColor: "#C0392B", // eslint-disable-line react-native/no-color-literals
    },
    checkinButtonDisabled: {
      opacity: 0.45,
    },
    checkinButtonText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 13,
    },

    // --- Progress row inside card ---
    cardProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    cardProgressLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    countGroup: {
      flexDirection: "row",
      alignItems: "center",
    },
    // Gray box so the editable number reads as an input field.
    countEditBox: {
      minWidth: 38,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    countInput: {
      minWidth: 38,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
    },
    countValueText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    countTargetText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textMuted,
    },
    miniBarTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceMuted,
      marginTop: 8,
      overflow: "hidden",
    },
    miniBarFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.primary,
    },

    // --- Done section ---
    doneRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      opacity: 0.7,
    },
    doneEmojiContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#6e6e6e",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    doneEmoji: {
      borderRadius: 14,
      height: 20,
      width: 20,
      fontSize: 5,
    },
    doneName: {
      flex: 1,
      fontSize: 15,
      color: colors.textMuted,
      textDecorationLine: "line-through",
    },
    doneStreak: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
      marginRight: 10,
    },
    doneCheckCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    doneCheckMark: {
      color: colors.onPrimary,
      fontSize: 13,
      fontWeight: "900",
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: 24,
    },

    // --- Undo snackbar ---
    snackbarWrap: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 96,
    },
    snackbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#1F2933", // eslint-disable-line react-native/no-color-literals
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 18,
    },
    snackbarText: {
      color: "#FFFFFF", // eslint-disable-line react-native/no-color-literals
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    snackbarAction: {
      color: colors.primaryMedium,
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 16,
    },

    // --- Modal shell (shared by filter + confirm) ---
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)", // eslint-disable-line react-native/no-color-literals
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 22,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    modalMessage: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
      marginBottom: 18,
    },

    // --- Confirm modal buttons ---
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    modalBtnGhost: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
    },
    modalBtnGhostText: {
      color: colors.textSecondary,
      fontWeight: "700",
      fontSize: 14,
    },
    modalBtnPrimary: {
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    modalBtnPrimaryText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 14,
    },

    // --- Filter menu ---
    filterGroupLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 10,
      marginTop: 6,
    },
    filterChipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 6,
    },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.onPrimary,
    },
    filterCloseBtn: {
      marginTop: 18,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    filterCloseBtnText: {
      color: colors.onPrimary,
      fontWeight: "800",
      fontSize: 14,
    },
    sectionKebabActive: {
      color: colors.primary,
    },
  });
