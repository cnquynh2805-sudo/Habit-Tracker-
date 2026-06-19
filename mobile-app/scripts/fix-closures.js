const fs = require("fs");
const path = require("path");

const file = path.join(
  __dirname,
  "..",
  "src",
  "navigation",
  "BottomTabNavigator.js",
);
let c = fs.readFileSync(file, "utf8");

c = c.replace(
  /t\('tabs\.todayScreen'\)}<\/Text>[\r\n\s]*<\/View>[\r\n\s]*\);/g,
  "t('tabs.todayScreen')}</Text>\n  </View>\n);};",
);
c = c.replace(
  /t\('tabs\.statsScreen'\)}<\/Text>[\r\n\s]*<\/View>[\r\n\s]*\);/g,
  "t('tabs.statsScreen')}</Text>\n  </View>\n);};",
);
c = c.replace(
  /t\('tabs\.goalsScreen'\)}<\/Text>[\r\n\s]*<\/View>[\r\n\s]*\);/g,
  "t('tabs.goalsScreen')}</Text>\n  </View>\n);};",
);
c = c.replace(
  /t\('tabs\.mascotScreen'\)}<\/Text>[\r\n\s]*<\/View>[\r\n\s]*\);/g,
  "t('tabs.mascotScreen')}</Text>\n  </View>\n);};",
);

fs.writeFileSync(file, c);
console.log("Fixed closures");
