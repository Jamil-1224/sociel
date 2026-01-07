import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Community from '@/models/Community';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// GET /api/communities/[id] - Get a single community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const community = await Community.findById(params.id)
      .populate('admin', 'name email avatar')
      .populate('moderators', 'name email avatar')
      .populate('members', 'name email avatar')
      .lean();

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: community });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[id] - Update a community
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, category, privacy, coverImage, rules } = body;

    const community = await Community.findByIdAndUpdate(
      params.id,
      { name, description, category, privacy, coverImage, rules },
      { new: true, runValidators: true }
    ).populate('admin', 'name email avatar');

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: community });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id] - Delete a community
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const community = await Community.findByIdAndDelete(params.id);

    if (!community) {
      return NextResponse.json(
        { success: false, error: 'Community not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Community deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
