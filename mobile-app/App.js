import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORT SCREENS AND NEW NAVIGATORS
import BottomTabNavigator from './src/navigation/BottomTabNavigator'; // Path to the newly created Tab Navigator file
import CreateHabitScreen from './src/screens/CreateHabit/CreateHabitScreen'; // Habit creation/modification screen
import { ThemeProvider } from './src/providers/ThemeProvider'; // Theme provider
import { QueryProvider } from './src/providers/QueryProvider'; // React Query provider
import './src/i18n'; // Initialize i18n

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
              headerShown: false, // Hide the default Stack header to use custom Figma-accurate headers
            }}
          >
            {/* 2. SET UP BOTTOM TAB AS THE MAIN APPLICATION FLOW */}
            <Stack.Screen 
              name="MainTabs" 
              component={BottomTabNavigator} 
            />

            {/* 3. CREATE/EDIT HABIT SCREEN WILL OVERLAY THE TAB BAR ON NAVIGATION */}
            <Stack.Screen 
              name="CreateHabit" 
              component={CreateHabitScreen} 
              options={{
                animation: 'slide_from_bottom', // Premium bottom-up slide transition effect
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </QueryProvider>
  );
}