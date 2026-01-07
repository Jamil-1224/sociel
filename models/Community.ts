import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ICommunity extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  coverImage?: string;
  category: string;
  privacy: 'public' | 'private';
  admin: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  rules: string[];
  memberCount: number;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a community name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
      minlength: [3, 'Name must be at least 3 characters'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['technology', 'sports', 'gaming', 'music', 'art', 'education', 'business', 'lifestyle', 'other'],
      default: 'other',
    },
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide an admin'],
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    rules: [
      {
        type: String,
        maxlength: [200, 'Rule cannot be more than 200 characters'],
      },
    ],
    memberCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommunitySchema.index({ name: 1 });
CommunitySchema.index({ category: 1 });
CommunitySchema.index({ privacy: 1 });
CommunitySchema.index({ admin: 1 });
CommunitySchema.index({ members: 1 });
CommunitySchema.index({ createdAt: -1 });

// Text search index
CommunitySchema.index({ name: 'text', description: 'text' });

export default models.Community || model<ICommunity>('Community', CommunitySchema);
