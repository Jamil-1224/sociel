import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import User from '@/models/User';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// POST /api/communities/[id]/join - Join a community
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please provide userId' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if community exists
    const community = await Community.findById(params.id);
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (community.members.includes(userId as any)) {
      return NextResponse.json(
        { success: false, error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add user to members
    community.members.push(userId as any);
    community.memberCount = community.members.length;
    await community.save();

    const updatedCommunity = await Community.findById(params.id)
      .populate('admin', 'name email avatar')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Joined community successfully',
      data: updatedCommunity,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
