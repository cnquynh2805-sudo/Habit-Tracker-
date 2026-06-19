const fs = require("fs");
const path = require("path");

const bTabPath = path.join(
  __dirname,
  "..",
  "src",
  "navigation",
  "BottomTabNavigator.js",
);
let bTabContent = fs.readFileSync(bTabPath, "utf8");

// Inject useTranslation to BottomTabNavigator
if (!bTabContent.includes("useTranslation")) {
  bTabContent = bTabContent.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { useTranslation } from 'react-i18next';",
  );
  bTabContent = bTabContent.replace(
    "export default function BottomTabNavigator() {",
    "export default function BottomTabNavigator() {\n  const { t } = useTranslation();",
  );
}

// Replace tab texts
bTabContent = bTabContent.replace(
  />Today Screen</g,
  ">{t('tabs.todayScreen')}<",
);
bTabContent = bTabContent.replace(
  />Statistics Screen</g,
  ">{t('tabs.statsScreen')}<",
);
bTabContent = bTabContent.replace(
  />Goals Screen</g,
  ">{t('tabs.goalsScreen')}<",
);
bTabContent = bTabContent.replace(
  />Mascot Screen</g,
  ">{t('tabs.mascotScreen')}<",
);
bTabContent = bTabContent.replace(/>Today</g, ">{t('tabs.today')}<");
bTabContent = bTabContent.replace(/>Habits</g, ">{t('tabs.habits')}<");
bTabContent = bTabContent.replace(/>Stats</g, ">{t('tabs.stats')}<");
bTabContent = bTabContent.replace(/>Goals</g, ">{t('tabs.goals')}<");
bTabContent = bTabContent.replace(/>Mascot</g, ">{t('tabs.mascot')}<");

fs.writeFileSync(bTabPath, bTabContent);

const cHabitPath = path.join(
  __dirname,
  "..",
  "src",
  "screens",
  "CreateHabit",
  "CreateHabitScreen.js",
);
let cHabitContent = fs.readFileSync(cHabitPath, "utf8");

// Inject useTranslation to CreateHabitScreen
if (!cHabitContent.includes("useTranslation")) {
  cHabitContent = cHabitContent.replace(
    "import { View, Text",
    "import { useTranslation } from 'react-i18next';\nimport { View, Text",
  );
  cHabitContent = cHabitContent.replace(
    "export default function CreateHabitScreen({ route, navigation }) {",
    "export default function CreateHabitScreen({ route, navigation }) {\n  const { t } = useTranslation();",
  );
}

// Replace createHabit texts
cHabitContent = cHabitContent.replace(/>Cancel</g, ">{t('common.cancel')}<");
cHabitContent = cHabitContent.replace(/>Delete</g, ">{t('common.delete')}<");
cHabitContent = cHabitContent.replace(
  />Habit Detail</g,
  ">{t('createHabit.titleDetail')}<",
);
cHabitContent = cHabitContent.replace(
  />Edit Habit</g,
  ">{t('createHabit.titleEdit')}<",
);
cHabitContent = cHabitContent.replace(
  />New Habit</g,
  ">{t('createHabit.titleNew')}<",
);
cHabitContent = cHabitContent.replace(/>Save</g, ">{t('common.save')}<");

cHabitContent = cHabitContent.replace(
  />Review your progress metrics below.</g,
  ">{t('createHabit.mascotDetail')}<",
);
cHabitContent = cHabitContent.replace(
  />Tweak your progress metrics here to stay on track!</g,
  ">{t('createHabit.mascotEdit')}<",
);
cHabitContent = cHabitContent.replace(
  />Starting a new habit is the first step towards a better you! What shall we tackle today?</g,
  ">{t('createHabit.mascotNew')}<",
);

cHabitContent = cHabitContent.replace(
  />Habit Name</g,
  ">{t('createHabit.habitNameLabel')}<",
);
cHabitContent = cHabitContent.replace(
  /placeholder="e.g., Drink 8 glasses of water"/g,
  "placeholder={t('createHabit.habitNamePlaceholder')}",
);
cHabitContent = cHabitContent.replace(
  />Category</g,
  ">{t('createHabit.categoryLabel')}<",
);
cHabitContent = cHabitContent.replace(
  />Frequency</g,
  ">{t('createHabit.frequencyLabel')}<",
);
cHabitContent = cHabitContent.replace(
  />Target per Day</g,
  ">{t('createHabit.targetLabel')}<",
);
cHabitContent = cHabitContent.replace(
  />times per day</g,
  ">{t('createHabit.targetUnit')}<",
);
cHabitContent = cHabitContent.replace(
  />Priority</g,
  ">{t('createHabit.priorityLabel')}<",
);
cHabitContent = cHabitContent.replace(
  />Pro Tip: Consistency over intensity.</g,
  ">{t('createHabit.proTip')}<",
);

cHabitContent = cHabitContent.replace(
  />Custom Frequency</g,
  ">{t('createHabit.modalCustomTitle')}<",
);
cHabitContent = cHabitContent.replace(
  />Select the active practice days</g,
  ">{t('createHabit.modalCustomDesc')}<",
);
cHabitContent = cHabitContent.replace(/>Done</g, ">{t('common.done')}<");

// Category mappings inside loop: {cat} -> {t('category.' + cat.toLowerCase())}
cHabitContent = cHabitContent.replace(
  />\{cat\}</g,
  ">{t('category.' + cat.toLowerCase())}<",
);

// Frequency mappings inside loop/check: 'Daily' -> t('frequency.daily')
cHabitContent = cHabitContent.replace(/>Daily</g, ">{t('frequency.daily')}<");
cHabitContent = cHabitContent.replace(/>Custom</g, ">{t('frequency.custom')}<");
cHabitContent = cHabitContent.replace(
  />\{frequency === 'Custom' \? `Custom \\(\$\{customDays.length\}\\)` : frequency\}</g,
  ">{frequency === 'Custom' ? t('frequency.customWithCount', { count: customDays.length }) : t('frequency.' + frequency.toLowerCase())}<",
);

fs.writeFileSync(cHabitPath, cHabitContent);
console.log("Replaced strings in CreateHabitScreen and BottomTabNavigator");
