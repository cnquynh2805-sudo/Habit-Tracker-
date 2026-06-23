/* eslint-disable no-unused-vars, i18next/no-literal-string */
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import { createStyles } from "./MascotSelection.styles";
import { useMascotStore } from "../store/mascotStore";

import { useTheme } from "@/providers/ThemeProvider";

const mascots = [
  {
    id: "brother",
    name: "Brother",
    available: true,
    image: require("../../../assets/mascot/happy_boy.gif"),
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    available: false,
    image: require("../../../../assets/logo.png"),
  },
];

export default function MascotSelectionScreen() {
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [index, setIndex] = useState(0);

  const { chooseMascot } = useMascotStore();

  const mascot = mascots[index];

  return (
    <ImageBackground
      source={require("../../../assets/backgrounds/room_1.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose your mascot</Text>

          <Text style={styles.subtitle}>
            Your companion will motivate you on your journey!
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.mascotList}>
          {/* BROTHER */}
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.9}
            style={[styles.mascotCard, styles.selectedCard]}
          >
            <Image
              source={require("../../../assets/mascot/happy_boy.gif")}
              style={styles.mascotImage}
              resizeMode="contain"
            />

            <Text style={styles.mascotName}>Brother</Text>

            <Text style={styles.description}>
              Always here to support your goals!
            </Text>

            <View style={styles.selectedButton}>
              <Text style={styles.selectedText}>✓ Selected</Text>
            </View>
          </TouchableOpacity>

          {/* COMING SOON */}
          <View style={[styles.mascotCard, styles.lockedCard]}>
            <Image
              source={require("../../../../assets/logo.png")}
              style={styles.lockedMascot}
              resizeMode="contain"
            />

            <View style={styles.lockOverlay}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>

            <Text style={styles.mascotName}>Coming Soon</Text>

            <Text style={styles.description}>More mascots are on the way!</Text>

            <View style={styles.lockedButton}>
              <Text style={styles.lockedButtonText}>Locked</Text>
            </View>
          </View>
        </View>

        {/* CONTINUE */}
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.continueButton}
          onPress={() => chooseMascot("brother")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
