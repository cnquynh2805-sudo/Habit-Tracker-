const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.styles.js');
let content = fs.readFileSync(file, 'utf8');

// remove maxWidth from Priority
content = content.replace(/maxWidth: "68%",/g, "");
// ensure minWidth 120 is present instead of percentage
if (content.includes('minWidth: "40%"')) {
  content = content.replace(/minWidth: "40%",/g, "minWidth: 120,");
}

fs.writeFileSync(file, content);
console.log("Cleaned styles");
