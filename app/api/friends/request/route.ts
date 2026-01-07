import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

// Force Node.js runtime (required for Mongoose/MongoDB)
export const runtime = 'nodejs';

// POST /api/friends/request - Send friend request
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

    if (userId === friendId) {
      return NextResponse.json(
        { success: false, error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if already friends
    const user = await User.findById(userId);
    if (user.friends.includes(friendId)) {
      return NextResponse.json(
        { success: false, error: 'Already friends' },
        { status: 400 }
      );
    }

    // Check if request already sent
    if (user.friendRequestsSent.includes(friendId)) {
      return NextResponse.json(
        { success: false, error: 'Friend request already sent' },
        { status: 400 }
      );
    }

    // Add to sender's sent requests
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friendRequestsSent: friendId },
    });

    // Add to receiver's received requests
    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friendRequestsReceived: userId },
    });

    // Create notification
    await Notification.create({
      recipient: friendId,
      sender: userId,
      type: 'friend_request',
      message: `sent you a friend request`,
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send friend request' },
      { status: 400 }
    );
  }
}

// GET /api/friends/request - Get friend requests
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // received or sent

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const field = type === 'received' ? 'friendRequestsReceived' : 'friendRequestsSent';
    
    const user = await User.findById(userId).populate(field, 'name email avatar');
    
    return NextResponse.json({
      success: true,
      data: user[field],
    });
  } catch (error: any) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch friend requests' },
      { status: 400 }
    );
  }
}
