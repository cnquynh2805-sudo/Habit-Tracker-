/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
    },

    messageBubbleContainer: {
      alignSelf: "flex-start",
      marginBottom: 16,
      marginLeft: 20,
    },

    messageBubble: {
      backgroundColor: "#fff",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
      maxWidth: 280,
    },

    messageBubbleText: {
      color: colors.primary || "#2D6A63",
      fontWeight: "600",
      fontSize: 14,
      textAlign: "left",
    },

    messageBubbleTail: {
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 10,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: "#fff",
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },

    preview: {
      width: 320,
      height: 260,
      alignSelf: "center",
      borderRadius: 20,
      overflow: "hidden",
    },

    mascotImage: {
      width: 170,
      height: 170,
      position: "absolute",
      left: 70,
      top: 45,
    },

    rewardAnimation: {
      width: 90,
      height: 90,
      position: "absolute",
      right: 20,
      bottom: 20,
    },

    bear: {
      fontSize: 100,
    },
  });
