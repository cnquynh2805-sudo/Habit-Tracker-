const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'App.js');
let content = fs.readFileSync(file, 'utf8');

// Replace the main App component
const newApp = `
function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="CreateHabit"
          component={CreateHabitScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </QueryProvider>
  );
}
`;

content = content.replace(/export default function App\(\) \{[\s\S]*\}\n?$/, newApp);

// Don't forget to import useTheme in App.js
if (!content.includes('import { useTheme, ThemeProvider }')) {
  content = content.replace(/import \{ ThemeProvider \} from "\.\/src\/providers\/ThemeProvider";/, 'import { ThemeProvider, useTheme } from "./src/providers/ThemeProvider";');
}

fs.writeFileSync(file, content);
console.log("Updated App.js with AppNavigator");
