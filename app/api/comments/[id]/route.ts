import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

// GET /api/comments/[id] - Get a single comment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }
    
    const comment = await Comment.findById(params.id)
      .populate('author', 'name avatar')
      .populate('post', 'title');
    
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comment' },
      { status: 400 }
    );
  }
}

// PUT /api/comments/[id] - Update a comment by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Only allow updating content
    const updateData: any = {};
    if (body.content) {
      updateData.content = body.content;
      updateData.isEdited = true;
    }
    
    const comment = await Comment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('author', 'name avatar')
      .populate('post', 'title');
    
    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: comment });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update comment' },
      { status: 400 }
    );
  }
}

// PATCH /api/comments/[id] - Like/unlike a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (body.action === 'like' && body.userId) {
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      
      const comment = await Comment.findByIdAndUpdate(
        params.id,
        { $addToSet: { likes: body.userId } },
        { new: true }
      )
        .populate('author', 'name avatar')
        .populate('post', 'title');
      
      return NextResponse.json({ success: true, data: comment });
    }
    
    if (body.action === 'unlike' && body.userId) {
      if (!mongoose.Types.ObjectId.isValid(body.userId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      
      const comment = await Comment.findByIdAndUpdate(
        params.id,
        { $pull: { likes: body.userId } },
        { new: true }
      )
        .populate('author', 'name avatar')
        .populate('post', 'title');
      
      return NextResponse.json({ success: true, data: comment });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error patching comment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update comment' },
      { status: 400 }
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }
    
    const deletedComment = await Comment.findByIdAndDelete(params.id);
    if (!deletedComment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {},
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 400 }
    );
  }
}
