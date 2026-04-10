import { NextRequest, NextResponse } from 'next/server';
import Payment from '../payments/model';
import Room from '../rooms/model';
import Contract from '../contracts/model';
import Invoice from '../invoices/model';

export class ReportController {
  static async getReports(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'revenue';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    let start: Date, end: Date;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    switch (type) {
      case 'revenue':
        return await this.getRevenueReport(start, end, format);
      case 'rooms':
        return await this.getRoomReport(format);
      case 'contracts':
        return await this.getContractReport(start, end, format);
      case 'payments':
        return await this.getPaymentReport(start, end, format);
      default:
        return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
    }
  }

  private static async getRevenueReport(start: Date, end: Date, format: string) {
    const revenueByMonth = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const revenueByMethod = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const data = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      totalRevenue: totalRevenue[0]?.total || 0,
      totalPayments: totalRevenue[0]?.count || 0,
      revenueByMonth,
      revenueByMethod,
    };

    if (format === 'csv') return this.generateRevenueCSV(data);
    return NextResponse.json({ success: true, data });
  }

  private static async getRoomReport(format: string) {
    const roomStats = await Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: { $in: ['rented', 'dangThue'] } });
    const emptyRooms = await Room.countDocuments({ status: { $in: ['available', 'trong'] } });
    const maintenanceRooms = await Room.countDocuments({ status: { $in: ['maintenance', 'baoTri'] } });

    const data = {
      totalRooms,
      occupiedRooms,
      emptyRooms,
      maintenanceRooms,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100 * 100) / 100 : 0,
      roomStats,
    };

    if (format === 'csv') return this.generateRoomCSV(data);
    return NextResponse.json({ success: true, data });
  }

  private static async getContractReport(start: Date, end: Date, format: string) {
    const contracts = await Contract.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate('roomId', 'roomCode')
      .populate('representativeId', 'fullName phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    const contractStats = await Contract.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$rentPrice' },
        },
      },
    ]);

    const data = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      totalContracts: contracts.length,
      contracts,
      contractStats,
    };

    if (format === 'csv') return this.generateContractCSV(data);
    return NextResponse.json({ success: true, data });
  }

  private static async getPaymentReport(start: Date, end: Date, format: string) {
    const payments = await Payment.find({
      paymentDate: { $gte: start, $lte: end }
    })
      .populate({
        path: 'invoiceId',
        select: 'invoiceCode totalAmount'
      })
      .populate('receivedBy', 'name email')
      .sort({ paymentDate: -1 })
      .lean();

    const paymentStats = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$method',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      payments,
      paymentStats,
    };

    if (format === 'csv') return this.generatePaymentCSV(data);
    return NextResponse.json({ success: true, data });
  }

  private static generateRevenueCSV(data: any) {
    let csv = 'Revenue Report\n';
    csv += `From: ${data.period.start}\nTo: ${data.period.end}\n`;
    csv += `Total Revenue: ${data.totalRevenue}\nTotal Transactions: ${data.totalPayments}\n\n`;
    csv += 'Revenue by Month:\nMonth,Year,Total,Giao dịch\n';
    data.revenueByMonth.forEach((item: any) => {
      csv += `${item._id.month},${item._id.year},${item.total},${item.count}\n`;
    });
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="revenue-report.csv"' }
    });
  }

  private static generateRoomCSV(data: any) {
    let csv = 'Room Report\n';
    csv += `Total: ${data.totalRooms}\nOccupied: ${data.occupiedRooms}\nEmpty: ${data.emptyRooms}\nMaintenance: ${data.maintenanceRooms}\nOccupancy Rate: ${data.occupancyRate}%\n`;
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="room-report.csv"' }
    });
  }

  private static generateContractCSV(data: any) {
    let csv = 'Contract Report\n';
    // Simplified CSV generation for brevity
    csv += `Total Contracts: ${data.totalContracts}\n`;
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="contract-report.csv"' }
    });
  }

  private static generatePaymentCSV(data: any) {
    let csv = 'Payment Report\n';
    csv += `Total Payments: ${data.totalPayments}\nTotal Amount: ${data.totalAmount}\n`;
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="payment-report.csv"' }
    });
  }
}
