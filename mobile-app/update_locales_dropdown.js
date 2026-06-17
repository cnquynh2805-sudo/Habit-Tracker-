const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.habitList) data.habitList = {};
  if (!data.habitList.contextMenu) data.habitList.contextMenu = {};
  
  data.habitList.contextMenu.pause = 'Pause';
  data.habitList.contextMenu.resume = 'Resume';
  data.habitList.contextMenu.archive = 'Archive';
  data.habitList.contextMenu.restore = 'Restore';
  data.habitList.contextMenu.delete = 'Delete';
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
console.log('Updated JSON files with dropdown options.');
