const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'screens', 'CreateHabit', 'CreateHabitScreen.styles.js');
let content = fs.readFileSync(file, 'utf8');

// Header
content = content.replace(/color: "#3D6A52",/g, 'color: colors.primary,');
content = content.replace(/color: "#EF4444",/g, 'color: colors.error,'); // assuming we have error, or just leave it since error is usually red. I'll use "#EF4444" but we should add colors.error to ThemeProvider. Actually, let's just leave #EF4444 for now as it's readable on dark.
content = content.replace(/color: "#111827",/g, 'color: colors.text,');
content = content.replace(/backgroundColor: "#3D6A52",/g, 'backgroundColor: colors.primary,');

// General texts
content = content.replace(/color: "#0F172A",/g, 'color: colors.text,');
content = content.replace(/color: "#475569",/g, 'color: colors.textMuted,');
content = content.replace(/color: "#64748B",/g, 'color: colors.textDisabled,');
content = content.replace(/color: "#000000",/g, 'color: colors.text,');
content = content.replace(/color: "#333",/g, 'color: colors.text,');
content = content.replace(/color: "#1F2937",/g, 'color: colors.text,');

// Borders
content = content.replace(/borderColor: "#E2E8F0",/g, 'borderColor: colors.border,');
content = content.replace(/borderColor: "#CBD5E1",/g, 'borderColor: colors.border,');

// Surfaces
content = content.replace(/backgroundColor: "#F8FAFC",/g, 'backgroundColor: colors.surfaceMuted,');

fs.writeFileSync(file, content);
console.log("Updated CreateHabitScreen.styles.js text colors");
