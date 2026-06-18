const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "src",
  "screens",
  "CreateHabit",
  "CreateHabitScreen.styles.js",
);
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /backgroundColor: "#FAFBFB"/g,
  "backgroundColor: colors.background",
);
content = content.replace(
  /backgroundColor: "#FFFFFF"/g,
  "backgroundColor: colors.surface",
);
content = content.replace(
  /borderBottomColor: "#F1F3F2"/g,
  "borderBottomColor: colors.border",
);
content = content.replace(
  /borderColor: "#EAEAEA"/g,
  "borderColor: colors.border",
);
content = content.replace(
  /backgroundColor: "#EAEAEA"/g,
  "backgroundColor: colors.border",
);
content = content.replace(
  /backgroundColor: "#F9FAFB"/g,
  "backgroundColor: colors.background",
);
content = content.replace(
  /backgroundColor: "#2D4A3E"/g,
  "backgroundColor: colors.primary",
);
content = content.replace(/color: "#000"/g, "color: colors.text");
content = content.replace(/color: "#1C1C1C"/g, "color: colors.text");
content = content.replace(/color: "#334155"/g, "color: colors.textSecondary");
content = content.replace(/color: "#5F6368"/g, "color: colors.textMuted");
content = content.replace(/color: "#9E9E9E"/g, "color: colors.textDisabled");
content = content.replace(/color: "#FFFFFF"/g, "color: colors.onPrimary");
content = content.replace(
  /backgroundColor: "#F1F5F9"/g,
  "backgroundColor: colors.surfaceMuted",
);

fs.writeFileSync(file, content);
console.log("Updated CreateHabitScreen.styles.js");
