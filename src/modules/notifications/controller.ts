import { NextRequest, NextResponse } from 'next/server';
import Notification from './model';
import mongoose from 'mongoose';

export class NotificationController {
  static async getNotifications(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .populate('senderId', 'name email')
      .populate('roomIds', 'roomCode')
      .populate('buildingId', 'name')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createNotification(request: NextRequest, userId: string) {
    const body = await request.json();
    
    const newNotification = new Notification({
      ...body,
      senderId: new mongoose.Types.ObjectId(userId),
      readByIds: [],
      sentAt: new Date(),
    });

    await newNotification.save();

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification sent successfully',
    }, { status: 201 });
  }

  static async updateNotification(id: string, request: NextRequest) {
    const body = await request.json();
    const updated = await Notification.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Notification updated successfully' });
  }

  static async deleteNotification(id: string) {
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
  }

  static async markAsRead(id: string, userId: string) {
    const updated = await Notification.findByIdAndUpdate(
        id,
        { $addToSet: { readByIds: new mongoose.Types.ObjectId(userId) } },
        { new: true }
    );
    if (!updated) return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Marked as read' });
  }
}
