import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Models
import User from '../src/modules/users/model';
import Building from '../src/modules/buildings/model';
import Room from '../src/modules/rooms/model';
import Tenant from '../src/modules/tenants/model';
import Contract from '../src/modules/contracts/model';
import MeterReading from '../src/modules/meter-readings/model';
import Invoice from '../src/modules/invoices/model';
import Payment from '../src/modules/payments/model';
import Issue from '../src/modules/incidents/model';
import Notification from '../src/modules/notifications/model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

// Data Sets
const VN_NAMES = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức', 'Hoàng Thu Thảo',
    'Vũ Minh Tuấn', 'Đặng Hồng Nhung', 'Bùi Xuân Hùng', 'Đỗ Thùy Linh', 'Ngô Quang Khải',
    'Lý Gia Bảo', 'Trịnh Công Sơn', 'Hồ Xuân Hương', 'Phan Văn Trị', 'Đoàn Thị Điểm',
    'Mai Văn Thưởng', 'Cao Minh Quang', 'Đinh Tiến Đạt', 'Quách Thành Danh', 'Tạ Minh Tâm'
];

const TOWNS = ['Bến Thành', 'Phạm Ngũ Lão', 'Đa Kao', 'Tân Định', 'Cầu Ông Lãnh', 'Cô Giang', 'Phường 1', 'Phường 5', 'Thảo Điền', 'An Phú'];
const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Quận Thủ Đức', 'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Huyện Nhà Bè'];
const STREETS = ['Lê Lợi', 'Nguyễn Huệ', 'Võ Văn Kiệt', 'Cách Mạng Tháng Tám', 'Điện Biên Phủ', 'Nam Kỳ Khởi Nghĩa', 'Bùi Viện', 'Phạm Ngọc Thạch', 'Nguyễn Thị Minh Khai', 'Pasteur'];

const OCCUPATIONS = ['Kỹ sư phần mềm', 'Kế toán', 'Sinh viên ĐHQG', 'Nhân viên văn phòng', 'Kinh doanh tự do', 'Giáo viên', 'Bác sĩ', 'Thiết kế đồ họa', 'Marketing', 'Hướng dẫn viên du lịch'];

const COMMON_AMENITIES = ['wifi', 'camera', 'security', 'parking', 'elevator', 'dryingArea', 'sharedBathroom', 'sharedKitchen'];
const ROOM_AMENITIES = ['ac', 'waterHeater', 'fridge', 'bed', 'wardrobe', 'desk', 'chair', 'tv', 'wifi', 'washingMachine', 'kitchen', 'pot', 'dishes', 'bowl'];

