const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.styles.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/minWidth: "40%",/g, "minWidth: \"auto\", minWidth: \"30%\",");
content = content.replace(/figmaPriorityCapsuleBase: \{\s*flexDirection: "row",\s*alignItems: "center",\s*justifyContent: "center",\s*paddingVertical: 4,\s*paddingHorizontal: 8,\s*borderRadius: 12,\s*borderWidth: 1,\s*maxWidth: "33.33%",/g, `figmaPriorityCapsuleBase: {\n      flexDirection: "row",\n      alignItems: "center",\n      justifyContent: "center",\n      paddingVertical: 4,\n      paddingHorizontal: 8,\n      borderRadius: 12,\n      borderWidth: 1,\n      maxWidth: "68%",`);

fs.writeFileSync(file, content);
console.log("Updated styles.");
