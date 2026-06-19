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

// Ensure Menu wrappers are defined
if (!content.includes("langMenuWrapper:")) {
  content = content.replace(
    "headerRightActionGroup: {",
    `langMenuWrapper: { position: "relative" },
    themeMenuWrapper: { position: "relative" },
    relativeWrapper: { position: "relative" },
    headerRightActionGroup: {`,
  );
  fs.writeFileSync(file, content);
}
console.log("Added wrapper styles.");
