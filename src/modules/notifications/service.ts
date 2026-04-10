import Notification from './model';
import Invoice from '../invoices/model';
import Contract from '../contracts/model';
import Issue from '../incidents/model';
import mongoose from 'mongoose';

export class NotificationService {
  /**
   * Retrieves overdue invoice notifications.
   */
  static async getOverdueInvoiceNotifications() {
    const overdueInvoices = await Invoice.find({
      dueDate: { $lt: new Date() },
      status: { $in: ['unpaid', 'partiallyPaid'] },
    })
      .populate('contractId', 'contractCode roomId')
      .populate('roomId', 'roomCode buildingId')
      .populate('tenantId', 'fullName phoneNumber')
      .sort({ dueDate: 1 });

    return overdueInvoices.map(invoice => ({
      id: `overdue_invoice_${invoice._id}`,
      type: 'overdue_invoice',
      title: 'Invoice Overdue',
      message: `Invoice ${invoice.invoiceCode} for room ${invoice.roomId.roomCode} is overdue`,
      data: {
        invoiceId: invoice._id,
        invoiceCode: invoice.invoiceCode,
        roomCode: invoice.roomId.roomCode,
        tenantName: invoice.tenantId.fullName,
        dueDate: invoice.dueDate,
        remainingAmount: invoice.remainingAmount,
      },
      priority: 'high',
      createdAt: invoice.dueDate,
    }));
  }

  /**
   * Retrieves expiring contract notifications.
   */
  static async getExpiringContractNotifications() {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const expiringContracts = await Contract.find({
      endDate: { $lte: nextMonth },
      status: 'active',
    })
      .populate('roomId', 'roomCode buildingId')
      .populate('representativeId', 'fullName phoneNumber')
      .sort({ endDate: 1 });

    return expiringContracts.map(contract => {
      const daysLeft = Math.ceil((contract.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: `expiring_contract_${contract._id}`,
        type: 'expiring_contract',
        title: 'Contract Expiring',
        message: `Contract ${contract.contractCode} for room ${contract.roomId.roomCode} expires in ${daysLeft} days`,
        data: {
          contractId: contract._id,
          contractCode: contract.contractCode,
          roomCode: contract.roomId.roomCode,
          tenantName: contract.representativeId.fullName,
          endDate: contract.endDate,
          daysLeft,
        },
        priority: daysLeft <= 7 ? 'high' : daysLeft <= 15 ? 'medium' : 'low',
        createdAt: contract.endDate,
      };
    });
  }

  /**
   * Retrieves pending issue notifications.
   */
  static async getPendingIssueNotifications() {
    const pendingIssues = await Issue.find({
      status: { $in: ['new', 'processing'] },
    })
      .populate('roomId', 'roomCode buildingId')
      .populate('tenantId', 'fullName phoneNumber')
      .sort({ priority: -1, reportedAt: -1 });

    return pendingIssues.map(issue => {
      return {
        id: `pending_issue_${issue._id}`,
        type: 'pending_issue',
        title: 'Pending Issue',
        message: `Issue "${issue.title}" at room ${issue.roomId.roomCode} needs attention`,
        data: {
          issueId: issue._id,
          title: issue.title,
          roomCode: issue.roomId.roomCode,
          tenantName: issue.tenantId.fullName,
          type: issue.type,
          priority: issue.priority,
          status: issue.status,
          reportedAt: issue.reportedAt,
        },
        priority: issue.priority === 'critical' ? 'critical' : issue.priority === 'high' ? 'high' : 'medium',
        createdAt: issue.reportedAt,
      };
    });
  }

  /**
   * Retrieves all notifications combined and sorted by priority.
   */
  static async getAllSmartNotifications() {
    const [overdue, expiring, issues] = await Promise.all([
      this.getOverdueInvoiceNotifications(),
      this.getExpiringContractNotifications(),
      this.getPendingIssueNotifications()
    ]);

    const combined = [...overdue, ...expiring, ...issues];
    
    const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return combined.sort((a: any, b: any) => {
      const pDiff = (priorityOrder[b.priority as string] || 0) - (priorityOrder[a.priority as string] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}
