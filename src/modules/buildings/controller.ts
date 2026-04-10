import { NextRequest, NextResponse } from 'next/server';
import Building from './model';
import { BuildingService } from './service';
import { buildingSchema } from '@/schemas';
import { z } from 'zod';
import mongoose from 'mongoose';

export class BuildingController {
  static async getBuildings(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.ward': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const buildingWithStats = await BuildingService.getBuildingsWithStats(query, skip, limit);
    const total = await Building.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: buildingWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createBuilding(request: NextRequest, userId: string) {
    const body = await request.json();
    
    // Support backward compatibility for incoming Vietnamese field names
    const formattedBody = {
      ...body,
      name: body.name || body.tenToaNha,
      address: body.address || (body.diaChi ? {
        houseNumber: body.diaChi.soNha,
        street: body.diaChi.duong,
        ward: body.diaChi.phuong,
        district: body.diaChi.quan,
        city: body.diaChi.thanhPho,
      } : undefined),
      description: body.description || body.moTa,
      images: body.images || body.anhToaNha,
      commonAmenities: body.commonAmenities || body.tienNghiChung,
    };

    const validatedData = buildingSchema.parse(formattedBody);

    const newBuilding = new Building({
      ...validatedData,
      ownerId: new mongoose.Types.ObjectId(userId),
    });

    await newBuilding.save();

    return NextResponse.json({
      success: true,
      data: newBuilding,
      message: 'Building created successfully',
    }, { status: 201 });
  }

  static async getBuildingById(id: string) {
    const building = await Building.findById(id).populate('ownerId', 'name email').lean();
    if (!building) {
      return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: building });
  }

  static async updateBuilding(id: string, request: NextRequest) {
    const body = await request.json();
    
    const formattedBody = {
      ...body,
      name: body.name || body.tenToaNha,
      address: body.address || (body.diaChi ? {
        houseNumber: body.diaChi.soNha,
        street: body.diaChi.duong,
        ward: body.diaChi.phuong,
        district: body.diaChi.quan,
        city: body.diaChi.thanhPho,
      } : undefined),
      description: body.description || body.moTa,
      images: body.images || body.anhToaNha,
      commonAmenities: body.commonAmenities || body.tienNghiChung,
    };

    const validatedData = buildingSchema.partial().parse(formattedBody);
    const updatedBuilding = await Building.findByIdAndUpdate(id, { $set: validatedData }, { new: true });

    if (!updatedBuilding) {
      return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBuilding, message: 'Building updated successfully' });
  }

  static async deleteBuilding(id: string) {
    const deletedBuilding = await Building.findByIdAndDelete(id);
    if (!deletedBuilding) {
      return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Building deleted successfully' });
  }

  static async getPublicBuildings(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.ward': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const buildings = await Building.find(query)
      .select('name address description commonAmenities images')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Building.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: buildings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  }
}
