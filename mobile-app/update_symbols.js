const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'HabitList', 'HabitListScreen.js');
let content = fs.readFileSync(file, 'utf8');

// Icons
content = content.replace(/<Text style=\{styles\.floatingActionButtonText\}>\+<\/Text>/g, "<Text style={styles.floatingActionButtonText}>{t('icons.plus')}</Text>");
content = content.replace(/<Text style=\{styles\.kebabMenuIconText\}>?<\/Text>/g, "<Text style={styles.kebabMenuIconText}>{t('icons.kebab')}</Text>");
content = content.replace(/<Text style=\{styles\.themeIconText\}>?<\/Text>/g, "<Text style={styles.themeIconText}>{t('icons.star')}</Text>");
content = content.replace(/<Text style=\{styles\.themeIconText\}>?<\/Text>/g, "<Text style={styles.themeIconText}>{t('icons.arrowLeft')}</Text>");

fs.writeFileSync(file, content);
console.log("Translated symbols.");
