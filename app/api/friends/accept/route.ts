import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// POST /api/friends/accept - Accept friend request
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

    // Add to friends list for both users
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: userId },
    });

    // Create notification
    await Notification.create({
      recipient: friendId,
      sender: userId,
      type: 'friend_accept',
      message: `accepted your friend request`,
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request accepted',
    });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to accept friend request' },
      { status: 400 }
    );
  }
}
