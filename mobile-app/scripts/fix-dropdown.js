const fs = require("fs");

const path = "src/screens/HabitList/HabitListScreen.styles.js";
let c = fs.readFileSync(path, "utf8");

c = c.replace(/width: '35%',\n/g, ""); // Let the popup expand dynamically
c = c.replace(/fontSize: 13,/g, "fontSize: 16,"); // Set readable font size
c = c.replace(
  /paddingHorizontal: \(SCREEN_WIDTH - 350\) \/ 2,/g,
  "paddingHorizontal: 20,",
);

fs.writeFileSync(path, c);
console.log("Fixed dropdowns and padding.");
