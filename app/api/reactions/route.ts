import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

// POST /api/reactions - Add or change reaction
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { userId, targetId, targetType, reactionType } = await request.json();

    if (!userId || !targetId || !targetType || !reactionType) {
      return NextResponse.json(
        { success: false, error: 'userId, targetId, targetType, and reactionType are required' },
        { status: 400 }
      );
    }

    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(reactionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const Model = targetType === 'post' ? Post : Comment;
    const target = await Model.findById(targetId);

    if (!target) {
      return NextResponse.json(
        { success: false, error: `${targetType} not found` },
        { status: 404 }
      );
    }

    // Remove user from all reaction types first
    const updateQuery: any = {};
    validReactions.forEach((reaction) => {
      updateQuery[`reactions.${reaction}`] = { $ne: userId };
    });

    await Model.findByIdAndUpdate(targetId, {
      $pull: {
        'reactions.like': userId,
        'reactions.love': userId,
        'reactions.haha': userId,
        'reactions.wow': userId,
        'reactions.sad': userId,
        'reactions.angry': userId,
      },
    });

    // Add to new reaction type
    await Model.findByIdAndUpdate(targetId, {
      $addToSet: { [`reactions.${reactionType}`]: userId },
    });

    // Create notification if not own post/comment
    if (target.author.toString() !== userId) {
      await Notification.create({
        recipient: target.author,
        sender: userId,
        type: 'reaction',
        [targetType === 'post' ? 'relatedPost' : 'relatedComment']: targetId,
        message: `reacted ${reactionType} to your ${targetType}`,
        read: false,
      });
    }

    const updatedTarget = await Model.findById(targetId).populate('author', 'name avatar');

    return NextResponse.json({
      success: true,
      message: 'Reaction added successfully',
      data: updatedTarget,
    });
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add reaction' },
      { status: 400 }
    );
  }
}

// DELETE /api/reactions - Remove reaction
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { userId, targetId, targetType } = await request.json();

    if (!userId || !targetId || !targetType) {
      return NextResponse.json(
        { success: false, error: 'userId, targetId, and targetType are required' },
        { status: 400 }
      );
    }

    const Model = targetType === 'post' ? Post : Comment;

    // Remove from all reaction types
    await Model.findByIdAndUpdate(targetId, {
      $pull: {
        'reactions.like': userId,
        'reactions.love': userId,
        'reactions.haha': userId,
        'reactions.wow': userId,
        'reactions.sad': userId,
        'reactions.angry': userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reaction removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove reaction' },
      { status: 400 }
    );
  }
}
