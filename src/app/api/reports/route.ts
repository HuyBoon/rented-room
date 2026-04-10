import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { ReportController } from '@/modules/reports/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await ReportController.getReports(request);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
