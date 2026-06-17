const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { globSync } = require("glob");

const SCREENS_DIR = path.resolve(__dirname, "../src/screens");
const files = globSync(`${SCREENS_DIR}/**/*.js`);

let totalViolations = 0;
const reports = [];

function reportViolation(file, line, rule, message) {
  totalViolations++;
  reports.push(
    `\x1b[31m[Violation]\x1b[0m ${path.basename(file)}:${line} -> ${rule}: ${message}`,
  );
}

files.forEach((file) => {
  const code = fs.readFileSync(file, "utf-8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (e) {
    console.error(`Failed to parse ${file}:`, e.message);
    return;
  }

  traverse(ast, {
    // Check for inline styles
    JSXAttribute(pathNode) {
      if (pathNode.node.name.name === "style") {
        const value = pathNode.node.value;
        if (
          value &&
          value.type === "JSXExpressionContainer" &&
          value.expression.type === "ObjectExpression"
        ) {
          reportViolation(
            file,
            pathNode.node.loc.start.line,
            "UI_GUIDELINES_RULE_3",
            "Inline styles are forbidden. Extract to StyleSheet.create.",
          );
        }
      }
    },

    // Check for missing a11y labels on Touchables
    JSXOpeningElement(pathNode) {
      const elementName = pathNode.node.name.name;
      if (elementName === "TouchableOpacity" || elementName === "Pressable") {
        const hasAccessible = pathNode.node.attributes.some(
          (attr) => attr.name && attr.name.name === "accessible",
        );
        const hasA11yRole = pathNode.node.attributes.some(
          (attr) => attr.name && attr.name.name === "accessibilityRole",
        );
        const hasA11yLabel = pathNode.node.attributes.some(
          (attr) => attr.name && attr.name.name === "accessibilityLabel",
        );

        if (!hasAccessible || !hasA11yRole || !hasA11yLabel) {
          reportViolation(
            file,
            pathNode.node.loc.start.line,
            "UI_GUIDELINES_RULE_4",
            `${elementName} is missing required accessibility props (accessible, accessibilityRole, accessibilityLabel).`,
          );
        }
      }
    },

    // Check for fixed pixels vs responsive layout
    CallExpression(pathNode) {
      if (
        pathNode.node.callee.type === "MemberExpression" &&
        pathNode.node.callee.object.name === "StyleSheet" &&
        pathNode.node.callee.property.name === "create"
      ) {
        // We found StyleSheet.create({...})
        pathNode.traverse({
          ObjectProperty(stylePropPath) {
            const propName =
              stylePropPath.node.key.name || stylePropPath.node.key.value;
            const propValue = stylePropPath.node.value;

            if (
              [
                "width",
                "height",
                "maxWidth",
                "minWidth",
                "maxHeight",
                "minHeight",
              ].includes(propName)
            ) {
              if (propValue.type === "NumericLiteral" && propValue.value > 48) {
                // Rule 5: 48px is the max for touch targets. Anything bigger like 100, 200 should be a percentage or flex!
                reportViolation(
                  file,
                  stylePropPath.node.loc.start.line,
                  "UI_GUIDELINES_RULE_5",
                  `Fixed layout pixel detected (${propName}: ${propValue.value}). Use percentages (e.g., '50%') or flex layout for values larger than 48px.`,
                );
              }
            }
          },
        });
      }
    },
  });
});

console.log(`\n\x1b[36m--- UI Guideline Auditor Report ---\x1b[0m`);
if (totalViolations === 0) {
  console.log(
    `\x1b[32mSuccess! 0 UI Guideline violations found across ${files.length} files.\x1b[0m`,
  );
  process.exit(0);
} else {
  reports.forEach((r) => console.log(r));
  console.log(
    `\n\x1b[31mFailed: Found ${totalViolations} UI Guideline violations. Please fix them.\x1b[0m`,
  );
  process.exit(1);
}
