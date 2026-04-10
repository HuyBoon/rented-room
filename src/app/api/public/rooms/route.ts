import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { RoomController } from '@/modules/rooms/controller';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    return await RoomController.getPublicRooms(request);
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
