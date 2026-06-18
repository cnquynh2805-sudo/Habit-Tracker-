const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "src", "providers", "ThemeProvider.tsx");
let content = fs.readFileSync(file, "utf8");

const darkColorsReplacement = `const darkColors = {
  background: "#0F1115",
  surface: "#1A1D24",
  surfaceMuted: "#252A33",
  primary: "#34D399",
  onPrimary: "#022C22",
  primaryLight: "#064E3B",
  primaryMedium: "#059669",
  successLight: "#064E3B",
  successDark: "#34D399",
  warningLight: "#451A03",
  warningDark: "#FDE047",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textDisabled: "#475569",
  border: "#334155",
  priorityLowBg: "#1E3A8A",
  priorityLowText: "#BFDBFE",
  priorityLowStripe: "#3B82F6",
  priorityMediumBg: "#713F12",
  priorityMediumText: "#FEF08A",
  priorityMediumStripe: "#F59E0B",
  priorityHighBg: "#064E3B",
  priorityHighText: "#A7F3D0",
  priorityHighStripe: "#10B981",
  badgeStudyBg: "#1E3A8A",
  badgeStudyText: "#93C5FD",
  badgeDefaultBg: "#064E3B",
  badgeDefaultText: "#6EE7B7",
};`;

content = content.replace(
  /const darkColors = \{[\s\S]*?\};/,
  darkColorsReplacement,
);
fs.writeFileSync(file, content);
console.log("Updated dark theme colors");
