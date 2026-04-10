import { NextRequest, NextResponse } from 'next/server';
import Room from './model';
import Building from '../buildings/model';
import { RoomService } from './service';
import { roomSchema } from '@/schemas';
import { z } from 'zod';

export class RoomController {
  static async getRooms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const buildingId = searchParams.get('buildingId') || searchParams.get('toaNha') || '';
    const status = searchParams.get('status') || searchParams.get('trangThai') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { roomCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (buildingId) query.buildingId = buildingId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const roomsWithStats = await RoomService.getRoomsWithStats(query, skip, limit);
    const total = await Room.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: roomsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createRoom(request: NextRequest) {
    const body = await request.json();
    
    // Support both old and new field names for backward compatibility during transition
    const formattedBody = {
      ...body,
      roomCode: body.roomCode || body.maPhong,
      buildingId: body.buildingId || body.toaNha,
      floor: body.floor !== undefined ? body.floor : body.tang,
      area: body.area !== undefined ? body.area : body.dienTich,
      rentPrice: body.rentPrice !== undefined ? body.rentPrice : body.giaThue,
      deposit: body.deposit !== undefined ? body.deposit : body.tienCoc,
      description: body.description || body.moTa,
      images: body.images || body.anhPhong,
      amenities: body.amenities || body.tienNghi,
      maxOccupants: body.maxOccupants !== undefined ? body.maxOccupants : body.soNguoiToiDa,
    };

    const validatedData = roomSchema.parse(formattedBody);

    // Check if building exists
    const building = await Building.findById(validatedData.buildingId);
    if (!building) {
      return NextResponse.json(
        { message: 'Building not found' },
        { status: 400 }
      );
    }

    const newRoom = new Room({
      ...validatedData,
      status: 'available', 
    });

    await newRoom.save();

    // Sync status based on contracts
    const derivedStatus = await RoomService.deriveStatus(newRoom._id.toString());
    newRoom.status = derivedStatus;
    await newRoom.save();

    return NextResponse.json({
      success: true,
      data: newRoom,
      message: 'Room created successfully',
    }, { status: 201 });
  }

  static async getRoomById(id: string) {
    const room = await Room.findById(id).populate('buildingId').lean();
    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: room });
  }

  static async updateRoom(id: string, request: NextRequest) {
    const body = await request.json();
    const formattedBody = {
      ...body,
      roomCode: body.roomCode || body.maPhong,
      buildingId: body.buildingId || body.toaNha,
      floor: body.floor !== undefined ? body.floor : body.tang,
      area: body.area !== undefined ? body.area : body.dienTich,
      rentPrice: body.rentPrice !== undefined ? body.rentPrice : body.giaThue,
      deposit: body.deposit !== undefined ? body.deposit : body.tienCoc,
      description: body.description || body.moTa,
      images: body.images || body.anhPhong,
      amenities: body.amenities || body.tienNghi,
      maxOccupants: body.maxOccupants !== undefined ? body.maxOccupants : body.soNguoiToiDa,
    };

    const validatedData = roomSchema.partial().parse(formattedBody);
    const updatedRoom = await Room.findByIdAndUpdate(id, { $set: validatedData }, { new: true });
    
    if (!updatedRoom) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRoom, message: 'Room updated successfully' });
  }

  static async deleteRoom(id: string) {
    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Room deleted successfully' });
  }

  static async getPublicRooms(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const buildingId = searchParams.get('buildingId') || searchParams.get('toaNha') || '';
    const status = searchParams.get('status') || searchParams.get('trangThai') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { roomCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (buildingId && buildingId !== 'all') query.buildingId = buildingId;
    if (status && status !== 'all') {
      // Map legacy status if needed
      query.status = status === 'trong' ? 'available' : status;
    }

    // Public rooms filter: usually only available rooms or rooms with images
    query.$or = [
      ...(query.$or || []),
      { images: { $exists: true, $not: { $size: 0 } } },
      { status: 'available' }
    ];

    const skip = (page - 1) * limit;
    const rooms = await Room.find(query)
      .populate('buildingId', 'name address')
      .sort({ roomCode: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Room.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  }
}
