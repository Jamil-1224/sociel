import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// GET /api/posts/[id] - Get a single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    const post = await Post.findById(params.id)
      .populate('author', 'name email avatar bio')
      .populate('likes', 'name avatar');
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Post.findByIdAndUpdate(params.id, { $inc: { views: 1 } });
    
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 400 }
    );
  }
}

// PUT /api/posts/[id] - Update a post by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Prevent updating certain fields
    delete body._id;
    delete body.author;
    delete body.createdAt;
    delete body.views;
    delete body.likes;
    
    const post = await Post.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate('author', 'name email avatar');
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update post' },
      { status: 400 }
    );
  }
}

// PATCH /api/posts/[id] - Partial update (like/unlike)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Handle like/unlike
    if (body.action === 'like' && body.userId) {
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      
      const post = await Post.findByIdAndUpdate(
        params.id,
        { $addToSet: { likes: body.userId } },
        { new: true }
      ).populate('author', 'name email avatar');
      
      return NextResponse.json({ success: true, data: post });
    }
    
    if (body.action === 'unlike' && body.userId) {
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      
      const post = await Post.findByIdAndUpdate(
        params.id,
        { $pull: { likes: body.userId } },
        { new: true }
      ).populate('author', 'name email avatar');
      
      return NextResponse.json({ success: true, data: post });
    }
    
    // Generic partial update
    const post = await Post.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error patching post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update post' },
      { status: 400 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID format' },
        { status: 400 }
      );
    }
    
    const deletedPost = await Post.findByIdAndDelete(params.id);
    if (!deletedPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      data: {},
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 400 }
    );
  }
}
