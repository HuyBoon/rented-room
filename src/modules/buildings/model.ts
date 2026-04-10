import mongoose, { Schema, Document } from 'mongoose';

export interface IBuilding extends Document {
  name: string;
  address: {
    houseNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  description?: string;
  images: string[];
  ownerId: mongoose.Types.ObjectId;
  totalRooms: number;
  commonAmenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  houseNumber: {
    type: String,
    required: [true, 'House number is required'],
    trim: true
  },
  street: {
    type: String,
    required: [true, 'Street name is required'],
    trim: true
  },
  ward: {
    type: String,
    required: [true, 'Ward/Commune is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  }
}, { _id: false });

const BuildingSchema = new Schema<IBuilding>({
  name: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true,
    maxlength: [200, 'Building name cannot exceed 200 characters']
  },
  address: {
    type: AddressSchema,
    required: [true, 'Address is required']
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
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [0, 'Total rooms cannot be negative'],
    default: 0
  },
  commonAmenities: [{
    type: String,
    enum: ['wifi', 'camera', 'security', 'parking', 'elevator', 'dryingArea', 'sharedBathroom', 'sharedKitchen'],
    trim: true
  }]
}, {
  timestamps: true
});

BuildingSchema.index({ name: 'text', 'address.street': 'text', 'address.ward': 'text' });
BuildingSchema.index({ ownerId: 1 });

export default mongoose.models.Building || mongoose.model<IBuilding>('Building', BuildingSchema);
