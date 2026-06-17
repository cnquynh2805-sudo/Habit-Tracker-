const fs = require('fs');

const path = 'src/screens/HabitList/HabitListScreen.js';
let c = fs.readFileSync(path, 'utf8');

// 1. Add Alert to imports
c = c.replace(
  "TouchableWithoutFeedback",
  "TouchableWithoutFeedback,\n  Alert"
);

// 2. Add try/catch to handlers
c = c.replace(
  /const handleLanguageChange = \(lang\) => \{[\s\S]*?\};\s*const handleThemeChange = \(theme\) => \{[\s\S]*?\};/,
  `const handleLanguageChange = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      setIsLangMenuOpen(false);
    } catch (e) {
      console.error('Language error:', e);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      setThemeMode(theme);
      setIsThemeMenuOpen(false);
    } catch (e) {
      console.error('Theme error:', e);
      Alert.alert('Error', 'Failed to change theme');
    }
  };`
);

// 3. Translate "My Habits"
c = c.replace(
  /<Text style=\{styles.headerMainTitleText\}>My Habits<\/Text>/g,
  "<Text style={styles.headerMainTitleText}>{t('habitList.title')}</Text>"
);

// 4. Translate "Active Habits", "Paused List", "Archived List"
c = c.replace(
  /\{ id: 'Active', title: 'Active Habits' \},/g,
  "{ id: 'Active', title: t('habitList.filter.active') },"
);
c = c.replace(
  /\{ id: 'Paused', title: 'Paused List' \},/g,
  "{ id: 'Paused', title: t('habitList.filter.paused') },"
);
c = c.replace(
  /\{ id: 'Archived', title: 'Archived List' \}/g,
  "{ id: 'Archived', title: t('habitList.filter.archived') }"
);

// 5. Translate Category chips
c = c.replace(
  /<Text style=\{\[styles.filterChipText, isCurrent && styles.filterChipTextActive\]\}>\{cat\}<\/Text>/g,
  "<Text style={[styles.filterChipText, isCurrent && styles.filterChipTextActive]}>{t('category.' + cat.toLowerCase())}</Text>"
);

// 6. Translate Themes
c = c.replace(
  /\{theme\}<\/Text>/g,
  "{t('theme.' + theme.toLowerCase())}</Text>"
);

fs.writeFileSync(path, c);
console.log('Injected translations and try/catch handlers.');
