/* eslint-disable react-native/no-inline-styles, react-hooks/refs, i18next/no-literal-string */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { CATEGORY_ICONS } from "../../habits/constants";

const SWIPE_THRESHOLD = 110;
const CHECKIN_COOLDOWN_MS = 3000;

export default function TodoHabitCard({
  item,
  styles,
  colors,
  t,
  onCheckin,
  onSetCount,
  onSwipeDone,
}) {
  const { habit, checkin, target, overdue, streak } = item;
  const count = checkin.completedCount || 0;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(count));
  const [cooldown, setCooldown] = useState(false);

  const translateX = useMemo(() => new Animated.Value(0), []);
  const widthRef = useRef(400);
  const cooldownTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(cooldownTimerRef.current), []);

  const springBack = () =>
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only claim leftward swipes (= Done); rightward bubbles up to tabs.
        onMoveShouldSetPanResponder: (_evt, g) =>
          g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        // Keep the gesture once started so the parent tab-swipe responder
        // can't steal it mid-swipe (which would freeze the card).
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_evt, g) => {
          if (g.dx < 0) translateX.setValue(g.dx);
        },
        onPanResponderRelease: (_evt, g) => {
          // Always settle back, then ask the screen to confirm on a full swipe.
          springBack();
          if (g.dx < -SWIPE_THRESHOLD) onSwipeDone(habit);
        },
        onPanResponderTerminate: () => springBack(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habit, onSwipeDone, translateX],
  );

  const commitDraft = () => {
    setEditing(false);
    onSetCount(habit, draft);
  };

  // Disable the check-in button for a few seconds to prevent spamming.
  const handleCheckin = () => {
    if (cooldown) return;
    onCheckin(habit);
    setCooldown(true);
    cooldownTimerRef.current = setTimeout(
      () => setCooldown(false),
      CHECKIN_COOLDOWN_MS,
    );
  };

  const emoji = CATEGORY_ICONS[(habit.category || "other").toLowerCase()];
  const fillPct = Math.min(
    100,
    Math.round((count / Math.max(1, target)) * 100),
  );

  return (
    <View
      style={styles.cardClip}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
    >
      {/* Reveal layer behind the card while swiping left */}
      <View style={styles.swipeHintLayer}>
        <Text style={styles.swipeHintText}>✓ {t("today.markDone")}</Text>
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View style={[styles.habitCard, overdue && styles.habitCardOverdue]}>
          <View style={styles.cardTopRow}>
            <View style={styles.categoryCircle}>
              <Image source={emoji} style={styles.categoryCircleImage} />
            </View>

            <View style={styles.cardTitleGroup}>
              <Text style={styles.habitName} numberOfLines={1}>
                {habit.name}
              </Text>
              <Text style={styles.habitMeta} numberOfLines={1}>
                {t(`category.${(habit.category || "other").toLowerCase()}`)} ·{" "}
                {t("today.targetTimes", { count: target })}{" "}
                {t(`frequency.${(habit.frequency || "daily").toLowerCase()}`)}
                {streak > 1 ? ` · ${t("today.dayStreak", { count: streak })}` : ""}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("today.checkin")}
              accessibilityState={{ disabled: cooldown }}
              style={[
                styles.checkinButton,
                overdue && styles.checkinButtonOverdue,
                cooldown && styles.checkinButtonDisabled,
              ]}
              onPress={handleCheckin}
              disabled={cooldown}
              activeOpacity={0.85}
            >
              <Text style={styles.checkinButtonText}>{t("today.checkin")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardProgressRow}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text style={[styles.cardProgressLabel, { marginBottom: 0 }]}>
                {t("today.progress").toUpperCase()}
              </Text>
              {overdue && (
                <Text style={[styles.habitMetaOverdue, { marginLeft: 8, fontSize: 11, letterSpacing: 0.5 }]}>
                  {t("today.overdue").toUpperCase()}
                </Text>
              )}
            </View>

            <View style={styles.countGroup}>
              {editing ? (
                <TextInput
                  style={styles.countInput}
                  value={draft}
                  onChangeText={(txt) => setDraft(txt.replace(/[^0-9]/g, ""))}
                  onBlur={commitDraft}
                  onSubmitEditing={commitDraft}
                  keyboardType="number-pad"
                  maxLength={3}
                  autoFocus
                  selectTextOnFocus
                  accessibilityLabel={t("today.editCount")}
                />
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("today.editCount")}
                  style={styles.countEditBox}
                  onPress={() => {
                    setDraft(String(count));
                    setEditing(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.countValueText}>{count}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.countTargetText}>{` / ${target}`}</Text>
            </View>
          </View>

          <View style={styles.miniBarTrack}>
            <View style={[styles.miniBarFill, { width: `${fillPct}%` }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
