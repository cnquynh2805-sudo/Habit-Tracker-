const fs = require("fs");

const path = "src/screens/HabitList/HabitListScreen.styles.js";
let c = fs.readFileSync(path, "utf8");

// 1. Fix the collapsed height
c = c.replace(/height: '20%',/g, "paddingVertical: 16,");

// 2. Remove fixed width from dropdown menus
c = c.replace(/width: '35%',\n/g, "");

// 3. Increase dropdown font size
c = c.replace(/fontSize: 13,/g, "fontSize: 16,");

// 4. Stretch the FlatList items
c = c.replace(
  /paddingHorizontal: \(SCREEN_WIDTH - 350\) \/ 2,/g,
  "paddingHorizontal: 20,",
);
c = c.replace(/width: '90%',/g, "width: '100%',");

fs.writeFileSync(path, c);
console.log("Fixed styles reliably.");
