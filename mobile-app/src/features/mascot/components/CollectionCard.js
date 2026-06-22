import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import styles from "./CollectionCard.styles.js";
import LottieView from "lottie-react-native";
import { useMascotStore } from "../store/mascotStore";

export default function CollectionCard({
  item,
  onEquip,
}) {
  
  const { equippedRewardId } = useMascotStore();
  const isEquipped = equippedRewardId === item.id;
  
  // const getButtonStyle = () => {
  //   if (item.unlocked && isEquipped) {
  //     return styles.equippedButton;
  //   }
  //   return styles.unequippedButton;
  // };

  // const getTextStyle = () => {
  //   if (item.unlocked && isEquipped) {
  //     return styles.equippedButtonText;
  //   }
  //   return styles.unequippedButtonText;
  // };

  // const getButtonLabel = () => {
  //   if (!item.unlocked) {
  //     return `${item.unlockCondition.value} day streak`;
  //   }
  //   return isEquipped ? "Equipped" : "Equip";
  // };
  const buttonStyle = [
    styles.button,

    !item.unlocked && styles.lockedButton,

    item.unlocked &&
      !isEquipped &&
      styles.unequippedButton,

    item.unlocked &&
      isEquipped &&
      styles.equippedButton,
  ];

  const buttonTextStyle = [
    styles.buttonText,

    !item.unlocked &&
      styles.lockedButtonText,

    item.unlocked &&
      !isEquipped &&
      styles.unequippedButtonText,

    item.unlocked &&
      isEquipped &&
      styles.equippedButtonText,
  ];

  const getButtonLabel = () => {
    if (!item.unlocked) return `${item.unlockCondition.value} day streak`;

    if (isEquipped) return "Equipped";

    return "Equip";
  };
  
  return (
    <View style={styles.card}>
      <View style={{opacity: item.unlocked ? 1 : 0.35, ...styles.animationContainer}} >
        <LottieView
          source={item.animation}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>

      <Text style={styles.name}>
        {item.name}
      </Text>

      <TouchableOpacity
        style={buttonStyle}
        onPress={() =>
          item.unlocked && onEquip(item.id)
        }
      >
        <Text style={buttonTextStyle}>
          {getButtonLabel()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}