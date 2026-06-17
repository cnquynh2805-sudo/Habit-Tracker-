const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
let content = fs.readFileSync(file, 'utf8');

const targetStart = `<View style={styles.cardBadgesRow}>`;
const targetEnd = `              <View style={styles.figmaChevronRightContainer}>
                <View style={styles.figmaChevronLineTop} />
                <View style={styles.figmaChevronLineBottom} />
              </View>
            </View>`;

const startIdx = content.indexOf(targetStart);
const endIdx = content.indexOf(targetEnd) + targetEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `              <View style={styles.cardTagsGrid}>
                <View style={styles.cardTagsRow}>
                  <View
                    style={[
                      styles.miniMetaBadge,
                      { backgroundColor: categoryBadgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniMetaBadgeText,
                        { color: categoryBadgeText },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {t(\`category.\${(item.category || '').toLowerCase()}\`)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.miniMetaBadge,
                      { backgroundColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniMetaBadgeText,
                        { color: colors.textMuted },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {t(\`frequency.\${(item.frequency || '').toLowerCase()}\`)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Interactive element"
                    style={[
                      styles.statusCapsule,
                      currentStatus === "Active" && styles.statusCapsuleActive,
                      currentStatus === "Paused" && styles.statusCapsulePaused,
                      currentStatus === "Archived" && styles.statusCapsuleArchived,
                    ]}
                    onPress={() =>
                      setActiveDropdownId(isDropdownVisible ? null : item.id)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.statusCapsuleText,
                        currentStatus === "Active" && styles.statusTextActive,
                        currentStatus === "Paused" && styles.statusTextPaused,
                        currentStatus === "Archived" && styles.statusTextArchived,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {t(\`status.\${currentStatus.toLowerCase()}\`)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardTagsRow}>
                  <View
                    style={[
                      styles.figmaPriorityCapsuleBase,
                      { backgroundColor: priTheme.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.figmaPriorityCapsuleText,
                        { color: priTheme.text },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {priTheme.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cardRightActionBlock}>
              <View style={styles.figmaChevronRightContainer}>
                <View style={styles.figmaChevronLineTop} />
                <View style={styles.figmaChevronLineBottom} />
              </View>
            </View>`;
            
  content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced labels block.');
} else {
  console.log('Failed to find start or end index.');
}
