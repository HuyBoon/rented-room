import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { InvoiceController } from '@/modules/invoices/controller';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Invalid invoice ID' }, { status: 400 });
    }

    return await InvoiceController.getPublicInvoiceById(id);
  } catch (error) {
    console.error('Error fetching public invoice:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
