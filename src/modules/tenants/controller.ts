import { NextRequest, NextResponse } from 'next/server';
import Tenant from './model';
import { TenantService } from './service';
import { tenantSchema } from '@/schemas';
import { updateTenantStatus } from '@/lib/status-utils';
import { z } from 'zod';

export class TenantController {
  static async getTenants(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || searchParams.get('trangThai') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { idCardNumber: { $regex: search, $options: 'i' } },
        { hometown: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const tenantsWithDetails = await TenantService.getTenantsWithDetails(query, skip, limit);
    const total = await Tenant.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tenantsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createTenant(request: NextRequest) {
    const body = await request.json();
    
    // Support backward compatibility for incoming Vietnamese field names
    const formattedBody = {
      ...body,
      fullName: body.fullName || body.hoTen,
      phoneNumber: body.phoneNumber || body.soDienThoai,
      idCardNumber: body.idCardNumber || body.cccd,
      dateOfBirth: body.dateOfBirth || body.ngaySinh,
      gender: body.gender || (body.gioiTinh === 'nam' ? 'male' : body.gioiTinh === 'nu' ? 'female' : 'other'),
      hometown: body.hometown || body.queQuan,
      idCardImages: body.idCardImages || (body.anhCCCD ? {
        front: body.anhCCCD.matTruoc,
        back: body.anhCCCD.matSau,
      } : undefined),
      occupation: body.occupation || body.ngheNghiep,
      password: body.password || body.matKhau,
    };

    const validatedData = tenantSchema.parse(formattedBody);

    // Check if phone or ID card already exists
    const existing = await Tenant.findOne({
      $or: [
        { phoneNumber: validatedData.phoneNumber },
        { idCardNumber: validatedData.idCardNumber }
      ]
    });

    if (existing) {
      return NextResponse.json({ message: 'Phone number or ID card already in use' }, { status: 400 });
    }

    const newTenant = new Tenant({
      ...validatedData,
      status: 'idle',
    });

    await newTenant.save();
    await updateTenantStatus(newTenant._id.toString());

    return NextResponse.json({
      success: true,
      data: newTenant,
      message: 'Tenant created successfully',
    }, { status: 201 });
  }

  static async getTenantById(id: string) {
    const tenant = await Tenant.findById(id).select('+password').lean();
    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    
    // Logic to fetch details similar to getTenants but for one
    const details = await TenantService.getTenantsWithDetails({ _id: id }, 0, 1);
    
    return NextResponse.json({ success: true, data: details[0] });
  }

  static async updateTenant(id: string, request: NextRequest) {
    const body = await request.json();
    
    const formattedBody = {
      ...body,
      fullName: body.fullName || body.hoTen,
      phoneNumber: body.phoneNumber || body.soDienThoai,
      idCardNumber: body.idCardNumber || body.cccd,
      dateOfBirth: body.dateOfBirth || body.ngaySinh,
      gender: body.gender || (body.gender === 'nam' ? 'male' : body.gender === 'nu' ? 'female' : body.gender),
      hometown: body.hometown || body.queQuan,
      idCardImages: body.idCardImages || (body.anhCCCD ? {
        front: body.anhCCCD.matTruoc,
        back: body.anhCCCD.matSau,
      } : undefined),
      occupation: body.occupation || body.ngheNghiep,
      password: body.password || body.matKhau,
    };

    const validatedData = tenantSchema.partial().parse(formattedBody);
    const updatedTenant = await Tenant.findByIdAndUpdate(id, { $set: validatedData }, { new: true });

    if (!updatedTenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    await updateTenantStatus(id);

    return NextResponse.json({ success: true, data: updatedTenant, message: 'Tenant updated successfully' });
  }

  static async deleteTenant(id: string) {
    const deleted = await Tenant.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Tenant deleted successfully' });
  }

  static async login(request: NextRequest) {
    const body = await request.json();
    const formattedBody = {
      phoneNumber: body.phoneNumber || body.soDienThoai,
      password: body.password || body.matKhau,
    };

    if (!formattedBody.phoneNumber || !formattedBody.password) {
      return NextResponse.json({ message: 'Phone number and password are required' }, { status: 400 });
    }

    const tenant = await Tenant.findOne({ phoneNumber: formattedBody.phoneNumber }).select('+password');
    if (!tenant) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

    if (!tenant.password) {
      return NextResponse.json({ message: 'Account not activated. Please contact management.' }, { status: 401 });
    }

    const isValid = await tenant.comparePassword(formattedBody.password);
    if (!isValid) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { id: tenant._id, phoneNumber: tenant.phoneNumber, fullName: tenant.fullName, role: 'tenant' },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        tenant: {
          id: tenant._id,
          fullName: tenant.fullName,
          phoneNumber: tenant.phoneNumber,
          email: tenant.email,
          idCardNumber: tenant.idCardNumber,
          status: tenant.status
        },
        token
      }
    });
  }

  static async getMe(tenantId: string) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    const [currentContract, unpaidInvoicesCount, latestInvoice] = await Promise.all([
      import('../contracts/model').then(m => m.default.findOne({
        tenantId,
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).populate({
        path: 'roomId',
        select: 'roomCode area rentPrice deposit buildingId',
        populate: { path: 'buildingId', select: 'name address' }
      })),
      import('../invoices/model').then(m => m.default.countDocuments({
        tenantId,
        status: { $in: ['unpaid', 'partiallyPaid', 'overdue'] }
      })),
      import('../invoices/model').then(m => m.default.findOne({ tenantId }).sort({ createdAt: -1 }).populate('roomId', 'roomCode'))
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tenant,
        currentContract,
        unpaidInvoicesCount,
        latestInvoice
      }
    });
  }
}
