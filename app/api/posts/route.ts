import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// GET /api/posts - Get all posts with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Search
    const search = searchParams.get('search') || '';
    const searchQuery = search
      ? { $text: { $search: search } }
      : {};
    
    // Filtering
    const author = searchParams.get('author');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    
    const filterQuery: any = { ...searchQuery };
    
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      filterQuery.author = author;
    }
    if (status) filterQuery.status = status;
    if (category) filterQuery.category = category;
    if (tag) filterQuery.tags = tag;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = { [sortBy]: sortOrder };
    
    // Execute query
    const posts = await Post.find(filterQuery)
      .populate('author', 'name email avatar')
      .sort(sort)
      .limit(limit)
      .skip(skip);
    
    // Get total count
    const total = await Post.countDocuments(filterQuery);
    
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 400 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.content || !body.author) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }
    
    // Validate author ID
    if (!mongoose.Types.ObjectId.isValid(body.author)) {
      return NextResponse.json(
        { success: false, error: 'Invalid author ID' },
        { status: 400 }
      );
    }
    
    const post = await Post.create(body);
    const populatedPost = await Post.findById(post._id).populate('author', 'name email avatar');
    
    return NextResponse.json(
      { success: true, data: populatedPost },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create post' },
      { status: 400 }
    );
  }
}
