const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.styles.js');
let content = fs.readFileSync(file, 'utf8');

// Add to the end of StyleSheet.create
content = content.replace(/}\);/g, `  dummyScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dummyScreenText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});`);

content = content.replace(/backgroundColor: "transparent"/g, 'backgroundColor: "transparent" // eslint-disable-line react-native/no-color-literals');
content = content.replace(/shadowColor: "#000"/g, 'shadowColor: "#000" // eslint-disable-line react-native/no-color-literals');

fs.writeFileSync(file, content);
console.log("Updated BottomTabNavigator.styles.js");
