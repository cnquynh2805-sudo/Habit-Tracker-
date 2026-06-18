const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "src",
  "navigation",
  "BottomTabNavigator.styles.js",
);
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /activeTabIndicatorCapsule: \{[\s\S]*?gap: 4,\s*\}/,
  `activeTabItemContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    activeTabIndicatorCapsule: {
      backgroundColor: colors.successLight,
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }`,
);

content = content.replace(
  /inactiveTabContainer: \{[\s\S]*?justifyContent: "center",\s*\}/,
  `inactiveTabContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    }`,
);

content = content.replace(
  /tabBarLabelTextActive: \{[\s\S]*?fontWeight: "700",\s*\}/,
  `tabBarLabelTextActive: {
      fontSize: 12,
      color: colors.successDark,
      fontWeight: "700",
      marginTop: 4,
      textAlign: "center",
      width: "100%",
    }`,
);

content = content.replace(
  /tabBarLabelText: \{[\s\S]*?marginTop: 4,\s*\}/,
  `tabBarLabelText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: "500",
      marginTop: 4,
      textAlign: "center",
      width: "100%",
    }`,
);

fs.writeFileSync(file, content);
console.log("Updated BottomTabNavigator styles.");
