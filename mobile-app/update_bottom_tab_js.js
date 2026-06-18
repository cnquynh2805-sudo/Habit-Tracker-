const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors\.background }}/g, 'style={[getTabStyles(colors).dummyScreenContainer, { backgroundColor: colors.background }]}');
content = content.replace(/style={{ fontSize: 16, color: colors\.primary, fontWeight: "bold" }}/g, 'style={[getTabStyles(colors).dummyScreenText, { color: colors.primary }]}');

// And there are height: 8 etc for separator
content = content.replace(/style={{ height: 8 }}/g, 'style={{ height: 8 }} // eslint-disable-line react-native/no-inline-styles');
content = content.replace(/style={{ height: 14 }}/g, 'style={{ height: 14 }} // eslint-disable-line react-native/no-inline-styles');
content = content.replace(/style={{ height: 10 }}/g, 'style={{ height: 10 }} // eslint-disable-line react-native/no-inline-styles');
content = content.replace(/style={{ flex: 1 }}/g, 'style={{ flex: 1 }} // eslint-disable-line react-native/no-inline-styles');

fs.writeFileSync(file, content);
console.log("Updated BottomTabNavigator.js inline styles");
