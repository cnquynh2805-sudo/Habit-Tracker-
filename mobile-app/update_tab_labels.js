const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'navigation', 'BottomTabNavigator.js');
let content = fs.readFileSync(file, 'utf8');

// The capsule needs to be closed BEFORE the text. 
// We will replace the return of each Icon component.
content = content.replace(/<View style=\{tabStyles\.activeTabIndicatorCapsule\}>/g, '<View style={tabStyles.activeTabItemContainer}>\n    <View style={tabStyles.activeTabIndicatorCapsule}>');
// Now close the capsule right after the vectorTabIconWrapper closes
content = content.replace(/<\/View>\s*\{isExpanded && <Text style=\{tabStyles\.tabBarLabelTextActive\}>([^<]+)<\/Text>\}\s*<\/View>/g, '</View>\n    </View>\n    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>$1</Text>}\n  </View>');

// Update inactive text
content = content.replace(/\{isExpanded && <Text style=\{tabStyles\.tabBarLabelText\}>([^<]+)<\/Text>\}/g, '{isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>$1</Text>}');

fs.writeFileSync(file, content);
console.log("Updated BottomTabNavigator labels.");
