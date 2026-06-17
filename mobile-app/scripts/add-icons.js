const fs = require('fs');
let c = fs.readFileSync('src/screens/HabitList/HabitListScreen.js', 'utf8');

// 1. Add lucide imports
c = c.replace(
  "import { useTheme } from '../../providers/ThemeProvider';",
  "import { useTheme } from '../../providers/ThemeProvider';\nimport { Globe, Palette } from 'lucide-react-native';"
);

// 2. Add state for menus
c = c.replace(
  "const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);",
  "const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);\n  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);\n  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);"
);

// 3. Add handle functions
c = c.replace(
  /const toggleLanguage = \(\) => \{[\s\S]*?\};\s*const toggleTheme = \(\) => \{[\s\S]*?\};/,
  `const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangMenuOpen(false);
  };

  const handleThemeChange = (theme) => {
    setThemeMode(theme);
    setIsThemeMenuOpen(false);
  };`
);

// 4. Update the close-all handler in useEffect
c = c.replace(
  "setIsHeaderMenuOpen(false);",
  "setIsHeaderMenuOpen(false);\n      setIsLangMenuOpen(false);\n      setIsThemeMenuOpen(false);"
);

// 5. Update the close-all handler in TouchableWithoutFeedback and FlatList
c = c.replace(/setIsHeaderMenuOpen\(false\);/g, "setIsHeaderMenuOpen(false);\n          setIsLangMenuOpen(false);\n          setIsThemeMenuOpen(false);");

// 6. Replace the icons in UI
c = c.replace(
  /<View style=\{styles\.langMenuWrapper\}>[\s\S]*?<\/View>\s*<View style=\{styles\.themeMenuWrapper\}>[\s\S]*?<\/View>/,
  `<View style={styles.langMenuWrapper}>
                <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Toggle Language" onPress={() => setIsLangMenuOpen(!isLangMenuOpen)} style={styles.headerIconButton}>
                  <Globe color="#2D4A3E" size={24} />
                </TouchableOpacity>
                {isLangMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="English" style={styles.headerMenuPopoverItem} onPress={() => handleLanguageChange('en')}>
                      <Text style={[styles.headerMenuPopoverText, i18n.language === 'en' && { color: '#2D4A3E', fontWeight: '700' }]}>English</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Tiếng Việt" style={styles.headerMenuPopoverItem} onPress={() => handleLanguageChange('vi')}>
                      <Text style={[styles.headerMenuPopoverText, i18n.language === 'vi' && { color: '#2D4A3E', fontWeight: '700' }]}>Tiếng Việt</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.themeMenuWrapper}>
                <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Toggle Theme" onPress={() => setIsThemeMenuOpen(!isThemeMenuOpen)} style={styles.headerIconButton}>
                  <Palette color="#2D4A3E" size={24} />
                </TouchableOpacity>
                {isThemeMenuOpen && (
                  <View style={styles.headerStatePopoverMenu}>
                    {['Light', 'Dark', 'System'].map(theme => (
                      <TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel={theme} key={theme} style={styles.headerMenuPopoverItem} onPress={() => handleThemeChange(theme)}>
                        <Text style={[styles.headerMenuPopoverText, themeMode === theme && { color: '#2D4A3E', fontWeight: '700' }]}>{theme}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>`
);

fs.writeFileSync('src/screens/HabitList/HabitListScreen.js', c);
console.log('Injected Lucide and Dropdowns');
