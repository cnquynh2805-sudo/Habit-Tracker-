const fs = require("fs");
const path = require("path");
function removeDefaultValues(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(
    /\{t\('([^']+)',\s*\{\s*defaultValue:\s*'[^']+'\s*\}\)\}/g,
    "{t('')}",
  );
  content = content.replace(
    /t\('([^']+)',\s*\{\s*defaultValue:\s*'[^']+'\s*\}\)/g,
    "t('')",
  );
  fs.writeFileSync(filePath, content);
}
removeDefaultValues(
  path.join(__dirname, "src", "navigation", "BottomTabNavigator.js"),
);
removeDefaultValues(
  path.join(__dirname, "src", "screens", "HabitList", "HabitListScreen.js"),
);
console.log("Removed defaultValues.");
