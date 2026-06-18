const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.styles.js');
let content = fs.readFileSync(file, 'utf8');

// 1. topFilterBarContainer: remove paddingBottom
content = content.replace(/paddingBottom: 100,\n/g, '');

// 2. listScrollContentBody: add paddingBottom: 120
content = content.replace(/paddingHorizontal: 20,\n\s*gap: 12,\n/g, 'paddingHorizontal: 20,\n    gap: 12,\n    paddingBottom: 120,\n');

// 3. floatingActionButton: change bottom to 116
content = content.replace(/bottom: 32,/g, 'bottom: 116,');

fs.writeFileSync(file, content);
console.log("Updated HabitListScreen.styles.js padding and FAB");
