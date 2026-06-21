import React from "react";
import { Image, View } from "react-native";

import { MASCOT } from "../hooks/useTodayCheckins";

// Replace the placeholder gifs in src/assets/mascot with the real ones
// (same filenames) — see that folder's README.
const MASCOT_SOURCES = {
  [MASCOT.idle]: require("../../../assets/mascot/happy_boy.gif"),
  [MASCOT.happy]: require("../../../assets/mascot/happy_boy.gif"),
  [MASCOT.waiting]: require("../../../assets/mascot/waiting_boy.gif"),
  [MASCOT.doubt]: require("../../../assets/mascot/doubt_boy.gif"),
};

export default function MascotAvatar({ state, styles }) {
  const source = MASCOT_SOURCES[state] || MASCOT_SOURCES[MASCOT.idle];
  return (
    <View style={styles.mascotAvatarBox}>
      <Image
        source={source}
        style={styles.mascotAvatarImage}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel={`Mascot ${state}`}
      />
    </View>
  );
}
