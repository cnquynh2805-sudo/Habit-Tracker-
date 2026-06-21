import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export default function DailyProgressCard({
  styles,
  colors,
  t,
  completedCount,
  totalCount,
  progressPct,
  atRiskCount,
}) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTopRow}>
        <View style={styles.flexOne}>
          <Text style={styles.progressTitle}>{t("today.dailyProgress")}</Text>
          <Text style={styles.progressSubtitle}>
            {t("today.habitsDone", { done: completedCount, total: totalCount })}
          </Text>
        </View>
        <View>
          <Text style={styles.progressPctValue}>{progressPct}%</Text>
          <Text style={styles.progressPctLabel}>{t("today.completed")}</Text>
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
      </View>

      {atRiskCount > 0 && (
        <View style={styles.riskPill}>
          <AlertTriangle size={16} color={colors.warningDark} />
          <Text style={styles.riskPillText}>
            {t("today.atRisk", { count: atRiskCount })}
          </Text>
        </View>
      )}
    </View>
  );
}
