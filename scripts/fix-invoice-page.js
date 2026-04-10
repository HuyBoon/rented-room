const fs = require('fs');
let file = 'src/app/invoices/[id]/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

const dict = {
  'hoaDon.maHoaDon': 'hoaDon.invoiceCode',
  'hoaDon.phong': 'hoaDon.roomId',
  'hoaDon.khachThue': 'hoaDon.tenantId',
  'hoaDon.thang': 'hoaDon.month',
  'hoaDon.nam': 'hoaDon.year',
  'hoaDon.hanThanhToan': 'hoaDon.dueDate',
  'hoaDon.trangThai': 'hoaDon.status',
  'hoaDon.chiSoDienBanDau': 'hoaDon.electricityStart',
  'hoaDon.chiSoDienCuoiKy': 'hoaDon.electricityEnd',
  'hoaDon.soDien': 'hoaDon.electricityUsage',
  'hoaDon.chiSoNuocBanDau': 'hoaDon.waterStart',
  'hoaDon.chiSoNuocCuoiKy': 'hoaDon.waterEnd',
  'hoaDon.soNuoc': 'hoaDon.waterUsage',
  'hoaDon.tienPhong': 'hoaDon.roomAmount',
  'hoaDon.tienDien': 'hoaDon.electricityAmount',
  'hoaDon.tienNuoc': 'hoaDon.waterAmount',
  'hoaDon.phiDichVu': 'hoaDon.serviceFees',
  'hoaDon.tongTien': 'hoaDon.totalAmount',
  'hoaDon.daThanhToan': 'hoaDon.paidAmount',
  'hoaDon.conLai': 'hoaDon.remainingAmount',
  'hoaDon.ghiChu': 'hoaDon.notes',
  
  'phi.ten': 'phi.name',
  'phi.gia': 'phi.amount',

  'thanhToan.phuongThuc': 'thanhToan.method',
  'thanhToan.soTien': 'thanhToan.amount',
  'thanhToan.ngayThanhToan': 'thanhToan.paymentDate',
  'thanhToan.thongTinChuyenKhoan': 'thanhToan.transferInfo',
  'thanhToan.ghiChu': 'thanhToan.notes',
  
  'transferInfo.nganHang': 'transferInfo.bank',
  'transferInfo.soGiaoDich': 'transferInfo.transactionId',
  
  "'chuaThanhToan'": "'unpaid'",
  "'daThanhToanMotPhan'": "'partiallyPaid'",
  "'daThanhToan'": "'paid'",
  "'quaHan'": "'overdue'",

  "'tienMat'": "'cash'",
  "'chuyenKhoan'": "'transfer'",
  "'viDienTu'": "'eWallet'",
};

for(const [k, v] of Object.entries(dict)) {
  txt = txt.split(k).join(v);
}

fs.writeFileSync(file, txt);
console.log('Fixed ', file);
