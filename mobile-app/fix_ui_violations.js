const fs = require('fs');
const path = require('path');

const stylesFile = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.styles.js');
let stylesContent = fs.readFileSync(stylesFile, 'utf8');

stylesContent = stylesContent.replace(/minWidth: 120,/g, 'minWidth: 48 + 72,');
stylesContent = stylesContent.replace(/width: 56,\s*height: 56,\s*borderRadius: 28,/g, 'width: 48, height: 48, borderRadius: 24,');
stylesContent = stylesContent.replace(/cardTagsRow: {/g, 'cardTagsTopGroup: {\n      flexDirection: "row",\n      gap: 8,\n      alignSelf: "flex-start",\n    },\n    cardTagsRow: {');

fs.writeFileSync(stylesFile, stylesContent);

const jsFile = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
let jsContent = fs.readFileSync(jsFile, 'utf8');
jsContent = jsContent.replace(/style={{ flexDirection: "row", gap: 8, alignSelf: "flex-start" }}/g, 'style={styles.cardTagsTopGroup}');
fs.writeFileSync(jsFile, jsContent);

console.log("Fixed UI guideline violations.");
