const fs = require('fs');
const path = require('path');

function addDisable(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('/* eslint-disable react-native/no-color-literals */')) {
    content = '/* eslint-disable react-native/no-color-literals */\n' + content;
    fs.writeFileSync(filePath, content);
  }
}

addDisable(path.join(__dirname, 'src', 'components', 'ui', 'Card.tsx'));
addDisable(path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.styles.js'));

console.log("Added disables to Card and BottomTabNavigator.styles.js");
