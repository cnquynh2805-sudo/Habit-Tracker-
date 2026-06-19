const fs = require("fs");

function fixA11y(file) {
  let c = fs.readFileSync(file, "utf8");
  c = c.replace(/<TouchableOpacity([^>]*?)>/g, (match, p1) => {
    let result = match;
    if (!p1.includes("accessible"))
      result = result.replace(">", " accessible={true}>");
    if (!p1.includes("accessibilityRole"))
      result = result.replace(">", ' accessibilityRole="button">');
    if (!p1.includes("accessibilityLabel"))
      result = result.replace(
        ">",
        ' accessibilityLabel="Interactive element">',
      );
    return result;
  });
  fs.writeFileSync(file, c);
}

fixA11y("src/screens/HabitList/HabitListScreen.js");
fixA11y("src/screens/CreateHabit/CreateHabitScreen.js");
console.log("Fixed A11y");
