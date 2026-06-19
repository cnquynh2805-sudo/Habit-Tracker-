const fs = require("fs");

const map = {
  "'#FAFBFB'": "colors.background",
  "'#F1F3F2'": "colors.surfaceMuted",
  "'#3D6A52'": "colors.primary",
  "'#EF4444'": "colors.warningDark",
  "'#111827'": "colors.text",
  "'#A8D3BE'": "colors.primaryLight",
  "'#F5F7F6'": "colors.surfaceMuted",
  "'#E9EBEA'": "colors.border",
  "'#475569'": "colors.textSecondary",
  "'#94A3B8'": "colors.textDisabled",
  "'#FBFDFD'": "colors.background",
  "'#E2E8F0'": "colors.border",
  "'#64748B'": "colors.textSecondary",
  "'#EEF1F0'": "colors.surfaceMuted",
  "'#E1E5E3'": "colors.border",
  "'#F8FAFC'": "colors.background",
  "'#FFFDF0'": "colors.warningLight",
  "'#EAB308'": "colors.warningDark",
  "'#FEF2F2'": "colors.warningLight",
  "'#1E293B'": "colors.text",
  "'#E8F2EE'": "colors.successLight",
  "'rgba(15, 23, 42, 0.4)'": "colors.border",
  "'rgba(15, 23, 42, 0.3)'": "colors.border",
  "'transparent'": "'transparent'",
};

let txt = fs.readFileSync(
  "src/screens/CreateHabit/CreateHabitScreen.styles.js",
  "utf8",
);
for (const [k, v] of Object.entries(map)) {
  txt = txt.split(k).join(v);
}
// Shadows
txt = txt.replace(/shadowColor: '#000'/g, "shadowColor: colors.text");
fs.writeFileSync("src/screens/CreateHabit/CreateHabitScreen.styles.js", txt);

let txt2 = fs.readFileSync(
  "src/screens/HabitList/HabitListScreen.styles.js",
  "utf8",
);
txt2 = txt2.replace(/shadowColor: '#000'/g, "shadowColor: colors.text");
fs.writeFileSync("src/screens/HabitList/HabitListScreen.styles.js", txt2);

// Fix CreateHabitScreen.js React hook dependencies error
let txt3 = fs.readFileSync(
  "src/screens/CreateHabit/CreateHabitScreen.js",
  "utf8",
);
// Fix loadHabitForEditing order
const loadHabitFunc = `
  const loadHabitForEditing = async () => {
    try {
      const existingDataJson = await AsyncStorage.getItem('@habits_list');
      if (existingDataJson) {
        const habitsList = JSON.parse(existingDataJson);
        const targetHabit = habitsList.find(h => h.id === habitId);
        if (targetHabit) {
          const rawPriority = targetHabit.priority || 'Medium';
          const formattedPriority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1).toLowerCase();
          
          const rawFrequency = targetHabit.frequency || 'Daily';
          const formattedFrequency = rawFrequency.charAt(0).toUpperCase() + rawFrequency.slice(1).toLowerCase();

          const rawStatus = targetHabit.status || 'Active';
          const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          setHabitName(targetHabit.name);
          setCategory(targetHabit.category || 'Mindfulness');
          setFrequency(formattedFrequency);
          setDaysOfWeekList(targetHabit.daysOfWeek || []);
          setTargetPerDay((targetHabit.targetPerDay || 1).toString());
          setCurrentStatus(formattedStatus); 
          setPriority(formattedPriority);

          setBackupData({
            name: targetHabit.name,
            category: targetHabit.category || 'Mindfulness',
            frequency: formattedFrequency,
            daysOfWeek: targetHabit.daysOfWeek || [],
            targetPerDay: (targetHabit.targetPerDay || 1).toString(),
            status: formattedStatus,
            priority: formattedPriority
          });
        }
      }
    } catch (e) {
      console.log('Error loading habit details:', e);
    }
  };
`;
// Remove old declaration
txt3 = txt3.replace(
  /const loadHabitForEditing = async \(\) => \{[\s\S]*?^  \};\n/m,
  "",
);
// Insert above useEffect
txt3 = txt3.replace(
  "useEffect(() => {",
  loadHabitFunc + "\n  useEffect(() => {",
);
fs.writeFileSync("src/screens/CreateHabit/CreateHabitScreen.js", txt3);
