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

const replacement = `    loadingCenterWheel: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    floatingActionButton: {
      position: "absolute",
      right: 24,
      bottom: 32,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 100,
    },
    fabPlusSignHorizontal: {
      width: 20,
      height: 2,
      backgroundColor: colors.onPrimary,
      position: "absolute",
    },
    fabPlusSignVertical: {
      width: 2,
      height: 20,
      backgroundColor: colors.onPrimary,
      position: "absolute",
    },
  });`;

content = content.replace(
  /    loadingCenterWheel: \{\s*flex: 1,\s*alignItems: "center",\s*justifyContent: "center",\s*\},\s*\}\);/,
  replacement,
);
fs.writeFileSync(file, content);
console.log("Added floatingActionButton styles");
