const fs = require('fs');

const dict = {
  "'chuaThanhToan'": "'unpaid'",
  "'daThanhToanMotPhan'": "'partiallyPaid'",
  "'daThanhToan'": "'paid'",
  "'quaHan'": "'overdue'",
  "'hoatDong'": "'active'"
};

function fixFile(file) {
  let txt = fs.readFileSync(file, 'utf8');
  for(const [k, v] of Object.entries(dict)) {
    txt = txt.split(k).join(v);
  }
  fs.writeFileSync(file, txt);
  console.log('Fixed', file);
}

fixFile('src/components/ui/hoa-don-data-table.tsx');
fixFile('src/components/ui/hop-dong-data-table.tsx');
