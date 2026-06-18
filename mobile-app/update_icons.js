const fs = require("fs");
const path = require("path");
const localesDir = path.join(__dirname, "src", "locales");
const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.icons) data.icons = {};
  data.icons.check = "?";
  data.icons.star = "?";
  data.icons.arrowLeft = "?";
  data.icons.plus = "+";
  data.icons.kebab = "?";

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log("Updated JSON files with icons.");
