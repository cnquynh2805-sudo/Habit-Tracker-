const fs = require("fs");
const path = require("path");
const localesDir = path.join(__dirname, "src", "locales");
const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.tabs) data.tabs = {};
  data.tabs.tapToSeeScreenNames = "Tap to see screen names"; // Defaulting to EN for all, can be translated later

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log("Updated JSON files.");
