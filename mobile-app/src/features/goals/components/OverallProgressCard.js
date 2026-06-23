import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

// AnimatedCircle must use useAnimatedProps (not useAnimatedStyle)
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Displays overall progress: "X / Y habits have goals" with a circular
 * progress ring (Reanimated + react-native-svg) and a linear bar underneath.
 */
export default function OverallProgressCard({
  activeCount,
  totalCount,
  percent,
  styles,
  colors,
}) {
  const { t } = useTranslation();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, percent)) / 100, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  // SVG ring geometry
  const SIZE = 72;
  const STROKE = 7;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = RADIUS * 2 * Math.PI;

  // SVG props must use useAnimatedProps (not useAnimatedStyle)
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE - CIRCUMFERENCE * progress.value,
  }));

  // Linear bar uses useAnimatedStyle (correct for View/RN components)
  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const displayPercent = Math.round(percent);

  return (
    <View style={styles.overallCard}>
      {/* Top row: text + ring */}
      <View style={styles.overallCardRow}>
        <View style={styles.overallTextContainer}>
          <Text style={styles.overallLabel}>{t("goals.overallProgress")}</Text>
          <Text style={styles.overallCount}>
            {activeCount} / {totalCount}
          </Text>
          <Text style={styles.overallSubtext}>
            {t("goals.habitsHaveGoals")}
          </Text>
        </View>

        {/* Circular progress ring */}
        <View style={styles.progressRingContainer}>
          <Svg width={SIZE} height={SIZE}>
            {/* Background track */}
            <Circle
              stroke={colors.border}
              fill="none"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE}
            />
            {/* Animated fill arc */}
            <AnimatedCircle
              stroke={colors.primary}
              fill="none"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE}
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedCircleProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
          <Text style={styles.progressRingText}>{displayPercent}%</Text>
        </View>
      </View>

      {/* Linear progress bar */}
      <View style={styles.overallProgressBarBg}>
        <Animated.View
          style={[styles.overallProgressBarFill, animatedBarStyle]}
        />
      </View>
    </View>
  );
}
