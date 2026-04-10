import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { BuildingController } from '@/modules/buildings/controller';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    return await BuildingController.getPublicBuildings(request);
  } catch (error) {
    console.error('Error fetching public buildings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
