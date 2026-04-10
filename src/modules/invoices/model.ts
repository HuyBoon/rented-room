import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceCode: string;
  contractId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  roomAmount: number;
  electricityAmount: number;
  electricityUsage: number;
  electricityStart: number;
  electricityEnd: number;
  waterAmount: number;
  waterUsage: number;
  waterStart: number;
  waterEnd: number;
  serviceFees: Array<{
    name: string;
    amount: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'unpaid' | 'partiallyPaid' | 'paid' | 'overdue';
  dueDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceFeeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Service amount is required'],
    min: [0, 'Service amount must be at least 0']
  }
}, { _id: false });

const InvoiceSchema = new Schema<IInvoice>({
  invoiceCode: {
    type: String,
    required: [true, 'Invoice code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  contractId: {
    type: Schema.Types.ObjectId,
    ref: 'Contract',
    required: [true, 'Contract is required']
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1-12'],
    max: [12, 'Month must be between 1-12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be at least 2020']
  },
  roomAmount: {
    type: Number,
    required: [true, 'Room amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  electricityAmount: {
    type: Number,
    required: [true, 'Electricity amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  electricityUsage: {
    type: Number,
    required: [true, 'Electricity usage is required'],
    min: [0, 'Usage must be at least 0']
  },
  electricityStart: {
    type: Number,
    required: [true, 'Start reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  electricityEnd: {
    type: Number,
    required: [true, 'End reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  waterAmount: {
    type: Number,
    required: [true, 'Water amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  waterUsage: {
    type: Number,
    required: [true, 'Water usage is required'],
    min: [0, 'Usage must be at least 0']
  },
  waterStart: {
    type: Number,
    required: [true, 'Start reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  waterEnd: {
    type: Number,
    required: [true, 'End reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  serviceFees: [ServiceFeeSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  paidAmount: {
    type: Number,
    required: [true, 'Paid amount is required'],
    min: [0, 'Amount must be at least 0'],
    default: 0
  },
  remainingAmount: {
    type: Number,
    required: [true, 'Remaining amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  status: {
    type: String,
    enum: ['unpaid', 'partiallyPaid', 'paid', 'overdue'],
    default: 'unpaid'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

InvoiceSchema.index({ contractId: 1 });
InvoiceSchema.index({ roomId: 1 });
InvoiceSchema.index({ tenantId: 1 });
InvoiceSchema.index({ month: 1, year: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
