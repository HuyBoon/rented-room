import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  contractCode: string;
  roomId: mongoose.Types.ObjectId;
  tenantIds: mongoose.Types.ObjectId[];
  representativeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  rentPrice: number;
  deposit: number;
  paymentCycle: 'monthly' | 'quarterly' | 'yearly';
  paymentDay: number;
  terms: string;
  electricityPrice: number;
  waterPrice: number;
  electricityStart: number;
  waterStart: number;
  serviceFees: Array<{
    name: string;
    amount: number;
  }>;
  status: 'active' | 'expired' | 'cancelled';
  contractFile?: string;
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

const ContractSchema = new Schema<IContract>({
  contractCode: {
    type: String,
    required: [true, 'Contract code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  tenantIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'At least one tenant is required']
  }],
  representativeId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Representative is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  rentPrice: {
    type: Number,
    required: [true, 'Rent price is required'],
    min: [0, 'Rent price must be at least 0']
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit is required'],
    min: [0, 'Deposit must be at least 0']
  },
  paymentCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  paymentDay: {
    type: Number,
    required: [true, 'Payment day is required'],
    min: [1, 'Day must be between 1-31'],
    max: [31, 'Day must be between 1-31']
  },
  terms: {
    type: String,
    required: [true, 'Terms are required'],
    trim: true
  },
  electricityPrice: {
    type: Number,
    required: [true, 'Electricity price is required'],
    min: [0, 'Price must be at least 0']
  },
  waterPrice: {
    type: Number,
    required: [true, 'Water price is required'],
    min: [0, 'Price must be at least 0']
  },
  electricityStart: {
    type: Number,
    required: [true, 'Initial electricity reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  waterStart: {
    type: Number,
    required: [true, 'Initial water reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  serviceFees: [ServiceFeeSchema],
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  contractFile: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

ContractSchema.index({ roomId: 1 });
ContractSchema.index({ status: 1 });
ContractSchema.index({ startDate: 1 });
ContractSchema.index({ endDate: 1 });
ContractSchema.index({ representativeId: 1 });

// Validation: end date must be after start date
ContractSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
