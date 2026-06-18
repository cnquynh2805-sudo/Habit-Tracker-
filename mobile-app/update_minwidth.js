const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "src",
  "screens",
  "HabitList",
  "HabitListScreen.styles.js",
);
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /minWidth: "auto", minWidth: "30%",/g,
  "minWidth: 120,",
);

fs.writeFileSync(file, content);
console.log("Updated minWidth to 120.");
