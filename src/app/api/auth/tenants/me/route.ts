import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TenantController } from '@/modules/tenants/controller';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'tenant' && decoded.role !== 'khachThue') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    return await TenantController.getMe(decoded.id);
  } catch (error) {
    console.error('Error fetching tenant info:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
