import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/friends/reject - Reject friend request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, friendId } = await request.json();

    if (!userId || !friendId) {
      return NextResponse.json(
        { success: false, error: 'userId and friendId are required' },
        { status: 400 }
      );
    }

    // Remove from pending requests
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequestsReceived: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friendRequestsSent: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error: any) {
    console.error('Error rejecting friend request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject friend request' },
      { status: 400 }
    );
  }
}
