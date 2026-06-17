const fs = require("fs");
const path = require("path");

const bTabPath = path.join(
  __dirname,
  "..",
  "src",
  "navigation",
  "BottomTabNavigator.js",
);
let content = fs.readFileSync(bTabPath, "utf8");

// Wrap screen components to allow hook usage
content = content.replace(
  /const TodayScreen = \(\) => \(/g,
  "const TodayScreen = () => { const { t } = useTranslation(); return (",
);
content = content.replace(
  /const StatsScreen = \(\) => \(/g,
  "const StatsScreen = () => { const { t } = useTranslation(); return (",
);
content = content.replace(
  /const GoalsScreen = \(\) => \(/g,
  "const GoalsScreen = () => { const { t } = useTranslation(); return (",
);
content = content.replace(
  /const MascotScreen = \(\) => \(/g,
  "const MascotScreen = () => { const { t } = useTranslation(); return (",
);

// Close the return blocks
content = content.replace(
  /\);\n\nconst StatsScreen/g,
  ");};\n\nconst StatsScreen",
);
content = content.replace(
  /\);\n\nconst GoalsScreen/g,
  ");};\n\nconst GoalsScreen",
);
content = content.replace(
  /\);\n\nconst MascotScreen/g,
  ");};\n\nconst MascotScreen",
);
content = content.replace(/\);\n\n\n\/\/ ---/g, ");};\n\n\n// ---");

// Pass t as prop to icon components
content = content.replace(/\{ focused \}/g, "{ focused, t }");

content = content.replace(
  /<TodayIcon \{...props\} \/>/g,
  "<TodayIcon {...props} t={t} />",
);
content = content.replace(
  /<HabitsIcon \{...props\} \/>/g,
  "<HabitsIcon {...props} t={t} />",
);
content = content.replace(
  /<StatsIcon \{...props\} \/>/g,
  "<StatsIcon {...props} t={t} />",
);
content = content.replace(
  /<GoalsIcon \{...props\} \/>/g,
  "<GoalsIcon {...props} t={t} />",
);
content = content.replace(
  /<MascotIcon \{...props\} \/>/g,
  "<MascotIcon {...props} t={t} />",
);

fs.writeFileSync(bTabPath, content);
console.log("Fixed BottomTabNavigator scope for t()");
