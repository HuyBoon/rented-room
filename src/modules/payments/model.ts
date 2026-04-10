import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId;
  amount: number;
  method: 'cash' | 'transfer' | 'eWallet';
  transferInfo?: {
    bank: string;
    transactionId: string;
  };
  paymentDate: Date;
  receivedBy: mongoose.Types.ObjectId;
  notes?: string;
  receiptImage?: string;
  createdAt: Date;
}

const TransferInfoSchema = new Schema({
  bank: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true
  }
}, { _id: false });

const PaymentSchema = new Schema<IPayment>({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be greater than 0']
  },
  method: {
    type: String,
    enum: ['cash', 'transfer', 'eWallet'],
    required: [true, 'Payment method is required']
  },
  transferInfo: {
    type: TransferInfoSchema,
    required: function(this: IPayment) {
      return this.method === 'transfer';
    }
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  receiptImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ paymentDate: 1 });
PaymentSchema.index({ receivedBy: 1 });
PaymentSchema.index({ method: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
