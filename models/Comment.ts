import mongoose, { Schema, model, models, Document } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested comments/replies
  reactions: {
    like: mongoose.Types.ObjectId[];
    love: mongoose.Types.ObjectId[];
    haha: mongoose.Types.ObjectId[];
    wow: mongoose.Types.ObjectId[];
    sad: mongoose.Types.ObjectId[];
    angry: mongoose.Types.ObjectId[];
  };
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Please provide comment content'],
      trim: true,
      minlength: [1, 'Comment must be at least 1 character'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an author'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Please provide a post'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    reactions: {
      like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      haha: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      wow: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      sad: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      angry: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });

// Virtual for total reaction count
CommentSchema.virtual('reactionCount').get(function () {
  return (
    this.reactions.like.length +
    this.reactions.love.length +
    this.reactions.haha.length +
    this.reactions.wow.length +
    this.reactions.sad.length +
    this.reactions.angry.length
  );
});

// Ensure virtuals are included in JSON
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

export default models.Comment || model<IComment>('Comment', CommentSchema);
