const fs = require('fs');
const path = require('path');

const replacements = {
  // Modules
  "@/modules/building": "@/modules/buildings",
  // rooms doesn't contain building so it's safe
  "@/modules/room": "@/modules/rooms",
  "@/modules/issue": "@/modules/incidents",
  "@/modules/user": "@/modules/users",
  "@/modules/contract": "@/modules/contracts",
  "@/modules/invoice": "@/modules/invoices",
  "@/modules/payment": "@/modules/payments",
  "@/modules/notification": "@/modules/notifications",
  "@/modules/tenant": "@/modules/tenants",
  "@/modules/meter-reading": "@/modules/meter-readings",
  "@/modules/report": "@/modules/reports",

  // APIs
  "/api/toa-nha": "/api/buildings",
  "/api/phong": "/api/rooms",
  "/api/su-co": "/api/incidents",
  "/api/hoa-don": "/api/invoices",
  "/api/thanh-toan": "/api/payments",
  "/api/hop-dong": "/api/contracts",
  "/api/thong-bao": "/api/notifications",
  "/api/chi-so-dien-nuoc": "/api/meter-readings",
  
  // Public APIs
  "/api/toa-nha-public": "/api/public/buildings",
  "/api/phong-public": "/api/public/rooms",
  "/api/hoa-don-public": "/api/public/invoices",

  // Dashboard
  "/dashboard/toa-nha": "/dashboard/buildings",
  "/dashboard/phong": "/dashboard/rooms",
  "/dashboard/su-co": "/dashboard/incidents",
  "/dashboard/hoa-don": "/dashboard/invoices",
  "/dashboard/thanh-toan": "/dashboard/payments",
  "/dashboard/hop-dong": "/dashboard/contracts",
  "/dashboard/thong-bao": "/dashboard/notifications",
  "/dashboard/quan-ly-tai-khoan": "/dashboard/users",
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

  // We should be careful about partial replacements, e.g. replacing 'building' inside 'buildings' by accident.
  // Since we replace 'building' to 'buildings', if we run it twice we get 'buildingss'.
  // But we use strings with prefixes like "@/modules/building" -> "@/modules/buildings", which should be safe if done properly. Wait! What if we have "@modules/building/controller"? It works: "@modules/buildings/controller".
  // What about "/dashboard/toa-nha" -> "/dashboard/buildings"?
  // This is safe.
  
  for (const [oldStr, newStr] of Object.entries(replacements)) {
    // using regex to ensure we just split on exact matches
    const escapedOldStr = oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!s)${escapedOldStr}(?!s)`, 'g');
    newContent = newContent.replace(regex, newStr);
    
    // some normal replacements
    newContent = newContent.split(oldStr).join(newStr);
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
