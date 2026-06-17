const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.styles.js');
let content = fs.readFileSync(file, 'utf8');

// Ensure we have the required styles for the new BottomTabNavigator approach
const missingStyles = `
    globalBottomTabBarExpanded: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 96,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
    },
    tabBarItem: {
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    tabBarItemExpanded: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '100%',
      paddingTop: 12,
    },
    expandHandleWrapper: {
      position: 'absolute',
      bottom: 60,
      width: '100%',
      alignItems: 'center',
    },
    collapseHandleWrapper: {
      position: 'absolute',
      bottom: 96,
      width: '100%',
      alignItems: 'center',
      paddingBottom: 4,
    },
`;

if (!content.includes('globalBottomTabBarExpanded')) {
  content = content.replace('globalBottomTabBar: {', missingStyles + '\n    globalBottomTabBar: {');
  fs.writeFileSync(file, content);
}
console.log("Updated styles.");
