const fs = require('fs');
const path = require('path');

const replacements = {
  "/khach-thue": "/tenants",
  "/hoa-don": "/invoices",
  "/xem-phong": "/view-room",
  "api/khach-thue": "api/tenants",
  "api/hoa-don": "api/invoices",
  "api/auth/khach-thue": "api/auth/tenants",
  "/dashboard/ho-so": "/dashboard/profile",
  "/dashboard/cai-dat": "/dashboard/settings"
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
    newContent = newContent.split(oldStr).join(newStr);
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
