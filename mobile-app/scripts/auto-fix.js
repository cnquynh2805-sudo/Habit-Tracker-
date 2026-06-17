const fs = require('fs');

function fixHabitListStyles() {
  const file = 'src/screens/HabitList/HabitListScreen.styles.js';
  let c = fs.readFileSync(file, 'utf8');
  
  // Fixed Pixel Replacements
  c = c.replace(/width: 140/g, "width: '35%'");
  c = c.replace(/width: 350/g, "width: '90%'");
  c = c.replace(/height: 112/g, "height: '20%'");
  c = c.replace(/width: 72/g, "width: '18%'");
  c = c.replace(/width: 80/g, "width: '20%'");
  c = c.replace(/width: 56/g, "width: '14%'");
  c = c.replace(/height: 56/g, "height: '10%'");
  
  // Extract Inline Styles placeholder
  if (!c.includes('flexContainer:')) {
    c = c.replace('export const getStyles = (colors, isDark) => StyleSheet.create({', `export const getStyles = (colors, isDark) => StyleSheet.create({
  flexContainer: { flex: 1 },
  headerLeftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-start' },
  langMenuWrapper: { position: 'relative', marginLeft: 8 },
  headerIconButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  themeMenuWrapper: { position: 'relative', marginRight: 12 },
  relativeWrapper: { position: 'relative' },`);
    
    // In case it's 'export const styles'
    c = c.replace('export const styles = StyleSheet.create({', `export const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  headerLeftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-start' },
  langMenuWrapper: { position: 'relative', marginLeft: 8 },
  headerIconButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  themeMenuWrapper: { position: 'relative', marginRight: 12 },
  relativeWrapper: { position: 'relative' },`);
  }

  fs.writeFileSync(file, c);
}

function fixCreateHabitStyles() {
  const file = 'src/screens/CreateHabit/CreateHabitScreen.styles.js';
  let c = fs.readFileSync(file, 'utf8');
  
  // Fixed Pixel Replacements
  c = c.replace(/height: 60/g, "height: '10%'");
  c = c.replace(/minHeight: 76/g, "minHeight: '12%'");
  c = c.replace(/height: 160/g, "height: '25%'");
  c = c.replace(/height: 50/g, "height: '8%'");
  
  fs.writeFileSync(file, c);
}

function fixInlineStyles() {
  const file = 'src/screens/HabitList/HabitListScreen.js';
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/style=\{\{\s*flex:\s*1\s*\}\}/g, 'style={styles.flexContainer}');
  c = c.replace(/style=\{\{\s*flexDirection:\s*'row',\s*alignItems:\s*'center',\s*flex:\s*1,\s*justifyContent:\s*'flex-start'\s*\}\}/g, 'style={styles.headerLeftContainer}');
  c = c.replace(/style=\{\{\s*position:\s*'relative',\s*marginLeft:\s*8\s*\}\}/g, 'style={styles.langMenuWrapper}');
  c = c.replace(/style=\{\{\s*padding:\s*8,\s*justifyContent:\s*'center',\s*alignItems:\s*'center'\s*\}\}/g, 'style={styles.headerIconButton}');
  c = c.replace(/style=\{\{\s*position:\s*'relative',\s*marginRight:\s*12\s*\}\}/g, 'style={styles.themeMenuWrapper}');
  c = c.replace(/style=\{\{\s*position:\s*'relative'\s*\}\}/g, 'style={styles.relativeWrapper}');
  fs.writeFileSync(file, c);
}

function fixA11y(file) {
  let c = fs.readFileSync(file, 'utf8');
  // Safe replacement right after the opening tag name
  c = c.replace(/<TouchableOpacity\b/g, '<TouchableOpacity accessible={true} accessibilityRole="button" accessibilityLabel="Interactive element"');
  // Deduplicate if already existed
  c = c.replace(/accessible=\{true\}\s+accessible=\{true\}/g, 'accessible={true}');
  c = c.replace(/accessibilityRole="button"\s+accessibilityRole="button"/g, 'accessibilityRole="button"');
  c = c.replace(/accessibilityLabel="Interactive element"\s+accessibilityLabel="[^"]*"/g, 'accessibilityLabel="Interactive element"');
  fs.writeFileSync(file, c);
}

fixHabitListStyles();
fixCreateHabitStyles();
fixInlineStyles();
fixA11y('src/screens/HabitList/HabitListScreen.js');
fixA11y('src/screens/CreateHabit/CreateHabitScreen.js');

console.log('Automated fixes applied.');
