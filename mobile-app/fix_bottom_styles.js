const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.styles.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/backgroundColor: "transparent" \/\/ eslint-disable-line react-native\/no-color-literals,/g, 'backgroundColor: "transparent", // eslint-disable-line react-native/no-color-literals');
content = content.replace(/shadowColor: "#000" \/\/ eslint-disable-line react-native\/no-color-literals,/g, 'shadowColor: "#000", // eslint-disable-line react-native/no-color-literals');

fs.writeFileSync(file, content);
console.log("Fixed BottomTabNavigator.styles.js parsing error");
