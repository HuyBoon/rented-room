import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  content: string;
  type: 'general' | 'invoice' | 'issue' | 'contract' | 'other';
  senderId: mongoose.Types.ObjectId;
  receiverIds: mongoose.Types.ObjectId[];
  roomIds?: mongoose.Types.ObjectId[];
  buildingId?: mongoose.Types.ObjectId;
  readByIds: mongoose.Types.ObjectId[];
  sentAt: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'invoice', 'issue', 'contract', 'other'],
    default: 'general'
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiverIds: [{
    type: Schema.Types.ObjectId,
    required: [true, 'At least one receiver is required']
  }],
  roomIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Room'
  }],
  buildingId: {
    type: Schema.Types.ObjectId,
    ref: 'Building'
  },
  readByIds: [{
    type: Schema.Types.ObjectId
  }],
  sentAt: {
    type: Date,
    required: [true, 'Sent date is required'],
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

NotificationSchema.index({ senderId: 1 });
NotificationSchema.index({ sentAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ title: 'text', content: 'text' });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
