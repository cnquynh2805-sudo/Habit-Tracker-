const fs = require("fs");

const mappings = {
  "'#F9FBF9'": "colors.background",
  "'#2D4A3E'": "colors.primary",
  "'#FFFFFF'": "colors.surface",
  "'#EAEAEA'": "colors.border",
  "'#334155'": "colors.textSecondary",
  "'#4A4A4A'": "colors.textSecondary",
  "'#F1F3F1'": "colors.surfaceMuted",
  "'#A8D5BA'": "colors.primaryLight",
  "'#E0E0E0'": "colors.border",
  "'#1C1C1C'": "colors.text",
  "'#9E9E9E'": "colors.textDisabled",
  "'#C2E7D9'": "colors.successLight",
  "'#FDE8BB'": "colors.warningLight",
  "'#1E4631'": "colors.successDark",
  "'#B76E00'": "colors.warningDark",
  "'#5F6368'": "colors.textMuted",
  "'#8FDAB5'": "colors.primaryMedium",
  "'#EFF6FF'": "colors.priorityLowBg",
  "'#1E40AF'": "colors.priorityLowText",
  "'#3B82F6'": "colors.priorityLowStripe",
  "'#FEFCE8'": "colors.priorityMediumBg",
  "'#854D0E'": "colors.priorityMediumText",
  "'#F59E0B'": "colors.priorityMediumStripe",
  "'#E6F4EA'": "colors.priorityHighBg",
  "'#137333'": "colors.priorityHighText",
  "'#D6E6FE'": "colors.badgeStudyBg",
  "'#D1E7DD'": "colors.badgeDefaultBg",
  "'#F1F5F9'": "colors.surfaceMuted",
};

const processFile = (filePath, funcName) => {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace static export with function
  content = content.replace(
    `export const ${funcName} = StyleSheet.create({`,
    `export const get${funcName.charAt(0).toUpperCase() + funcName.slice(1)} = (colors) => StyleSheet.create({`,
  );

  // Apply mappings
  for (const [hex, variable] of Object.entries(mappings)) {
    content = content.split(hex).join(variable);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Processed", filePath);
};

processFile("src/screens/HabitList/HabitListScreen.styles.js", "styles");
processFile("src/screens/CreateHabit/CreateHabitScreen.styles.js", "styles");
processFile("src/navigation/BottomTabNavigator.styles.js", "tabStyles");
