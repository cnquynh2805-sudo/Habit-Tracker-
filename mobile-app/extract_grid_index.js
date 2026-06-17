const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<View style={styles.cardBadgesRow}>';
const endMarker = '<View style={styles.figmaChevronRightContainer}>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  const replacement = `<DynamicPriorityTagsGrid
                item={item}
                currentStatus={currentStatus}
                categoryBadgeBg={categoryBadgeBg}
                categoryBadgeText={categoryBadgeText}
                colors={colors}
                styles={styles}
                t={t}
                isDropdownVisible={isDropdownVisible}
                setActiveDropdownId={setActiveDropdownId}
                priTheme={priTheme}
              />
            </View>

            <View style={styles.cardRightActionBlock}>
              `;
              
  content = before + replacement + after;
  
  // Also fix the symbols and strings while we're at it!
  content = content.replace(/<Text style=\{styles\.floatingActionButtonText\}>\+<\/Text>/g, "<Text style={styles.floatingActionButtonText}>{t('icons.plus')}</Text>");
  content = content.replace(/<Text style=\{styles\.kebabMenuIconText\}>?<\/Text>/g, "<Text style={styles.kebabMenuIconText}>{t('icons.kebab')}</Text>");
  content = content.replace(/<Text style=\{styles\.themeIconText\}>?<\/Text>/g, "<Text style={styles.themeIconText}>{t('icons.star')}</Text>");
  content = content.replace(/<Text style=\{styles\.themeIconText\}>?<\/Text>/g, "<Text style={styles.themeIconText}>{t('icons.arrowLeft')}</Text>");

  content = content.replace(/label: "Pause"/g, "label: t('habitList.contextMenu.pause')");
  content = content.replace(/label: "Resume"/g, "label: t('habitList.contextMenu.resume')");
  content = content.replace(/label: "Archive"/g, "label: t('habitList.contextMenu.archive')");
  content = content.replace(/label: "Restore"/g, "label: t('habitList.contextMenu.restore')");
  content = content.replace(/label: "Delete"/g, "label: t('habitList.contextMenu.delete')");

  content = content.replace(/defaultValue: "Medium Priority"/g, "");
  content = content.replace(/defaultValue: "High Priority"/g, "");
  content = content.replace(/defaultValue: "Low Priority"/g, "");
  content = content.replace(/, \{\s*\}/g, "");

const extractedComponent = `
const DynamicPriorityTagsGrid = ({ item, currentStatus, categoryBadgeBg, categoryBadgeText, colors, styles, t, isDropdownVisible, setActiveDropdownId, priTheme }) => {
  const [topGroupWidth, setTopGroupWidth] = React.useState(null);

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

  content = content + '\n' + extractedComponent;
  fs.writeFileSync(file, content);
  console.log("Successfully extracted DynamicPriorityTagsGrid and fixed strings");
} else {
  console.log("Could not find markers");
}
