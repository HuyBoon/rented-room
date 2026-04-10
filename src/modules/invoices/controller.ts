import { NextRequest, NextResponse } from 'next/server';
import Invoice from './model';
import { BillingService } from '../billing/service';
import { invoiceSchema } from '@/schemas';
import { z } from 'zod';

export class InvoiceController {
  static async getInvoices(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const contractId = searchParams.get('contractId');
    const status = searchParams.get('status');

    // Single item fetch if ID exists
    if (id) {
      const invoice = await Invoice.findById(id)
        .populate('contractId', 'contractCode')
        .populate('roomId', 'roomCode')
        .populate('tenantId', 'fullName phoneNumber')
        .lean();
      
      if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: invoice });
    }

    const query: any = {};
    if (contractId) query.contractId = contractId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query)
      .populate('contractId', 'contractCode')
      .populate('roomId', 'roomCode')
      .populate('tenantId', 'fullName phoneNumber')
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  static async createInvoice(request: NextRequest) {
    const body = await request.json();
    
    // Validate based on English schema
    const validatedData = invoiceSchema.parse(body);
    const invoiceCalculation = await BillingService.calculateInvoiceData(validatedData as any);

    const invoice = new Invoice(invoiceCalculation);
    await invoice.save();

    await invoice.populate([
      { path: 'contractId', select: 'contractCode' },
      { path: 'roomId', select: 'roomCode' },
      { path: 'tenantId', select: 'fullName phoneNumber' }
    ]);

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  }

  static async updateInvoice(request: NextRequest) {
    const body = await request.json();
    const id = body.id || body._id;

    if (!id) return NextResponse.json({ message: 'Missing invoice ID' }, { status: 400 });

    // Validate based on English schema
    const validatedData = invoiceSchema.partial().parse(body);
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true }
    ).populate([
      { path: 'contractId', select: 'contractCode' },
      { path: 'roomId', select: 'roomCode' },
      { path: 'tenantId', select: 'fullName phoneNumber' }
    ]).lean();

    if (!updatedInvoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });
  }

  static async getInvoiceFormData() {
    const [contracts, rooms, tenants] = await Promise.all([
      import('../contracts/model').then(m => m.default.find({ status: 'active' }).populate('roomId', 'roomCode')),
      import('../rooms/model').then(m => m.default.find().select('roomCode buildingId status')),
      import('../tenants/model').then(m => m.default.find().select('fullName phoneNumber status')),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        contractList: contracts,
        roomList: rooms,
        tenantList: tenants,
      }
    });
  }

  static async getLatestReading(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const month = parseInt(searchParams.get('month') || '1');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!contractId) return NextResponse.json({ message: 'Missing contract ID' }, { status: 400 });

    const contract = await import('../contracts/model').then(m => m.default.findById(contractId));
    if (!contract) return NextResponse.json({ message: 'Contract not found' }, { status: 404 });

    const lastInvoice = await Invoice.findOne({
      contractId,
      $or: [
        { year: { $lt: year } },
        { year: year, month: { $lt: month } }
      ]
    }).sort({ year: -1, month: -1 });

    let electricityStart = 0;
    let waterStart = 0;

    if (lastInvoice) {
      electricityStart = lastInvoice.electricityEnd || 0;
      waterStart = lastInvoice.waterEnd || 0;
    } else {
      electricityStart = contract.electricityStart || 0;
      waterStart = contract.waterStart || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        electricityStart,
        waterStart,
        isFirstInvoice: !lastInvoice,
        lastInvoicePeriod: lastInvoice ? `${lastInvoice.month}/${lastInvoice.year}` : null
      }
    });
  }

  static async deleteInvoice(id: string) {
    const deleted = await Invoice.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  }

  static async getPublicInvoiceById(id: string) {
    const invoice = await Invoice.findById(id)
      .populate('contractId')
      .populate('roomId')
      .populate('tenantId')
      .lean();
    
    if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

    const payments = await import('../payments/model').then(m => m.default.find({ invoiceId: id })
      .sort({ paymentDate: -1 })
      .lean()
    );

    return NextResponse.json({
      success: true,
      data: {
        invoice,
        payments
      }
    });
  }
}
