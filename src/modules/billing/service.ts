import Invoice from '../invoices/model';
import Contract from '../contracts/model';
import MeterReading from '../meter-readings/model';
import mongoose from 'mongoose';

export interface InvoiceCalculationInput {
  contractId: string;
  month: number;
  year: number;
  roomAmount: number;
  electricityStart: number;
  electricityEnd: number;
  waterStart: number;
  waterEnd: number;
  serviceFees?: Array<{ name: string; amount: number }>;
  paidAmount?: number;
  dueDate?: Date | string;
  invoiceCode?: string;
  notes?: string;
}

export class BillingService {
  /**
   * Calculates all components of an invoice based on input and contract settings.
   */
  static async calculateInvoiceData(input: InvoiceCalculationInput) {
    const contract = await Contract.findById(input.contractId).populate('roomId');
    if (!contract) {
      throw new Error('Contract not found');
    }

    const {
      roomAmount,
      electricityStart,
      electricityEnd,
      waterStart,
      waterEnd,
      serviceFees = []
    } = input;

    // Calculate usage
    const electricityUsage = Math.max(0, electricityEnd - electricityStart);
    const waterUsage = Math.max(0, waterEnd - waterStart);

    // Calculate costs based on contract rates
    const electricityAmount = electricityUsage * (contract.electricityPrice || 0);
    const waterAmount = waterUsage * (contract.waterPrice || 0);
    const totalServiceFees = serviceFees.reduce((sum, fee) => sum + fee.amount, 0);

    const totalAmount = roomAmount + electricityAmount + waterAmount + totalServiceFees;
    const paidAmount = input.paidAmount ?? 0;
    const remainingAmount = totalAmount - paidAmount;

    // Determine due date if not provided
    let dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (!dueDate) {
      // Default to contract's payment day in the specified month/year
      dueDate = new Date(input.year, input.month - 1, contract.paymentDay || 1);
    }

    // Determine status from amounts and due date
    let status: 'unpaid' | 'partiallyPaid' | 'paid' | 'overdue' = 'unpaid';
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partiallyPaid';
    } else {
      status = 'unpaid';
    }

    if (dueDate < new Date() && remainingAmount > 0) {
      status = 'overdue';
    }

    return {
      invoiceCode: input.invoiceCode || this.generateInvoiceCode(input.year, input.month),
      contractId: input.contractId,
      roomId: contract.roomId._id,
      tenantId: contract.representativeId,
      month: input.month,
      year: input.year,
      roomAmount,
      electricityAmount,
      electricityUsage,
      electricityStart,
      electricityEnd,
      waterAmount,
      waterUsage,
      waterStart,
      waterEnd,
      serviceFees,
      totalAmount,
      paidAmount,
      remainingAmount,
      status,
      dueDate,
      notes: input.notes,
    };
  }

  /**
   * Generates a standard invoice code.
   */
  private static generateInvoiceCode(year: number, month: number): string {
    const dateStr = `${year}${month.toString().padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV${dateStr}${random}`;
  }

  /**
   * Automatic invoice generation logic for a specific contract and period.
   */
  static async generateAutoInvoice(contractId: string, month: number, year: number) {
    const contract = await Contract.findById(contractId).populate('roomId');
    if (!contract) return null;

    // Check for existing invoice
    const existing = await Invoice.findOne({ contractId, month, year });
    if (existing) return null;

    // Get current month's readings
    const readings = await MeterReading.findOne({ roomId: contract.roomId._id, month, year });
    if (!readings) return null;

    // Logic for indices
    let electricityStart = 0;
    let waterStart = 0;

    const lastInvoice = await Invoice.findOne({
      contractId,
      $or: [{ year: { $lt: year } }, { year: year, month: { $lt: month } }]
    }).sort({ year: -1, month: -1 });

    if (lastInvoice) {
      electricityStart = lastInvoice.electricityEnd;
      waterStart = lastInvoice.waterEnd;
    } else {
      electricityStart = contract.electricityStart;
      waterStart = contract.waterStart;
    }

    const input: InvoiceCalculationInput = {
      contractId,
      month,
      year,
      roomAmount: contract.rentPrice,
      electricityStart,
      electricityEnd: readings.electricityCurrent,
      waterStart,
      waterEnd: readings.waterCurrent,
      serviceFees: contract.serviceFees,
    };

    const data = await this.calculateInvoiceData(input);
    const invoice = new Invoice(data);
    return await invoice.save();
  }
}
