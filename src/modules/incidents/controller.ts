import { NextRequest, NextResponse } from 'next/server';
import Issue from './model';
import Room from '../rooms/model';
import Tenant from '../tenants/model';
import { z } from 'zod';

export class IssueController {
  static async getIssues(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const issues = await Issue.find(query)
      .populate('roomId', 'roomCode buildingId')
      .populate('tenantId', 'fullName phoneNumber')
      .populate('handlerId', 'name email')
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Issue.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async createIssue(request: NextRequest) {
    const body = await request.json();
    
    const { roomId, tenantId } = body;

    if (!roomId) return NextResponse.json({ message: 'Room ID is required' }, { status: 400 });
    if (!tenantId) return NextResponse.json({ message: 'Tenant ID is required' }, { status: 400 });

    const room = await Room.findById(roomId);
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 400 });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 400 });

    const newIssue = new Issue({
      ...body,
      reportedAt: new Date(),
    });

    await newIssue.save();

    return NextResponse.json({
      success: true,
      data: newIssue,
      message: 'Issue reported successfully',
    }, { status: 201 });
  }

  static async getIssueById(id: string) {
    const issue = await Issue.findById(id)
      .populate('roomId', 'roomCode buildingId')
      .populate('tenantId', 'fullName phoneNumber')
      .populate('handlerId', 'name email');
    
    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, data: issue });
  }

  static async updateIssue(id: string, request: NextRequest) {
    const body = await request.json();
    
    if (body.status === 'resolved' && !body.resolvedAt) {
      body.resolvedAt = new Date();
    }

    const updatedIssue = await Issue.findByIdAndUpdate(id, { $set: body }, { new: true });
    
    if (!updatedIssue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, data: updatedIssue, message: 'Issue updated successfully' });
  }

  static async deleteIssue(id: string) {
    const deleted = await Issue.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
  }
}
