import mongoose, { Schema, model, models, Document } from 'mongoose';
import { IUser } from './User';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  reactions: {
    like: mongoose.Types.ObjectId[];
    love: mongoose.Types.ObjectId[];
    haha: mongoose.Types.ObjectId[];
    wow: mongoose.Types.ObjectId[];
    sad: mongoose.Types.ObjectId[];
    angry: mongoose.Types.ObjectId[];
  };
  media: {
    type: 'image' | 'video' | 'none';
    url?: string;
    thumbnail?: string;
  };
  featuredImage?: string;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
      minlength: [3, 'Title must be at least 3 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an author'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactions: {
      like: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      haha: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      wow: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      sad: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      angry: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    media: {
      type: {
        type: String,
        enum: ['image', 'video', 'none'],
        default: 'none',
      },
      url: String,
      thumbnail: String,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ status: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ title: 'text', content: 'text' }); // Text search index

// Virtual for total reaction count
PostSchema.virtual('reactionCount').get(function () {
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
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

export default models.Post || model<IPost>('Post', PostSchema);
