import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

// GET /api/comments - Get comments (optionally filtered by post)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    const parentId = searchParams.get('parentId');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const filterQuery: any = {};
    
    if (postId && mongoose.Types.ObjectId.isValid(postId)) {
      filterQuery.post = postId;
    }
    
    if (parentId) {
      if (parentId === 'null') {
        filterQuery.parentComment = null;
      } else if (mongoose.Types.ObjectId.isValid(parentId)) {
        filterQuery.parentComment = parentId;
      }
    }
    
    const comments = await Comment.find(filterQuery)
      .populate('author', 'name avatar')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Comment.countDocuments(filterQuery);
    
    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 400 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.content || !body.author || !body.post) {
      return NextResponse.json(
        { success: false, error: 'Content, author, and post are required' },
        { status: 400 }
      );
    }
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(body.author) || 
        !mongoose.Types.ObjectId.isValid(body.post)) {
      return NextResponse.json(
        { success: false, error: 'Invalid author or post ID' },
        { status: 400 }
      );
    }
    
    const comment = await Comment.create(body);
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar')
      .populate('post', 'title');
    
    return NextResponse.json(
      { success: true, data: populatedComment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create comment' },
      { status: 400 }
    );
  }
}
