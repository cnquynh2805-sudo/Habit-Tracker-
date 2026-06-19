const fs = require("fs");

const path = "src/screens/HabitList/HabitListScreen.styles.js";
let c = fs.readFileSync(path, "utf8");

c = c.replace(/height: 112/g, "paddingVertical: 16");
c = c.replace(/width: 350/g, "width: '100%'");

fs.writeFileSync(path, c);
console.log("Fixed card sizes.");
