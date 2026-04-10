import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { UserController } from '@/modules/users/controller';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    return await UserController.register(request);
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
