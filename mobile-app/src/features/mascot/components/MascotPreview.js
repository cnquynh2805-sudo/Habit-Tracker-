import React from "react";

import {
  View,
  Image,
  ImageBackground,
  Text,
} from "react-native";

import LottieView from "lottie-react-native";

import { rewardItems } from "../data/rewards";

import { useMascotStore } from "../store/mascotStore";
import { useTheme } from "@/providers/ThemeProvider";

export default function MascotPreview() {
  const { equippedRewardId } =
    useMascotStore();

  const reward =
    rewardItems.find(
      (item) =>
        item.id === equippedRewardId
    );

  const { colors } = useTheme();

  return (
    <>
      <View
        style={{
          alignSelf: "center",

          backgroundColor: colors.surface,

          paddingHorizontal: 14,

          paddingVertical: 10,

          borderRadius: 18,

          marginBottom: 12,

          shadowOpacity: 0.08,

          shadowRadius: 6,

          elevation: 2,
        }}
      >
        <Text
          style={{
            color: colors.text,

            fontWeight: "600",
          }}
        >
          You're doing great today! 🌱
        </Text>
      </View>
      <ImageBackground
        source={require("../../../assets/backgrounds/room_1.jpg")}
        style={{
          width: 320,
          height: 260,

          alignSelf: "center",

          borderRadius: 20,

          overflow: "hidden",
        }}
      >
        <Image
          source={require("../../../assets/mascot/happy_boy.gif")}
          style={{
            width: 170,
            height: 170,

            position: "absolute",

            left: 70,

            top: 45,
          }}
        />

        {reward && (
          <LottieView
            source={reward.animation}
            autoPlay
            loop
            style={{
              width: 90,
              height: 90,

              position: "absolute",

              right: 20,

              bottom: 20,
            }}
          />
        )}
      </ImageBackground>
    </>
   
  );
}