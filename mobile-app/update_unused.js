const fs = require('fs');
const path = require('path');

// 1. CreateHabitScreen.styles.js (unused height)
let file = path.join(__dirname, 'src', 'screens', 'CreateHabit', 'CreateHabitScreen.styles.js');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import \{ StyleSheet, Dimensions, Platform \} from "react-native";\nconst \{ width, height \} = Dimensions\.get\("window"\);/g, 'import { StyleSheet, Dimensions, Platform } from "react-native";\nconst { width } = Dimensions.get("window");');
fs.writeFileSync(file, content);

// 2. HabitListScreen.js (unused isDark)
file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/const \{ colors, isDark \} = useTheme\(\);/g, 'const { colors } = useTheme();');
fs.writeFileSync(file, content);

// 3. HabitListScreen.styles.js (unused SCREEN_WIDTH)
file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.styles.js');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/const SCREEN_WIDTH = Dimensions\.get\('window'\)\.width;/g, '');
fs.writeFileSync(file, content);

// 4. src/app/_layout.tsx (unused useAppStore)
file = path.join(__dirname, 'src', 'app', '_layout.tsx');
content = fs.readFileSync(file, 'utf8');
content = content.replace(/import \{ useAppStore \} from "\.\.\/store\/useAppStore";\n/g, '');
fs.writeFileSync(file, content);

console.log("Updated unused variables");
