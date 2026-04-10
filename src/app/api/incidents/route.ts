import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { IssueController } from '@/modules/incidents/controller';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await IssueController.getIssues(request);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    return await IssueController.createIssue(request);
  } catch (error) {
    console.error('Error reporting issue:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
