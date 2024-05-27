const path = require("path");
const fs = require("fs");
const fg = require("fast-glob");

// Adjust these according to your project structure
const srcDir = path.join(__dirname, "src");
const aliasMap = {
  api: "src/api",
  database: "src/database",
  utils: "src/utils",
};

// Convert absolute import to relative import
const convertToRelative = (from, to) => {
  const relativePath = path.relative(path.dirname(from), to);
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
};

console.log(`Source directory: ${srcDir}`);
console.log("Alias map:", aliasMap);

// Process all TypeScript files in the source directory
fg(`${srcDir}/**/*.ts`).then((files) => {
  if (files.length === 0) {
    console.log("No files found.");
    return;
  }

  console.log(`Found ${files.length} files.`);

  files.forEach((file) => {
    console.log(`Processing file: ${file}`);
    let content = fs.readFileSync(file, "utf8");
    let updatedContent = content;

    for (const [alias, aliasPath] of Object.entries(aliasMap)) {
      const regex = new RegExp(
        `import\\s+(\\{[^}]+\\}\\s+from\\s+['"]${alias}|[^\\s]+\\s+from\\s+['"]${alias})([^'"]+)['"]`,
        "g"
      );
      updatedContent = updatedContent.replace(regex, (match, p1, p2) => {
        const absolutePath = path.join(__dirname, aliasPath, p2);
        const relativePath = convertToRelative(file, absolutePath);
        console.log(`Replacing import from ${alias}${p2} to ${relativePath}`);
        return `import ${p1}${relativePath}'`;
      });
    }

    if (updatedContent !== content) {
      fs.writeFileSync(file, updatedContent, "utf8");
      console.log(`Updated imports in ${file}`);
    }
  });

  console.log("Finished updating imports.");
});
