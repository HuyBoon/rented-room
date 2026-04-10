import { NextRequest, NextResponse } from 'next/server';
import Contract from './model';
import Room from '../rooms/model';
import Tenant from '../tenants/model';
import { contractSchema } from '@/schemas';
import { updateRoomStatus, updateAllTenantsStatus } from '@/lib/status-utils';
import { z } from 'zod';

export class ContractController {
  static async getContracts(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || searchParams.get('trangThai') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { contractCode: { $regex: search, $options: 'i' } },
        { terms: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const contracts = await Contract.find(query)
      .populate({
        path: 'roomId',
        select: 'roomCode buildingId',
        populate: {
          path: 'buildingId',
          select: 'name'
        }
      })
      .populate('tenantIds', 'fullName phoneNumber')
      .populate('representativeId', 'fullName phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contract.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createContract(request: NextRequest) {
    const body = await request.json();
    
    // Support backward compatibility for incoming Vietnamese field names
    const formattedBody = {
      ...body,
      contractCode: body.contractCode || body.maHopDong,
      roomId: body.roomId || body.phong,
      tenantIds: body.tenantIds || body.khachThueId,
      representativeId: body.representativeId || body.nguoiDaiDien,
      startDate: body.startDate || body.ngayBatDau,
      endDate: body.endDate || body.ngayKetThuc,
      rentPrice: body.rentPrice !== undefined ? body.rentPrice : body.giaThue,
      deposit: body.deposit !== undefined ? body.deposit : body.tienCoc,
      paymentCycle: body.paymentCycle || (body.chuKyThanhToan === 'thang' ? 'monthly' : body.chuKyThanhToan === 'quy' ? 'quarterly' : body.chuKyThanhToan === 'nam' ? 'yearly' : body.paymentCycle),
      paymentDay: body.paymentDay !== undefined ? body.paymentDay : body.ngayThanhToan,
      terms: body.terms || body.dieuKhoan,
      electricityPrice: body.electricityPrice !== undefined ? body.electricityPrice : body.giaDien,
      waterPrice: body.waterPrice !== undefined ? body.waterPrice : body.giaNuoc,
      electricityStart: body.electricityStart !== undefined ? body.electricityStart : body.chiSoDienBanDau,
      waterStart: body.waterStart !== undefined ? body.waterStart : body.chiSoNuocBanDau,
      serviceFees: body.serviceFees || (body.phiDichVu?.map((f: any) => ({ name: f.ten, amount: f.gia }))),
      contractFile: body.contractFile || body.fileHopDong,
    };

    const validatedData = contractSchema.parse(formattedBody);

    // Initial check
    const room = await Room.findById(validatedData.roomId);
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 400 });

    const tenants = await Tenant.find({ _id: { $in: validatedData.tenantIds } });
    if (tenants.length !== validatedData.tenantIds.length) {
      return NextResponse.json({ message: 'One or more tenants not found' }, { status: 400 });
    }

    if (!validatedData.tenantIds.includes(validatedData.representativeId)) {
      return NextResponse.json({ message: 'Representative must be one of the tenants' }, { status: 400 });
    }

    // Check for overlapping active contracts
    const existing = await Contract.findOne({
      roomId: validatedData.roomId,
      status: 'active',
      $or: [
        {
          startDate: { $lte: new Date(validatedData.endDate) },
          endDate: { $gte: new Date(validatedData.startDate) }
        }
      ]
    });

    if (existing) {
      return NextResponse.json({ message: 'Room already has an active contract for this period' }, { status: 400 });
    }

    const newContract = new Contract({
      ...validatedData,
      status: 'active',
    });

    await newContract.save();

    await updateRoomStatus(validatedData.roomId);
    await updateAllTenantsStatus(validatedData.tenantIds);

    return NextResponse.json({
      success: true,
      data: newContract,
      message: 'Contract created successfully',
    }, { status: 201 });
  }

  static async getContractById(id: string) {
    const contract = await Contract.findById(id)
      .populate({
        path: 'roomId',
        populate: { path: 'buildingId', select: 'name' }
      })
      .populate('tenantIds', 'fullName phoneNumber')
      .populate('representativeId', 'fullName phoneNumber')
      .lean();
      
    if (!contract) return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: contract });
  }

  static async updateContract(id: string, request: NextRequest) {
    const body = await request.json();
    // Use similar formatting logic as create if needed, or just partial parse
    const validatedData = contractSchema.partial().parse(body);
    const updated = await Contract.findByIdAndUpdate(id, { $set: validatedData }, { new: true });
    
    if (!updated) return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    
    if (validatedData.roomId) await updateRoomStatus(validatedData.roomId);
    if (validatedData.tenantIds) await updateAllTenantsStatus(validatedData.tenantIds);

    return NextResponse.json({ success: true, data: updated, message: 'Contract updated successfully' });
  }

  static async deleteContract(id: string) {
    const contract = await Contract.findById(id);
    if (!contract) return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    
    const roomId = contract.roomId.toString();
    const tenantIds = contract.tenantIds.map((t: any) => t.toString());
    
    await Contract.findByIdAndDelete(id);
    
    await updateRoomStatus(roomId);
    await updateAllTenantsStatus(tenantIds);

    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  }
}
