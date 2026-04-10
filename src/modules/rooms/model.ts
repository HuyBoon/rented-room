import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomCode: string;
  buildingId: mongoose.Types.ObjectId;
  floor: number;
  area: number;
  rentPrice: number;
  deposit: number;
  description?: string;
  images: string[];
  amenities: string[];
  status: 'available' | 'booked' | 'rented' | 'maintenance';
  maxOccupants: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  roomCode: {
    type: String,
    required: [true, 'Room code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]+$/, 'Room code can only contain letters and numbers']
  },
  buildingId: {
    type: Schema.Types.ObjectId,
    ref: 'Building',
    required: [true, 'Building is required']
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required'],
    min: [0, 'Floor must be greater than or equal to 0']
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [1, 'Area must be greater than 0']
  },
  rentPrice: {
    type: Number,
    required: [true, 'Rent price is required'],
    min: [0, 'Rent price must be greater than or equal to 0']
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit is required'],
    min: [0, 'Deposit must be greater than or equal to 0']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    enum: [
      'ac', 'waterHeater', 'fridge', 'bed', 'wardrobe', 'desk', 
      'chair', 'tv', 'wifi', 'washingMachine', 'kitchen', 'pot', 'dishes', 'bowl'
    ],
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'booked', 'rented', 'maintenance'],
    default: 'available'
  },
  maxOccupants: {
    type: Number,
    required: [true, 'Max occupants is required'],
    min: [1, 'Max occupants must be at least 1'],
    max: [10, 'Max occupants cannot exceed 10']
  }
}, {
  timestamps: true
});

RoomSchema.index({ buildingId: 1 });
RoomSchema.index({ status: 1 });
RoomSchema.index({ rentPrice: 1 });
RoomSchema.index({ floor: 1 });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
