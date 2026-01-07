import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';
import mongoose from 'mongoose';

// POST /api/communities/[id]/leave - Leave a community
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

    const community = await Community.findById(params.id);
    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    // Check if user is the admin
    if (community.admin.toString() === userId) {
      return NextResponse.json(
        { success: false, error: 'Admin cannot leave the community. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Remove user from members
    community.members = community.members.filter(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() !== userId
    );
    community.memberCount = community.members.length;
    await community.save();

    return NextResponse.json({
      success: true,
      message: 'Left community successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
