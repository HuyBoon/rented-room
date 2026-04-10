import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  description: string;
  type: 'utility' | 'furniture' | 'cleanliness' | 'security' | 'other';
  roomId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'processing' | 'resolved' | 'cancelled';
  handlerId?: mongoose.Types.ObjectId;
  handlerNotes?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['utility', 'furniture', 'cleanliness', 'security', 'other'],
    default: 'other'
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
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'processing', 'resolved', 'cancelled'],
    default: 'new'
  },
  handlerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  handlerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  images: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

IssueSchema.index({ roomId: 1 });
IssueSchema.index({ tenantId: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ type: 1 });

export default mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
