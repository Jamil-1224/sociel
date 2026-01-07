import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import User from '@/models/User';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// GET /api/communities - Get all communities with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const privacy = searchParams.get('privacy');
    const sort = searchParams.get('sort') || '-createdAt';

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (privacy) query.privacy = privacy;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Community.countDocuments(query);
    const communities = await Community.find(query)
      .populate('admin', 'name email avatar')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    return NextResponse.json({
      success: true,
      data: communities,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, category, privacy, admin, coverImage, rules } = body;

    // Validate required fields
    if (!name || !description || !admin) {
      return NextResponse.json(
        { success: false, error: 'Please provide name, description, and admin' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(admin);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Create community
    const community = await Community.create({
      name,
      description,
      category: category || 'other',
      privacy: privacy || 'public',
      admin,
      members: [admin], // Admin is automatically a member
      moderators: [],
      coverImage,
      rules: rules || [],
      memberCount: 1,
      postCount: 0,
    });

    const populatedCommunity = await Community.findById(community._id)
      .populate('admin', 'name email avatar');

    return NextResponse.json(
      { success: true, data: populatedCommunity },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Community name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
