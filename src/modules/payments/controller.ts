import { NextRequest, NextResponse } from 'next/server';
import Payment from './model';
import Invoice from '../invoices/model';
import mongoose from 'mongoose';

export class PaymentController {
  static async getPayments(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const contractId = searchParams.get('contractId');
    const invoiceId = searchParams.get('invoiceId');

    const query: any = {};
    if (contractId) {
      const invoices = await Invoice.find({ contractId }).select('_id');
      query.invoiceId = { $in: invoices.map(hd => hd._id) };
    }
    if (invoiceId) {
      query.invoiceId = invoiceId;
    }

    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .populate({
        path: 'invoiceId',
        select: 'invoiceCode month year totalAmount roomId tenantId',
        populate: [
          { path: 'roomId', select: 'roomCode' },
          { path: 'tenantId', select: 'fullName' }
        ]
      })
      .populate('receivedBy', 'name email')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  static async createPayment(request: NextRequest, userId: string) {
    const body = await request.json();
    
    // Expecting fields directly from standardized English schema
    const { invoiceId, amount, method, transferInfo, paymentDate, notes, receiptImage } = body;

    if (!invoiceId || !amount || !method) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

    if (amount > invoice.remainingAmount) {
      return NextResponse.json({ message: 'Payment amount exceeds remaining balance' }, { status: 400 });
    }

    if (method === 'transfer' && !transferInfo) {
      return NextResponse.json({ message: 'Transfer information is required for transfer payments' }, { status: 400 });
    }

    const payment = new Payment({
      invoiceId,
      amount,
      method,
      transferInfo,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      receivedBy: new mongoose.Types.ObjectId(userId),
      notes,
      receiptImage
    });

    await payment.save();

    // Update the invoice
    invoice.paidAmount += amount;
    invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount;
    
    if (invoice.remainingAmount <= 0) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partiallyPaid';
    }

    await invoice.save();

    await payment.populate([
      { path: 'invoiceId', select: 'invoiceCode month year totalAmount' },
      { path: 'receivedBy', select: 'name email' }
    ]);

    const updatedInvoice = await Invoice.findById(invoiceId)
      .populate('roomId', 'roomCode')
      .populate('tenantId', 'fullName')
      .populate('contractId', 'contractCode');

    return NextResponse.json({
      success: true,
      data: {
        payment,
        invoice: updatedInvoice
      },
      message: 'Payment created successfully'
    });
  }

  static async updatePayment(id: string, request: NextRequest) {
    const body = await request.json();
    
    const payment = await Payment.findById(id);
    if (!payment) return NextResponse.json({ message: 'Payment not found' }, { status: 404 });

    const originalInvoiceId = payment.invoiceId.toString();
    const originalAmount = payment.amount;

    // If invoice changed, we need to adjust both invoices
    if (body.invoiceId && body.invoiceId !== originalInvoiceId) {
      // Revert original invoice
      const oldInvoice = await Invoice.findById(originalInvoiceId);
      if (oldInvoice) {
        oldInvoice.paidAmount -= originalAmount;
        oldInvoice.remainingAmount = oldInvoice.totalAmount - oldInvoice.paidAmount;
        oldInvoice.status = oldInvoice.remainingAmount <= 0 ? 'paid' : (oldInvoice.paidAmount > 0 ? 'partiallyPaid' : 'unpaid');
        await oldInvoice.save();
      }

      // Update new invoice
      const newInvoice = await Invoice.findById(body.invoiceId);
      if (newInvoice) {
        if (body.amount > newInvoice.remainingAmount) {
          return NextResponse.json({ message: 'Payment amount exceeds new invoice remaining balance' }, { status: 400 });
        }
        newInvoice.paidAmount += (body.amount || originalAmount);
        newInvoice.remainingAmount = newInvoice.totalAmount - newInvoice.paidAmount;
        newInvoice.status = newInvoice.remainingAmount <= 0 ? 'paid' : (newInvoice.paidAmount > 0 ? 'partiallyPaid' : 'unpaid');
        await newInvoice.save();
      }
    } else {
      // Amount changed for same invoice
      if (body.amount !== undefined && body.amount !== originalAmount) {
        const invoice = await Invoice.findById(originalInvoiceId);
        if (invoice) {
          const diff = body.amount - originalAmount;
          if (diff > invoice.remainingAmount) {
            return NextResponse.json({ message: 'Updated payment amount exceeds remaining balance' }, { status: 400 });
          }
          invoice.paidAmount += diff;
          invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount;
          invoice.status = invoice.remainingAmount <= 0 ? 'paid' : (invoice.paidAmount > 0 ? 'partiallyPaid' : 'unpaid');
          await invoice.save();
        }
      }
    }

    // Apply updates to payment using English fields
    if (body.invoiceId) payment.invoiceId = body.invoiceId;
    if (body.amount !== undefined) payment.amount = body.amount;
    if (body.method) payment.method = body.method;
    if (body.transferInfo) payment.transferInfo = body.transferInfo;
    if (body.paymentDate) payment.paymentDate = new Date(body.paymentDate);
    if (body.notes) payment.notes = body.notes;
    if (body.receiptImage) payment.receiptImage = body.receiptImage;

    await payment.save();
    return NextResponse.json({ success: true, data: payment, message: 'Payment updated successfully' });
  }

  static async deletePayment(id: string) {
    const payment = await Payment.findById(id);
    if (!payment) return NextResponse.json({ message: 'Payment not found' }, { status: 404 });

    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.paidAmount -= payment.amount;
      invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount;
      invoice.status = invoice.remainingAmount <= 0 ? 'paid' : (invoice.paidAmount > 0 ? 'partiallyPaid' : 'unpaid');
      await invoice.save();
    }

    await Payment.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Payment deleted successfully' });
  }
}
