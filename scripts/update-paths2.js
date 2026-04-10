const fs = require('fs');
const path = require('path');

const replacements = {
  "/dashboard/room": "/dashboard/rooms",
  "/dashboard/invoice": "/dashboard/invoices",
};

function walkDir(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  });
  return files;
}

const files = walkDir('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  for (const [oldStr, newStr] of Object.entries(replacements)) {
    // using regex to ensure we just split on exact matches
    const escapedOldStr = oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!s)${escapedOldStr}(?!s)`, 'g');
    newContent = newContent.replace(regex, newStr);
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
