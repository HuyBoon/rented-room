import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentController } from '@/modules/payments/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await PaymentController.getPayments(request);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await PaymentController.createPayment(request, session.user.id);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}