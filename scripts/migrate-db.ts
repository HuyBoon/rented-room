import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

const entityMap = {
  'nguoidungs': 'users',
  'toanhas': 'buildings',
  'phongs': 'rooms',
  'khachthues': 'tenants',
  'hopdongs': 'contracts',
  'hoadons': 'invoices',
  'thanhtoans': 'payments',
  'sucos': 'issues',
  'thongbaos': 'notifications',
  'chisodiennuocs': 'meterreadings'
};

async function migrate() {
  const client = new MongoClient(MONGODB_URI as string);
  
  try {
    await client.connect();
    console.log('--- Connected to MongoDB ---');
    const db = client.db();

    // 1. Snapshot / Warning
    console.log('Starting collection renames...');

    // 2. Rename collections if they exist with old names
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map(c => c.name);

    for (const [oldName, newName] of Object.entries(entityMap)) {
      if (existingNames.includes(oldName)) {
        console.log(`Renaming collection ${oldName} to ${newName}`);
        await db.collection(oldName).rename(newName);
      }
    }

    // 2.5. Drop all indexes to prevent duplicate key errors during field renames
    console.log('--- Dropped existing indexes to prevent conflicts ---');
    const targetCollections = Object.values(entityMap);
    for (const collName of targetCollections) {
      if (existingNames.includes(collName) || Object.values(entityMap).includes(collName)) {
        try {
          // Check if collection exists before dropping indexes
          const actualColls = await db.listCollections({ name: collName }).toArray();
          if (actualColls.length > 0) {
            console.log(`Dropping indexes for ${collName}...`);
            await db.collection(collName).dropIndexes();
          }
        } catch (e) {
          console.warn(`Could not drop indexes for ${collName}:`, (e as Error).message);
        }
      }
    }

    // 3. Transform fields in each collection
    console.log('--- Transforming fields ---');

    // BUILDINGS
    console.log('Migrating Buildings...');
    await db.collection('buildings').updateMany({}, {
      $rename: {
        'tenToaNha': 'name',
        'diaChi.soNha': 'address.houseNumber',
        'diaChi.duong': 'address.street',
        'diaChi.phuong': 'address.ward',
        'diaChi.quan': 'address.district',
        'diaChi.thanhPho': 'address.city',
        'moTa': 'description',
        'anhToaNha': 'images',
        'chuSoHuu': 'ownerId',
        'tongSoPhong': 'totalRooms',
        'tienNghiChung': 'commonAmenities',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // ROOMS
    console.log('Migrating Rooms...');
    await db.collection('rooms').updateMany({}, {
      $rename: {
        'maPhong': 'roomCode',
        'toaNha': 'buildingId',
        'tang': 'floor',
        'dienTich': 'area',
        'giaThue': 'rentPrice',
        'tienCoc': 'deposit',
        'moTa': 'description',
        'anhPhong': 'images',
        'tienNghi': 'amenities',
        'trangThai': 'status',
        'soNguoiToiDa': 'maxOccupants',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // TENANTS
    console.log('Migrating Tenants...');
    await db.collection('tenants').updateMany({}, {
      $rename: {
        'hoTen': 'fullName',
        'soDienThoai': 'phoneNumber',
        'cccd': 'idCardNumber',
        'ngaySinh': 'dateOfBirth',
        'gioiTinh': 'gender',
        'queQuan': 'hometown',
        'anhCCCD.matTruoc': 'idCardImages.front',
        'anhCCCD.matSau': 'idCardImages.back',
        'ngheNghiep': 'occupation',
        'matKhau': 'password',
        'trangThai': 'status',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // CONTRACTS
    console.log('Migrating Contracts...');
    await db.collection('contracts').updateMany({}, {
      $rename: {
        'maHopDong': 'contractCode',
        'phong': 'roomId',
        'khachThueId': 'tenantIds',
        'nguoiDaiDien': 'representativeId',
        'ngayBatDau': 'startDate',
        'ngayKetThuc': 'endDate',
        'giaThue': 'rentPrice',
        'tienCoc': 'deposit',
        'chuKyThanhToan': 'paymentCycle',
        'ngayThanhToan': 'paymentDay',
        'dieuKhoan': 'terms',
        'giaDien': 'electricityPrice',
        'giaNuoc': 'waterPrice',
        'chiSoDienBanDau': 'electricityStart',
        'chiSoNuocBanDau': 'waterStart',
        'phiDichVu': 'serviceFees',
        'trangThai': 'status',
        'fileHopDong': 'contractFile',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // INVOICES
    console.log('Migrating Invoices...');
    await db.collection('invoices').updateMany({}, {
      $rename: {
        'maHoaDon': 'invoiceCode',
        'hopDong': 'contractId',
        'phong': 'roomId',
        'khachThue': 'tenantId',
        'thang': 'month',
        'nam': 'year',
        'tienPhong': 'roomAmount',
        'tienDien': 'electricityAmount',
        'soDien': 'electricityUsage',
        'chiSoDienBanDau': 'electricityStart',
        'chiSoDienCuoiKy': 'electricityEnd',
        'tienNuoc': 'waterAmount',
        'soNuoc': 'waterUsage',
        'chiSoNuocBanDau': 'waterStart',
        'chiSoNuocCuoiKy': 'waterEnd',
        'phiDichVu': 'serviceFees',
        'tongTien': 'totalAmount',
        'daThanhToan': 'paidAmount',
        'conLai': 'remainingAmount',
        'trangThai': 'status',
        'hanThanhToan': 'dueDate',
        'ghiChu': 'notes',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // PAYMENTS
    console.log('Migrating Payments...');
    await db.collection('payments').updateMany({}, {
      $rename: {
        'hoaDon': 'invoiceId',
        'soTien': 'amount',
        'phuongThuc': 'method',
        'thongTinChuyenKhoan.nganHang': 'transferInfo.bank',
        'thongTinChuyenKhoan.soGiaoDich': 'transferInfo.transactionId',
        'ngayThanhToan': 'paymentDate',
        'nguoiNhan': 'receivedBy',
        'ghiChu': 'notes',
        'anhBienLai': 'receiptImage',
        'ngayTao': 'createdAt'
      }
    });

    // ISSUES
    console.log('Migrating Issues...');
    await db.collection('issues').updateMany({}, {
      $rename: {
        'tieuDe': 'title',
        'moTa': 'description',
        'loaiSuCo': 'type',
        'phong': 'roomId',
        'khachThue': 'tenantId',
        'mucDoUuTien': 'priority',
        'trangThai': 'status',
        'nguoiXuLy': 'handlerId',
        'ghiChuXuLy': 'handlerNotes',
        'ngayBaoCao': 'reportedAt',
        'ngayTao': 'createdAt',
        'ngayCapNhat': 'updatedAt'
      }
    });

    // NOTIFICATIONS
    console.log('Migrating Notifications...');
    await db.collection('notifications').updateMany({}, {
      $rename: {
        'tieuDe': 'title',
        'noiDung': 'content',
        'loai': 'type',
        'nguoiGui': 'senderId',
        'nguoiNhan': 'receiverIds',
        'phong': 'roomIds',
        'toaNha': 'buildingId',
        'daDoc': 'readByIds',
        'ngayGui': 'sentAt',
        'ngayTao': 'createdAt'
      }
    });

    // METER READINGS
    console.log('Migrating MeterReadings...');
    await db.collection('meterreadings').updateMany({}, {
      $rename: {
        'phong': 'roomId',
        'thang': 'month',
        'nam': 'year',
        'chiSoDienCu': 'electricityPrev',
        'chiSoDienMoi': 'electricityCurrent',
        'soDienTieuThu': 'electricityUsage',
        'chiSoNuocCu': 'waterPrev',
        'chiSoNuocMoi': 'waterCurrent',
        'soNuocTieuThu': 'waterUsage',
        'anhChiSoDien': 'electricityImage',
        'anhChiSoNuoc': 'waterImage',
        'nguoiGhi': 'recordedBy',
        'ngayGhi': 'recordedAt',
        'ngayTao': 'createdAt'
      }
    });

    // USERS (Standardizing on English fields and dropping legacy Vietnamese ones)
    console.log('Migrating Users...');
    const users = await db.collection('users').find({}).toArray();
    for (const user of users) {
      const updateDoc: any = {
        $set: {
            name: user.name || user.ten,
            password: user.password || user.matKhau,
            phoneNumber: user.phone || user.soDienThoai,
            role: user.role || user.vaiTro,
            avatar: user.avatar || user.anhDaiDien,
            status: user.isActive ? 'active' : 'locked',
            createdAt: user.createdAt || user.ngayTao,
            updatedAt: user.updatedAt || user.ngayCapNhat
        },
        $unset: {
            ten: "",
            matKhau: "",
            soDienThoai: "",
            vaiTro: "",
            anhDaiDien: "",
            trangThai: "",
            phone: "",
            isActive: "",
            ngayTao: "",
            ngayCapNhat: ""
        }
      };
      await db.collection('users').updateOne({ _id: user._id }, updateDoc);
    }

    console.log('--- Migration Completed Successfully ---');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
