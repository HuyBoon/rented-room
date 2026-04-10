import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'admin' | 'landlord' | 'staff';
  avatar?: string;
  status: 'active' | 'locked';
  lastLogin?: Date;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phoneNumber: {
    type: String,
    required: false,
    match: [/^[0-9]{10,11}$/, 'Invalid phone number']
  },
  role: {
    type: String,
    enum: ['admin', 'landlord', 'staff'],
    default: 'staff'
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'locked'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    required: false,
    maxlength: [500, 'Address cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
