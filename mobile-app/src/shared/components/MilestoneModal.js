import React from 'react';
import { View, Text, Modal, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAppStore } from '../stores/useAppStore';
import { useMascotStore } from '../../features/mascot/store/mascotStore';
import { useTheme } from '../../providers/ThemeProvider';
import LottieView from 'lottie-react-native';
import { rewardItems } from '../../features/mascot/data/rewards';

// Require at module level so the asset resolver runs once, not conditionally.
const MascotImage = require('../../assets/mascot/happy_boy.gif');

export default function MilestoneModal() {
  const milestoneAlert = useAppStore(state => state.milestoneAlert);
  const hideMilestoneAlert = useAppStore(state => state.hideMilestoneAlert);
  const equipItem = useMascotStore(state => state.equipItem);
  const { colors } = useTheme();

  // Extract fields safely — milestoneAlert may be null when modal is hidden.
  const { type, habitName, goalName, progressPct, streak, rewardId } = milestoneAlert || {};
  const isHundred = type === 'hundred';

  const handleClaimReward = () => {
    if (rewardId) {
      equipItem(rewardId);
    }
    hideMilestoneAlert();
  };

  let rewardAnimation = null;
  if (rewardId) {
    const r = rewardItems.find(item => item.id === rewardId);
    if (r && r.animation) {
      rewardAnimation = r.animation;
    }
  }

  // Always render the Modal — only toggle `visible`. This ensures React Native
  // can play the fade animation when milestoneAlert transitions null → value.
  return (
    <Modal transparent animationType="fade" visible={!!milestoneAlert} onRequestClose={hideMilestoneAlert}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {isHundred ? (
            <>
              {/* 100% Achievement Design */}
              <Text style={[styles.headline, { color: colors.text }]}>Goal Achieved!</Text>
              <View style={styles.capsule}>
                <Text style={styles.capsuleText}>100% Habit Streak</Text>
              </View>

              <View style={styles.mascotContainer}>
                <Image source={MascotImage} style={styles.mascot} />
                {rewardAnimation && (
                  <LottieView
                    source={rewardAnimation}
                    autoPlay
                    loop
                    style={[StyleSheet.absoluteFillObject, { transform: [{ scale: 0.5 }], top: -20 }]}
                  />
                )}
              </View>

              <View style={styles.goldenCard}>
                <Text style={styles.goldenCardTitle}>The Master Bloom Badge</Text>
              </View>

              <TouchableOpacity style={[styles.btnClaim, { backgroundColor: colors.primary }]} onPress={handleClaimReward}>
                <Text style={styles.btnClaimText}>Claim Reward</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutline} onPress={hideMilestoneAlert}>
                <Text style={[styles.btnOutlineText, { color: colors.text }]}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* 80% Alert Design */}
              <Text style={[styles.headline, { color: colors.text }]}>So Close!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>You're almost there! Keep up the great work.</Text>

              <View style={styles.progressContainer}>
                <Svg height="120" width="120" viewBox="0 0 120 120" style={styles.svgProgress}>
                  <Circle cx="60" cy="60" r="50" stroke={colors.border} strokeWidth="10" fill="none" />
                  <Circle cx="60" cy="60" r="50" stroke={colors.primary} strokeWidth="10" fill="none" strokeDasharray={`${(80 / 100) * 314} 314`} />
                </Svg>
                <Image source={MascotImage} style={styles.mascotSmall} />
              </View>

              <Text style={[styles.progressText, { color: colors.primary }]}>80% Complete</Text>

              <View style={[styles.streakBadge, { backgroundColor: colors.border }]}>
                <Text style={[styles.streakBadgeText, { color: colors.text }]}>{habitName} • {streak} Streak</Text>
              </View>

              <TouchableOpacity style={[styles.btnClaim, { backgroundColor: colors.primary }]} onPress={hideMilestoneAlert}>
                <Text style={styles.btnClaimText}>Keep Going -{'>'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutline} onPress={hideMilestoneAlert}>
                <Text style={[styles.btnOutlineText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  capsule: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  capsuleText: {
    color: '#000',
    fontWeight: 'bold',
  },
  mascotContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mascot: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  mascotSmall: {
    width: 70,
    height: 70,
    position: 'absolute',
    resizeMode: 'contain',
  },
  goldenCard: {
    backgroundColor: '#FFF8DC',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  goldenCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  btnClaim: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnClaimText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnOutline: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  svgProgress: {
    position: 'absolute',
  },
  progressText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 20,
  },
  streakBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  streakBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