// Helper to pick random item
const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
// Helper to pick multiple random items
const pickMultiple = (arr: any[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
};

async function seed() {
  try {
    console.log('--- Connecting to MongoDB ---');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected successfully.');

    // 0. Clear existing data
    console.log('--- Clearing existing data ---');
    await Promise.all([
      User.deleteMany({}),
      Building.deleteMany({}),
      Room.deleteMany({}),
      Tenant.deleteMany({}),
      Contract.deleteMany({}),
      MeterReading.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Issue.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Data cleared.');

    const seedCounts: Record<string, number> = {};

    // 1. Seed Users (10)
    console.log('--- Seeding 10 Users ---');
    const users = [];
    for (let i = 1; i <= 10; i++) {
        const role = i === 1 ? 'admin' : (i <= 4 ? 'landlord' : 'staff');
        const user = await User.create({
            name: pick(VN_NAMES),
            email: `user${i}@rentedroom.vn`,
            password: 'password123',
            phoneNumber: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
            role: role,
            status: 'active'
        });
        users.push(user);
    }
    seedCounts['Users'] = users.length;

    // 2. Seed Buildings (10)
    console.log('--- Seeding 10 Buildings ---');
    const buildings = [];
    const landlords = users.filter(u => u.role === 'admin' || u.role === 'landlord');
    for (let i = 1; i <= 10; i++) {
        const building = await Building.create({
            name: `${pick(['Toà nhà', 'Chung cư', 'Khu trọ'])} ${pick(['Hạnh Phúc', 'Thế Kỷ', 'Bình An', 'Mặt Trời', 'Ánh Sao', 'Thanh Bình'])} ${i}`,
            address: {
                houseNumber: `${i * 10}/${i}`,
                street: pick(STREETS),
                ward: pick(TOWNS),
                district: pick(DISTRICTS),
                city: 'TP. Hồ Chí Minh',
            },
            description: 'Tòa nhà cao cấp, đầy đủ tiện nghi, an ninh đảm bảo.',
            images: [`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80`],
            ownerId: pick(landlords)._id,
            totalRooms: 10,
            commonAmenities: pickMultiple(COMMON_AMENITIES, 4)
        });
        buildings.push(building);
    }
    seedCounts['Buildings'] = buildings.length;

    // 3. Seed Rooms (10)
    console.log('--- Seeding 10 Rooms ---');
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
        const building = buildings[i-1 % buildings.length];
        const room = await Room.create({
            roomCode: `P${100 + i}`,
            buildingId: building._id,
            floor: Math.ceil(i/3),
            area: 20 + Math.floor(Math.random() * 20),
            rentPrice: (3 + Math.floor(Math.random() * 5)) * 1000000,
            deposit: 5000000 + Math.floor(Math.random() * 10000000),
            description: 'Phòng sạch sẽ, ban công rộng, ánh sáng tự nhiên tốt.',
            maxOccupants: 2 + Math.floor(Math.random() * 2),
            status: 'rented', // All seeded rooms will be rented for consistent contract/reading seeding
            amenities: pickMultiple(ROOM_AMENITIES, 5)
        });
        rooms.push(room);
    }
    seedCounts['Rooms'] = rooms.length;

    // 4. Seed Tenants (10)
    console.log('--- Seeding 10 Tenants ---');
    const tenants = [];
    for (let i = 1; i <= 10; i++) {
        const idCard = Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
        const tenant = await Tenant.create({
            fullName: VN_NAMES[i + 9 % VN_NAMES.length],
            phoneNumber: `08${Math.floor(10000000 + Math.random() * 90000000)}`,
            email: `tenant${i}@gmail.com`,
            idCardNumber: idCard,
            dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), 1, 1),
            gender: Math.random() > 0.5 ? 'male' : 'female',
            hometown: pick(DISTRICTS),
            occupation: pick(OCCUPATIONS),
            password: 'password123',
            status: 'renting'
        });
        tenants.push(tenant);
    }
    seedCounts['Tenants'] = tenants.length;

    // 5. Seed Contracts (10)
    console.log('--- Seeding 10 Contracts ---');
    const contracts = [];
    for (let i = 0; i < 10; i++) {
        const room = rooms[i];
        const tenant = tenants[i];
        const contract = await Contract.create({
            contractCode: `HĐ${202400 + i}`,
            roomId: room._id,
            tenantIds: [tenant._id],
            representativeId: tenant._id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-01-01'),
            rentPrice: room.rentPrice,
            deposit: room.deposit,
            paymentCycle: 'monthly',
            paymentDay: 5,
            terms: 'Hợp đồng thuê nhà tiêu chuẩn, quy định về giờ giấc và quản lý tài sản.',
            electricityPrice: 3500,
            waterPrice: 20000,
            electricityStart: 100 + i * 10,
            waterStart: 50 + i * 5,
            serviceFees: [{ name: 'Rác', amount: 50000 }, { name: 'Vệ sinh', amount: 30000 }],
            status: 'active'
        });
        contracts.push(contract);
    }
    seedCounts['Contracts'] = contracts.length;

    // 6. Seed MeterReadings (10)
    console.log('--- Seeding 10 Readings ---');
    const readings = [];
    for (let i = 0; i < 10; i++) {
        const contract = contracts[i];
        const elecPrev = contract.electricityStart;
        const elecCurr = elecPrev + 120 + Math.floor(Math.random() * 50);
        const waterPrev = contract.waterStart;
        const waterCurr = waterPrev + 10 + Math.floor(Math.random() * 10);
        
        const reading = await MeterReading.create({
            roomId: contract.roomId,
            month: 3,
            year: 2024,
            electricityPrev: elecPrev,
            electricityCurrent: elecCurr,
            electricityUsage: elecCurr - elecPrev,
            waterPrev: waterPrev,
            waterCurrent: waterCurr,
            waterUsage: waterCurr - waterPrev,
            recordedBy: pick(users)._id,
            recordedAt: new Date('2024-03-01')
        });
        readings.push(reading);
    }
    seedCounts['MeterReadings'] = readings.length;

    // 7. Seed Invoices (10)
    console.log('--- Seeding 10 Invoices ---');
    const invoices = [];
    for (let i = 0; i < 10; i++) {
        const contract = contracts[i];
        const reading = readings[i];
        
        const elecUsage = reading.electricityCurrent - reading.electricityPrev;
        const waterUsage = reading.waterCurrent - reading.waterPrev;
        
        const elecAmount = elecUsage * contract.electricityPrice;
        const waterAmount = waterUsage * contract.waterPrice;
        const serviceTotal = contract.serviceFees.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        const total = contract.rentPrice + elecAmount + waterAmount + serviceTotal;

        const invoice = await Invoice.create({
            invoiceCode: `INV-${20240300 + i}`,
            contractId: contract._id,
            roomId: contract.roomId,
            tenantId: contract.representativeId,
            month: 3,
            year: 2024,
            roomAmount: contract.rentPrice,
            electricityAmount: elecAmount,
            electricityUsage: elecUsage,
            electricityStart: reading.electricityPrev,
            electricityEnd: reading.electricityCurrent,
            waterAmount: waterAmount,
            waterUsage: waterUsage,
            waterStart: reading.waterPrev,
            waterEnd: reading.waterCurrent,
            serviceFees: contract.serviceFees,
            totalAmount: total,
            paidAmount: i < 5 ? total : 0,
            remainingAmount: i < 5 ? 0 : total,
            dueDate: new Date('2024-03-10'),
            status: i < 5 ? 'paid' : 'unpaid'
        });
        invoices.push(invoice);
    }
    seedCounts['Invoices'] = invoices.length;

    // 8. Seed Payments (10)
    console.log('--- Seeding 10 Payments ---');
    const payments = [];
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    for (let i = 0; i < 10; i++) {
        const invoice = paidInvoices[i % paidInvoices.length];
        const payment = await Payment.create({
            invoiceId: invoice._id,
            amount: invoice.totalAmount,
            method: pick(['cash', 'transfer', 'eWallet']),
            transferInfo: {
                bank: 'Vietcombank',
                transactionId: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`
            },
            paymentDate: new Date(),
            receivedBy: pick(users)._id,
            notes: 'Thanh toán tiền phòng tháng 3'
        });
        payments.push(payment);
    }
    seedCounts['Payments'] = payments.length;

    // 9. Seed Issues (10)
    console.log('--- Seeding 10 Issues ---');
    const issues = [];
    for (let i = 0; i < 10; i++) {
        const room = rooms[i];
        const tenant = tenants[i];
        const issue = await Issue.create({
            title: pick(['Hư vòi nước', 'Bóng đèn hỏng', 'Máy lạnh không lạnh', 'Cửa bị kẹt', 'Wifi yếu', 'Nước chảy chậm']),
            description: 'Yêu cầu thợ sửa chữa sớm nhất có thể để đảm bảo sinh hoạt.',
            type: pick(['utility', 'furniture', 'cleanliness', 'security', 'other']),
            roomId: room._id,
            tenantId: tenant._id,
            priority: pick(['low', 'medium', 'high', 'critical']),
            status: pick(['new', 'processing', 'resolved', 'cancelled'])
        });
        issues.push(issue);
    }
    seedCounts['Issues'] = issues.length;

    // 10. Seed Notifications (10)
    console.log('--- Seeding 10 Notifications ---');
    const notifications = [];
    for (let i = 0; i < 10; i++) {
        const sender = pick(landlords);
        const receiverSet = pickMultiple(tenants, 3);
        const notification = await Notification.create({
            title: pick(['Thông báo đóng tiền phòng', 'Nhắc nhở nội quy tòa nhà', 'Lịch bảo trì hệ thống điện', 'Chúc mừng ngày lễ']),
            content: 'Vui lòng kiểm tra và thực hiện theo đúng thông báo của ban quản lý. Cảm ơn.',
            type: pick(['general', 'invoice', 'issue', 'contract', 'other']),
            senderId: sender._id,
            receiverIds: receiverSet.map(t => t._id),
            readByIds: [],
            sentAt: new Date()
        });
        notifications.push(notification);
    }
    seedCounts['Notifications'] = notifications.length;

    console.log('--- Seeding Summary ---');
    Object.entries(seedCounts).forEach(([model, count]) => {
        console.log(`${model}: ${count} records created.`);
    });
    console.log('--- Seeding Completed! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
