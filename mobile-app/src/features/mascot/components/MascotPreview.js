/* eslint-disable react-hooks/purity */
import LottieView from "lottie-react-native";
import React from "react";
import { View, Image, ImageBackground, Text } from "react-native";

import { createStyles } from "./MascotPreview.styles";
import { rewardItems } from "../data/rewards";
import { useMascotStore } from "../store/mascotStore";

import { useTheme } from "@/providers/ThemeProvider";

export default function MascotPreview() {
  const { equippedRewardId } = useMascotStore();

  const reward = rewardItems.find((item) => item.id === equippedRewardId);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const messages = [
    "You're doing great today! 🌱",
    "Keep going! ✨",
    "I'm proud of you! 🐻",
    "One habit at a time 💪",
    "Let's build a streak! 🔥",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const selectedMascot = useMascotStore((state) => state.selectedMascot);

  const mascotImages = {
    brother: require("../../../assets/mascot/happy_boy.gif"),
  };

  console.log("Current equip:", equippedRewardId);

  return (
    <>
      <View style={styles.messageBubbleContainer}>
        <View style={styles.messageBubble}>
          <Text style={styles.messageBubbleText}>{randomMessage}</Text>
        </View>
        {/* Tail pointing down */}
        <View style={styles.messageBubbleTail} />
      </View>
      <ImageBackground
        source={require("../../../assets/backgrounds/room_1.jpg")}
        style={styles.preview}
      >
        <Image
          // source={require("../../../assets/mascot/happy_boy.gif")}
          source={mascotImages[selectedMascot]}
          style={styles.mascotImage}
        />

        {reward && (
          <LottieView
            source={reward.animation}
            autoPlay
            loop
            style={styles.rewardAnimation}
          />
        )}
      </ImageBackground>
    </>
  );
}
