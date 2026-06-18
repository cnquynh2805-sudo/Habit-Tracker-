const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'providers', 'ThemeProvider.tsx');
let content = fs.readFileSync(file, 'utf8');

// Update dark colors
content = content.replace(/textSecondary: "#94A3B8",/g, 'textSecondary: "#CBD5E1",');
content = content.replace(/textMuted: "#64748B",/g, 'textMuted: "#94A3B8",');
content = content.replace(/textDisabled: "#475569",/g, 'textDisabled: "#64748B",');
content = content.replace(/border: "#334155",/g, 'border: "#475569",');

fs.writeFileSync(file, content);
console.log("Updated ThemeProvider.tsx dark theme contrast");
