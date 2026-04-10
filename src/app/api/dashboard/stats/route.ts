import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Room from '@/modules/rooms/model';
import Invoice from '@/modules/invoices/model';
import Issue from '@/modules/incidents/model';
import Contract from '@/modules/contracts/model';
import Payment from '@/modules/payments/model';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const roomStatsPromise = Room.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const revenueThangPromise = Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueNamPromise = Payment.aggregate([
      { $match: { paymentDate: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [roomStats, revThang, revNam, overdueInvoices, pendingIssues, expiringContracts] = await Promise.all([
      roomStatsPromise,
      revenueThangPromise,
      revenueNamPromise,
      Invoice.countDocuments({
        dueDate: { $lte: nextWeek },
        status: { $in: ['unpaid', 'partiallyPaid'] }
      }),
      Issue.countDocuments({ status: { $in: ['new', 'processing'] } }),
      Contract.countDocuments({
        endDate: { $lte: nextMonth },
        status: 'active'
      })
    ]);

    // Parse room stats with English keys
    const statsMap: Record<string, number> = { available: 0, rented: 0, booked: 0, maintenance: 0, total: 0 };
    roomStats.forEach(stat => {
      if (stat._id) {
        statsMap[stat._id] = stat.count;
        statsMap.total += stat.count;
      }
    });

    const stats = {
      totalRooms: statsMap.total,
      availableRooms: statsMap.available,
      rentedRooms: statsMap.rented,
      bookedRooms: statsMap.booked,
      maintenanceRooms: statsMap.maintenance,
      monthlyRevenue: revThang[0]?.total || 0,
      yearlyRevenue: revNam[0]?.total || 0,
      overdueInvoices,
      pendingIssues,
      expiringContracts,
    };
    
    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
