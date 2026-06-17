const fs = require("fs");

let txt = fs.readFileSync(
  "src/screens/CreateHabit/CreateHabitScreen.js",
  "utf8",
);

txt = txt.replace(
  "import { styles } from './CreateHabitScreen.styles';",
  "import { getStyles } from './CreateHabitScreen.styles';\nimport { useTheme } from '../../providers/ThemeProvider';",
);
txt = txt.replace(
  "export default function CreateHabitScreen({ route, navigation }) {",
  "export default function CreateHabitScreen({ route, navigation }) {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);",
);
txt = txt.replace(
  'placeholderTextColor="#94A3B8"',
  "placeholderTextColor={colors.textDisabled}",
);
txt = txt.replace(
  'ActivityIndicator size="small" color="#FFFFFF"',
  'ActivityIndicator size="small" color={colors.onPrimary}',
);

fs.writeFileSync("src/screens/CreateHabit/CreateHabitScreen.js", txt);
