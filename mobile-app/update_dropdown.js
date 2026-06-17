const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/label: "Pause"/g, "label: t('habitList.contextMenu.pause', { defaultValue: 'Pause' })");
content = content.replace(/label: "Resume"/g, "label: t('habitList.contextMenu.resume', { defaultValue: 'Resume' })");
content = content.replace(/label: "Archive"/g, "label: t('habitList.contextMenu.archive', { defaultValue: 'Archive' })");
content = content.replace(/label: "Restore"/g, "label: t('habitList.contextMenu.restore', { defaultValue: 'Restore' })");
content = content.replace(/label: "Delete"/g, "label: t('habitList.contextMenu.delete', { defaultValue: 'Delete' })");

fs.writeFileSync(file, content);
console.log("Translated dropdown options");
