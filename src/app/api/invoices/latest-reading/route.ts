import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { InvoiceController } from '@/modules/invoices/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await InvoiceController.getLatestReading(request);
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
