const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "src",
  "screens",
  "HabitList",
  "HabitListScreen.js",
);
let content = fs.readFileSync(file, "utf8");

const extractedComponent = `
const DynamicPriorityTagsGrid = ({ item, currentStatus, categoryBadgeBg, categoryBadgeText, colors, styles, t, isDropdownVisible, setActiveDropdownId, priTheme }) => {
  const [topGroupWidth, setTopGroupWidth] = useState(null);

  return (
    <View style={styles.cardTagsGrid}>
      <View style={styles.cardTagsRow}>
        <View 
          style={{ flexDirection: 'row', gap: 8, alignSelf: 'flex-start' }}
          onLayout={(e) => setTopGroupWidth(e.nativeEvent.layout.width)}
        >
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
              adjustsFontSizeToFit={true}
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
              adjustsFontSizeToFit={true}
            >
              {t(\`frequency.\${(item.frequency || '').toLowerCase()}\`)}
            </Text>
          </View>
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
            adjustsFontSizeToFit={true}
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
            topGroupWidth ? { width: topGroupWidth } : { flexShrink: 1 }
          ]}
        >
          <Text
            style={[
              styles.figmaPriorityCapsuleText,
              { color: priTheme.text },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit={true}
          >
            {priTheme.label}
          </Text>
        </View>
      </View>
    </View>
  );
};
`;

if (!content.includes("DynamicPriorityTagsGrid = ({")) {
  content = content + "\n" + extractedComponent;
  fs.writeFileSync(file, content);
  console.log("Appended extracted component");
}
