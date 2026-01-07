import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/friends/list - Get friends list
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).populate('friends', 'name email avatar bio location');
    
    return NextResponse.json({
      success: true,
      data: user.friends,
      count: user.friends.length,
    });
  } catch (error: any) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch friends' },
      { status: 400 }
    );
  }
}

// DELETE /api/friends/list - Unfriend
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { userId, friendId } = await request.json();

    if (!userId || !friendId) {
      return NextResponse.json(
        { success: false, error: 'userId and friendId are required' },
        { status: 400 }
      );
    }

    // Remove from both friends lists
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove friend' },
      { status: 400 }
    );
  }
}
