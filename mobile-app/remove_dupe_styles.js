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

const regex =
  /flfloatingActionButton: \{[\s\S]*?fabPlusSignVertical: \{[\s\S]*?\},/g;
content = content.replace(regex, "");
fs.writeFileSync(file, content);
console.log("Removed duplicated/old floatingActionButton block");
