import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITenant extends Document {
  fullName: string;
  phoneNumber: string;
  email?: string;
  idCardNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  hometown: string;
  idCardImages?: {
    front: string;
    back: string;
  };
  occupation?: string;
  password?: string;
  status: 'renting' | 'checkedOut' | 'idle';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const IdCardImagesSchema = new Schema({
  front: {
    type: String,
    trim: true,
    default: ''
  },
  back: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const TenantSchema = new Schema<ITenant>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10,11}$/, 'Invalid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  idCardNumber: {
    type: String,
    required: [true, 'ID card number is required'],
    unique: true,
    match: [/^[0-9]{12}$/, 'ID card number must be 12 digits']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  hometown: {
    type: String,
    required: [true, 'Hometown is required'],
    trim: true,
    maxlength: [200, 'Hometown cannot exceed 200 characters']
  },
  idCardImages: {
    type: IdCardImagesSchema,
    default: { front: '', back: '' }
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  password: {
    type: String,
    select: false,
    minlength: [6, 'Password must be at least 6 characters']
  },
  status: {
    type: String,
    enum: ['renting', 'checkedOut', 'idle'],
    default: 'idle'
  }
}, {
  timestamps: true
});

// Hash password before saving
TenantSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

TenantSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

TenantSchema.index({ fullName: 'text', hometown: 'text', occupation: 'text' });
TenantSchema.index({ status: 1 });

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);
