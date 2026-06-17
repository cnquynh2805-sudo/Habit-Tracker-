const fs = require('fs');
let c = fs.readFileSync('src/screens/HabitList/HabitListScreen.styles.js', 'utf8');
c = c.replace('export const styles = StyleSheet.create({', `export const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  headerLeftContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-start' },
  langMenuWrapper: { position: 'relative', marginLeft: 8 },
  headerIconButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  themeMenuWrapper: { position: 'relative', marginRight: 12 },
  relativeWrapper: { position: 'relative' },`);
fs.writeFileSync('src/screens/HabitList/HabitListScreen.styles.js', c);
console.log('Fixed');
