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

    // 1. Seed Users (Admin)
    console.log('--- Seeding Users ---');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@rented.com',
      password: 'admin123',
      phoneNumber: '0901234567',
      role: 'admin',
      status: 'active'
    });
    console.log('Admin created.');

    // 2. Seed Buildings
    console.log('--- Seeding Buildings ---');
    const building1 = await Building.create({
      name: 'Toà Nhà Hạnh Phúc',
      address: {
        houseNumber: '123',
        street: 'Đường Lê Lợi',
        ward: 'Bến Thành',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
      },
      description: 'Tòa nhà cao cấp trung tâm thành phố',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'],
      ownerId: admin._id,
      totalRooms: 10,
      commonAmenities: ['wifi', 'camera', 'security', 'elevator']
    });

    const building2 = await Building.create({
      name: 'Motel Sunside',
      address: {
        houseNumber: '45/6',
        street: 'Đường Võ Văn Kiệt',
        ward: 'Phường 5',
        district: 'Quận 5',
        city: 'TP. Hồ Chí Minh',
      },
      description: 'Khu vực yên tĩnh, thoáng mát',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      ownerId: admin._id,
      totalRooms: 5,
      commonAmenities: ['wifi', 'parking', 'dryingArea']
    });
    console.log('Buildings created.');

    // 3. Seed Rooms
    console.log('--- Seeding Rooms ---');
    const room1 = await Room.create({
      roomCode: 'P101',
      buildingId: building1._id,
      floor: 1,
      area: 25,
      rentPrice: 5000000,
      deposit: 10000000,
      description: 'Phòng ban công thoáng đãng',
      maxOccupants: 2,
      status: 'rented',
      amenities: ['ac', 'waterHeater', 'wifi']
    });

    const room2 = await Room.create({
      roomCode: 'P102',
      buildingId: building1._id,
      floor: 1,
      area: 30,
      rentPrice: 6000000,
      deposit: 12000000,
      description: 'Phòng rộng rãi, full nội thất',
      maxOccupants: 3,
      status: 'available',
      amenities: ['ac', 'waterHeater', 'wifi', 'bed', 'wardrobe']
    });

    const room3 = await Room.create({
      roomCode: 'S101',
      buildingId: building2._id,
      floor: 1,
      area: 20,
      rentPrice: 3500000,
      deposit: 3500000,
      description: 'Phòng giá rẻ cho sinh viên',
      maxOccupants: 2,
      status: 'rented',
      amenities: ['wifi', 'kitchen']
    });
    console.log('Rooms created.');

    // 4. Seed Tenants
    console.log('--- Seeding Tenants ---');
    const tenant1 = await Tenant.create({
      fullName: 'Nguyễn Văn Nam',
      phoneNumber: '0911222333',
      email: 'nam.nv@gmail.com',
      idCardNumber: '001200333444',
      dateOfBirth: new Date('1995-05-15'),
      gender: 'male',
      hometown: 'Hà Nội',
      occupation: 'Kỹ sư phần mềm',
      status: 'renting'
    });

    const tenant2 = await Tenant.create({
      fullName: 'Lê Thị Hoa',
      phoneNumber: '0988777666',
      email: 'hoa.lt@gmail.com',
      idCardNumber: '001200555666',
      dateOfBirth: new Date('1998-10-20'),
      gender: 'female',
      hometown: 'Đà Nẵng',
      occupation: 'Kế toán',
      status: 'renting'
    });
    console.log('Tenants created.');

    // 5. Seed Contracts
    console.log('--- Seeding Contracts ---');
    const contract1 = await Contract.create({
      contractCode: 'HD001',
      roomId: room1._id,
      tenantIds: [tenant1._id],
      representativeId: tenant1._id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      rentPrice: 5000000,
      deposit: 10000000,
      paymentCycle: 'monthly',
      paymentDay: 5,
      terms: 'Hợp đồng thuê nhà 1 năm...',
      electricityPrice: 3500,
      waterPrice: 20000,
      electricityStart: 100,
      waterStart: 50,
      serviceFees: [{ name: 'Rác', amount: 50000 }, { name: 'Vệ sinh', amount: 30000 }],
      status: 'active'
    });

    const contract2 = await Contract.create({
      contractCode: 'HD002',
      roomId: room3._id,
      tenantIds: [tenant2._id],
      representativeId: tenant2._id,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2025-02-15'),
      rentPrice: 3500000,
      deposit: 3500000,
      paymentCycle: 'monthly',
      paymentDay: 15,
      terms: 'Hợp đồng sinh viên...',
      electricityPrice: 3500,
      waterPrice: 20000,
      electricityStart: 200,
      waterStart: 80,
      serviceFees: [{ name: 'Rác', amount: 50000 }],
      status: 'active'
    });
    console.log('Contracts created.');

    // 6. Seed Readings
    console.log('--- Seeding Readings ---');
    await MeterReading.create({
      roomId: room1._id,
      month: 3,
      year: 2024,
      electricityPrev: 100,
      electricityCurrent: 250,
      electricityUsage: 150,
      waterPrev: 50,
      waterCurrent: 65,
      waterUsage: 15,
      recordedBy: admin._id,
      recordedAt: new Date('2024-03-01')
    });

    await MeterReading.create({
      roomId: room3._id,
      month: 3,
      year: 2024,
      electricityPrev: 200,
      electricityCurrent: 280,
      electricityUsage: 80,
      waterPrev: 80,
      waterCurrent: 88,
      waterUsage: 8,
      recordedBy: admin._id,
      recordedAt: new Date('2024-03-01')
    });
    console.log('Readings created.');

    // 7. Seed Invoices
    console.log('--- Seeding Invoices ---');
    const invoice1 = await Invoice.create({
      invoiceCode: 'HD202403P101',
      contractId: contract1._id,
      roomId: room1._id,
      tenantId: tenant1._id,
      month: 3,
      year: 2024,
      roomAmount: 5000000,
      electricityAmount: 150 * 3500,
      electricityUsage: 150,
      electricityStart: 100,
      electricityEnd: 250,
      waterAmount: 15 * 20000,
      waterUsage: 15,
      waterStart: 50,
      waterEnd: 65,
      serviceFees: [{ name: 'Rác', amount: 50000 }, { name: 'Vệ sinh', amount: 30000 }],
      totalAmount: 5000000 + (150 * 3500) + (15 * 20000) + 50000 + 30000,
      paidAmount: 0,
      remainingAmount: 5000000 + (150 * 3500) + (15 * 20000) + 50000 + 30000,
      dueDate: new Date('2024-03-10'),
      status: 'unpaid'
    });
    console.log('Invoices created.');

    // 8. Seed Issues
    console.log('--- Seeding Issues ---');
    await Issue.create({
      title: 'Hư vòi nước',
      description: 'Vòi nước nhà vệ sinh bị rò rỉ',
      type: 'utility',
      roomId: room1._id,
      tenantId: tenant1._id,
      priority: 'medium',
      status: 'new'
    });
    console.log('Issues created.');

    console.log('--- Seeding Completed! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
