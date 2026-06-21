import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import styles from "./CollectionCard.styles";
import LottieView from "lottie-react-native";
import { useMascotStore } from "../store/mascotStore";

export default function CollectionCard({
  item,
  onEquip,
}) {
  
  const { equippedRewardId } = useMascotStore();
  const isEquipped = equippedRewardId === item.id;
  
  const getButtonStyle = () => {
    if (item.unlocked && isEquipped) {
      return styles.equippedButton;
    }
    return styles.unequippedButton;
  };

  const getTextStyle = () => {
    if (item.unlocked && isEquipped) {
      return styles.equippedButtonText;
    }
    return styles.unequippedButtonText;
  };

  const getButtonLabel = () => {
    if (!item.unlocked) {
      return "Locked";
    }
    return isEquipped ? "Unequip" : "Equip";
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.animationContainer}>
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
        style={[styles.button, getButtonStyle()]}
        onPress={() => {
          if (!item.unlocked) return;
          onEquip(item.id);
        }}
      >
        <Text style={[styles.buttonText, getTextStyle()]}>
          {getButtonLabel()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}