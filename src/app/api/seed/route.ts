import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/modules/users/model';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({})
    ]);

    // Create admin user
    const admin = new User({
      // English fields (required for compatibility)
      name: 'Admin',
      password: '123456',
      phoneNumber: '0326132124',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
    });
    await admin.save();

 


  
   
    return NextResponse.json({
      success: true,
      message: 'Seed data đã được tạo thành công',
      data: {
        admin: admin.email
      }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
