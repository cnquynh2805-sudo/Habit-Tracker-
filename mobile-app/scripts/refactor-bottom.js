const fs = require("fs");

let txt = fs.readFileSync("src/navigation/BottomTabNavigator.js", "utf8");

txt = txt.replace(
  "import { tabStyles } from './BottomTabNavigator.styles';",
  "import { getTabStyles } from './BottomTabNavigator.styles';\nimport { useTheme } from '../../providers/ThemeProvider';",
);

// Fix dummy screens
const screens = ["TodayScreen", "StatsScreen", "GoalsScreen", "MascotScreen"];
for (const screen of screens) {
  txt = txt.replace(
    `const ${screen} = () => { const { t } = useTranslation(); return (`,
    `const ${screen} = () => { const { t } = useTranslation(); const { colors } = useTheme(); return (`,
  );
}

// Fix icons
const icons = [
  "TodayIcon",
  "HabitsIcon",
  "StatsIcon",
  "GoalsIcon",
  "MascotIcon",
];
for (const icon of icons) {
  txt = txt.replace(
    `const ${icon} = ({ focused, t }) => focused ? (`,
    `const ${icon} = ({ focused, t }) => {\n  const { colors } = useTheme();\n  const tabStyles = getTabStyles(colors);\n  return focused ? (`,
  );

  // Find the closing of the icon which is `);\n` or `);\n\n`
  txt = txt.replace(
    new RegExp(`(${icon}.*?return focused \\?.*?\\): \\(.*?\\);)`, "s"),
    (match) => match.replace(/\);$/, ");\n};"),
  );
}

// Fix BottomTabNavigator
txt = txt.replace(
  "export default function BottomTabNavigator() {\n  const { t } = useTranslation();",
  "export default function BottomTabNavigator() {\n  const { t } = useTranslation();\n  const { colors } = useTheme();\n  const tabStyles = getTabStyles(colors);",
);

// Replace colors
txt = txt.replace(/'#F9FBF9'/g, "colors.background");
txt = txt.replace(/'#2D4A3E'/g, "colors.primary");
txt = txt.replace(/'#1E4631'/g, "colors.successDark");
txt = txt.replace(/'#5F6368'/g, "colors.textMuted");

fs.writeFileSync("src/navigation/BottomTabNavigator.js", txt);
