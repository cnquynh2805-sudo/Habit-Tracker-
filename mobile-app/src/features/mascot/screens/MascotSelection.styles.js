/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    background: {
      flex: 1,
    },

    overlay: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.65)",
    },

    header: {
      marginTop: 80,
      alignItems: "center",
    },

    title: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.primary,
      textAlign: "center",
    },

    subtitle: {
      marginTop: 12,
      textAlign: "center",
      fontSize: 18,
      lineHeight: 28,
      color: colors.textMuted,
    },

    mascotList: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 60,
    },

    mascotCard: {
      width: 170,
      height: 360,

      backgroundColor: "rgba(255,255,255,0.95)",

      borderRadius: 30,

      padding: 16,

      alignItems: "center",

      marginHorizontal: 8,
    },

    selectedCard: {
      borderWidth: 3,
      borderColor: "#7AE2A8",

      shadowColor: "#7AE2A8",

      shadowOpacity: 0.5,

      shadowRadius: 16,

      elevation: 10,
    },

    lockedCard: {
      opacity: 0.75,
    },

    mascotImage: {
      width: 140,
      height: 140,
    },

    lockedMascot: {
      width: 140,
      height: 140,
      opacity: 0.15,
    },

    lockOverlay: {
      position: "absolute",

      top: 65,

      alignSelf: "center",

      width: 70,

      height: 70,

      borderRadius: 35,

      backgroundColor: "rgba(255,255,255,0.9)",

      justifyContent: "center",

      alignItems: "center",
    },

    lockEmoji: {
      fontSize: 32,
    },

    mascotName: {
      width: "100%",
      marginTop: 10,

      textAlign: "center",

      fontSize: 28,
      fontWeight: "700",

      color: colors.primary,
    },

    description: {
      textAlign: "center",

      marginTop: 12,

      color: colors.textMuted,

      lineHeight: 22,
    },

    selectedButton: {
      marginTop: "auto",

      width: "100%",

      height: 46,

      borderRadius: 23,

      backgroundColor: colors.primary,

      justifyContent: "center",

      alignItems: "center",
    },

    selectedText: {
      color: "#FFF",

      fontWeight: "700",

      fontSize: 16,
    },

    lockedButton: {
      marginTop: "auto",

      width: "100%",

      height: 46,

      borderRadius: 23,

      backgroundColor: "#DADADA",

      justifyContent: "center",

      alignItems: "center",
    },

    lockedButtonText: {
      color: "#777",

      fontWeight: "700",
    },

    continueButton: {
      marginTop: 50,

      marginHorizontal: 24,

      height: 60,

      borderRadius: 30,

      backgroundColor: colors.primary,

      justifyContent: "center",

      alignItems: "center",
    },

    continueText: {
      color: "#FFF",

      fontSize: 20,

      fontWeight: "700",
    },
  });
