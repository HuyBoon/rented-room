import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { TenantController } from '@/modules/tenants/controller';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    return await TenantController.login(request);
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
