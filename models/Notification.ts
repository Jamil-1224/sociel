import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'friend_request' | 'friend_accept' | 'like' | 'comment' | 'reaction' | 'mention' | 'share';
  relatedPost?: mongoose.Types.ObjectId;
  relatedComment?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['friend_request', 'friend_accept', 'like', 'comment', 'reaction', 'mention', 'share'],
      required: true,
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    relatedComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ sender: 1 });

export default models.Notification || model<INotification>('Notification', NotificationSchema);
