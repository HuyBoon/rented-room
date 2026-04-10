import { NextRequest, NextResponse } from 'next/server';
import MeterReading from './model';
import Room from '../rooms/model';
import mongoose from 'mongoose';

export class MeterReadingController {
  static async getReadings(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const roomId = searchParams.get('roomId') || searchParams.get('phong') || '';
    const month = searchParams.get('month') || searchParams.get('thang') || '';
    const year = searchParams.get('year') || searchParams.get('nam') || '';

    const query: any = {};
    if (roomId) query.roomId = roomId;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const skip = (page - 1) * limit;
    const readings = await MeterReading.find(query)
      .populate('roomId', 'roomCode buildingId')
      .populate('recordedBy', 'name email')
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MeterReading.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: readings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createReading(request: NextRequest, userId: string) {
    const body = await request.json();
    
    // Support backward compatibility
    const formattedBody = {
      ...body,
      roomId: body.roomId || body.phong,
      month: body.month || body.thang,
      year: body.year || body.nam,
      electricityPrev: body.electricityPrev !== undefined ? body.electricityPrev : body.chiSoDienCu,
      electricityCurrent: body.electricityCurrent !== undefined ? body.electricityCurrent : body.chiSoDienMoi,
      waterPrev: body.waterPrev !== undefined ? body.waterPrev : body.chiSoNuocCu,
      waterCurrent: body.waterCurrent !== undefined ? body.waterCurrent : body.chiSoNuocMoi,
      electricityImage: body.electricityImage || body.anhChiSoDien,
      waterImage: body.waterImage || body.anhChiSoNuoc,
      recordedAt: body.recordedAt || body.ngayGhi,
    };

    const room = await Room.findById(formattedBody.roomId);
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 400 });

    const existing = await MeterReading.findOne({
      roomId: formattedBody.roomId,
      month: formattedBody.month,
      year: formattedBody.year,
    });

    if (existing) return NextResponse.json({ message: 'Readings already recorded for this period' }, { status: 400 });

    // Validation: Current must be >= Previous
    if (formattedBody.electricityCurrent < formattedBody.electricityPrev) {
      return NextResponse.json({ message: 'Current electricity reading must be >= previous' }, { status: 400 });
    }
    if (formattedBody.waterCurrent < formattedBody.waterPrev) {
      return NextResponse.json({ message: 'Current water reading must be >= previous' }, { status: 400 });
    }

    const newReading = new MeterReading({
      ...formattedBody,
      recordedBy: new mongoose.Types.ObjectId(userId),
      recordedAt: formattedBody.recordedAt ? new Date(formattedBody.recordedAt) : new Date(),
    });

    await newReading.save();

    return NextResponse.json({
      success: true,
      data: newReading,
      message: 'Meter reading recorded successfully',
    }, { status: 201 });
  }

  static async deleteReading(id: string, userId: string, role: string) {
    const reading = await MeterReading.findById(id);
    if (!reading) return NextResponse.json({ message: 'Meter reading not found' }, { status: 404 });

    if (reading.recordedBy.toString() !== userId && role !== 'admin') {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    await MeterReading.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Meter reading deleted successfully' });
  }

  static async getReadingById(id: string) {
    const reading = await MeterReading.findById(id)
      .populate('roomId', 'roomCode buildingId')
      .populate('recordedBy', 'name email');
    
    if (!reading) return NextResponse.json({ message: 'Meter reading not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: reading });
  }

  static async updateReading(id: string, request: NextRequest, userId: string, role: string) {
    const body = await request.json();
    const formattedBody = {
      ...body,
      roomId: body.roomId || body.phong,
      month: body.month || body.thang,
      year: body.year || body.nam,
      electricityPrev: body.electricityPrev !== undefined ? body.electricityPrev : body.chiSoDienCu,
      electricityCurrent: body.electricityCurrent !== undefined ? body.electricityCurrent : body.chiSoDienMoi,
      waterPrev: body.waterPrev !== undefined ? body.waterPrev : body.chiSoNuocCu,
      waterCurrent: body.waterCurrent !== undefined ? body.waterCurrent : body.chiSoNuocMoi,
      electricityImage: body.electricityImage || body.anhChiSoDien,
      waterImage: body.waterImage || body.anhChiSoNuoc,
      recordedAt: body.recordedAt || body.ngayGhi,
    };

    const reading = await MeterReading.findById(id);
    if (!reading) return NextResponse.json({ message: 'Meter reading not found' }, { status: 404 });

    if (reading.recordedBy.toString() !== userId && role !== 'admin') {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    // Validation: Current must be >= Previous
    if (formattedBody.electricityCurrent !== undefined && formattedBody.electricityPrev !== undefined) {
      if (formattedBody.electricityCurrent < formattedBody.electricityPrev) {
        return NextResponse.json({ message: 'Current electricity reading must be >= previous' }, { status: 400 });
      }
    }
    if (formattedBody.waterCurrent !== undefined && formattedBody.waterPrev !== undefined) {
      if (formattedBody.waterCurrent < formattedBody.waterPrev) {
        return NextResponse.json({ message: 'Current water reading must be >= previous' }, { status: 400 });
      }
    }

    const updated = await MeterReading.findByIdAndUpdate(
      id,
      { $set: formattedBody },
      { new: true, runValidators: true }
    ).populate('roomId', 'roomCode buildingId').populate('recordedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Meter reading updated successfully',
    });
  }
}
