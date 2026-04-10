import mongoose, { Schema, Document } from 'mongoose';

export interface IMeterReading extends Document {
  roomId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  electricityPrev: number;
  electricityCurrent: number;
  electricityUsage: number;
  waterPrev: number;
  waterCurrent: number;
  waterUsage: number;
  electricityImage?: string;
  waterImage?: string;
  recordedBy: mongoose.Types.ObjectId;
  recordedAt: Date;
  createdAt: Date;
}

const MeterReadingSchema = new Schema<IMeterReading>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
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
  electricityPrev: {
    type: Number,
    required: [true, 'Previous electricity reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  electricityCurrent: {
    type: Number,
    required: [true, 'Current electricity reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  electricityUsage: {
    type: Number,
    required: [true, 'Electricity usage is required'],
    min: [0, 'Usage must be at least 0']
  },
  waterPrev: {
    type: Number,
    required: [true, 'Previous water reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  waterCurrent: {
    type: Number,
    required: [true, 'Current water reading is required'],
    min: [0, 'Reading must be at least 0']
  },
  waterUsage: {
    type: Number,
    required: [true, 'Water usage is required'],
    min: [0, 'Usage must be at least 0']
  },
  electricityImage: {
    type: String,
    trim: true
  },
  waterImage: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recorder is required']
  },
  recordedAt: {
    type: Date,
    required: [true, 'Recorded date is required'],
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

MeterReadingSchema.index({ roomId: 1, month: 1, year: 1 }, { unique: true });
MeterReadingSchema.index({ month: 1, year: 1 });
MeterReadingSchema.index({ recordedBy: 1 });

MeterReadingSchema.pre('save', function(next) {
  if (this.isModified('electricityCurrent') || this.isModified('electricityPrev')) {
    this.electricityUsage = Math.max(0, this.electricityCurrent - this.electricityPrev);
  }
  
  if (this.isModified('waterCurrent') || this.isModified('waterPrev')) {
    this.waterUsage = Math.max(0, this.waterCurrent - this.waterPrev);
  }
  
  next();
});

export default mongoose.models.MeterReading || mongoose.model<IMeterReading>('MeterReading', MeterReadingSchema);
