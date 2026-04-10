import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { NotificationService } from '@/modules/notifications/service';
import { NotificationController } from '@/modules/notifications/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let notifications = [];

    switch (type) {
      case 'overdue_invoices':
        notifications = await NotificationService.getOverdueInvoiceNotifications();
        break;
      case 'expiring_contracts':
        notifications = await NotificationService.getExpiringContractNotifications();
        break;
      case 'pending_issues':
        notifications = await NotificationService.getPendingIssueNotifications();
        break;
      case 'all':
      default:
        notifications = await NotificationService.getAllSmartNotifications();
    }

    // Paginate results in-memory for these aggregated lists
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: notifications.length,
        totalPages: Math.ceil(notifications.length / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching smart notifications:', error);
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const { notificationId } = body;

    // Use markAsRead logic from controller
    if (notificationId) {
      return await NotificationController.markAsRead(notificationId, session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ message: 'Error marking notification' }, { status: 500 });
  }
}
