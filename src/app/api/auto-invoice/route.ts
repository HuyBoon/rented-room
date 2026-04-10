import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Contract from '@/modules/contracts/model';
import Invoice from '@/modules/invoices/model';
import MeterReading from '@/modules/meter-readings/model';
import { BillingService } from '@/modules/billing/service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get all active contracts
    const activeContracts = await Contract.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).select('_id contractCode').lean();

    let createdInvoices = 0;
    const errors: string[] = [];

    // Parallel processing with controlled concurrency or just sequential if small
    for (const contract of activeContracts as any[]) {
      try {
        const invoice = await BillingService.generateAutoInvoice(
          contract._id.toString(),
          currentMonth,
          currentYear
        );
        if (invoice) createdInvoices++;
      } catch (error: any) {
        console.error(`Error for contract ${contract.contractCode}:`, error);
        errors.push(`Contract ${contract.contractCode}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        createdInvoices,
        totalContracts: activeContracts.length,
        errors,
      },
      message: `Successfully created ${createdInvoices} automated invoices`,
    });

  } catch (error: any) {
    console.error('Error in auto invoice generation:', error);
    return NextResponse.json({ message: 'Error generating automated invoices' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Count active contracts
    const activeContractsCount = await Contract.countDocuments({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    // Count existing invoices for this month
    const existingInvoicesCount = await Invoice.countDocuments({
      month: currentMonth,
      year: currentYear,
    });

    // Count contracts without utility readings
    // More efficient to find contracts first, then check readings in modular way
    const contractsWithoutReadingsCount = await Contract.countDocuments({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      _id: {
        $nin: await MeterReading.find({ month: currentMonth, year: currentYear }).distinct('contractId')
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        currentMonth,
        currentYear,
        activeContractsCount,
        existingInvoicesCount,
        contractsWithoutReadingsCount,
        canRun: activeContractsCount > 0 && contractsWithoutReadingsCount === 0,
      },
    });

  } catch (error) {
    console.error('Error checking auto-invoice status:', error);
    return NextResponse.json({ message: 'Error checking auto-invoice status' }, { status: 500 });
  }
}
