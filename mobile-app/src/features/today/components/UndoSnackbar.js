import React, { useEffect, useMemo } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";

// Visibility (and the 8s lifetime) is driven by the parent via `visible`.
// Tapping UNDO reverts the last local change before it syncs to the server.
export default function UndoSnackbar({ visible, message, onUndo, styles, t }) {
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.snackbarWrap, { opacity }]}>
      <Animated.View style={styles.snackbar}>
        <Text style={styles.snackbarText} numberOfLines={1}>
          {message}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("today.undo")}
          onPress={onUndo}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.snackbarAction}>{t("today.undo")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
